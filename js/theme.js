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

      // Swap roadmap SVG image paths if they exist
      const roadImg = document.querySelector('img[src="/assets/The_Road_Map.svg"]');
      if (roadImg) {
        roadImg.src = "/assets/The_Road_Map_BCD.svg";
      }
      const roadLinks = document.querySelectorAll('a[href="/assets/The_Road_Map.svg"]');
      roadLinks.forEach(link => {
        link.href = "/assets/The_Road_Map_BCD.svg";
      });
    });
  }
})();
