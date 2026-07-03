// TEMPORARY DIAGNOSTIC ENDPOINT - DELETE AFTER DEBUGGING
// DO NOT SHIP THIS TO PRODUCTION PERMANENTLY
// URL: /api/sponsor/diagnose

export async function onRequestGet({ env }) {
  // Collect diagnostic information
  const diagnosis = {
    timestamp: new Date().toISOString(),
    binding_available: !!env.DB,
    binding_type: env.DB ? typeof env.DB : "undefined",
    query_attempted: false,
    query_success: false,
    error: null,
    table_check: null,
    row_count: null
  };

  // Step 1: Check if the DB binding exists
  if (!env.DB) {
    diagnosis.error = "DB binding is undefined - check Pages bindings";
    return new Response(JSON.stringify(diagnosis, null, 2), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }

  // Step 2: Try a simple query to check if the table exists
  try {
    diagnosis.query_attempted = true;

    // Try to get the table info
    const tableCheck = await env.DB.prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='facilities'"
    ).first();

    diagnosis.table_check = tableCheck ? "exists" : "missing";

    // If table exists, count the rows
    if (tableCheck) {
      const countResult = await env.DB.prepare(
        "SELECT COUNT(*) as count FROM facilities"
      ).first();
      diagnosis.row_count = countResult ? countResult.count : 0;

      // Try to get the first few facilities
      const sample = await env.DB.prepare(
        "SELECT id, name, state FROM facilities LIMIT 5"
      ).all();
      diagnosis.sample = sample.results || [];
      diagnosis.query_success = true;
    }
  } catch (error) {
    diagnosis.error = error.message;
    diagnosis.stack = error.stack;
    diagnosis.query_success = false;
  }

  return new Response(JSON.stringify(diagnosis, null, 2), {
    status: diagnosis.query_success ? 200 : 500,
    headers: { "Content-Type": "application/json" }
  });
}
