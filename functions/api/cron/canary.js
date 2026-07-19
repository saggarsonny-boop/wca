import { json, err } from "../../../_shared/response.js";

export async function onRequestGet({ env }) {
  if (!env.DB) {
    return err("Database binding DB is missing", 500);
  }

  try {
    // Self-bootstrap table if missing
    await env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS organiser_canary_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        status TEXT,
        details TEXT
      );
    `).run();

    // Check DB read/write patency
    const status = "OK";
    const details = "Self-validation check completed successfully.";
    
    await env.DB.prepare(`
      INSERT INTO organiser_canary_logs (status, details)
      VALUES (?, ?);
    `).bind(status, details).run();

    // Cleanup logs older than 7 days to conserve storage
    await env.DB.prepare(`
      DELETE FROM organiser_canary_logs
      WHERE timestamp < datetime('now', '-7 days');
    `).run();

    return json({
      success: true,
      timestamp: new Date().toISOString(),
      database: "HEALTHY",
      message: "Zero-ops canary diagnostic validation complete."
    });
  } catch (ex) {
    return err(`Canary self-diagnostic failure: ${ex.message}`, 500);
  }
}
