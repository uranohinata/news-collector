#!/usr/bin/env python3
import html
import json
import re
import urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime, timezone
from email.utils import parsedate_to_datetime
from pathlib import Path

FEEDS = [
    {
        "name": "NHK NEWS WEB",
        "url": "https://www3.nhk.or.jp/rss/news/cat0.xml",
        "category": "ニュース",
        "key": "all",
    },
    {
        "name": "ITmedia NEWS",
        "url": "https://rss.itmedia.co.jp/rss/2.0/news_bursts.xml",
        "category": "テクノロジー",
        "key": "technology",
    },
    {
        "name": "GIGAZINE",
        "url": "https://gigazine.net/news/rss_2.0/",
        "category": "テクノロジー",
        "key": "technology",
    },
]
USER_AGENT = "news-collector/1.0 (+https://github.com/uranohinata/news-collector)"


def clean_text(value):
    value = html.unescape(value or "")
    return re.sub(r"\s+", " ", re.sub(r"<[^>]+>", "", value)).strip()


def text(element, names):
    for name in names:
        child = element.find(name)
        if child is not None and child.text:
            return clean_text(child.text)
    return ""


def item_link(item):
    link = item.find("link")
    if link is not None:
        if link.text:
            return link.text.strip()
        if link.attrib.get("href"):
            return link.attrib["href"]
    for child in item:
        if child.tag.endswith("link") and child.attrib.get("href"):
            return child.attrib["href"]
    return ""


def published_at(value):
    if not value:
        return datetime.now(timezone.utc).isoformat()
    try:
        return parsedate_to_datetime(value).astimezone(timezone.utc).isoformat()
    except (TypeError, ValueError, OverflowError):
        return value


def fetch_feed(feed):
    request = urllib.request.Request(feed["url"], headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(request, timeout=20) as response:
        root = ET.fromstring(response.read())
    items = root.findall(".//item")
    if not items:
        items = root.findall(".//{http://www.w3.org/2005/Atom}entry")
    articles = []
    for item in items[:10]:
        title = text(item, ["title", "{http://www.w3.org/2005/Atom}title"])
        url = item_link(item)
        if not title or not url:
            continue
        summary = text(item, ["description", "summary", "{http://www.w3.org/2005/Atom}summary"])
        date = text(item, ["pubDate", "published", "updated", "{http://www.w3.org/2005/Atom}published"])
        articles.append(
            {
                "category": feed["category"],
                "key": feed["key"],
                "source": feed["name"],
                "time": published_at(date),
                "title": title,
                "description": summary[:180],
                "url": url,
                "visual": "ai" if feed["key"] == "technology" else "climate",
            }
        )
    return articles


def main():
    articles = []
    errors = []
    for feed in FEEDS:
        try:
            articles.extend(fetch_feed(feed))
        except Exception as error:
            errors.append(f"{feed['name']}: {error}")
    if not articles:
        raise RuntimeError("RSSを1件も取得できませんでした: " + " / ".join(errors))
    articles.sort(key=lambda article: article["time"], reverse=True)
    output = {
        "updatedAt": datetime.now(timezone.utc).isoformat(),
        "articles": articles[:30],
        "errors": errors,
    }
    destination = Path(__file__).resolve().parents[1] / "data" / "news.json"
    destination.parent.mkdir(exist_ok=True)
    destination.write_text(json.dumps(output, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"取得: {len(articles)}件 / 失敗: {len(errors)}件")
    for error in errors:
        print(f"警告: {error}")


if __name__ == "__main__":
    main()
