/**
 * WCA Case Organiser — real smoke test
 *
 * Not a fake test suite. Every check below makes a real fetch and asserts
 * on the actual response. Run this from your browser's console while
 * logged into the organiser (so the session cookie is attached), on
 * either the preview URL or whitecollaracademy.com.
 *
 * Usage: paste this whole file into DevTools console, then run:
 *   runSmokeTest()
 */

async function runSmokeTest() {
  const results = [];

  function record(name, pass, detail) {
    results.push({ name, pass, detail });
    console.log(`${pass ? "✅" : "❌"} ${name}${detail ? " — " + detail : ""}`);
  }

  // 1. Auth: /api/auth/me should return 200 with an email if logged in
  try {
    const r = await fetch("/api/auth/me", { credentials: "include" });
    const data = await r.json().catch(() => ({}));
    record("auth/me returns current user", r.ok && !!data.email, `status ${r.status}`);
  } catch (e) {
    record("auth/me returns current user", false, e.message);
  }

  // 2. Case file GET should return 200 with a data key (null or object)
  try {
    const r = await fetch("/api/organiser/case-file", { credentials: "include" });
    const data = await r.json().catch(() => ({}));
    record("case-file GET succeeds", r.ok && "data" in data, `status ${r.status}`);
  } catch (e) {
    record("case-file GET succeeds", false, e.message);
  }

  // 3. Dates GET should return 200 with an array
  try {
    const r = await fetch("/api/organiser/dates", { credentials: "include" });
    const data = await r.json().catch(() => ({}));
    record("dates GET returns array", r.ok && Array.isArray(data.dates), `status ${r.status}`);
  } catch (e) {
    record("dates GET returns array", false, e.message);
  }

  // 4. Documents GET should return 200 with an array
  try {
    const r = await fetch("/api/organiser/documents", { credentials: "include" });
    const data = await r.json().catch(() => ({}));
    record("documents GET returns array", r.ok && Array.isArray(data.documents), `status ${r.status}`);
  } catch (e) {
    record("documents GET returns array", false, e.message);
  }

  // 5. AI guide should reject an empty message with a real 400, not a crash
  try {
    const r = await fetch("/api/organiser/ai", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "" })
    });
    record("ai endpoint rejects empty message", r.status === 400, `status ${r.status}`);
  } catch (e) {
    record("ai endpoint rejects empty message", false, e.message);
  }

  // 6. Unauthenticated request to a protected endpoint should be 401, not 200
  try {
    const r = await fetch("/api/organiser/case-file", { credentials: "omit" });
    record("protected endpoint blocks logged-out access", r.status === 401, `status ${r.status}`);
  } catch (e) {
    record("protected endpoint blocks logged-out access", false, e.message);
  }

  // 7. Calculator page actually contains the projection report heading
  try {
    const r = await fetch("/organiser/calculator.html");
    const html = await r.text();
    record("calculator page renders projection report", html.includes("SENTENCE PROJECTION"), `status ${r.status}`);
  } catch (e) {
    record("calculator page renders projection report", false, e.message);
  }

  const passed = results.filter(r => r.pass).length;
  console.log(`\n${passed}/${results.length} passed`);
  return results;
}
