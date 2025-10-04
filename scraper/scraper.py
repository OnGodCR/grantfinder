#!/usr/bin/env python3
# Multi-source Grant Scraper: RSS + auto-RSS + sitemap + HTML + web search
# ✅ Changes vs your original:
#    1) Robust requests session with retries & browser-like headers
#    2) Safer HTML pipeline (strip control chars; Readability -> lxml -> BeautifulSoup fallback)
#    3) Authorization: Bearer <INTERNAL_API_TOKEN> to match your Express middleware
#    4) Fetch pacing and body size cap to reduce errors / timeouts

import os, sys, time, json, re, traceback, hashlib
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional, Set, Tuple
from urllib.parse import urljoin, urlparse

import requests
import yaml
import textwrap
import feedparser
from tenacity import retry, wait_exponential_jitter, stop_after_attempt

from lxml import html as lxml_html
from bs4 import BeautifulSoup
from readability import Document
import dateparser
from urllib import robotparser
import feedfinder2

from requests.adapters import HTTPAdapter, Retry
from tenacity import RetryError

# ----------------- ENV / CONFIG -----------------
def _dequote(s: str | None) -> str:
    s = (s or "").strip()
    # strip one pair of surrounding quotes if present
    if (s.startswith('"') and s.endswith('"')) or (s.startswith("'") and s.endswith("'")):
        s = s[1:-1].strip()
    return s

# ----------------- FILTERS / LIMITS -----------------
# Keywords used to keep only grant-like items from RSS/HTML.
# You can override with SCRAPER_KEYWORDS (comma-separated).
GRANT_KEYWORDS = [
    kw.strip().lower() for kw in
    (os.getenv("SCRAPER_KEYWORDS") or
     "grant, funding, fellowship, rfp, rfa, solicitation, opportunity, award, "
     "scholarship, bursary, stipend, prize, competition, challenge, initiative, "
     "program, project, research, innovation, startup, accelerator, incubator, "
     "venture, investment, capital, finance, financial, support, assistance, "
     "sponsorship, donation, contribution, endowment, bequest, legacy, "
     "philanthropy, charitable, nonprofit, foundation, trust, fund, "
     "application, apply, deadline, due, closing, submission, proposal, "
     "request, call, announcement, notice, circular, bulletin, "
     "government, federal, state, local, municipal, public, private, "
     "corporate, business, commercial, industry, sector, field, "
     "education, academic, university, college, school, institution, "
     "research, development, innovation, technology, science, "
     "arts, culture, humanities, social, community, health, medical, "
     "environment, climate, sustainability, energy, renewable, "
     "international, global, worldwide, cross-border, transnational"
    ).split(",")
    if kw.strip()
]

# Max response bytes we’ll read from any HTTP fetch
MAX_BODY = int(os.getenv("SCRAPER_MAX_BODY_BYTES", "2000000"))

# ----------------- HINTS FOR SCORING/PARSING -----------------
# Comma-separated env overrides:
#   SCRAPER_DEADLINE_HINTS="deadline,due date,applications due"
#   SCRAPER_AMOUNT_HINTS="budget,funding amount,award,up to,$,€"
DEADLINE_HINTS = [
    h.strip().lower()
    for h in (os.getenv("SCRAPER_DEADLINE_HINTS") or
              "deadline, due date, submission deadline, applications due, "
              "closing date, full proposal due, letter of intent due, LOI due"
             ).split(",")
    if h.strip()
]

AMOUNT_HINTS = [
    h.strip().lower()
    for h in (os.getenv("SCRAPER_AMOUNT_HINTS") or
              "amount, award, funding, budget, total costs, up to, maximum, min, max, $, €, £"
             ).split(",")
    if h.strip()
]

BACKEND_INTERNAL_URL = _dequote(os.getenv("BACKEND_INTERNAL_URL"))  # e.g., https://.../api/internal/grants
INTERNAL_API_TOKEN   = _dequote(os.getenv("INTERNAL_API_TOKEN"))

BATCH_LIMIT          = int(os.getenv("SCRAPER_BATCH_LIMIT", "10"))
LOG_LEVEL            = (os.getenv("SCRAPER_LOG_LEVEL", "info") or "info").lower()
DRY_RUN              = (os.getenv("SCRAPER_DRY_RUN", "false") or "false").lower() == "true"
TIMEOUT_SEC          = int(os.getenv("SCRAPER_HTTP_TIMEOUT", os.getenv("SCRAPER_TIMEOUT_SEC", "30")))
REQUEST_DELAY_MS     = int(os.getenv("SCRAPER_DELAY_MS", os.getenv("SCRAPER_REQUEST_DELAY_MS", "300")))
USER_AGENT           = os.getenv("SCRAPER_UA", os.getenv("SCRAPER_USER_AGENT", "GrantFinderBot/1.0 (+https://example.com)"))

# Discovery / fan-out
ALLOW_EXTERNAL_FANOUT = (os.getenv("SCRAPER_ALLOW_EXTERNAL_FANOUT", "true") or "true").lower() == "true"
FANOUT_MAX_HOSTS      = int(os.getenv("SCRAPER_FANOUT_MAX_HOSTS", "100"))
FANOUT_DEPTH          = int(os.getenv("SCRAPER_FANOUT_DEPTH", "3"))
ALLOWED_TLDS          = set(((os.getenv("SCRAPER_ALLOWED_TLDS", ".gov,.edu,.org,.int,.com,.net,.uk,.ca,.au,.de,.fr,.es,.it,.nl,.se,.no,.dk,.fi,.ch,.at,.be,.ie,.pt,.pl,.cz,.hu,.ro,.bg,.hr,.si,.sk,.lt,.lv,.ee,.cy,.mt,.lu") or "").lower()).split(","))

# Relevance filter knobs
RELEVANCE_MIN_SCORE   = int(os.getenv("SCRAPER_RELEVANCE_MIN_SCORE", "6"))
TITLE_WEIGHT          = 4
BODY_WEIGHT           = 1

SERPAPI_KEY          = _dequote(os.getenv("SERPAPI_KEY"))      # optional
BING_API_KEY         = _dequote(os.getenv("BING_API_KEY"))     # optional
GOOGLE_API_KEY       = _dequote(os.getenv("GOOGLE_API_KEY"))   # optional
GOOGLE_CSE_ID        = _dequote(os.getenv("GOOGLE_CSE_ID"))    # optional
DUCKDUCKGO_API_KEY   = _dequote(os.getenv("DUCKDUCKGO_API_KEY")) # optional


def _build_session() -> requests.Session:
    s = requests.Session()
    retries = Retry(
        total=4,
        backoff_factor=0.8,
        status_forcelist=(429, 500, 502, 503, 504),
        allowed_methods=frozenset(["GET", "HEAD", "POST"])
    )
    s.mount("http://", HTTPAdapter(max_retries=retries))
    s.mount("https://", HTTPAdapter(max_retries=retries))
    s.headers.update({
        "User-Agent": USER_AGENT or (
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
            "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
        ),
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Cache-Control": "no-cache",
        "Pragma": "no-cache",
        "Connection": "close",
    })
    return s

SESSION = _build_session()

def auth_sanity_check():
    url = BACKEND_INTERNAL_URL or ""
    tok = (INTERNAL_API_TOKEN or "")
    redacted = tok[:6] + "…" + tok[-6:] if len(tok) >= 12 else "(too-short)"
    log("info", "auth_check.env",
        BACKEND_INTERNAL_URL=url,
        INTERNAL_API_TOKEN_preview=redacted,
        has_quotes=("yes" if tok.startswith('"') or tok.endswith('"') else "no"),
        length=len(tok))
    if not url:
        log("warn", "auth_check.skip", reason="no BACKEND_INTERNAL_URL")
        return
    try:
        # Try Bearer first, then x-internal-token fallback
        for scheme, headers in [
            ("bearer", {"Authorization": f"Bearer {tok}"} if tok else {}),
            ("x-internal-token", {"x-internal-token": tok} if tok else {}),
        ]:
            try:
                r = SESSION.post(url, json={}, headers=headers, timeout=TIMEOUT_SEC)
                body = (r.text or "")[:160].replace("\n", " ")
                log("info", "auth_check.http", scheme=scheme, status=r.status_code, body=body)
                # If backend returns 400 (missing fields), auth worked for this scheme.
                if r.status_code in (400, 422):
                    return
            except Exception as inner:
                log("warn", "auth_check.try_error", scheme=scheme, error=str(inner))
        log("warn", "auth_check.failed_all", note="Both bearer and x-internal-token failed")
    except Exception as e:
        log("error", "auth_check.exception", error=str(e))


@retry(wait=wait_exponential_jitter(initial=1, max=20), stop=stop_after_attempt(5))
def post_grant(payload: Dict[str, Any]) -> Dict[str, Any]:
    if DRY_RUN:
        log("info", "DRY_RUN on, skipping POST", title=payload.get("title"))
        return {"ok": True, "dryRun": True}

    if not BACKEND_INTERNAL_URL:
        hard_fail("Missing BACKEND_INTERNAL_URL")

    # Send BOTH headers to maximize compatibility with your middleware
    headers = {"Content-Type": "application/json"}
    if INTERNAL_API_TOKEN:
        headers["Authorization"] = f"Bearer {INTERNAL_API_TOKEN}"
        headers["x-internal-token"] = INTERNAL_API_TOKEN

    r = SESSION.post(
        BACKEND_INTERNAL_URL,
        json=payload,
        headers=headers,
        timeout=TIMEOUT_SEC,
    )
    if r.status_code == 429:
        raise RuntimeError(f"429 from backend: {r.text[:200]}")
    if r.status_code == 401:
        # Add helpful context in logs
        raise RuntimeError(
            "POST failed 401: Unauthorized. "
            "Tried both Authorization: Bearer and x-internal-token. "
            "Check token value and backend auth middleware."
        )
    if r.status_code >= 300:
        raise RuntimeError(f"POST failed {r.status_code}: {r.text[:200]}")
    try:
        return r.json()
    except Exception:
        return {"ok": r.ok}


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
        r = SESSION.get(url, timeout=TIMEOUT_SEC, allow_redirects=True)
        if r.status_code >= 400:
            log("warn", "Fetch bad status", url=url, status=r.status_code)
            return None
        # trim oversized responses to protect parsers
        if r.content and len(r.content) > MAX_BODY:
            r._content = r.content[:MAX_BODY]
        return r
    except Exception as e:
        log("warn", "Fetch error", url=url, error=str(e))
        return None
    finally:
        sleep_ms(REQUEST_DELAY_MS)

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
    if not robots_txt: return True
    try:
        rp = robotparser.RobotFileParser()
        rp.parse(robots_txt.splitlines())
        return rp.can_fetch(SESSION.headers.get("User-Agent","*"), url)
    except Exception:
        return True

def domain_tld(url: str) -> str:
    try:
        return urlparse(url).netloc.split(".")[-1].lower()
    except Exception:
        return ""

def is_allowed_tld(url: str) -> bool:
    tld = "." + domain_tld(url)
    return (not ALLOWED_TLDS) or (tld in ALLOWED_TLDS)

def relevance_score(title: str, body: str) -> int:
    t = (title or "").lower()
    b = (body or "").lower()

    def hits(text: str, kws: set[str]) -> int:
        score = 0
        for kw in kws:
            if kw in text:
                score += 1
        return score

    score = 0
    score += TITLE_WEIGHT * hits(t, GRANT_KEYWORDS)
    score += BODY_WEIGHT  * hits(b, GRANT_KEYWORDS)
    if any(h in t or h in b for h in DEADLINE_HINTS): score += 1
    if any(h in t or h in b for h in AMOUNT_HINTS):   score += 1
    return score

def looks_like_grant_page(url: str, title: str, description: str) -> bool:
    return relevance_score(title, description) >= RELEVANCE_MIN_SCORE

# ----------------- HTML Sanitation & Readability Fallback -----------------
CONTROL_CHARS_RE = re.compile(r"[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]")

def _safe_text(s: str) -> str:
    if not s: return ""
    return CONTROL_CHARS_RE.sub(" ", s)

def download_and_readable(url: str) -> Optional[lxml_html.HtmlElement]:
    resp = fetch(url)
    if not resp:
        return None

    raw = resp.text or ""
    raw = _safe_text(raw)

    # Try Readability first, sanitized
    try:
        doc = Document(raw)
        summary_html = doc.summary(html_partial=True)
        summary_html = _safe_text(summary_html or "")
        return lxml_html.fromstring(summary_html)
    except Exception:
        pass

    # Fallback: plain DOM of the whole page (sanitized)
    try:
        return lxml_html.fromstring(raw)
    except Exception:
        # Final fallback: BeautifulSoup → text in a minimal container
        try:
            soup = BeautifulSoup(raw, "html.parser")
            text = soup.get_text(separator=" ", strip=True)
            html_min = f"<html><body><article>{_safe_text(text)}</article></body></html>"
            return lxml_html.fromstring(html_min)
        except Exception:
            return None

# ----------------- POST TO BACKEND -----------------

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

            if not looks_like_grant_page(link, title, desc):
                continue

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

def crawl_html(seed_urls: List[str],
               same_host_only: bool,
               include_patterns: List[str],
               exclude_patterns: List[str],
               max_pages: int,
               per_page_delay_ms: int,
               fanout_depth: int = FANOUT_DEPTH) -> List[str]:
    seen: Set[str] = set()
    queue: List[Tuple[str,int]] = [(u, 0) for u in dict.fromkeys(seed_urls)]
    out: List[str] = []
    distinct_hosts: Set[str] = set()

    # robots from first seed host (best effort)
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
        url, depth = queue.pop(0)
        if url in seen:
            continue
        seen.add(url)

        if robots_txt and not allowed_by_robots(robots_txt, url):
            log("debug", "Blocked by robots.txt", url=url)
            continue

        resp = fetch(url)
        if not resp:
            continue

        out.append(url)
        host = urlparse(url).netloc
        distinct_hosts.add(host)
        if len(distinct_hosts) > FANOUT_MAX_HOSTS:
            continue

        try:
            soup = BeautifulSoup(resp.text, "html.parser")
            for a in soup.find_all("a", href=True):
                href = a["href"].strip()
                if href.startswith("#") or href.startswith("mailto:"):
                    continue
                next_url = urljoin(url, href)

                # respect scoping / fan-out
                if same_host_only and not same_host(next_url, url):
                    continue
                if not same_host_only:
                    if depth >= fanout_depth:
                        continue
                    if not is_allowed_tld(next_url):
                        continue

                # include/exclude patterns
                if include_patterns and not any(pat.lower() in next_url.lower() for pat in include_patterns):
                    continue
                if exclude_patterns and any(pat.lower() in next_url.lower() for pat in exclude_patterns):
                    continue

                if next_url not in seen and (len(queue) + len(out)) < max_pages * 3:
                    queue.append((next_url, depth + (0 if same_host_only else 1)))
        except Exception:
            pass

        sleep_ms(per_page_delay_ms or REQUEST_DELAY_MS)

    log("info", "Crawl completed", pages=len(out), hosts=len(distinct_hosts))
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
    # auto-sitemap expansion from robots.txt
    expanded = list(seeds)
    for home in list(seeds):
        try:
            u = urlparse(home)
            robots_url = f"{u.scheme}://{u.netloc}/robots.txt"
            r = SESSION.get(robots_url, timeout=10)
            if r.status_code < 400:
                for line in r.text.splitlines():
                    if line.lower().startswith("sitemap:"):
                        sm = line.split(":",1)[1].strip()
                        expanded.extend(collect_sitemap_urls(name, sm, cfg.get("include_patterns", []), 200))
        except Exception:
            pass
    seeds = list(dict.fromkeys(expanded))

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
            title = fields.get("title","")
            desc  = fields.get("description","")
            if not (title and desc): continue
            if not looks_like_grant_page(p, title, desc): continue

            payload = to_payload(
                source=name,
                url=p,
                title=title,
                description=desc,
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
    
    # Try multiple search engines for better coverage
    search_engines = []
    
    if SERPAPI_KEY:
        search_engines.append(("SerpAPI", search_serpapi))
    if BING_API_KEY:
        search_engines.append(("Bing", search_bing))
    if GOOGLE_API_KEY and GOOGLE_CSE_ID:
        search_engines.append(("Google", search_google))
    
    # If no API keys, try DuckDuckGo (no API key required)
    if not search_engines:
        search_engines.append(("DuckDuckGo", search_duckduckgo))
    
    for engine_name, search_func in search_engines:
        try:
            engine_urls = search_func(queries, max_results)
            urls.extend(engine_urls)
            log("info", f"Search engine {engine_name} found {len(engine_urls)} URLs")
        except Exception as e:
            log("warn", f"Search engine {engine_name} failed", error=str(e))
    
    # Remove duplicates while preserving order
    return list(dict.fromkeys(urls))

def search_serpapi(queries: List[str], max_results: int) -> List[str]:
    urls = []
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
    return urls

def search_bing(queries: List[str], max_results: int) -> List[str]:
    urls = []
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
    return urls

def search_google(queries: List[str], max_results: int) -> List[str]:
    urls = []
    for q in queries:
        try:
            r = SESSION.get("https://www.googleapis.com/customsearch/v1",
                            params={"key": GOOGLE_API_KEY, "cx": GOOGLE_CSE_ID, 
                                   "q": q, "num": min(max_results, 10)},
                            timeout=TIMEOUT_SEC)
            if r.status_code < 400:
                data = r.json()
                for item in (data.get("items") or [])[:max_results]:
                    u = item.get("link")
                    if u: urls.append(u)
        except Exception as e:
            log("warn", "Google search failed", error=str(e), query=q)
    return urls

def search_duckduckgo(queries: List[str], max_results: int) -> List[str]:
    urls = []
    for q in queries:
        try:
            # DuckDuckGo doesn't have a public API, so we'll use their instant answer API
            # This is limited but better than nothing
            r = SESSION.get("https://api.duckduckgo.com/",
                            params={"q": q, "format": "json", "no_html": "1", "skip_disambig": "1"},
                            timeout=TIMEOUT_SEC)
            if r.status_code < 400:
                data = r.json()
                # DuckDuckGo instant answers don't provide many URLs, but we can try
                for item in (data.get("RelatedTopics") or [])[:max_results]:
                    if isinstance(item, dict) and "FirstURL" in item:
                        urls.append(item["FirstURL"])
        except Exception as e:
            log("warn", "DuckDuckGo search failed", error=str(e), query=q)
    return urls

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
            max_pages=10,
            per_page_delay_ms=int(cfg.get("per_page_delay_ms", REQUEST_DELAY_MS))
        )
        for p in host_pages:
            if len(items) >= limit: break
            try:
                fields = apply_rules(p, rules)
                title = fields.get("title","")
                desc  = fields.get("description","")
                if not (title and desc): continue
                if not looks_like_grant_page(p, title, desc): continue

                payload = to_payload(
                    source=name,
                    url=p,
                    title=title,
                    description=desc,
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
            sleep_ms(400)  # be polite to downstream
        except Exception as e:
            # Unwrap Tenacity to surface the real error text/status
            err_txt = str(e)
            try:
                if isinstance(e, RetryError) and e.last_attempt:
                    inner = e.last_attempt.exception()
                    if inner:
                        err_txt = f"{type(inner).__name__}: {inner}"
            except Exception:
                pass
            log("error", "Post failed", title=payload.get("title",""), error=err_txt, url=payload.get("url",""))
    return posted

# ----------------- MAIN -----------------
def main():
    auth_sanity_check()
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
                        title = fields.get("title","")
                        desc  = fields.get("description","")
                        if not (title and desc): continue
                        if not looks_like_grant_page(p, title, desc): continue
                        payload = to_payload(
                            source=name, url=p,
                            title=title, description=desc,
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
