export async function onRequestGet({ request }) {
  const url = new URL(request.url);
  const scoreVal = url.searchParams.get("score") || "100";
  const score = parseInt(scoreVal, 10) || 100;
  
  let color = "#D4AF37"; // Gold for high scores
  if (score < 70) color = "#ef4444"; // Red
  else if (score < 90) color = "#3b82f6"; // Blue

  // Determine label based on language
  const acceptLang = request.headers.get("Accept-Language") || "en";
  const lang = (url.searchParams.get("lang") || acceptLang.substring(0, 2)).toLowerCase();
  
  let label = "XEO COMPLIANT";
  if (lang === "es") label = "XEO CUMPLIDO";
  else if (lang === "fr") label = "CONFORME XEO";
  else if (lang === "de") label = "XEO KONFORM";

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="20">
    <linearGradient id="b" x2="0" y2="100%">
      <stop offset="0" stop-color="#bbb" stop-opacity=".1"/>
      <stop offset="1" stop-opacity=".1"/>
    </linearGradient>
    <mask id="a">
      <rect width="160" height="20" rx="3" fill="#fff"/>
    </mask>
    <g mask="url(#a)">
      <path fill="#555" d="M0 0h110v20H0z"/>
      <path fill="${color}" d="M110 0h50v20H110z"/>
      <path fill="url(#b)" d="M0 0h160v20H0z"/>
    </g>
    <g fill="#fff" text-anchor="middle" font-family="DejaVu Sans,Verdana,Geneva,sans-serif" font-size="11">
      <text x="55" y="15" fill="#010101" fill-opacity=".3">${label}</text>
      <text x="55" y="14">${label}</text>
      <text x="135" y="15" fill="#010101" fill-opacity=".3">${score}%</text>
      <text x="135" y="14">${score}%</text>
    </g>
  </svg>`;

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=86400"
    }
  });
}
