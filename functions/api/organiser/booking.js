import { requireAuth } from "../../_shared/auth.js";
import { json, err } from "../../_shared/response.js";

async function getProfile(user, env) {
  return await env.DB.prepare(
    "SELECT email, subscription_status, consulting_sessions_remaining, role, phone FROM organiser_users WHERE id = ?"
  ).bind(user.uid).first();
}

function getConsultantKey(email) {
  if (email === "saggarsonny@gmail.com") return "sonny";
  if (email === "thomas.webster@gmail.com") return "webster";
  return null;
}

export async function onRequestGet({ request, env }) {
  try {
    const user = await requireAuth(request, env);
    const profile = await getProfile(user, env);

    const db = env.DB;

    if (profile.role === "admin") {
      const consultant = getConsultantKey(profile.email);
      // Admin sees bookings and blocked slots for their own calendar only
      const bookings = await db.prepare(`
        SELECT b.*, u.email as client_email 
        FROM organiser_consulting_bookings b
        JOIN organiser_users u ON b.user_id = u.id
        WHERE b.consultant = ?
        ORDER BY b.booking_date ASC, b.booking_time ASC
      `).bind(consultant).all();

      const blocked = await db.prepare(
        "SELECT * FROM organiser_blocked_slots WHERE consultant = ? ORDER BY blocked_date ASC"
      ).bind(consultant).all();

      return json({
        bookings: bookings.results || [],
        blocked: blocked.results || [],
        consultant
      });
    } else {
      // Clients see all of their own bookings
      const bookings = await db.prepare(`
        SELECT * FROM organiser_consulting_bookings 
        WHERE user_id = ? 
        ORDER BY booking_date ASC, booking_time ASC
      `).bind(user.uid).all();

      // Clients also need to know blocked slots to disable them in calendar picker
      const blocked = await db.prepare(
        "SELECT blocked_date, blocked_time, consultant FROM organiser_blocked_slots"
      ).all();

      return json({
        bookings: bookings.results || [],
        blocked: blocked.results || []
      });
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
    const { action } = body;

    const profile = await getProfile(user, env);
    const db = env.DB;

    if (profile.role === "admin") {
      const adminConsultant = getConsultantKey(profile.email);
      if (!adminConsultant) return err("Invalid admin consultant account", 403);

      if (action === "approve") {
        const { booking_id } = body;
        const booking = await db.prepare(
          "SELECT b.*, u.email as client_email FROM organiser_consulting_bookings b JOIN organiser_users u ON b.user_id = u.id WHERE b.id = ?"
        ).bind(booking_id).first();

        if (!booking) return err("Booking not found", 404);
        if (booking.consultant !== adminConsultant) return err("Cannot modify other consultant's booking", 403);

        await db.prepare(
          "UPDATE organiser_consulting_bookings SET status = 'confirmed' WHERE id = ?"
        ).bind(booking_id).run();

        // Send confirmed email to client
        if (env.RESEND_API_KEY) {
          await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${env.RESEND_API_KEY}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              from: "support@whitecollaracademy.com",
              to: booking.client_email,
              subject: `Confirmed Booking Notice: Case Consulting`,
              html: `<p>Your consulting session request with <strong>${adminConsultant === "sonny" ? "Dr. Sonny Saggar" : "Dr. Thomas Webster"}</strong> on <strong>${booking.booking_date}</strong> at <strong>${booking.booking_time}</strong> has been **CONFIRMED**.</p>`
            })
          });
        }
        return json({ success: true });

      } else if (action === "block") {
        const { date, time } = body;
        if (!date || !time) return err("Date and Time required", 400);

        await db.prepare(
          "INSERT INTO organiser_blocked_slots (consultant, blocked_date, blocked_time) VALUES (?, ?, ?)"
        ).bind(adminConsultant, date, time).run();
        return json({ success: true });

      } else if (action === "unblock") {
        const { block_id } = body;
        await db.prepare(
          "DELETE FROM organiser_blocked_slots WHERE id = ? AND consultant = ?"
        ).bind(block_id, adminConsultant).run();
        return json({ success: true });

      } else if (action === "override_add") {
        const { client_email, date, time, phone } = body;
        const client = await db.prepare("SELECT id FROM organiser_users WHERE email = ?").bind(client_email).first();
        if (!client) return err("Client user not found", 404);

        // Admins can bypass limits and add direct slots
        await db.prepare(
          "INSERT INTO organiser_consulting_bookings (user_id, consultant, booking_date, booking_time, status, phone) VALUES (?, ?, ?, ?, 'confirmed', ?)"
        ).bind(client.id, adminConsultant, date, time, phone).run();

        if (env.RESEND_API_KEY) {
          await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${env.RESEND_API_KEY}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              from: "support@whitecollaracademy.com",
              to: client_email,
              subject: `Confirmed Booking Notice: Direct Admin Placement`,
              html: `<p>Dr. ${adminConsultant === "sonny" ? "Saggar" : "Webster"} has added a consulting session to your calendar: <strong>${date}</strong> at <strong>${time}</strong>.</p>`
            })
          });
        }
        return json({ success: true });

      } else if (action === "move") {
        const { booking_id, new_date, new_time } = body;
        const booking = await db.prepare("SELECT * FROM organiser_consulting_bookings WHERE id = ?").bind(booking_id).first();
        if (!booking) return err("Booking not found", 404);
        if (booking.consultant !== adminConsultant) return err("Cannot move other consultant's booking", 403);

        await db.prepare(
          "UPDATE organiser_consulting_bookings SET booking_date = ?, booking_time = ?, status = 'confirmed' WHERE id = ?"
        ).bind(new_date, new_time, booking_id).run();

        const client = await db.prepare("SELECT email FROM organiser_users WHERE id = ?").bind(booking.user_id).first();
        if (env.RESEND_API_KEY && client) {
          await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${env.RESEND_API_KEY}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              from: "support@whitecollaracademy.com",
              to: client.email,
              subject: `Rescheduled Booking Notice: Case Consulting`,
              html: `<p>Your session with <strong>Dr. ${adminConsultant === "sonny" ? "Saggar" : "Webster"}</strong> has been moved to: <strong>${new_date}</strong> at <strong>${new_time}</strong>.</p>`
            })
          });
        }
        return json({ success: true });
      }

      return err("Action not supported", 400);

    } else {
      // Client Booking Flow
      if (action === "cancel") {
        const { booking_id } = body;
        const booking = await db.prepare(
          "SELECT * FROM organiser_consulting_bookings WHERE id = ? AND user_id = ?"
        ).bind(booking_id, user.uid).first();

        if (!booking) return err("Booking not found", 404);
        if (booking.status === "cancelled") return err("Session already cancelled", 400);

        const bookingDateTime = new Date(`${booking.booking_date}T${booking.booking_time}:00`);
        const now = new Date();
        const differenceMs = bookingDateTime - now;
        const hoursRemaining = differenceMs / (1000 * 60 * 60);

        let refundSession = hoursRemaining >= 24;

        await db.prepare(
          "UPDATE organiser_consulting_bookings SET status = 'cancelled' WHERE id = ?"
        ).bind(booking_id).run();

        if (refundSession) {
          await db.prepare(
            "UPDATE organiser_users SET consulting_sessions_remaining = consulting_sessions_remaining + 1 WHERE id = ?"
          ).bind(user.uid).run();
        }

        // Email Sonny & Tom
        if (env.RESEND_API_KEY) {
          await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${env.RESEND_API_KEY}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              from: "support@whitecollaracademy.com",
              to: "saggarsonny@gmail.com, thomas.webster@gmail.com",
              subject: `Consulting Session CANCELLED by Client`,
              html: `<p>Client <strong>${user.email}</strong> cancelled their session with Dr. ${booking.consultant === "sonny" ? "Saggar" : "Webster"}: <strong>${booking.booking_date}</strong> at <strong>${booking.booking_time}</strong>.</p>`
            })
          });
        }

        return json({ success: true, refunded: refundSession });

      } else {
        // Create Request Booking
        const { consultant, date, time, phone } = body;
        if (!consultant || !date || !time || !phone) {
          return err("Consultant, Date, Time, and Phone are required", 400);
        }

        if (profile.subscription_status !== "consulting") {
          return err("Consulting plan required.", 403);
        }
        if (profile.consulting_sessions_remaining <= 0) {
          return err("No prepaid sessions remaining.", 400);
        }

        // Verify slot is not blocked
        const isBlocked = await db.prepare(
          "SELECT id FROM organiser_blocked_slots WHERE consultant = ? AND blocked_date = ? AND blocked_time = ?"
        ).bind(consultant, date, time).first();
        if (isBlocked) return err("Slot is blocked by consultant.", 400);

        // Verify 7-day advance booking window
        const selectedDate = new Date(`${date}T00:00:00`);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const minLeadDate = new Date(today);
        minLeadDate.setDate(today.getDate() + 7);

        if (selectedDate < minLeadDate) {
          return err("Prepaid sessions require a minimum of 7 days advance booking lead time.", 400);
        }

        // Decrement balance and update phone
        await db.prepare(
          "UPDATE organiser_users SET consulting_sessions_remaining = consulting_sessions_remaining - 1, phone = ? WHERE id = ?"
        ).bind(phone, user.uid).run();

        // Save Booking as 'requested'
        const result = await db.prepare(
          "INSERT INTO organiser_consulting_bookings (user_id, consultant, booking_date, booking_time, status, phone) VALUES (?, ?, ?, ?, 'requested', ?)"
        ).bind(user.uid, consultant, date, time, phone).run();

        // Send 'requested' emails to Sonny & Tom
        if (env.RESEND_API_KEY) {
          await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${env.RESEND_API_KEY}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              from: "support@whitecollaracademy.com",
              to: "saggarsonny@gmail.com, thomas.webster@gmail.com",
              subject: `Consulting Session REQUESTED: ${consultant === "sonny" ? "Sonny" : "Tom"}`,
              html: `<p>A new consulting session has been **REQUESTED** by <strong>${user.email}</strong> (Phone: ${phone}) on <strong>${date}</strong> at <strong>${time}</strong>. Please approve this booking inside the Admin Console.</p>`
            })
          });
        }

        return json({ success: true, id: result.lastRowId });
      }
    }
  } catch (e) {
    if (e instanceof Response) return e;
    return err(e.message, 500);
  }
}
