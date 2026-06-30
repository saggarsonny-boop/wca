import { requireActiveSubscription } from "../../../_shared/auth.js";
import { json, err } from "../../../_shared/response.js";

export async function onRequestPost({ request, env }) {
  try {
    const user = await requireActiveSubscription(request, env);
    const attorney_id = user.uid;
    const attorney_email = user.email;

    const body = await request.json();
    const { client_email } = body;

    if (!client_email) {
      return err("Client email is required", 400);
    }

    const clean_email = client_email.toLowerCase().trim();
    const origin = new URL(request.url).origin;
    const isBCD = origin.includes("bluecollardiner");
    const brandName = isBCD ? "Blue Collar Diner" : "White Collar Academy";
    const shortName = isBCD ? "BCD" : "WCA";
    const senderEmail = isBCD ? "firms@bluecollardiner.com" : "firms@whitecollaracademy.com";

    // Check if client is registered
    let clientUser = await env.DB.prepare(
      "SELECT id FROM organiser_users WHERE email = ?"
    ).bind(clean_email).first();

    const linked_at = new Date().toISOString();

    if (!clientUser) {
      // Client not registered yet. Create a pending connection stub.
      // We will first check if we can insert or if link already exists
      const existing = await env.DB.prepare(
        "SELECT id FROM organiser_attorney_clients WHERE attorney_id = ? AND client_id = (SELECT id FROM organiser_users WHERE email = ?)"
      ).bind(attorney_id, clean_email).first();

      if (existing) {
        return json({ ok: true, notice: "Invitation already sent to this email." });
      }

      // We generate a temp registration record
      const resendKey = env.RESEND_API_KEY;
      if (resendKey) {
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${resendKey}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            from: `${shortName} Organiser <${senderEmail}>`,
            to: clean_email,
            subject: `Invitation to set up your ${shortName} Case Organiser workspace`,
            html: `
              <h3>${shortName} Case Collaboration Invite</h3>
              <p>Your attorney / case representative (<strong>${attorney_email}</strong>) has invited you to set up your secure Case Organiser workspace on ${brandName}.</p>
              <p>${shortName} helps you manage case details, calculate timeline credits, and draft your mitigation statement in an encrypted container.</p>
              <p><a href="${origin}/organiser/register.html">Click here to register your account and get started.</a></p>
              <p>Once registered, you can approve the connection request directly on your dashboard.</p>
            `
          })
        });
      }

      return json({
        ok: true,
        notice: `Invitation sent. Once ${client_email} registers their account, they can approve your connection.`
      });
    }

    // Client is registered. Insert link.
    const client_id = clientUser.id;

    if (attorney_id === client_id) {
      return err("You cannot invite yourself as a client.", 400);
    }

    // Existing client user link logic
    const existingLink = await env.DB.prepare(
      "SELECT status FROM organiser_attorney_clients WHERE attorney_id = ? AND client_id = ?"
    ).bind(attorney_id, clientUser.id).first();

    if (existingLink) {
      return json({ ok: true, notice: `You already have a connection request with this client (${existingLink.status}).` });
    }

    // Insert pending request
    await env.DB.prepare(`
      INSERT INTO organiser_attorney_clients (attorney_id, client_id, linked_at, status, is_active_slot)
      VALUES (?, ?, ?, 'pending', 0)
    `).bind(attorney_id, clientUser.id, linked_at).run();

    const resendKey = env.RESEND_API_KEY;
    if (resendKey) {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${resendKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          from: `${shortName} Organiser <${senderEmail}>`,
          to: clean_email,
          subject: `${shortName} Connection Request from ${attorney_email}`,
          html: `
            <h3>${shortName} Collaboration Link Request</h3>
            <p>Your defense counsel (<strong>${attorney_email}</strong>) has requested to link to your ${shortName} Case Organiser workspace.</p>
            <p>By approving, they will have read-only access to view your case files, dates, and statements.</p>
            <p><a href="${origin}/organiser/">Log in to your dashboard to approve or decline this request.</a></p>
          `
        })
      });
    }

    return json({ ok: true, notice: `Connection request sent successfully to ${client_email}.` });
  } catch (e) {
    if (e instanceof Response) return e;
    console.error("attorney-invite error", e);
    return err("Server error", 500);
  }
}
