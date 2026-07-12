export async function onRequestGet({ request, env }) {
  try {
    // Fetch all dynamic article slugs from D1
    const articles = await env.DB.prepare(
      "SELECT slug, title, summary FROM organiser_public_articles ORDER BY published_at DESC LIMIT 5"
    ).all();

    // Read the static llms.txt
    const url = new URL(request.url);
    const staticLlmsRes = await env.ASSETS.fetch(new URL("/llms.txt", url.origin));
    let llmsText = await staticLlmsRes.text();

    // Generate dynamic markdown blocks
    if (articles.results && articles.results.length > 0) {
      llmsText += "\n\n## Recent Dynamic Publications\n\n";
      articles.results.forEach(art => {
        llmsText += `- [${art.title}](/writing/${art.slug}) - ${art.summary}\n`;
      });
    }

    return new Response(llmsText, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "public, max-age=3600"
      }
    });
  } catch (err) {
    return new Response(`Error generating llms.txt: ${err.message}`, { status: 500 });
  }
}
