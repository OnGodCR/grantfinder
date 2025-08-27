import os, sys, time, json, hashlib
import requests, feedparser, yaml
from dateutil import parser as dtparse
from datetime import datetime, timezone

BACKEND_INTERNAL_URL = os.getenv("BACKEND_INTERNAL_URL")  # e.g. https://<railway-app>.up.railway.app/api/internal/grants
INTERNAL_API_TOKEN   = os.getenv("INTERNAL_API_TOKEN")
SOURCES_FILE         = os.getenv("SCRAPER_SOURCES_FILE", "sources.yml")
BATCH_LIMIT          = int(os.getenv("SCRAPER_BATCH_LIMIT", "20"))
LOG_LEVEL            = os.getenv("SCRAPER_LOG_LEVEL", "info").lower()
DRY_RUN              = os.getenv("SCRAPER_DRY_RUN", "false").lower() == "true"

def log(level, msg, **kw):
    levels = ["debug","info","warn","error"]
    if levels.index(level) >= levels.index(LOG_LEVEL):
        print(json.dumps({"level": level, "message": msg, **kw}), flush=True)

def norm_deadline(entry):
    # Try published or updated date as a pseudo-deadline if none exists
    for key in ["dc:date", "updated", "published"]:
        val = entry.get(key) or entry.get(f"{key}_parsed")
        if val:
            try:
                return dtparse.parse(str(val)).astimezone(timezone.utc).isoformat()
            except:
                pass
    # fallback: 6 months from now
    return (datetime.now(timezone.utc)).replace(microsecond=0).isoformat()

def pick_text(*vals):
    for v in vals:
        if v and isinstance(v, str):
            return v.strip()
    return None

def derive_source_id(source, link, title):
    base = f"{source}::{link or ''}::{title or ''}"
    return hashlib.sha1(base.encode("utf-8")).hexdigest()[:20]

def to_payload(feed_cfg, entry, defaults):
    source = feed_cfg["source"]
    url = entry.get("link") or entry.get("id") or ""
    title = pick_text(entry.get("title"), "Untitled Grant")
    description = pick_text(entry.get("summary"), entry.get("description"), "")
    eligibility = ""  # Most RSS don’t include explicit eligibility; backend AI can derive it

    # Try to find a real deadline in common custom fields (rare in RSS)
    deadline = None
    for key in ["deadline", "closes", "date", "closingDate"]:
        if key in entry:
            try:
                deadline = dtparse.parse(str(entry[key])).astimezone(timezone.utc).isoformat()
            except:
                pass
    if not deadline:
        deadline = norm_deadline(entry)

    # Funding min/max often missing; leave None
    currency = defaults.get("currency", "USD")

    source_id = derive_source_id(source, url, title)

    return {
        "source": source,
        "sourceId": source_id,
        "url": url,
        "title": title,
        "description": description or "",
        "eligibility": eligibility,
        "fundingMin": None,
        "fundingMax": None,
        "currency": currency,
        "deadline": deadline
    }

def post_grant(payload):
    if not BACKEND_INTERNAL_URL or not INTERNAL_API_TOKEN:
        raise RuntimeError("Missing BACKEND_INTERNAL_URL or INTERNAL_API_TOKEN")

    headers = {
        "Content-Type": "application/json",
        "x-internal-token": INTERNAL_API_TOKEN
    }
    if DRY_RUN:
        log("info", "DRY_RUN on – would POST", payload=payload)
        return {"ok": True, "dryRun": True}

    r = requests.post(BACKEND_INTERNAL_URL, headers=headers, data=json.dumps(payload), timeout=30)
    if r.status_code == 200:
        return r.json()
    else:
        try:
            body = r.json()
        except Exception:
            body = {"text": r.text}
        raise RuntimeError(f"POST failed {r.status_code}: {body}")

def fetch_feed(feed_cfg):
    d = feedparser.parse(feed_cfg["url"])
    if d.bozo:
        log("warn", "Feed parse warning/bozo", url=feed_cfg["url"], bozo=str(d.bozo_exception))
    return d.entries or []

def main():
    with open(SOURCES_FILE, "r") as f:
        cfg = yaml.safe_load(f) or {}
    feeds = cfg.get("feeds", [])
    defaults = cfg.get("defaults", {})

    if not feeds:
        log("error", "No feeds configured in sources.yml")
        sys.exit(1)

    total_posted = 0
    for feed_cfg in feeds:
        if total_posted >= BATCH_LIMIT:
            break
        entries = fetch_feed(feed_cfg)
        log("info", "Fetched feed entries", source=feed_cfg["source"], count=len(entries))

        for entry in entries:
            if total_posted >= BATCH_LIMIT:
                break
            try:
                payload = to_payload(feed_cfg, entry, defaults)
                res = post_grant(payload)
                log("info", "Posted grant", source=payload["source"], sourceId=payload["sourceId"], result=res)
                total_posted += 1
                # tiny delay to be gentle + control OpenAI spend on backend
                time.sleep(0.5)
            except Exception as e:
                log("warn", "Failed posting grant", error=str(e))

    log("info", "Scrape finished", total=total_posted, dryRun=DRY_RUN)

if __name__ == "__main__":
    main()
