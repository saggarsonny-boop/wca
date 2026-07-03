// TEMPORARY diagnostic endpoint for the sponsor feature's D1 wiring.
// Does not touch facilities.js or tiers.js. Delete this file once the
// production issue is confirmed and resolved.
export async function onRequestGet({ env }) {
  const out = {
    timestamp: new Date().toISOString(),
    binding_available: !!env.DB
  };

  if (!out.binding_available) {
    out.table_check = "unknown";
    out.error = "env.DB is undefined - the D1 binding named 'DB' is not attached to this Pages deployment/environment.";
    return new Response(JSON.stringify(out, null, 2), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    const countRow = await env.DB.prepare("SELECT COUNT(*) as n FROM facilities").first();
    out.table_check = "exists";
    out.row_count = countRow.n;

    const { results } = await env.DB.prepare(
      "SELECT id, name, state FROM facilities ORDER BY state, name LIMIT 5"
    ).all();
    out.sample = results;

    return new Response(JSON.stringify(out, null, 2), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    out.table_check = "missing_or_error";
    out.error = error.message;
    out.stack = error.stack;
    return new Response(JSON.stringify(out, null, 2), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
