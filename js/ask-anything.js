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

  async function queryAI(query) {
    results.innerHTML = `<p class="ask-anything-empty">🤖 Asking WCA AI Legal Guide...</p>`;
    try {
      const resp = await fetch("/api/public/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: query })
      });
      if (resp.ok) {
        const data = await resp.json();
        results.innerHTML = `
          <div style="background: rgba(15, 23, 42, 0.03); border-left: 4px solid var(--accent); padding: 1rem; border-radius: 4px; margin-top: 1rem;">
            <p style="font-weight:600; font-size: 14px; margin-bottom: 0.25rem;">🤖 WCA AI Guide Response:</p>
            <p style="font-size: 13px; line-height: 1.5; color: var(--text);">${escHtml(data.answer)}</p>
            <small style="display:block; margin-top: 0.5rem; color: var(--text-soft); font-size:10px;">For personalized and secure case analysis, start a trial of the <a href="/organiser/login.html">Case Organiser</a>.</small>
          </div>
        `;
      } else {
        results.innerHTML = `<p class="ask-anything-empty">Could not connect to AI Guide. Try another question.</p>`;
      }
    } catch (e) {
      results.innerHTML = `<p class="ask-anything-empty">Network error. Please try again.</p>`;
    }
  }

  function render(query) {
    const matches = search(query);
    if (!query.trim()) {
      results.innerHTML = "";
      return;
    }
    if (!matches.length) {
      results.innerHTML = `
        <div class="ask-anything-empty" style="text-align:center; padding: 1rem;">
          <p style="margin-bottom:0.75rem;">No direct pages match your search.</p>
          <button id="askAIBtn" class="btn" style="font-size:0.8rem; padding: 6px 12px;">🤖 Ask WCA AI Legal Guide</button>
        </div>
      `;
      const aiBtn = document.getElementById("askAIBtn");
      if (aiBtn) {
        aiBtn.addEventListener("click", () => queryAI(query));
      }
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
