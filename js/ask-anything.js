(function () {
  const input = document.getElementById("askAnythingInput");
  const btn = document.getElementById("askAnythingBtn");
  const results = document.getElementById("askAnythingResults");
  if (!input || !btn || !results || !window.WCA_SEARCH_INDEX) return;

  function escHtml(s) {
    return (s || "").toString().replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function search(query) {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return window.WCA_SEARCH_INDEX
      .map((entry) => {
        const haystack = (entry.title + " " + entry.description + " " + entry.keywords).toLowerCase();
        let score = 0;
        if (entry.title.toLowerCase().includes(q)) score += 3;
        q.split(/\s+/).forEach((word) => {
          if (word && haystack.includes(word)) score += 1;
        });
        return { entry, score };
      })
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 6)
      .map((r) => r.entry);
  }

  function render(query) {
    const matches = search(query);
    if (!query.trim()) {
      results.innerHTML = "";
      return;
    }
    if (!matches.length) {
      results.innerHTML = `<p class="ask-anything-empty">No matches yet. Try the <a href="/chapters.html">Free Chapters</a> or <a href="/writing.html">Writing</a> pages.</p>`;
      return;
    }
    results.innerHTML = matches
      .map(
        (m) => `
        <a class="ask-anything-result" href="${escHtml(m.url)}">
          <span class="ask-anything-result-title">${escHtml(m.title)}</span>
          <span class="ask-anything-result-desc">${escHtml(m.description)}</span>
        </a>`
      )
      .join("");
  }

  input.addEventListener("input", function () {
    render(input.value);
  });

  btn.addEventListener("click", function () {
    render(input.value);
  });

  input.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      e.preventDefault();
      render(input.value);
    }
  });
})();
