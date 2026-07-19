(function() {
  const termsMap = {
    "restitution": "restitution",
    "allocution": "allocution",
    "psr": "psr",
    "2255 motion": "2255-motion",
    "good conduct time": "good-conduct-time"
  };

  document.addEventListener("DOMContentLoaded", () => {
    // Avoid running on login or settings screens
    if (window.location.pathname.includes("login") || window.location.pathname.includes("admin")) return;

    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: function(node) {
          const parent = node.parentNode;
          if (!parent) return NodeFilter.FILTER_REJECT;
          const parentTag = parent.tagName.toUpperCase();
          if (["A", "SCRIPT", "STYLE", "TEXTAREA", "INPUT", "BUTTON"].includes(parentTag)) {
            return NodeFilter.FILTER_REJECT;
          }
          return NodeFilter.FILTER_ACCEPT;
        }
      }
    );

    const nodesToReplace = [];
    let node;
    while (node = walker.nextNode()) {
      let text = node.nodeValue;
      let matches = false;
      for (const term in termsMap) {
        if (new RegExp("\\b" + term + "\\b", "i").test(text)) {
          matches = true;
          break;
        }
      }
      if (matches) {
        nodesToReplace.push(node);
      }
    }

    nodesToReplace.forEach(textNode => {
      let html = textNode.nodeValue;
      for (const term in termsMap) {
        const regex = new RegExp("\\b(" + term + ")\\b", "ig");
        html = html.replace(regex, `<a href="/organiser/resources.html?term=${termsMap[term]}" class="seo-injected-link" style="color:var(--accent); text-decoration:underline;">$1</a>`);
      }
      const span = document.createElement("span");
      span.innerHTML = html;
      textNode.parentNode.replaceChild(span, textNode);
    });
  });
})();
