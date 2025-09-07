#!/usr/bin/env python3
# scraper.py — multi-source grant harvester (RSS + auto-RSS + sitemap + HTML + search)
import os, sys, time, json, re, traceback, hashlib
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional, Set, Tuple
from urllib.parse import urljoin, urlparse

import requests
import yaml
import feedparser
from tenacity import retry, wait_exponential_jitter, stop_after_attempt

from lxml import html as lxml_html
from bs4 import BeautifulSoup
from readability import Document
import dateparser
from urllib import robotparser
import feedfinder2

# ----------------- ENV / CONFIG -----------------
BACKEND_INTERNAL_URL = os.getenv("BACKEND_INTERNAL_URL")  # e.g., https://.../api/internal/grants
INTERNAL_API_TOKEN   = os.getenv("INTERNAL_API_TOKEN")
BATCH_LIMIT          = int(os.getenv("SCRAPER_BATCH_LIMIT", "10"))
LOG_LEVEL            = os.getenv("SCRAPER_LOG_LEVEL", "info").lower()
DRY_RUN              = os.getenv("SCRAPER_DRY_RUN", "false").lower() == "true"
TIMEOUT_SEC          = int(os.getenv("SCRAPER_HTTP_TIMEOUT", "30"))
REQUEST_DELAY_MS     = int(os.getenv("SCRAPER_DELAY_MS", "300"))
USER_AGENT           = os.getenv("SCRAPER_UA", "NovaGrantBot/1.0 (+https://novagrant.example)")
SERPAPI_KEY          = os.getenv("SERPAPI_KEY")      # optional
BING_API_KEY         = os.getenv("BING_API_KEY")     # optional

SESSION = requests.Session()
SESSION.headers.update({"User-Agent": USER_AGENT})

# ----------------- LOGGING -----------------
def log(level: str, msg: str, **ctx):
    levels = ["debug", "info", "warn", "error"]
    if levels.index(level) >= levels.index(LOG_LEVEL):
        line = {"ts": datetime.now(timezone.utc).isoformat(), "level": level, "msg": msg}
        if ctx: line.update(ctx)
        print(json.dumps(line), flush=True)

def hard_fail(msg: str):
    log("error", msg)
    sys.exit(1)

# ----------------- UTIL -----------------
def sha1(s: str) -> str:
    return hashlib.sha1(s.encode("utf-8", errors="ignore")).hexdigest()

def sleep_ms(ms: int):
    if ms > 0:
        time.sleep(ms/1000.0)

def same_host(u1: str, u2: str) -> bool:
    a, b = urlparse(u1), urlparse(u2)
    return a.netloc == b.netloc

def fetch(url: str) -> Optional[requests.Response]:
    try:
        r = SESSION.get(url, timeout=TIMEOUT_SEC)
        if r.status_code >= 400:
            log("warn", "Fetch bad status", url=url, status=r.status_code)
            return None
        return r
    except Exception as e:
        log("warn", "Fetch error", url=url, error=str(e))
        return None

def textify(elem) -> str:
    if elem is None: return ""
    if isinstance(elem, str): return elem
    try:
        return re.sub(r"\s+\n", "\n", " ".join(elem.itertext())).strip()
    except Exception:
        return ""

def extract_first_css(root, css: Optional[str]) -> str:
    if not css: return ""
    try:
        nodes = root.cssselect(css)
        if not nodes: return ""
        return textify(nodes[0])
    except Exception:
        return ""

def regex_group(pattern: str, text: str, group_index: int = -1) -> Optional[str]:
    if not pattern or not text: return None
    m = re.search(pattern, text, flags=re.I | re.M)
    if not m: return None
    return m.group(group_index if group_index != -1 else (m.lastindex or 0))

def parse_amounts(text: str, default_currency: str = "USD") -> Tuple[int,int,str]:
    if not text: return (0,0,default_currency)
    currency = default_currency
    vals = []
    for m in re.findall(r"([$€£])\s?([\d,\.]+)", text):
        sym, num = m
        if sym == "€": currency = "EUR"
        elif sym == "£": currency = "GBP"
        try:
            v = int(float(num.replace(",", "")))
            vals.append(v)
        except Exception:
            pass
    if not vals: return (0,0,currency)
    return (min(vals), max(vals), currency)

def parse_deadline(text: str) -> Optional[str]:
    if not text: return None
    dt = dateparser.parse(
        text,
        settings={"PREFER_DATES_FROM": "future", "RETURN_AS_TIMEZONE_AWARE": True}
    )
    if dt: return dt.astimezone(timezone.utc).isoformat()
    return None

def allowed_by_robots(robots_txt: Optional[str], url: str) -> bool:
    if not robots_txt:
        return True
    try:
        rp = robotparser.RobotFileParser()
        # robotparser can parse from lines directly
        rp.parse(robots_txt.splitlines())
        return rp.can_fetch(USER_AGENT, url)
    except Exception:
        return True


# ----------------- POST TO BACKEND -----------------
@retry(wait=wait_exponential_jitter(initial=1, max=20), stop=stop_after_attempt(5))
def post_grant(payload: Dict[str, Any]) -> Dict[str, Any]:
    if DRY_RUN:
        log("info", "DRY_RUN on, skipping POST", title=payload.get("title"))
        return {"ok": True, "dryRun": True}
    if not BACKEND_INTERNAL_URL or not INTERNAL_API_TOKEN:
        hard_fail("Missing BACKEND_INTERNAL_URL or INTERNAL_API_TOKEN env vars")

    r = SESSION.post(
        BACKEND_INTERNAL_URL,
        json=payload,
        headers={"x-internal-token": INTERNAL_API_TOKEN, "Content-Type": "application/json"},
        timeout=TIMEOUT_SEC,
    )
    if r.status_code == 429:
        raise RuntimeError(f"429 from backend: {r.text[:200]}")
    if r.status_code >= 300:
        raise RuntimeError(f"POST failed {r.status_code}: {r.text[:200]}")
    return r.json()

def to_payload(source: str, url: str, title: str, description: str,
               eligibility: str,
               default_currency: str,
               deadline_hint: Optional[str] = None,
               amount_hint: Optional[str] = None) -> Dict[str, Any]:
    fund_min, fund_max, currency = parse_amounts(
        (amount_hint or "") + " " + title + " " + description,
        default_currency=default_currency or "USD"
    )
    deadline_iso = parse_deadline(deadline_hint or description) or "2030-01-01T00:00:00.000Z"
    return {
        "source": source,
        "sourceId": sha1(url)[:32],
        "url": url,
        "title": (title or "Untitled")[:500],
        "description": (description or "No description provided.")[:5000],
        "eligibility": (eligibility or "See source page.")[:2000],
        "fundingMin": fund_min,
        "fundingMax": fund_max,
        "currency": currency,
        "deadline": deadline_iso,
    }

# ----------------- LOAD SOURCES -----------------
def load_sources() -> Tuple[List[Dict[str, Any]], Dict[str, Any]]:
    path = os.path.join(os.path.dirname(__file__), "sources.yml")
    if not os.path.exists(path):
        hard_fail(f"sources.yml not found at {path}")
    with open(path, "r") as f:
        y = yaml.safe_load(f) or {}
    feeds = y.get("feeds", [])
    defaults = y.get("defaults", {}) or {}
    return feeds, defaults

# ----------------- COLLECTORS -----------------
def collect_rss(feed_name: str, url: str, limit: int, default_currency: str) -> List[Dict[str, Any]]:
    log("info", "RSS fetch", feed=feed_name, url=url)
    parsed = feedparser.parse(url)
    items = []
    for entry in parsed.entries[:limit]:
        try:
            title = getattr(entry, "title", "") or ""
            link  = getattr(entry, "link", "") or ""
            if not title or not link:
                continue
            desc = ""
            for k in ("summary", "description"):
                v = getattr(entry, k, None)
                if isinstance(v, str): desc = v; break
            if not desc:
                v = getattr(entry, "content", None)
                if isinstance(v, list) and v and isinstance(v[0], dict) and "value" in v[0]:
                    desc = v[0]["value"]
            payload = to_payload(feed_name, link, title, desc, "See source page.", default_currency)
            items.append(payload)
        except Exception as e:
            log("warn", "RSS entry parse error", error=str(e))
    log("info", "RSS parsed", feed=feed_name, count=len(items))
    return items

def collect_autorss(feed_name: str, homepage: str, limit: int, default_currency: str) -> List[Dict[str, Any]]:
    log("info", "Auto-discovering feeds", url=homepage)
    feeds = feedfinder2.findFeeds(homepage)[:5]
    out = []
    for f in feeds:
        out.extend(collect_rss(feed_name, f, limit, default_currency))
    return out[:limit]

def collect_sitemap_urls(name: str, url: str, include: List[str], limit: int) -> List[str]:
    resp = fetch(url)
    if not resp: return []
    soup = BeautifulSoup(resp.text, "xml")
    locs = [loc.text.strip() for loc in soup.find_all("loc")]
    urls = []
    for u in locs:
        if include and not any(pat in u for pat in include):
            continue
        urls.append(u)
        if len(urls) >= limit: break
    log("info", "Sitemap urls", feed=name, count=len(urls))
    return urls

def download_and_readable(url: str) -> Optional[lxml_html.HtmlElement]:
    resp = fetch(url)
    if not resp: return None
    try:
        doc = Document(resp.text)
        html_clean = doc.summary(html_partial=True)
        return lxml_html.fromstring(html_clean)
    except Exception:
        try:
            return lxml_html.fromstring(resp.text)
        except Exception:
            return None

def crawl_html(seed_urls: List[str],
               same_host_only: bool,
               include_patterns: List[str],
               exclude_patterns: List[str],
               max_pages: int,
               per_page_delay_ms: int) -> List[str]:
    seen: Set[str] = set()
    queue: List[str] = list(dict.fromkeys(seed_urls))
    out: List[str] = []

    # robots
    robots_txt = None
    try:
        base = seed_urls[0]
        base_parsed = urlparse(base)
        robots_url = f"{base_parsed.scheme}://{base_parsed.netloc}/robots.txt"
        r = SESSION.get(robots_url, timeout=10)
        robots_txt = r.text if r.status_code < 400 else None
    except Exception:
        robots_txt = None

    while queue and len(out) < max_pages:
        url = queue.pop(0)
        if url in seen: continue
        seen.add(url)

        if robots_txt and not allowed_by_robots(robots_txt, url):
            log("debug", "Blocked by robots.txt", url=url); continue

        resp = fetch(url)
        if not resp: continue

        out.append(url)

        try:
            soup = BeautifulSoup(resp.text, "html.parser")
            for a in soup.find_all("a", href=True):
                href = a["href"].strip()
                if href.startswith("#") or href.startswith("mailto:"): continue
                next_url = urljoin(url, href)

                if same_host_only and not same_host(next_url, url):
                    continue
                if include_patterns and not any(pat.lower() in next_url.lower() for pat in include_patterns):
                    continue
                if exclude_patterns and any(pat.lower() in next_url.lower() for pat in exclude_patterns):
                    continue
                if next_url not in seen and len(queue) + len(out) < max_pages * 2:
                    queue.append(next_url)
        except Exception:
            pass

        sleep_ms(per_page_delay_ms or REQUEST_DELAY_MS)

    log("info", "Crawl completed", pages=len(out))
    return out

def apply_rules(page_url: str, rules: Dict[str, Any]) -> Dict[str, str]:
    root = download_and_readable(page_url)
    if root is None:
        return {"title":"","description":"","deadline":"","amount":"","eligibility":""}

    title = extract_first_css(root, (rules.get("title") or {}).get("css")) or \
            extract_first_css(root, "h1, h2, title")
    desc  = extract_first_css(root, (rules.get("description") or {}).get("css")) or \
            extract_first_css(root, "main, article, .content, body")

    eligibility = ""
    elig_rule = rules.get("eligibility") or {}
    if elig_rule:
        eligibility = extract_first_css(root, elig_rule.get("css"))

    # deadline
    deadline_text = ""
    dl_rule = rules.get("deadline") or {}
    if dl_rule.get("css"):
        t = extract_first_css(root, dl_rule["css"])
        deadline_text = regex_group(dl_rule.get("regex",""), t) or t
    else:
        deadline_text = regex_group(dl_rule.get("regex",""), textify(root)) or ""

    # amount
    amount_text = ""
    amt_rule = rules.get("amount") or {}
    if amt_rule.get("css"):
        t = extract_first_css(root, amt_rule["css"])
        amount_text = regex_group(amt_rule.get("regex",""), t) or t
    else:
        amount_text = regex_group(amt_rule.get("regex",""), textify(root)) or ""

    return {
        "title": (title or "").strip(),
        "description": (desc or "").strip(),
        "deadline": (deadline_text or "").strip(),
        "amount": (amount_text or "").strip(),
        "eligibility": (eligibility or "").strip(),
    }

def collect_html(name: str, cfg: Dict[str, Any], default_currency: str) -> List[Dict[str, Any]]:
    seeds = cfg.get("start_urls", []) or []
    if not seeds: return []
    pages = crawl_html(
        seed_urls=seeds,
        same_host_only=bool(cfg.get("same_host_only", True)),
        include_patterns=cfg.get("include_patterns", []),
        exclude_patterns=cfg.get("exclude_patterns", []),
        max_pages=int(cfg.get("max_pages", 150)),
        per_page_delay_ms=int(cfg.get("per_page_delay_ms", REQUEST_DELAY_MS))
    )
    items: List[Dict[str, Any]] = []
    rules = cfg.get("rules", {}) or {}
    limit = int(cfg.get("limit", BATCH_LIMIT))
    for p in pages[:limit]:
        try:
            fields = apply_rules(p, rules)
            if not (fields.get("title") and fields.get("description")):
                continue
            payload = to_payload(
                source=name,
                url=p,
                title=fields.get("title",""),
                description=fields.get("description",""),
                eligibility=fields.get("eligibility","") or "See source page.",
                default_currency=default_currency,
                deadline_hint=fields.get("deadline",""),
                amount_hint=fields.get("amount",""),
            )
            items.append(payload)
        except Exception as e:
            log("warn", "HTML extract error", url=p, error=str(e))
    log("info", "HTML items", feed=name, count=len(items))
    return items

def search_web(queries: List[str], max_results: int) -> List[str]:
    urls: List[str] = []
    if SERPAPI_KEY:
        for q in queries:
            try:
                r = SESSION.get("https://serpapi.com/search.json",
                                params={"engine":"google", "q":q, "num":max_results, "api_key":SERPAPI_KEY},
                                timeout=TIMEOUT_SEC)
                if r.status_code < 400:
                    data = r.json()
                    for item in (data.get("organic_results") or [])[:max_results]:
                        u = item.get("link")
                        if u: urls.append(u)
            except Exception as e:
                log("warn", "SerpAPI search failed", error=str(e), query=q)
    elif BING_API_KEY:
        headers = {"Ocp-Apim-Subscription-Key": BING_API_KEY}
        for q in queries:
            try:
                r = SESSION.get("https://api.bing.microsoft.com/v7.0/search",
                                params={"q": q, "count": max_results},
                                headers=headers, timeout=TIMEOUT_SEC)
                if r.status_code < 400:
                    data = r.json()
                    for item in (data.get("webPages", {}).get("value") or [])[:max_results]:
                        u = item.get("url")
                        if u: urls.append(u)
            except Exception as e:
                log("warn", "Bing search failed", error=str(e), query=q)
    else:
        log("warn", "Search disabled (no SERPAPI_KEY or BING_API_KEY)")
    return list(dict.fromkeys(urls))

def collect_search(name: str, cfg: Dict[str, Any], default_currency: str) -> List[Dict[str, Any]]:
    queries = cfg.get("queries", []) or []
    max_results = int(cfg.get("max_results_per_query", 25))
    rules = cfg.get("rules", {}) or {}
    seeds = search_web(queries, max_results)

    items: List[Dict[str, Any]] = []
    limit = int(cfg.get("limit", BATCH_LIMIT))
    include_patterns = cfg.get("include_patterns", [])
    same_host_only = bool(cfg.get("same_host_only", True))

    for seed in seeds:
        if len(items) >= limit: break
        host_pages = crawl_html(
            seed_urls=[seed],
            same_host_only=same_host_only,
            include_patterns=include_patterns,
            exclude_patterns=cfg.get("exclude_patterns", []),
            max_pages=10,  # shallow crawl
            per_page_delay_ms=int(cfg.get("per_page_delay_ms", REQUEST_DELAY_MS))
        )
        for p in host_pages:
            if len(items) >= limit: break
            try:
                fields = apply_rules(p, rules)
                if not (fields.get("title") and fields.get("description")):
                    continue
                payload = to_payload(
                    source=name,
                    url=p,
                    title=fields.get("title",""),
                    description=fields.get("description",""),
                    eligibility=fields.get("eligibility","") or "See source page.",
                    default_currency=default_currency,
                    deadline_hint=fields.get("deadline",""),
                    amount_hint=fields.get("amount",""),
                )
                items.append(payload)
            except Exception as e:
                log("warn", "Search extract error", url=p, error=str(e))

    log("info", "Search items", feed=name, count=len(items))
    return items

def post_items(items: List[Dict[str, Any]]) -> int:
    posted = 0
    for payload in items:
        try:
            res = post_grant(payload)
            posted += 1
            log("info", "Posted grant", title=payload["title"][:140], id_hint=res.get("id"))
            sleep_ms(400)  # be polite to downstream summarizers
        except Exception as e:
            log("error", "Post failed", error=str(e), title=payload.get("title",""))
    return posted

# ----------------- MAIN -----------------
def main():
    total_posted = 0
    try:
        feeds, defaults = load_sources()
        if not feeds:
            hard_fail("No feeds defined in sources.yml")
        default_currency = (defaults.get("currency") if isinstance(defaults, dict) else None) or "USD"

        for f in feeds:
            name = f.get("name") or f.get("source") or "unknown"
            typ  = (f.get("type") or "rss").lower()
            limit = int(f.get("limit", BATCH_LIMIT))
            try:
                if typ == "rss":
                    items = collect_rss(name, f["url"], limit, default_currency)
                elif typ == "autorss":
                    items = collect_autorss(name, f["url"], limit, default_currency)
                elif typ == "sitemap":
                    urls = collect_sitemap_urls(name, f["url"], f.get("include_patterns", []), limit*2)
                    rules = f.get("rules", {"title":{"css":"h1, h2"}, "description":{"css":"main, article, .content"}})
                    items = []
                    for p in urls[:limit]:
                        fields = apply_rules(p, rules)
                        if not (fields.get("title") and fields.get("description")):
                            continue
                        payload = to_payload(
                            source=name, url=p,
                            title=fields.get("title",""),
                            description=fields.get("description",""),
                            eligibility=fields.get("eligibility","") or "See source page.",
                            default_currency=default_currency,
                            deadline_hint=fields.get("deadline",""),
                            amount_hint=fields.get("amount",""),
                        )
                        items.append(payload)
                elif typ == "html":
                    items = collect_html(name, f, default_currency)
                elif typ == "search":
                    items = collect_search(name, f, default_currency)
                else:
                    log("warn", "Unknown type; skipping", type=typ, feed=name)
                    continue

                total_posted += post_items(items)
            except KeyError as ke:
                log("error", "Feed config missing key", feed=name, missing=str(ke))
            except Exception as e:
                log("error", "Feed processing error", feed=name, error=str(e))

        log("info", "Scraper completed", posted=total_posted, dryRun=DRY_RUN)
    except Exception as e:
        log("error", "Fatal crash", error=str(e), tb=traceback.format_exc())
        sys.exit(1)

if __name__ == "__main__":
    main()
