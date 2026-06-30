(function() {
  const isBlueCollar = window.location.hostname.includes("bluecollardiner") || window.location.search.includes("theme=bluecollar");
  if (isBlueCollar) {
    document.documentElement.classList.add("theme-bluecollar");
    
    document.addEventListener("DOMContentLoaded", () => {
      // Update document title
      document.title = document.title
        .replace(/White Collar Academy/g, "Blue Collar Diner")
        .replace(/WCA/g, "BCD")
        .replace(/White-Collar/g, "Blue-Collar")
        .replace(/white-collar/g, "blue-collar")
        .replace(/White Collar/g, "Blue Collar")
        .replace(/white collar/g, "blue collar");
      
      // Traverse DOM safely (rejecting script, style, input, textarea tags)
      const walker = document.createTreeWalker(
        document.body, 
        NodeFilter.SHOW_TEXT,
        {
          acceptNode: function(node) {
            const parent = node.parentNode;
            if (!parent) return NodeFilter.FILTER_REJECT;
            const parentTag = parent.tagName.toUpperCase();
            if (parentTag === "SCRIPT" || parentTag === "STYLE" || parentTag === "TEXTAREA" || parentTag === "INPUT") {
              return NodeFilter.FILTER_REJECT;
            }
            return NodeFilter.FILTER_ACCEPT;
          }
        }
      );
      
      let node;
      while (node = walker.nextNode()) {
        node.nodeValue = node.nodeValue
          .replace(/White Collar Academy/g, "Blue Collar Diner")
          .replace(/white collar academy/g, "blue collar diner")
          .replace(/WHITE COLLAR ACADEMY/g, "BLUE COLLAR DINER")
          .replace(/WCA Case Organiser/g, "Diner Case Organiser")
          .replace(/WCA/g, "BCD")
          .replace(/White-Collar/g, "Blue-Collar")
          .replace(/white-collar/g, "blue-collar")
          .replace(/White Collar/g, "Blue Collar")
          .replace(/white collar/g, "blue collar")
          .replace(/WHITE COLLAR/g, "BLUE COLLAR")
          .replace(/paralegal intake/g, "administrative intake");
      }

      // Swap Logo SVG text if exists
      const svgText = document.querySelector("svg text");
      if (svgText && svgText.textContent === "WCA") {
        svgText.textContent = "BCD";
      }

      // Update roadmap watermark overlay text if exists
      const watermark = document.getElementById("road-watermark-overlay");
      if (watermark) {
        watermark.textContent = "bluecollardiner.com";
      }
    });
  }

  // Register PWA manifest dynamically
  const manifestLink = document.createElement("link");
  manifestLink.rel = "manifest";
  manifestLink.href = "/manifest.json";
  document.head.appendChild(manifestLink);

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch(err => {
        console.error("PWA Service Worker registration failed:", err);
      });
    });
  }

  // Dynamic cross-linking loop in footers
  document.addEventListener("DOMContentLoaded", () => {
    const footerLinks = document.querySelector(".site-footer span:last-child");
    if (footerLinks) {
      const dot = document.createTextNode(" · ");
      const link = document.createElement("a");
      if (window.location.hostname.includes("bluecollardiner") || window.location.search.includes("theme=bluecollar")) {
        link.href = "https://whitecollaracademy.com";
        link.textContent = "White Collar Academy";
      } else {
        link.href = "https://bluecollardiner.com";
        link.textContent = "Blue Collar Diner";
      }
      link.style.opacity = "0.75";
      link.className = "no-print";
      footerLinks.appendChild(dot);
      footerLinks.appendChild(link);
    }
  });
})();
