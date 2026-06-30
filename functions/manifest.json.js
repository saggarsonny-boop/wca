export async function onRequest({ request }) {
  const origin = new URL(request.url).origin;
  const isBCD = origin.includes("bluecollardiner");
  
  const manifest = {
    name: isBCD ? "Blue Collar Diner" : "White Collar Academy",
    short_name: isBCD ? "BCD Diner" : "WCA Academy",
    description: isBCD 
      ? "Case organization and timeline optimization tools for blue-collar defendants." 
      : "Navigate the federal criminal justice system with plain-language resources and secure workspace tools.",
    start_url: "/",
    display: "standalone",
    background_color: isBCD ? "#faf8f5" : "#f4f1ea",
    theme_color: isBCD ? "#b45309" : "#2c4a7c",
    orientation: "any",
    icons: [
      {
        "src": "/assets/favicon.svg",
        "sizes": "any",
        "type": "image/svg+xml",
        "purpose": "any"
      }
    ]
  };

  return new Response(JSON.stringify(manifest), {
    headers: {
      "Content-Type": "application/manifest+json",
      "Cache-Control": "public, max-age=3600"
    }
  });
}
