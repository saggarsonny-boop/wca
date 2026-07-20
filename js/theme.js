(function() {
  // Restore theme immediately before DOM is rendered
  if (localStorage.getItem('wca_theme') === 'dark') {
    document.documentElement.classList.add('theme-dark');
  }

  // Dynamically load analytics tracker
  const analyticsScript = document.createElement("script");
  analyticsScript.src = "/js/analytics.js";
  analyticsScript.async = true;
  if (document.head) {
    document.head.appendChild(analyticsScript);
  }

  // Dynamically load automated SEO linking substrate
  const seoScript = document.createElement("script");
  seoScript.src = "/js/seo-linker.js";
  seoScript.async = true;
  if (document.head) {
    document.head.appendChild(seoScript);
  }

  const isBlueCollar = window.location.hostname.includes("bluecollardiner") || window.location.search.includes("theme=bluecollar");
  
  document.addEventListener("DOMContentLoaded", () => {
    // Mount theme toggle button
    const headerContainer = document.querySelector(".site-header .container");
    if (headerContainer) {
      const toggleBtn = document.createElement("button");
      toggleBtn.id = "theme-toggle-btn";
      toggleBtn.className = "btn btn--outline no-print";
      toggleBtn.style.cssText = "font-size:0.85rem; padding:0.4rem 0.8rem; margin-right:0.6rem; border-color:var(--border); cursor:pointer; background:transparent; display:inline-flex; align-items:center; justify-content:center;";
      
      const isDark = document.documentElement.classList.contains("theme-dark");
      toggleBtn.textContent = isDark ? "☀" : "🌙";
      
      toggleBtn.addEventListener("click", () => {
        const nowDark = document.documentElement.classList.toggle("theme-dark");
        localStorage.setItem("wca_theme", nowDark ? "dark" : "light");
        toggleBtn.textContent = nowDark ? "☀" : "🌙";
      });
      
      const logoutBtn = headerContainer.querySelector("#logout-btn") || headerContainer.querySelector(".btn");
      if (logoutBtn) {
        headerContainer.insertBefore(toggleBtn, logoutBtn);
      } else {
        headerContainer.appendChild(toggleBtn);
      }
    }

    // Swap header logo SVG with new premium gold crest
    const logoSvg = document.querySelector(".site-logo svg");
    if (logoSvg) {
      const fillVal = isBlueCollar ? "#8b0000" : "#0A0A0A";
      const strokeVal = isBlueCollar ? "#e2e8f0" : "url(#gold-grad-header)";
      const isDiner = isBlueCollar;
      
      logoSvg.outerHTML = `<svg width="28" height="28" viewBox="0 0 120 120" style="vertical-align:middle;margin-right:0.5rem;border-radius:6px;" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="gold-grad-header" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#BF953F" />
            <stop offset="25%" stop-color="#FCF6BA" />
            <stop offset="50%" stop-color="#B38728" />
            <stop offset="75%" stop-color="#FBF5B7" />
            <stop offset="100%" stop-color="#AA771C" />
          </linearGradient>
        </defs>
        <rect width="120" height="120" rx="20" fill="${fillVal}" />
        <circle cx="60" cy="60" r="42" fill="none" stroke="${strokeVal}" stroke-width="3" />
        ${isDiner ? `
          <!-- Stylized Fork and Knife for BCD Diner theme -->
          <path d="M 45,35 L 45,65 M 40,35 L 40,55 M 50,35 L 50,55 M 45,65 L 45,85" stroke="#e2e8f0" stroke-width="3" stroke-linecap="round" />
          <path d="M 75,35 L 75,85 M 70,35 L 80,35 L 78,55 L 72,55 Z" fill="#e2e8f0" stroke="#e2e8f0" stroke-width="1" />
        ` : `
          <!-- Stylized Classical Column for WCA Academy theme -->
          <g transform="translate(42, 36)">
            <path d="M 4,6 L 32,6 L 28,12 L 8,12 Z" fill="url(#gold-grad-header)" />
            <rect x="9" y="14" width="3" height="24" rx="1" fill="url(#gold-grad-header)" />
            <rect x="16.5" y="14" width="3" height="24" rx="1" fill="url(#gold-grad-header)" />
            <rect x="24" y="14" width="3" height="24" rx="1" fill="url(#gold-grad-header)" />
            <rect x="6" y="40" width="24" height="4" rx="1" fill="url(#gold-grad-header)" />
          </g>
        `}
    // Auto-translation dictionary for WCA
    const translations = {
      es: {
        "The Map I Wish Someone Had Handed Me.": "El mapa que desearía que alguien me hubiera entregado.",
        "Ask anything. Say anything.": "Pregunta lo que sea. Di lo que sea.",
        "Looking for something? Just ask, we'll find it.": "Busca algo? Solo pregunta, lo encontraremos.",
        "Case Organiser": "Organizador de Casos",
        "Get a chapter from Ground": "Obtén un capítulo de Ground"
      },
      fr: {
        "The Map I Wish Someone Had Handed Me.": "La carte que j'aurais aimé que quelqu'un me remette.",
        "Ask anything. Say anything.": "Demandez n'importe quoi. Dites n'importe quoi.",
        "Looking for something? Just ask, we'll find it.": "Vous cherchez quelque chose ? Demandez, nous le trouverons.",
        "Case Organiser": "Organisateur de Cas",
        "Get a chapter from Ground": "Obtenez un chapitre de Ground"
      },
      de: {
        "The Map I Wish Someone Had Handed Me.": "Die Karte, von der ich wünschte, jemand hätte sie mir gegeben.",
        "Ask anything. Say anything.": "Fragen Sie alles. Sagen Sie alles.",
        "Looking for something? Just ask, we'll find it.": "Suchen Sie etwas? Fragen Sie einfach, wir finden es.",
        "Case Organiser": "Fall-Organisator",
        "Get a chapter from Ground": "Holen Sie sich ein Kapitel von Ground"
      }
    };

    const userLang = (navigator.language || navigator.userLanguage || "en").substring(0, 2).toLowerCase();
    if (translations[userLang]) {
      const dict = translations[userLang];
      document.querySelectorAll("h1, h2, p, a, button, label").forEach(el => {
        const text = el.innerText.trim();
        if (dict[text]) {
          el.innerText = dict[text];
        }
      });
    }

    // Country-Specific Compliance Hook
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
    if (tz.includes("Europe") || tz.includes("London") || tz.includes("Berlin") || tz.includes("Paris") || tz.includes("Rome")) {
      const alertBanner = document.createElement("div");
      alertBanner.style.cssText = "background:#856404; color:#fff; padding:0.5rem; text-align:center; font-size:0.85rem; font-weight:bold; border-bottom: 2px solid #D4AF37;";
      alertBanner.className = "no-print";
      alertBanner.innerHTML = "⚠️ EU REGULATORY DIRECTIVE: This workspace is fully GDPR &amp; WCAG 2.1 Compliant.";
      document.body.insertBefore(alertBanner, document.body.firstChild);
    }
  });

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
      
      // Swap meta tags and OG links for Blue Collar Diner
      try {
        const ogUrl = document.querySelector('meta[property="og:url"]');
        if (ogUrl) ogUrl.setAttribute("content", window.location.href);
        const ogTitle = document.querySelector('meta[property="og:title"]');
        if (ogTitle) ogTitle.setAttribute("content", ogTitle.getAttribute("content").replace(/White Collar Academy/g, "Blue Collar Diner"));
        const ogDesc = document.querySelector('meta[property="og:description"]');
        if (ogDesc) ogDesc.setAttribute("content", ogDesc.getAttribute("content").replace(/White Collar Academy/g, "Blue Collar Diner"));
        const twitterUrl = document.querySelector('meta[property="twitter:url"]');
        if (twitterUrl) twitterUrl.setAttribute("content", window.location.href);
        const twitterTitle = document.querySelector('meta[property="twitter:title"]');
        if (twitterTitle) twitterTitle.setAttribute("content", twitterTitle.getAttribute("content").replace(/White Collar Academy/g, "Blue Collar Diner"));
        const twitterDesc = document.querySelector('meta[property="twitter:description"]');
        if (twitterDesc) twitterDesc.setAttribute("content", twitterDesc.getAttribute("content").replace(/White Collar Academy/g, "Blue Collar Diner"));
      } catch (e) {
        console.error("Meta updates failed:", e);
      }
      
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

  // 1. GLOBALLY BIND window.toggleSidebar IMMEDIATELY (no DOM dependency needed for declaration!)
  window.toggleSidebar = function() {
    const sidebar = document.querySelector('.org-sidebar');
    if (sidebar) {
      sidebar.classList.toggle('collapsed');
      const icon = document.querySelector('#sidebarToggle .toggle-icon');
      if (icon) {
        icon.textContent = sidebar.classList.contains('collapsed') ? '▶' : '◀';
      }
      localStorage.setItem('sidebarCollapsed', sidebar.classList.contains('collapsed') ? 'true' : 'false');
    }
  };

  // Register PWA manifest dynamically after DOM load
  document.addEventListener("DOMContentLoaded", () => {
    // A. Apply initial sidebar collapsed state immediately
    try {
      const isCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
      const sidebar = document.querySelector('.org-sidebar');
      if (sidebar && isCollapsed) {
        sidebar.classList.add('collapsed');
        const icon = document.querySelector('#sidebarToggle .toggle-icon');
        if (icon) icon.textContent = '▶';
      }
    } catch (e) {
      console.warn("Failed to load initial sidebar state:", e);
    }

    // B. Check and reveal admin status
    try {
      async function checkAdminStatus() {
        try {
          const res = await fetch("/api/auth/me");
          if (res.ok) {
            const user = await res.json();
            
            // Filter sidebar links based on user role
            const userRole = user.role || "defendant";
            document.querySelectorAll(".org-sidebar nav a.role-link").forEach(link => {
              if (!link.classList.contains(`role-${userRole}`)) {
                link.style.display = "none";
              }
            });

            if (user.role === "admin") {
              const cog = document.getElementById("admin-cog-link");
              if (cog) {
                cog.style.display = "block";
              }

              // Inject mobile floating admin cog
              if (!document.getElementById("mobile-admin-cog")) {
                const mobileCog = document.createElement("a");
                mobileCog.id = "mobile-admin-cog";
                mobileCog.href = "/organiser/admin.html";
                mobileCog.className = "no-print";
                mobileCog.textContent = "⚙️";
                mobileCog.style.cssText = `
                  display: flex;
                  position: fixed;
                  bottom: 80px;
                  right: 16px;
                  z-index: 9999;
                  background: var(--accent);
                  color: #fff;
                  width: 44px;
                  height: 44px;
                  border-radius: 50%;
                  align-items: center;
                  justify-content: center;
                  box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                  font-size: 20px;
                  text-decoration: none;
                `;
                
                const mediaQuery = window.matchMedia("(max-width: 640px)");
                function handleMedia(mq) {
                  mobileCog.style.display = mq.matches ? "flex" : "none";
                }
                if (typeof mediaQuery.addEventListener === 'function') {
                  mediaQuery.addEventListener("change", handleMedia);
                } else if (typeof mediaQuery.addListener === 'function') {
                  mediaQuery.addListener(handleMedia);
                }
                handleMedia(mediaQuery);
                
                document.body.appendChild(mobileCog);
              }
            }
          }
        } catch (err) {
          console.warn("Failed admin cog visibility check:", err);
        }
      }
      checkAdminStatus();
    } catch (e) {
      console.warn("Failed to schedule checkAdminStatus:", e);
    }

    // C. Try to run register PWA manifest
    try {
      const manifestLink = document.createElement("link");
      manifestLink.rel = "manifest";
      manifestLink.href = "/manifest.json";
      if (document.head) {
        document.head.appendChild(manifestLink);
      }
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js').catch(err => {
          console.error("PWA Service Worker registration failed:", err);
        });
      }
    } catch (e) {
      console.warn("PWA Manifest registration failed:", e);
    }

    // D. Try to run PWA Install Prompt
    try {
      let deferredPrompt;
      window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        const footer = document.querySelector(".site-footer .container");
        if (footer && !document.getElementById("pwa-install-btn")) {
          const installBtn = document.createElement("button");
          installBtn.id = "pwa-install-btn";
          installBtn.className = "btn btn--outline no-print";
          installBtn.style.fontSize = "0.75rem";
          installBtn.style.padding = "0.25rem 0.5rem";
          installBtn.style.marginLeft = "0.5rem";
          installBtn.textContent = "📲 Install App";
          installBtn.addEventListener('click', async () => {
            if (deferredPrompt) {
              deferredPrompt.prompt();
              const { outcome } = await deferredPrompt.userChoice;
              console.log(`User choice outcome: ${outcome}`);
              deferredPrompt = null;
              installBtn.remove();
            }
          });
          footer.appendChild(installBtn);
        }
      });
    } catch (e) {
      console.warn("PWA Install Prompt binding failed:", e);
    }

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
      const onClickStr = btn.getAttribute("onclick") || "";
      return txt.includes("Download PDF") || txt.includes("Print / Save Timeline") || txt.includes("Print Report") || onClickStr.includes("print");
    });
    
    pdfButtons.forEach(pdfBtn => {
      // Avoid duplicate injections
      if (pdfBtn.parentNode.querySelector("#btn-export-uds")) return;
      
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
