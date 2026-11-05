const articles = [
  { category: "テクノロジー", key: "technology", source: "TechCrunch Japan", time: "15分前", title: "生成AIは次のステージへ。企業が注目する最新トレンドと未来", description: "ビジネスの現場で急速に広がる生成AI。その可能性と課題を専門家が詳しく解説します。", visual: "ai" },
  { category: "サイエンス", key: "science", source: "WIRED.jp", time: "42分前", title: "気候変動を止めるために、私たちが今知っておくべきこと", description: "最新の研究から見えてきた、持続可能な未来に向けた取り組みを紹介。", visual: "climate" },
  { category: "ビジネス", key: "business", source: "日本経済新聞", time: "1時間前", title: "宇宙ビジネスの新時代。民間企業が切り拓く次のフロンティア", description: "新たな投資先としても注目を集める宇宙産業の現在とこれから。", visual: "space" },
  { category: "テクノロジー", key: "technology", source: "日経クロステック", time: "2時間前", title: "データで見る、これからのデジタル社会", description: "暮らしと産業を変える技術の進化を、最新データとともに読み解きます。", visual: "ai" },
];

const list = document.querySelector("#article-list");
const searchInput = document.querySelector("#search-input");
const loadMore = document.querySelector("#load-more");
let activeFilter = "all";
let visibleCount = 3;

function renderArticles() {
  const query = searchInput.value.trim().toLowerCase();
  const filtered = articles.filter((article) => {
    const matchesFilter = activeFilter === "all" || article.key === activeFilter;
    const matchesSearch = !query || `${article.title} ${article.description} ${article.source}`.toLowerCase().includes(query);
    return matchesFilter && matchesSearch;
  });

  list.innerHTML = filtered.slice(0, visibleCount).map((article, index) => `
    <article class="article-card">
      <div class="article-image ${article.visual}" aria-hidden="true">${index === 0 ? "AI" : index === 1 ? "eco" : "∞"}</div>
      <div class="article-body">
        <div class="article-meta"><b>${article.category}</b>${article.source}　${article.time}</div>
        <h3>${article.title}</h3>
        <p>${article.description}</p>
        <button class="bookmark" aria-label="記事を保存する" data-index="${index}">☆</button>
      </div>
    </article>
  `).join("");
  loadMore.hidden = filtered.length <= visibleCount;
}

document.querySelectorAll(".tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    document.querySelector(".tab.active").classList.remove("active");
    tab.classList.add("active");
    activeFilter = tab.dataset.filter;
    visibleCount = 3;
    renderArticles();
  });
});

searchInput.addEventListener("input", renderArticles);
loadMore.addEventListener("click", () => {
  visibleCount += 3;
  renderArticles();
});
document.querySelector("#refresh-button").addEventListener("click", (event) => {
  const button = event.currentTarget;
  button.disabled = true;
  button.innerHTML = "<span>↻</span> 更新中...";
  setTimeout(() => {
    document.querySelector("#article-count").textContent = "131";
    button.disabled = false;
    button.innerHTML = "<span>↻</span> 更新する";
  }, 650);
});
document.querySelector("#view-all").addEventListener("click", () => {
  activeFilter = "all";
  document.querySelector(".tab.active").classList.remove("active");
  document.querySelector('[data-filter="all"]').classList.add("active");
  visibleCount = articles.length;
  renderArticles();
});
list.addEventListener("click", (event) => {
  const bookmark = event.target.closest(".bookmark");
  if (bookmark) {
    bookmark.classList.toggle("saved");
    bookmark.textContent = bookmark.classList.contains("saved") ? "★" : "☆";
  }
});

renderArticles();