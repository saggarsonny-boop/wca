export async function onRequest({ env }) {
  // 1. Live user metrics
  const { results: usersCount } = await env.DB.prepare("SELECT COUNT(*) as count FROM organiser_users").all();
  const { results: userLogs } = await env.DB.prepare("SELECT id, email, subscription_status, created_at FROM organiser_users ORDER BY id DESC LIMIT 5").all();

  // 2. Live citation metrics
  const { results: citationStats } = await env.DB.prepare(
    "SELECT engine, SUM(clicks) as clicks_count FROM organiser_citation_tracker GROUP BY engine"
  ).all();

  // 3. Live public inquiries metrics
  const { results: publicQuestions } = await env.DB.prepare(
    "SELECT id, question_text, created_at FROM organiser_public_questions ORDER BY id DESC LIMIT 5"
  ).all();

  const totalUsers = usersCount[0]?.count || 0;
  const totalCitations = citationStats.reduce((sum, stat) => sum + (stat.clicks_count || 0), 0);

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Overseer Dashboard</title>
  <link rel="stylesheet" href="/css/style.css">
  <meta http-equiv="refresh" content="30">
</head>
<body style="padding: 2rem; background: #f8fafc; font-family: sans-serif;">
  <h1>🤖 Overseer Autopilot Dashboard</h1>
  <p>Real-time metrics, auto-refresh active (30s).</p>
  
  <div style="display: flex; gap: 2rem; margin: 2rem 0;">
    <div style="background: #fff; padding: 1.5rem; border-radius: 8px; border: 1px solid #e2e8f0; flex: 1;">
      <h3>Total Registered Users</h3>
      <p style="font-size: 2rem; font-weight: bold; margin: 0.5rem 0;">${totalUsers}</p>
    </div>
    <div style="background: #fff; padding: 1.5rem; border-radius: 8px; border: 1px solid #e2e8f0; flex: 1;">
      <h3>Global AI Citation Clicks</h3>
      <p style="font-size: 2rem; font-weight: bold; margin: 0.5rem 0; color: #10b981;">${totalCitations}</p>
    </div>
  </div>

  <h2>Citations per Engine (Live D1 Logs)</h2>
  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem; margin-bottom: 2rem;">
    ${citationStats.length === 0 ? `<p style="color:var(--text-soft); padding:10px;">No citations recorded yet.</p>` : 
      citationStats.map(c => `
      <div style="background: #fff; padding: 1rem; border-radius: 6px; border: 1px solid #e2e8f0;">
        <strong style="font-size: 0.9rem; text-transform: capitalize;">🤖 ${c.engine}</strong>
        <div style="font-size: 1.3rem; font-weight: bold; margin-top: 5px;">${c.clicks_count || 0} clicks</div>
      </div>
    `).join("")}
  </div>

  <h2>Recent Public AI Inquiries</h2>
  <table style="width: 100%; border-collapse: collapse; margin-top: 1rem; background: #fff; border-radius: 8px; overflow: hidden; border: 1px solid #e2e8f0; margin-bottom: 2rem;">
    <thead>
      <tr style="background: #f1f5f9; border-bottom: 1px solid #e2e8f0; text-align: left;">
        <th style="padding: 10px;">ID</th>
        <th style="padding: 10px;">Inquiry Text</th>
        <th style="padding: 10px;">Timestamp</th>
      </tr>
    </thead>
    <tbody>
      ${publicQuestions.length === 0 ? `<tr><td colspan="3" style="text-align:center; padding:10px; color:var(--text-soft);">No inquiries logged.</td></tr>` : 
        publicQuestions.map(q => `
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 10px;">${q.id}</td>
          <td style="padding: 10px;">${q.question_text}</td>
          <td style="padding: 10px;">${q.created_at}</td>
        </tr>
      `).join("")}
    </tbody>
  </table>

  <h2>Autopilot Registration Activity Log</h2>
  <table style="width: 100%; border-collapse: collapse; margin-top: 1rem; background: #fff; border-radius: 8px; overflow: hidden; border: 1px solid #e2e8f0; margin-bottom: 2rem;">
    <thead>
      <tr style="background: #f1f5f9; border-bottom: 1px solid #e2e8f0; text-align: left;">
        <th style="padding: 10px;">ID</th>
        <th style="padding: 10px;">Email</th>
        <th style="padding: 10px;">Status</th>
        <th style="padding: 10px; text-align: right;">Batch Action</th>
      </tr>
    </thead>
    <tbody>
      ${userLogs.length === 0 ? `<tr><td colspan="4" style="text-align:center; padding:10px; color:var(--text-soft);">No users registered yet.</td></tr>` : 
        userLogs.map(l => `
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 10px;">${l.id}</td>
          <td style="padding: 10px;">${l.email}</td>
          <td style="padding: 10px;">${l.subscription_status}</td>
          <td style="padding: 10px; text-align: right;">
            <button onclick="alert('Record approved')" style="padding: 4px 8px; background: #10b981; color: #fff; border: none; border-radius: 4px; cursor: pointer;">Approve</button>
            <button onclick="alert('Record rejected')" style="padding: 4px 8px; background: #ef4444; color: #fff; border: none; border-radius: 4px; cursor: pointer; margin-left: 0.25rem;">Reject</button>
          </td>
        </tr>
      `).join("")}
    </tbody>
  </table>
</body>
</html>`;

  return new Response(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" }
  });
}
