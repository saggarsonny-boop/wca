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
      
      // Traverse DOM and replace texts
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
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
    });
  }
})();
