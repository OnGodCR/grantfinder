import os, requests, yaml, feedparser
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

BACKEND_URL = os.getenv("BACKEND_INTERNAL_URL", "http://localhost:4000/api/internal/grants")
TOKEN = os.getenv("INTERNAL_API_TOKEN")

def post_grant(payload):
    headers = {"Content-Type": "application/json", "x-internal-token": TOKEN}
    r = requests.post(BACKEND_URL, json=payload, headers=headers, timeout=30)
    if r.status_code != 200:
        print("Failed to post grant:", r.status_code, r.text)
    else:
        print("Posted grant:", payload.get("title"))

def parse_rss(source):
    rss_url = source["rss"]
    d = feedparser.parse(rss_url)
    for entry in d.entries[:25]:  # take recent items
        title = entry.get("title", "Untitled")
        link = entry.get("link")
        desc = entry.get("summary", "") or entry.get("description", "")
        published = entry.get("published") or entry.get("updated")
        deadline = None
        if published:
            try:
                deadline = datetime(*entry.published_parsed[:6]).isoformat()
            except Exception:
                deadline = None

        payload = {
            "source": source["name"],
            "sourceId": f"{source.get('source_id_prefix','src')}:{link or title}",
            "url": link,
            "title": title,
            "description": desc,
            "deadline": deadline,
            "eligibility": None,
            "agencyName": source.get("agency"),
            "fundingMin": None,
            "fundingMax": None,
            "currency": "USD"
        }
        post_grant(payload)

def main():
    with open(os.path.join(os.path.dirname(__file__), "sources.yml"), "r", encoding="utf-8") as f:
        cfg = yaml.safe_load(f)
    for src in cfg.get("sources", []):
        parse_rss(src)

if __name__ == "__main__":
    main()
