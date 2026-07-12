export async function onRequestGet({ request, env }) {
  try {
    // Fetch all dynamic article slugs from D1
    const articles = await env.DB.prepare(
      "SELECT slug, published_at FROM organiser_public_articles ORDER BY published_at DESC"
    ).all();

    // Read the static sitemap.xml
    const url = new URL(request.url);
    const staticSitemapRes = await env.ASSETS.fetch(new URL("/sitemap.xml", url.origin));
    let sitemapText = await staticSitemapRes.text();

    // Generate dynamic XML url blocks
    let dynamicUrls = "";
    if (articles.results && articles.results.length > 0) {
      articles.results.forEach(art => {
        const dateStr = art.published_at ? art.published_at.split(" ")[0] : new Date().toISOString().split("T")[0];
        dynamicUrls += `  <url>
    <loc>https://whitecollaracademy.com/writing/${art.slug}</loc>
    <lastmod>${dateStr}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>\n`;
      });
    }

    // Insert dynamic blocks before the closing tag </urlset>
    sitemapText = sitemapText.replace("</urlset>", `${dynamicUrls}</urlset>`);

    return new Response(sitemapText, {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600"
      }
    });
  } catch (err) {
    return new Response(`Error generating sitemap: ${err.message}`, { status: 500 });
  }
}
