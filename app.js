let articles = [];
const fallbackArticles = [
  { category: "テクノロジー", key: "technology", source: "サンプル記事", time: "準備中", title: "ニュースを取得しています", description: "RSSから最新の記事を読み込んでいます。", visual: "ai", url: "https://www3.nhk.or.jp/news/" },
];
const list = document.querySelector("#article-list");
const searchInput = document.querySelector("#search-input");
const loadMore = document.querySelector("#load-more");
const resultCount = document.querySelector("#result-count");
const dateLabel = document.querySelector("#date-label");
const refreshButton = document.querySelector("#refresh-button");
const dialog = document.querySelector("#article-dialog");
const dialogTitle = document.querySelector("#dialog-title");
const dialogCategory = document.querySelector("#dialog-category");
const dialogMeta = document.querySelector("#dialog-meta");
const dialogDescription = document.querySelector("#dialog-description");
const dialogRead = document.querySelector("#dialog-read");
const dialogSave = document.querySelector("#dialog-save");
let activeFilter = "all";
let visibleCount = 10;
const saved = new Set(JSON.parse(localStorage.getItem("savedArticles") || "[]"));
let openedArticleUrl = null;

const escapeHtml = (value) => String(value || "").replace(/[&<>"']/g, (character) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;",
}[character]));

function formatTime(value) {
  if (!value || value === "準備中") return value || "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const minutes = Math.floor((Date.now() - date.getTime()) / 60000);
  if (minutes < 60) return `${Math.max(1, minutes)}分前`;
  if (minutes < 1440) return `${Math.floor(minutes / 60)}時間前`;
  return date.toLocaleDateString("ja-JP", { month: "numeric", day: "numeric" });
}

function renderArticles() {
  const query = searchInput.value.trim().toLowerCase();
  const filtered = articles.filter((article) => {
    const matchesFilter = activeFilter === "all" || (activeFilter === "saved" ? saved.has(article.url) : article.key === activeFilter);
    const matchesSearch = !query || `${article.title} ${article.description} ${article.source}`.toLowerCase().includes(query);
    return matchesFilter && matchesSearch;
  });
  resultCount.textContent = `${filtered.length}件`;
  list.innerHTML = filtered.slice(0, visibleCount).map((article) => `
    <article class="article-card" tabindex="0" role="button" data-article-url="${escapeHtml(article.url)}">
      <div class="article-image ${escapeHtml(article.visual)}" aria-hidden="true">${article.key === "technology" ? "技術" : article.key === "science" ? "科学" : "ニュース"}</div>
      <div class="article-body">
        <div class="article-meta"><b>${escapeHtml(article.category)}</b>${escapeHtml(article.source)}　${escapeHtml(formatTime(article.time))}</div>
        <h3>${escapeHtml(article.title)}</h3><p>${escapeHtml(article.description)}</p>
      </div>
      <button class="bookmark ${saved.has(article.url) ? "saved" : ""}" aria-label="記事を保存する" data-article-url="${escapeHtml(article.url)}">${saved.has(article.url) ? "★" : "☆"}</button>
    </article>
  `).join("");
  loadMore.hidden = filtered.length <= visibleCount;
}

function openArticle(url) {
  const article = articles.find((item) => item.url === url);
  if (!article) return;
  openedArticleUrl = article.url;
  dialogCategory.textContent = article.category;
  dialogTitle.textContent = article.title;
  dialogMeta.textContent = `${article.source}　${formatTime(article.time)}`;
  dialogDescription.textContent = article.description || "元記事で全文を読むことができます。";
  dialogRead.href = article.url;
  dialogRead.setAttribute("aria-label", `${article.source}の元記事を開く`);
  dialogSave.textContent = saved.has(article.url) ? "★ 保存済み" : "☆ 保存する";
  dialog.showModal();
}

async function loadNews() {
  refreshButton.disabled = true;
  refreshButton.innerHTML = "<span>↻</span> 取得中";
  try {
    const response = await fetch(`data/news.json?${Date.now()}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const payload = await response.json();
    articles = payload.articles?.length ? payload.articles : fallbackArticles;
    dateLabel.textContent = payload.updatedAt ? `最終更新 ${formatTime(payload.updatedAt)}` : "最新情報を取得しています";
  } catch (error) {
    articles = fallbackArticles;
    dateLabel.textContent = "ニュースを取得できませんでした";
    console.error("ニュースの取得に失敗しました", error);
  } finally {
    refreshButton.disabled = false;
    refreshButton.innerHTML = "<span>↻</span> 更新";
    renderArticles();
  }
}

document.querySelectorAll(".filter-chip").forEach((chip) => {
  chip.addEventListener("click", () => {
    document.querySelector(".filter-chip.active").classList.remove("active");
    chip.classList.add("active");
    activeFilter = chip.dataset.filter;
    visibleCount = 10;
    renderArticles();
  });
});
document.querySelector(".topic-button").addEventListener("click", () => document.querySelector('[data-filter="technology"]').click());
searchInput.addEventListener("input", renderArticles);
loadMore.addEventListener("click", () => { visibleCount += 10; renderArticles(); });
refreshButton.addEventListener("click", loadNews);
list.addEventListener("click", (event) => {
  const bookmark = event.target.closest(".bookmark");
  if (bookmark) {
    const url = bookmark.dataset.articleUrl;
    saved.has(url) ? saved.delete(url) : saved.add(url);
    localStorage.setItem("savedArticles", JSON.stringify([...saved]));
    renderArticles();
    return;
  }
  const card = event.target.closest(".article-card");
  if (card) openArticle(card.dataset.articleUrl);
});
list.addEventListener("keydown", (event) => {
  if (event.key !== "Enter" && event.key !== " ") return;
  const card = event.target.closest(".article-card");
  if (card) { event.preventDefault(); openArticle(card.dataset.articleUrl); }
});
document.querySelector("#dialog-close").addEventListener("click", () => dialog.close());
dialog.addEventListener("click", (event) => { if (event.target === dialog) dialog.close(); });
dialogSave.addEventListener("click", () => {
  if (!openedArticleUrl) return;
  saved.has(openedArticleUrl) ? saved.delete(openedArticleUrl) : saved.add(openedArticleUrl);
  localStorage.setItem("savedArticles", JSON.stringify([...saved]));
  dialogSave.textContent = saved.has(openedArticleUrl) ? "★ 保存済み" : "☆ 保存する";
  renderArticles();
});
loadNews();
