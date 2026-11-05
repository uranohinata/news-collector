# news-collector
ニュースと記事を収集・整理するダッシュボード
## ニュースハブ

RSSから日本語ニュースを取得し、`data/news.json` としてGitHub Pagesで表示するニュースリーダーです。

### 更新の仕組み

GitHub Actionsが30分ごとに `scripts/fetch_news.py` を実行し、NHK NEWS WEB、ITmedia NEWS、GIGAZINEのRSSを取得して記事のタイトル・概要・日時・元記事URLを更新します。手動で更新する場合は、Actionsの「ニュースを更新」から「Run workflow」を実行してください。

RSS提供元の仕様変更や一時的な障害で取得できないフィードがあっても、取得できたフィードの記事は更新されます。
