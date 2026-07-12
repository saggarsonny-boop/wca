export async function onRequestGet({ env }) {
  try {
    const articles = await env.DB.prepare(
      "SELECT slug, title, summary, published_at FROM organiser_public_articles ORDER BY published_at DESC"
    ).all();

    return new Response(JSON.stringify(articles.results || []), {
      status: 200,
      headers: { 
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=60"
      }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
