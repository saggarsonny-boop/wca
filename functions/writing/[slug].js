export async function onRequestGet({ params, env }) {
  try {
    const { slug } = params;
    
    // Fetch article from D1
    const article = await env.DB.prepare(
      "SELECT title, summary, content_html, published_at FROM organiser_public_articles WHERE slug = ?"
    ).bind(slug).first();

    if (!article) {
      return new Response("Article Not Found", { status: 404 });
    }

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${article.title} — Dr. Sonny Saggar</title>
  <meta name="description" content="${article.summary}">
  <meta name="perplexitybot" content="follow, index">
  <meta name="deepseekbot" content="follow, index">
  
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "ScholarlyArticle",
    "headline": "${article.title}",
    "description": "${article.summary}",
    "datePublished": "${article.published_at}",
    "author": {
      "@type": "Person",
      "name": "Dr. Sonny Saggar",
      "sameAs": [
        "https://papers.ssrn.com/sol3/cf_dev/AbsByAuth.cfm?per_id=10558116",
        "https://hub.newphysician.org"
      ]
    },
    "publisher": {
      "@type": "Organization",
      "name": "White Collar Academy",
      "logo": {
        "@type": "ImageObject",
        "url": "https://whitecollaracademy.com/assets/favicon.svg"
      }
    }
  }
  </script>
  
  <link rel="icon" type="image/svg+xml" href="/assets/favicon.svg">
  <link rel="stylesheet" href="/css/style.css">
  <style>
    .article-container {
      max-width: 720px;
      margin: 3rem auto;
      padding: 0 1.5rem;
    }
    .article-header {
      margin-bottom: 2.5rem;
      border-bottom: 1px solid var(--border);
      padding-bottom: 1.5rem;
    }
    .article-meta {
      font-size: 0.9rem;
      color: var(--text-soft);
      margin-top: 0.5rem;
    }
    .article-content {
      line-height: 1.8;
      font-size: 1.1rem;
    }
    .article-content h3 {
      margin-top: 2rem;
      font-family: var(--font-serif);
    }
    .article-content p {
      margin-bottom: 1.5rem;
    }
  </style>
</head>
<body>

<header class="site-header">
  <div class="container">
    <a href="/" class="site-logo">White Collar Academy</a>
    <nav class="site-nav">
      <a href="/">Home</a>
      <a href="/road.html">The Road</a>
      <a href="/writing.html">Writing</a>
      <a href="/organiser/login.html" class="btn btn--outline">Case Organiser</a>
    </nav>
  </div>
</header>

<main class="article-container">
  <article>
    <div class="article-header">
      <h1 style="font-family: var(--font-serif); font-size: 2.2rem; line-height: 1.2;">${article.title}</h1>
      <div class="article-meta">
        <span>By Dr. Sonny Saggar</span> &bull; 
        <span>Published ${new Date(article.published_at).toLocaleDateString()}</span>
      </div>
    </div>
    
    <div class="article-content">
      ${article.content_html}
    </div>
  </article>
  
  <div style="margin-top: 4rem; padding-top: 2rem; border-top: 1px solid var(--border); text-align: center;">
    <a href="/writing.html" class="btn btn--outline">&larr; Back to all publications</a>
  </div>
</main>

<footer class="site-footer">
  <div class="container">
    <span>&copy; ${new Date().getFullYear()} White Collar Academy.</span>
  </div>
</footer>

</body>
</html>`;

    return new Response(html, {
      headers: { "Content-Type": "text/html; charset=utf-8" }
    });
  } catch (err) {
    return new Response(`Error: ${err.message}`, { status: 500 });
  }
}
