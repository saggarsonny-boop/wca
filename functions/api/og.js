export async function onRequestGet({ request }) {
  const url = new URL(request.url);
  const location = url.searchParams.get("city") || url.searchParams.get("state") || "National";
  const payoutVal = url.searchParams.get("payout") || "900";
  
  const cleanLocation = location.replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const cleanPayout = payoutVal.replace(/</g, "&lt;").replace(/>/g, "&gt;");

  const svg = `<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="gold-grad-og" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#0A0A0A" />
        <stop offset="50%" stop-color="#D4AF37" />
        <stop offset="100%" stop-color="#0A0A0A" />
      </linearGradient>
    </defs>
    <!-- Background Matte Dark -->
    <rect width="1200" height="630" fill="#0A0A0A" />
    <!-- Kintsugi Top Accent Border -->
    <rect width="1200" height="8" fill="url(#gold-grad-og)" />
    
    <!-- Outer Shield Frame -->
    <circle cx="600" cy="210" r="82" fill="none" stroke="#D4AF37" stroke-width="2" opacity="0.3" />
    
    <!-- Stylized Column (WCA Brand) -->
    <g transform="translate(582, 175)" opacity="0.8">
      <path d="M 2,3 L 34,3 L 30,7 L 6,7 Z" fill="#D4AF37" />
      <rect x="8" y="9" width="3" height="25" rx="1" fill="#D4AF37" />
      <rect x="16.5" y="9" width="3" height="25" rx="1" fill="#D4AF37" />
      <rect x="25" y="9" width="3" height="25" rx="1" fill="#D4AF37" />
      <rect x="4" y="35" width="28" height="4" rx="1" fill="#D4AF37" />
    </g>

    <!-- State/City Localized Heading -->
    <text x="600" y="375" font-family="'Georgia', serif" font-size="54" font-weight="bold" fill="#ffffff" text-anchor="middle" letter-spacing="1">
      ${cleanLocation} Sentencing Guidelines
    </text>
    
    <!-- Subtitle (Referral / Payout / Plan Info) -->
    <text x="600" y="440" font-family="'Outfit', sans-serif" font-size="28" fill="#D4AF37" text-anchor="middle" letter-spacing="2">
      CASE MITIGATION &amp; CONSULTING • EST. Payout $${cleanPayout}
    </text>
    
    <!-- Description -->
    <text x="600" y="505" font-family="'Outfit', sans-serif" font-size="22" fill="#A3A3A3" text-anchor="middle" opacity="0.9">
      Calm, authoritative Federal case tools and resources for professionals.
    </text>
  </svg>`;

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=31536000, immutable"
    }
  });
}
