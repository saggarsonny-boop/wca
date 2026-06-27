/**
 * Renders the free video library from data/videos.js
 * Included on videos.html after the data file.
 */
(function () {
  const container = document.getElementById("video-library");
  if (!container) return;

  if (!VIDEOS || VIDEOS.length === 0) {
    container.innerHTML = "<p>Videos coming soon.</p>";
    return;
  }

  const cards = VIDEOS.map(function (v) {
    const embedHtml = v.id
      ? `<iframe
           src="https://www.youtube-nocookie.com/embed/${v.id}"
           title="${escHtml(v.title)}"
           allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
           allowfullscreen
         ></iframe>`
      : `<div class="video-placeholder">
           <div class="video-placeholder__icon">▶</div>
           <div>Video coming soon</div>
         </div>`;

    return `
      <article class="video-card">
        <div class="video-card__embed">
          <div class="video-wrap">${embedHtml}</div>
        </div>
        <div class="video-card__body">
          <h3 class="video-card__title">${escHtml(v.title)}</h3>
          <p class="video-card__desc">${escHtml(v.description)}</p>
        </div>
      </article>
    `;
  }).join("");

  container.innerHTML = `<div class="video-grid">${cards}</div>`;

  function escHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
}());
