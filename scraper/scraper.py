#!/usr/bin/env python3
import os, sys, time, json, traceback
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional

import requests
import yaml
import feedparser
from tenacity import retry, wait_exponential_jitter, stop_after_attempt

BACKEND_INTERNAL_URL = os.getenv("BACKEND_INTERNAL_URL")  # .../api/internal/grants
INTERNAL_API_TOKEN   = os.getenv("INTERNAL_API_TOKEN")
BATCH_LIMIT          = int(os.getenv("SCRAPER_BATCH_LIMIT", "10"))
LOG_LEVEL            = os.getenv("SCRAPER_LOG_LEVEL", "info").lower()
DRY_RUN              = os.getenv("SCRAPER_DRY_RUN", "false").lower() == "true"
TIMEOUT_SEC          = 30

def log(level: str, msg: str, **ctx):
    levels = ["debug", "info", "warn", "error"]
    if levels.index(level) >= levels.index(LOG_LEVEL):
        line = {"ts": datetime.now(timezone.utc).isoformat(), "level": level, "msg": msg}
        if ctx: line.update(ctx)
        print(json.dumps(line), flush=True)

def hard_fail(msg: str):
    log("error", msg)
    sys.exit(1)

def get_sources() -> List[Dict[str, Any]]:
    path = os.path.join(os.path.dirname(__file__), "sources.yml")
    if not os.path.exists(path):
        hard_fail(f"sources.yml not found at {path}")
    with open(path, "r") as f:
        y = yaml.safe_load(f) or {}
    return y.get("feeds", [])

@retry(wait=wait_exponential_jitter(initial=1, max=15), stop=stop_after_attempt(5))
def post_grant(payload: Dict[str, Any]) -> Dict[str, Any]:
    if DRY_RUN:
        log("info", "DRY_RUN on, skipping POST", title=payload.get("title"))
        return {"ok": True, "dryRun": True}
    if not BACKEND_INTERNAL_URL or not INTERNAL_API_TOKEN:
        hard_fail("Missing BACKEND_INTERNAL_URL or INTERNAL_API_TOKEN env vars")
    r = requests.post(
        BACKEND_INTERNAL_URL,
        json=payload,
        headers={"x-internal-token": INTERNAL_API_TOKEN, "Content-Type": "application/json"},
        timeout=TIMEOUT_SEC,
    )
    if r.status_code == 429:
        # Backoff more aggressively on rate limits (likely OpenAI downstream)
        raise RuntimeError(f"429 from backend: {r.text[:200]}")
    if r.status_code >= 300:
        raise RuntimeError(f"POST failed {r.status_code}: {r.text[:200]}")
    return r.json()

def norm_deadline(val: Optional[str]) -> Optional[str]:
    # Try to coerce a date string to ISO; feeds often have no formal deadlines.
    if not val: return None
    try:
        return datetime.fromisoformat(val.replace("Z", "+00:00")).astimezone(timezone.utc).isoformat()
    except Exception:
        return None

def parse_feed_item(feed_name: str, entry) -> Optional[Dict[str, Any]]:
    # Title & link are essential
    title = getattr(entry, "title", None) or ""
    link  = getattr(entry, "link", None) or ""
    if not title or not link:
        return None

    desc = ""
    for k in ("summary", "description", "content"):
        v = getattr(entry, k, None)
        if isinstance(v, str): 
            desc = v
            break
        if isinstance(v, list) and v and isinstance(v[0], dict) and "value" in v[0]:
            desc = v[0]["value"]
            break

    deadline = None
    # Some feeds put deadline in tags or custom fields; customize per source if needed

    payload = {
        "source": feed_name,
        "sourceId": getattr(entry, "id", link)[:200],
        "url": link,
        "title": title[:500],
        "description": desc[:5000] or "No description provided.",
        "eligibility": "See source page.",
        "fundingMin": 0,
        "fundingMax": 0,
        "currency": "USD",
        "deadline": deadline or "2030-01-01T00:00:00.000Z",
    }
    return payload

def collect_from_feed(feed_name: str, url: str, limit: int) -> List[Dict[str, Any]]:
    log("info", "Fetching feed", feed=feed_name, url=url)
    parsed = feedparser.parse(url)
    items = []
    for entry in parsed.entries[:limit]:
        try:
            p = parse_feed_item(feed_name, entry)
            if p: items.append(p)
        except Exception as e:
            log("warn", "Skip entry parse error", error=str(e), entry=getattr(entry, "title", ""))
    log("info", "Parsed entries", feed=feed_name, count=len(items))
    return items

def main():
    try:
        feeds = get_sources()
        if not feeds:
            hard_fail("No feeds defined in sources.yml")

        total_posted = 0
        for f in feeds:
            name = f.get("name") or "unknown"
            url = f.get("url")
            limit = int(f.get("limit", BATCH_LIMIT))
            if not url:
                log("warn", "Feed missing url, skipping", feed=name)
                continue
            items = collect_from_feed(name, url, limit)
            for payload in items:
                try:
                    res = post_grant(payload)
                    total_posted += 1
                    log("info", "Posted grant", title=payload["title"], id_hint=res.get("id"))
                    # Be nice to downstream (OpenAI summarization on backend)
                    time.sleep(0.5)
                except Exception as e:
                    log("error", "Post failed", error=str(e), title=payload["title"])
                    # do NOT crash the entire run; continue to next item
        log("info", "Scraper completed", posted=total_posted, dryRun=DRY_RUN)
    except Exception as e:
        log("error", "Fatal crash", error=str(e), tb=traceback.format_exc())
        sys.exit(1)

if __name__ == "__main__":
    main()
