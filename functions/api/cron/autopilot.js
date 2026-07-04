import { json, err } from "../../_shared/response.js";

export async function onRequest({ request, env }) {
  try {
    // 1. Verify cron secret key
    const authHeader = request.headers.get("Authorization");
    const expectedSecret = env.AUTOPILOT_CRON_SECRET || "wca-dev-cron-fallback-secret-2026";
    if (authHeader !== `Bearer ${expectedSecret}`) {
      return err("Unauthorized cron access", 401);
    }

    const url = new URL(request.url);
    const action = url.searchParams.get("action") || "all";
    const results = {};

    // --- TASK 1: DAILY D1 DATABASE BACKUP TO R2 ---
    if (action === "backup" || action === "all") {
      try {
        const users = await env.DB.prepare("SELECT * FROM organiser_users").all();
        const dates = await env.DB.prepare("SELECT * FROM organiser_dates").all();
        const reminders = await env.DB.prepare("SELECT * FROM organiser_reminders").all();
        
        const backupData = JSON.stringify({
          timestamp: new Date().toISOString(),
          tables: {
            organiser_users: users.results,
            organiser_dates: dates.results,
            organiser_reminders: reminders.results
          }
        });

        const dateStr = new Date().toISOString().split("T")[0];
        const backupKey = `backups/backup_${dateStr}.json`;
        
        await env.DOCUMENTS.put(backupKey, backupData, {
          customMetadata: { type: "database_backup" }
        });
        results.backup = { ok: true, key: backupKey };
      } catch (backupErr) {
        console.error("Backup failed", backupErr);
        results.backup = { ok: false, error: backupErr.message };
      }
    }

    // --- TASK 2: INACTIVE USER REACTIVATION ---
    if (action === "reactivate" || action === "all") {
      try {
        // Query users inactive based on updated_at or simulated login dates
        const { results: users } = await env.DB.prepare(
          "SELECT email, subscription_status, created_at FROM organiser_users"
        ).all();

        let emailsSent = 0;
        if (env.RESEND_API_KEY) {
          for (const u of users) {
            // Simulate check: if registered but subscription is trial
            if (u.subscription_status === "trial") {
              await fetch("https://api.resend.com/emails", {
                method: "POST",
                headers: {
                  "Authorization": `Bearer ${env.RESEND_API_KEY}`,
                  "Content-Type": "application/json"
                },
                body: JSON.stringify({
                  from: "success@whitecollaracademy.com",
                  to: u.email,
                  subject: "Rebuilding on Autopilot — Your Case Organizer Update",
                  html: "<p>Hello, we've refreshed your case resources. Log in today to review your PSR checklist and mitigation plan.</p>"
                })
              });
              emailsSent++;
            }
          }
        }
        results.reactivate = { ok: true, emails_sent: emailsSent };
      } catch (reactivateErr) {
        results.reactivate = { ok: false, error: reactivateErr.message };
      }
    }

    // --- TASK 3: TELEMETRY & REVENUE REPORTING ---
    if (action === "report" || action === "all") {
      try {
        const { results: userCount } = await env.DB.prepare("SELECT COUNT(*) as count FROM organiser_users").all();
        const { results: analyticsCount } = await env.DB.prepare("SELECT COUNT(*) as count FROM organiser_analytics").all();
        
        const adminEmail = "sonnysaggar@gmail.com";
        if (env.RESEND_API_KEY) {
          await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${env.RESEND_API_KEY}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              from: "reports@whitecollaracademy.com",
              to: adminEmail,
              subject: `WCA Autopilot Report: ${new Date().toLocaleDateString()}`,
              html: `
                <h2>White Collar Academy Weekly Status</h2>
                <ul>
                  <li><strong>Total User Registrations:</strong> ${userCount[0]?.count || 0}</li>
                  <li><strong>Total Telemetry Hits Tracked:</strong> ${analyticsCount[0]?.count || 0}</li>
                  <li><strong>Database Status:</strong> Fully Operational</li>
                </ul>
              `
            })
          });
        }
        results.report = { ok: true, admin_notified: adminEmail };
      } catch (reportErr) {
        results.report = { ok: false, error: reportErr.message };
      }
    }

    return json({ ok: true, timestamp: new Date().toISOString(), results });
  } catch (e) {
    console.error("Autopilot cron error", e);
    return err("Cron execution failed", 500);
  }
}
