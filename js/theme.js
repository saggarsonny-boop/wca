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

  // Dynamic cross-linking loop in footers & dynamic UDS buttons injection
  document.addEventListener("DOMContentLoaded", () => {
    // 1. Cross-linking loop in footers
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

    // 2. Find any print/pdf button and dynamically inject UDS export options
    const pdfButtons = Array.from(document.querySelectorAll("button")).filter(btn => {
      const txt = btn.textContent;
      return txt.includes("Download PDF") || txt.includes("Print / Save Timeline") || txt.includes("Print Report");
    });
    
    pdfButtons.forEach(pdfBtn => {
      // Avoid duplicate injections
      if (pdfBtn.nextSibling && pdfBtn.nextSibling.id === "btn-export-uds") return;
      
      const udsBtn = document.createElement("button");
      udsBtn.type = "button";
      udsBtn.id = "btn-export-uds";
      udsBtn.className = "btn no-print";
      udsBtn.style.marginLeft = "0.75rem";
      udsBtn.style.background = "#0f172a"; // Slate dark
      udsBtn.style.color = "#fff";
      udsBtn.style.border = "none";
      udsBtn.style.borderRadius = "4px";
      udsBtn.style.fontSize = pdfBtn.style.fontSize || "0.85rem";
      udsBtn.style.padding = pdfBtn.style.padding || "0.4rem 0.9rem";
      udsBtn.textContent = "💾 Export UDS (Interactive)";
      
      pdfBtn.parentNode.insertBefore(udsBtn, pdfBtn.nextSibling);
      
      udsBtn.addEventListener("click", () => {
        // Clone main content
        const mainEl = document.querySelector("main") || document.body;
        const mainClone = mainEl.cloneNode(true);
        
        // Remove interactive save bars, controls, sidebars, and headers
        const noPrintElements = mainClone.querySelectorAll(".no-print, button, .save-bar, aside, header, #btn-export-uds");
        noPrintElements.forEach(el => el.remove());
        
        // Convert all input, textarea, and select values into static text nodes
        const originalInputs = mainEl.querySelectorAll("input, textarea, select");
        const clonedInputs = mainClone.querySelectorAll("input, textarea, select");
        
        clonedInputs.forEach((clonedInput, index) => {
          const orig = originalInputs[index];
          let originalVal = orig.value || "";
          if (orig.tagName === "SELECT") {
            const opt = orig.options[orig.selectedIndex];
            originalVal = opt ? opt.text : "";
          }
          const staticSpan = document.createElement("span");
          staticSpan.style.borderBottom = "1px dashed #94a3b8";
          staticSpan.style.padding = "2px 6px";
          staticSpan.style.fontWeight = "600";
          staticSpan.textContent = originalVal || "(Unanswered)";
          clonedInput.parentNode.replaceChild(staticSpan, clonedInput);
        });

        const isBCD = window.location.hostname.includes("bluecollardiner") || window.location.search.includes("theme=bluecollar");
        const titleText = isBCD ? "Case Dossier — Blue Collar Diner UDS" : "Case Dossier — White Collar Academy UDS";
        
        const htmlString = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${titleText}</title>
  <style>
    body { background: ${isBCD ? '#ebedf0' : '#f4f1ea'}; color: #0f172a; font-family: Georgia, serif; line-height: 1.6; padding: 2rem 1rem; margin: 0; }
    .share-container, main { max-width: 900px; margin: 0 auto; background: #fff; border: 1px solid #cbd5e1; border-radius: 12px; padding: 2.5rem; box-shadow: 0 4px 20px rgba(0,0,0,0.02); }
    .meta-grid, .form-row, .score-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; margin-bottom: 2.5rem; border-bottom: 1px solid #e2e8f0; padding-bottom: 1rem; }
    .meta-item { background: #f8fafc; padding: 1rem; border-radius: 6px; border: 1px solid #e2e8f0; }
    label, span.text-soft { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; color: #475569; display: block; margin-bottom: 0.25rem; font-family: sans-serif; font-weight: 600; }
    .block-section { background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 1.5rem; margin-bottom: 2rem; }
    h1, h2, h3 { font-family: Georgia, serif; font-weight: 600; margin-top: 0; color: #0f172a; }
    .uds-banner { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 1rem; margin-bottom: 2rem; font-size: 0.85rem; line-height: 1.4; color: #166534; font-family: sans-serif; }
    .btn { display: none !important; }
  </style>
</head>
<body>
  <div class="share-container">
    <div class="uds-banner">
      🔒 <strong>Universal Document Schema (UDS 1.0) Active</strong> — This is a self-contained, offline-compatible case file dossier. It is interoperable, fully searchable, and print-ready.
    </div>
    ${mainClone.innerHTML}
  </div>
</body>
</html>`;

        const blob = new Blob([htmlString], { type: "text/html" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `Case_Dossier_UDS.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      });
    });
  });
})();
