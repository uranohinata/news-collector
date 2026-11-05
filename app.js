const articles = [
  { category: "テクノロジー", key: "technology", source: "TechCrunch Japan", time: "15分前", title: "生成AIは次のステージへ。企業が注目する最新トレンドと未来", description: "ビジネスの現場で急速に広がる生成AI。その可能性と課題を専門家が詳しく解説します。", visual: "ai", url: "https://jp.techcrunch.com/" },
  { category: "サイエンス", key: "science", source: "WIRED.jp", time: "42分前", title: "気候変動を止めるために、私たちが今知っておくべきこと", description: "最新の研究から見えてきた、持続可能な未来に向けた取り組みを紹介。", visual: "climate", url: "https://wired.jp/" },
  { category: "ビジネス", key: "business", source: "日本経済新聞", time: "1時間前", title: "宇宙ビジネスの新時代。民間企業が切り拓く次のフロンティア", description: "新たな投資先としても注目を集める宇宙産業の現在とこれから。", visual: "space", url: "https://www.nikkei.com/" },
  { category: "テクノロジー", key: "technology", source: "日経クロステック", time: "2時間前", title: "データで見る、これからのデジタル社会", description: "暮らしと産業を変える技術の進化を、最新データとともに読み解きます。", visual: "ai", url: "https://xtech.nikkei.com/" },
];

const list = document.querySelector("#article-list");
const searchInput = document.querySelector("#search-input");
const loadMore = document.querySelector("#load-more");
const resultCount = document.querySelector("#result-count");
const dialog = document.querySelector("#article-dialog");
const dialogTitle = document.querySelector("#dialog-title");
const dialogCategory = document.querySelector("#dialog-category");
const dialogMeta = document.querySelector("#dialog-meta");
const dialogDescription = document.querySelector("#dialog-description");
const dialogRead = document.querySelector("#dialog-read");
const dialogSave = document.querySelector("#dialog-save");
let activeFilter = "all";
let visibleCount = 3;
const saved = new Set();
let openedArticleIndex = null;

function renderArticles() {
  const query = searchInput.value.trim().toLowerCase();
  const filtered = articles.filter((article, index) => {
    const matchesFilter = activeFilter === "all" || (activeFilter === "saved" ? saved.has(index) : article.key === activeFilter);
    const matchesSearch = !query || `${article.title} ${article.description} ${article.source}`.toLowerCase().includes(query);
    return matchesFilter && matchesSearch;
  });
  resultCount.textContent = `${filtered.length}件`;
  list.innerHTML = filtered.slice(0, visibleCount).map((article, index) => {
    const originalIndex = articles.indexOf(article);
    return `<article class="article-card" tabindex="0" role="button" data-article-index="${originalIndex}">
      <div class="article-image ${article.visual}" aria-hidden="true">${article.key === "technology" ? "技術" : article.key === "science" ? "環境" : "宇宙"}</div>
      <div class="article-body">
        <div class="article-meta"><b>${article.category}</b>${article.source}　${article.time}</div>
        <h3>${article.title}</h3><p>${article.description}</p>
      </div>
      <button class="bookmark ${saved.has(originalIndex) ? "saved" : ""}" aria-label="記事を保存する" data-index="${originalIndex}">${saved.has(originalIndex) ? "★" : "☆"}</button>
    </article>`;
  }).join("");
  loadMore.hidden = filtered.length <= visibleCount;
}

document.querySelectorAll(".filter-chip").forEach((chip) => {
  chip.addEventListener("click", () => {
    document.querySelector(".filter-chip.active").classList.remove("active");
    chip.classList.add("active");
    activeFilter = chip.dataset.filter;
    visibleCount = 3;
    renderArticles();
  });
});
document.querySelector(".topic-button").addEventListener("click", () => {
  document.querySelector('[data-filter="technology"]').click();
});
searchInput.addEventListener("input", renderArticles);
loadMore.addEventListener("click", () => { visibleCount += 3; renderArticles(); });
document.querySelector("#refresh-button").addEventListener("click", (event) => {
  const button = event.currentTarget;
  button.disabled = true;
  button.innerHTML = "<span>↻</span> 更新中";
  setTimeout(() => { button.disabled = false; button.innerHTML = "<span>↻</span> 更新"; }, 600);
});
list.addEventListener("click", (event) => {
  const bookmark = event.target.closest(".bookmark");
  if (bookmark) {
    const index = Number(bookmark.dataset.index);
    saved.has(index) ? saved.delete(index) : saved.add(index);
    renderArticles();
    return;
  }
  const card = event.target.closest(".article-card");
  if (card) openArticle(Number(card.dataset.articleIndex));
});
list.addEventListener("keydown", (event) => {
  if (event.key !== "Enter" && event.key !== " ") return;
  const card = event.target.closest(".article-card");
  if (card) { event.preventDefault(); openArticle(Number(card.dataset.articleIndex)); }
});
function openArticle(index) {
  const article = articles[index];
  if (!article) return;
  openedArticleIndex = index;
  dialogCategory.textContent = article.category;
  dialogTitle.textContent = article.title;
  dialogMeta.textContent = `${article.source}　${article.time}`;
  dialogDescription.textContent = article.description;
  dialogRead.href = article.url;
  dialogRead.setAttribute("aria-label", `${article.source}の情報源を開く`);
  dialogSave.textContent = saved.has(index) ? "★ 保存済み" : "☆ 保存する";
  dialog.showModal();
}
document.querySelector("#dialog-close").addEventListener("click", () => dialog.close());
dialog.addEventListener("click", (event) => {
  if (event.target === dialog) dialog.close();
});
dialogSave.addEventListener("click", () => {
  if (openedArticleIndex === null) return;
  saved.has(openedArticleIndex) ? saved.delete(openedArticleIndex) : saved.add(openedArticleIndex);
  dialogSave.textContent = saved.has(openedArticleIndex) ? "★ 保存済み" : "☆ 保存する";
  renderArticles();
});
renderArticles();
