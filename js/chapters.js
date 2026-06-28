/**
 * Renders the free chapter library from data/chapters.js
 * Included on chapters.html after the data file.
 */
(function () {
  var container = document.getElementById("chapter-library");
  if (!container) return;

  if (!CHAPTERS || CHAPTERS.length === 0) {
    container.innerHTML = '<p class="text-soft">Chapters will appear here as they are published. Sign up below to be notified.</p>';
    return;
  }

  var cards = CHAPTERS.map(function (ch, idx) {
    var num = ch.number || String(idx + 1).padStart(2, "0");

    var audioHtml = ch.audioUrl
      ? '<audio controls preload="none" class="chapter-card__audio"><source src="' + escHtml(ch.audioUrl) + '"><p class="text-soft" style="font-size:0.85rem;">Your browser does not support the audio element.</p></audio>'
      : '<p class="chapter-card__audio-placeholder">Audio coming soon.</p>';

    var textLink = ch.textUrl
      ? '<a href="' + escHtml(ch.textUrl) + '" class="chapter-card__text-link">Read this chapter</a>'
      : '';

    return '<article class="chapter-card">'
      + '<div class="chapter-card__header">'
      + '<span class="chapter-card__num">' + escHtml(num) + '</span>'
      + '<h3 class="chapter-card__title">' + escHtml(ch.title) + '</h3>'
      + '</div>'
      + '<p class="chapter-card__desc">' + escHtml(ch.description) + '</p>'
      + audioHtml
      + textLink
      + '</article>';
  }).join("");

  container.innerHTML = '<div class="chapter-list">' + cards + '</div>';

  function escHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
}());
