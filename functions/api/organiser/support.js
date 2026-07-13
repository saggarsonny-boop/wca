import { requireAuth } from "../../_shared/auth.js";
import { json, err } from "../../_shared/response.js";

// Helper to check admin status
async function checkAdmin(user, env) {
  const dbUser = await env.DB.prepare(
    "SELECT role FROM organiser_users WHERE id = ?"
  ).bind(user.uid).first();
  return dbUser && dbUser.role === "admin";
}

export async function onRequestGet({ request, env }) {
  try {
    const user = await requireAuth(request, env);
    const isAdmin = await checkAdmin(user, env);

    if (isAdmin) {
      // List all tickets with user emails
      const tickets = await env.DB.prepare(`
        SELECT t.*, u.email as client_email 
        FROM organiser_support_tickets t
        JOIN organiser_users u ON t.user_id = u.id
        ORDER BY t.created_at DESC
      `).all();
      return json(tickets.results || []);
    } else {
      // List user's own tickets
      const tickets = await env.DB.prepare(`
        SELECT * FROM organiser_support_tickets 
        WHERE user_id = ? 
        ORDER BY created_at DESC
      `).bind(user.uid).all();
      return json(tickets.results || []);
    }
  } catch (e) {
    if (e instanceof Response) return e;
    return err(e.message, 500);
  }
}

export async function onRequestPost({ request, env }) {
  try {
    const user = await requireAuth(request, env);
    const body = await request.json();

    if (body.action === "reply") {
      // Admin posting a reply
      const isAdmin = await checkAdmin(user, env);
      if (!isAdmin) return err("Unauthorized", 403);

      const { ticket_id, message } = body;
      
      // Save reply
      await env.DB.prepare(
        "INSERT INTO organiser_ticket_replies (ticket_id, sender_role, message) VALUES (?, 'admin', ?)"
      ).bind(ticket_id, message).run();

      // Update ticket status
      await env.DB.prepare(
        "UPDATE organiser_support_tickets SET status = 'replied' WHERE id = ?"
      ).bind(ticket_id).run();

      // Fetch client email for notification
      const ticket = await env.DB.prepare(`
        SELECT t.subject, u.email 
        FROM organiser_support_tickets t
        JOIN organiser_users u ON t.user_id = u.id
        WHERE t.id = ?
      `).bind(ticket_id).first();

      // Email the client via Resend
      if (env.RESEND_API_KEY && ticket) {
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${env.RESEND_API_KEY}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            from: "support@whitecollaracademy.com",
            to: ticket.email,
            subject: `WCA Case Organizer Support: ${ticket.subject}`,
            html: `<p>A support consultant has replied to your ticket:</p><blockquote>${message}</blockquote>`
          })
        });
      }

      return json({ success: true });
    } else {
      // Client submitting a new ticket
      const { subject, message } = body;
      if (!subject || !message) return err("Subject and Message required", 400);

      const result = await env.DB.prepare(
        "INSERT INTO organiser_support_tickets (user_id, subject, message) VALUES (?, ?, ?)"
      ).bind(user.uid, subject, message).run();

      // Alert Sonny/Tom via Resend
      if (env.RESEND_API_KEY) {
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${env.RESEND_API_KEY}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            from: "support@whitecollaracademy.com",
            to: "saggarsonny@gmail.com",
            subject: `New Case Organizer Ticket: ${subject}`,
            html: `<p>Client <strong>${user.email}</strong> submitted a new support ticket:</p><blockquote>${message}</blockquote>`
          })
        });
      }

      return json({ success: true, id: result.lastRowId });
    }
  } catch (e) {
    if (e instanceof Response) return e;
    return err(e.message, 500);
  }
}
