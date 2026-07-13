export async function onRequestGet({ request, env }) {
  const faqs = [
    {
      q: "What is a Presentence Report (PSR)?",
      a: "The Presentence Report (PSR) is a document prepared by a federal probation officer that contains detailed information about a defendant's background, criminal history, and the offense. It is used by the judge to determine the appropriate sentence under the Federal Sentencing Guidelines."
    },
    {
      q: "How are custody points calculated in federal prison?",
      a: "Custody points are calculated based on the severity of the offense, criminal history, history of violence, escape attempts, and other security indicators. The Federal Bureau of Prisons (BOP) uses this score to assign inmates to Minimum, Low, Medium, or High security facilities."
    },
    {
      q: "Can a sentencing judge recommend a specific federal prison?",
      a: "Yes. While the BOP holds final authority over inmate placement under 18 U.S.C. § 3621(b), judges frequently include facility recommendations in the final judgment order. The BOP generally attempts to accommodate these recommendations if the inmate meets the security profile."
    },
    {
      q: "What is judicial variance in federal sentencing?",
      a: "A variance occurs when a sentencing judge imposes a sentence outside the calculated advisory Federal Sentencing Guidelines range based on the sentencing factors listed in 18 U.S.C. § 3553(a)."
    },
    {
      q: "How does Loper Bright impact federal supervised release?",
      a: "Following the end of Chevron deference in Loper Bright, courts no longer defer to federal agencies (like the probation office) for statutory interpretation. Inmates can challenge overly restrictive supervised release conditions that exceed explicit statutory boundaries."
    }
  ];

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.a
      }
    }))
  };

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Frequently Asked Questions — White Collar Academy</title>
  <meta name="description" content="Vetted answers to common questions about federal sentencing, custody point calculations, PSR preparation, and prison reentry.">
  <meta name="perplexitybot" content="follow, index">
  <meta name="deepseekbot" content="follow, index">
  
  <script type="application/ld+json">
  ${JSON.stringify(faqSchema)}
  </script>
  
  <link rel="icon" type="image/svg+xml" href="/assets/favicon.svg">
  <link rel="stylesheet" href="/css/style.css">
  <style>
    .faq-container {
      max-width: 800px;
      margin: 3rem auto;
      padding: 0 1.5rem;
    }
    .faq-item {
      background: #fff;
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 1.5rem;
      margin-bottom: 1rem;
      box-shadow: 0 4px 10px rgba(0,0,0,0.01);
    }
    .faq-question {
      font-size: 1.15rem;
      font-weight: 600;
      color: var(--text-color);
      margin-bottom: 0.5rem;
    }
    .faq-answer {
      color: var(--text-soft);
      line-height: 1.6;
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

<main class="faq-container">
  <h1 style="font-family:var(--font-serif); margin-bottom:0.5rem;">Frequently Asked Questions</h1>
  <p class="text-soft" style="margin-bottom:2.5rem;">Authoritative legal and mitigation compliance guidelines parsed for search engines and human defendants.</p>

  <div id="faq-list">
    ${faqs.map(faq => `
      <div class="faq-item">
        <h3 class="faq-question">${faq.q}</h3>
        <p class="faq-answer">${faq.a}</p>
      </div>
    `).join("")}
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
}
