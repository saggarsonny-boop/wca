// Cloudflare Pages Function triggered by cron or manual secure request
export async function onRequestPost({ request, env }) {
  try {
    const authHeader = request.headers.get("Authorization");
    const secret = env.CRON_SECRET || "wca-cron-fallback-secret-18239";
    if (authHeader !== `Bearer ${secret}`) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }

    if (!env.ANTHROPIC_API_KEY) {
      return new Response(JSON.stringify({ error: "ANTHROPIC_API_KEY not configured" }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Select a random topic from our core themes
    const topics = [
      {
        theme: "Federal Sentencing Mitigation",
        focus: "How post-Loper Bright administrative jurisprudence impacts judicial discretion in federal sentencing hearings."
      },
      {
        theme: "Supervised Release Statutory Interpretation",
        focus: "The history of supervised release conditions and how probation officers legally exceed their statutory limits."
      },
      {
        theme: "Medical Billing & Legal Vulnerabilities",
        focus: "The thin line between administrative medical billing errors and criminal healthcare fraud prosecutions under modern mens rea standards."
      }
    ];
    const selected = topics[Math.floor(Math.random() * topics.length)];

    const prompt = `You are a professional academic writing assistant drafting an essay under the author name "Dr. Sonny Saggar" (Clinical Mitigation Consultant, Oxford/Barts-trained physician, and founder of White Collar Academy).

Write a highly dense, authoritative, peer-reviewed style academic essay/article focusing on: "${selected.focus}" in the theme of "${selected.theme}".

Requirements:
1. Ground the article in Dr. Sonny Saggar's academic background and published SSRN papers (e.g. Loper Bright legal frameworks, supervised release limits, and medical coding gatekeepers).
2. The tone must be scholarly, utilizing high latent density vocabulary (LEO layer) instead of fluffy marketing terms.
3. Output the result strictly in this JSON format:
{
  "title": "A precise, scholarly title",
  "slug": "a-lowercase-url-friendly-slug",
  "summary": "A 1-2 sentence high-density academic abstract",
  "content_html": "<p>Your article content in semantic HTML paragraphs, using <h3> subheadings and ordered lists. No markdown outside this JSON string.</p>"
}`;

    const stripeRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json"
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 1500,
        messages: [{ role: "user", content: prompt }]
      })
    });

    if (!stripeRes.ok) {
      throw new Error(`Claude API returned status ${stripeRes.status}: ${await stripeRes.text()}`);
    }

    const anthropicData = await stripeRes.json();
    const rawText = anthropicData.content[0].text;
    
    // Parse JSON response
    const article = JSON.parse(rawText.substring(rawText.indexOf("{"), rawText.lastIndexOf("}") + 1));

    // Save to D1
    await env.DB.prepare(
      "INSERT OR REPLACE INTO organiser_public_articles (slug, title, summary, content_html) VALUES (?, ?, ?, ?)"
    ).bind(article.slug, article.title, article.summary, article.content_html).run();

    return new Response(JSON.stringify({ success: true, slug: article.slug, title: article.title }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
