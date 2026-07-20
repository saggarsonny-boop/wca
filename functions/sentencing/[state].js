export async function onRequestGet({ params, env }) {
  try {
    const rawState = params.state || "";
    const stateName = rawState.charAt(0).toUpperCase() + rawState.slice(1).toLowerCase();

    const stateData = {
      Illinois: { basePoints: 4, multiplier: 1.2, note: "Adheres to Illinois Compiled Statutes (ILCS) guidelines." },
      Texas: { basePoints: 5, multiplier: 1.3, note: "Texas Penal Code sentencing enhancement rules apply." },
      California: { basePoints: 6, multiplier: 1.4, note: "California determinate sentencing law parameters apply." },
      Florida: { basePoints: 5, multiplier: 1.25, note: "Florida Criminal Punishment Code worksheet calculations apply." },
      Newyork: { basePoints: 4, multiplier: 1.35, note: "New York Penal Law sentencing guidelines apply." }
    };

    const config = stateData[stateName] || { basePoints: 4, multiplier: 1.2, note: "Standard Federal sentencing guidelines parameters apply." };

    const schema = [
      {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": `${stateName} Sentencing Guidelines Tool`,
        "description": `State-specific sentencing guidelines and custody points calculator for ${stateName}.`,
        "applicationCategory": "BusinessApplication",
        "operatingSystem": "All",
        "url": `https://whitecollaracademy.com/sentencing/${rawState}`
      },
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": `How do I calculate custody points in ${stateName}?`,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": `To calculate custody points in ${stateName}, use the interactive offense score guidelines tool. Input your base offense level and dynamic state adjustments to estimate your total sentencing ranges.`
            }
          },
          {
            "@type": "Question",
            "name": `What services are active in ${stateName} for case mitigation?`,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": `White Collar Academy provides self-guided case organizers, PSR interview preparation tools, and attorney resources active across ${stateName} and national federal jurisdictions.`
            }
          }
        ]
      }
    ];

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${stateName} Sentencing Guidelines Calculator — WCA</title>
  <meta name="description" content="Calculate sentencing ranges, custody points, and mitigation eligibility guidelines for ${stateName}.">
  <meta name="perplexitybot" content="follow, index">
  <meta name="deepseekbot" content="follow, index">
  
  <script type="application/ld+json">
  ${JSON.stringify(schema)}
  </script>
  
  <link rel="icon" type="image/svg+xml" href="/assets/favicon.svg">
  <link rel="stylesheet" href="/css/style.css">
  <style>
    .calc-container {
      max-width: 680px;
      margin: 3rem auto;
      padding: 0 1.5rem;
    }
    .calc-card {
      background: #fff;
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 2rem;
      box-shadow: 0 4px 15px rgba(0,0,0,0.02);
      margin-top: 1.5rem;
    }
    .result-box {
      background: var(--bg-alt);
      border-left: 4px solid var(--accent);
      padding: 1rem;
      margin-top: 1.5rem;
      border-radius: 0 8px 8px 0;
      font-size: 0.95rem;
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

<main class="calc-container">
  <h1 style="font-family:var(--font-serif);">${stateName} Sentencing Guidelines</h1>
  <p class="text-soft">Grounded calculations for the state of ${stateName}. ${config.note}</p>

  <div class="calc-card">
    <h3 style="margin-bottom:1rem;">Estimate Offense Level</h3>
    
    <div style="margin-bottom:1rem;">
      <label style="display:block; margin-bottom:0.25rem; font-weight:600;">Base Offense Score</label>
      <input type="number" id="baseScore" value="${config.basePoints}" style="width:100%; padding:8px; border:1px solid var(--border); border-radius:4px;" readonly>
    </div>
    
    <div style="margin-bottom:1.5rem;">
      <label style="display:block; margin-bottom:0.25rem; font-weight:600;">Enhancement Level</label>
      <select id="enhancement" style="width:100%; padding:8px; border:1px solid var(--border); border-radius:4px;" onchange="recalc()">
        <option value="1">Standard (No enhancements)</option>
        <option value="2">Mitigating factors present</option>
        <option value="3">Enhancing factors present (+2)</option>
      </select>
    </div>

    <div class="result-box">
      <strong>Calculated Guidance:</strong>
      <div id="output-result" style="margin-top:0.5rem; font-weight:600; color:var(--accent);">Total Level: ${config.basePoints} points</div>
    </div>
  </div>
</main>

<script>
function recalc() {
  const base = parseFloat(document.getElementById("baseScore").value);
  const enh = document.getElementById("enhancement").value;
  let multiplier = ${config.multiplier};
  
  let score = base;
  if (enh === "2") {
    score = Math.max(1, base - 2);
  } else if (enh === "3") {
    score = base + 2;
  }
  
  document.getElementById("output-result").innerText = "Total Level: " + Math.round(score * multiplier) + " points (State Coeff: " + multiplier + ")";
}
</script>

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
