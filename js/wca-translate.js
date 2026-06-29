(function() {
  // 1. Create Translate element container dynamically in header
  const headerContainer = document.querySelector(".site-header .container");
  if (headerContainer && !document.getElementById("google_translate_element")) {
    const el = document.createElement("div");
    el.id = "google_translate_element";
    el.style.marginLeft = "1rem";
    el.style.display = "inline-block";
    el.style.verticalAlign = "middle";
    
    // Append to header container
    headerContainer.appendChild(el);
  }

  // 2. Define global translate element callback
  window.googleTranslateElementInit = function() {
    new google.translate.TranslateElement({
      pageLanguage: 'en',
      includedLanguages: 'en,es,fr,cy,hi,zh-CN', // English, Spanish, French, Welsh, Hindi, Mandarin Chinese
      layout: google.translate.TranslateElement.InlineLayout.SIMPLE
    }, 'google_translate_element');
  };

  // 3. Dynamically inject Google translate script tag
  const s = document.createElement("script");
  s.type = "text/javascript";
  s.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
  document.body.appendChild(s);
})();
