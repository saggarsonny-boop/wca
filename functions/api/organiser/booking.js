import { requireAuth } from "../../_shared/auth.js";
import { json, err } from "../../_shared/response.js";

async function getProfile(user, env) {
  return await env.DB.prepare(
    "SELECT subscription_status, consulting_sessions_remaining, role, phone FROM organiser_users WHERE id = ?"
  ).bind(user.uid).first();
}

export async function onRequestGet({ request, env }) {
  try {
    const user = await requireAuth(request, env);
    const profile = await getProfile(user, env);

    if (profile.role === "admin") {
      const bookings = await env.DB.prepare(`
        SELECT b.*, u.email as client_email 
        FROM organiser_consulting_bookings b
        JOIN organiser_users u ON b.user_id = u.id
        ORDER BY b.booking_date ASC, b.booking_time ASC
      `).all();
      return json(bookings.results || []);
    } else {
      const bookings = await env.DB.prepare(`
        SELECT * FROM organiser_consulting_bookings 
        WHERE user_id = ? 
        ORDER BY booking_date ASC, booking_time ASC
      `).bind(user.uid).all();
      return json(bookings.results || []);
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

    if (action === "cancel") {
      const { booking_id } = body;
      const booking = await env.DB.prepare(
        "SELECT * FROM organiser_consulting_bookings WHERE id = ? AND user_id = ?"
      ).bind(booking_id, user.uid).first();

      if (!booking) return err("Booking not found", 404);
      if (booking.status === "cancelled") return err("Session already cancelled", 400);

      // Check if cancellation is at least 24 hours in the future
      const bookingDateTime = new Date(`${booking.booking_date}T${booking.booking_time}:00`);
      const now = new Date();
      const differenceMs = bookingDateTime - now;
      const hoursRemaining = differenceMs / (1000 * 60 * 60);

      let refundSession = false;
      if (hoursRemaining >= 24) {
        refundSession = true;
      }

      // Update booking status
      await env.DB.prepare(
        "UPDATE organiser_consulting_bookings SET status = 'cancelled' WHERE id = ?"
      ).bind(booking_id).run();

      // Refund session if applicable
      if (refundSession) {
        await env.DB.prepare(
          "UPDATE organiser_users SET consulting_sessions_remaining = consulting_sessions_remaining + 1 WHERE id = ?"
        ).bind(user.uid).run();
      }

      // Alert Sonny & Tom of cancellation
      if (env.RESEND_API_KEY) {
        const emailContent = {
          from: "support@whitecollaracademy.com",
          to: "saggarsonny@gmail.com, thomas.webster@gmail.com",
          subject: `Consulting Session CANCELLED: ${booking.consultant === "sonny" ? "Sonny" : "Tom"}`,
          html: `<p>Client <strong>${user.email}</strong> cancelled a scheduled session:</p>
                 <ul>
                   <li><strong>Consultant:</strong> ${booking.consultant === "sonny" ? "Dr. Sonny Saggar" : "Dr. Thomas Webster"}</li>
                   <li><strong>Scheduled:</strong> ${booking.booking_date} at ${booking.booking_time}</li>
                   <li><strong>Notice Duration:</strong> ${hoursRemaining.toFixed(1)} hours</li>
                   <li><strong>Session Credited Back:</strong> ${refundSession ? "Yes" : "No (Late Cancellation/No Show)"}</li>
                 </ul>`
        };

        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${env.RESEND_API_KEY}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify(emailContent)
        });
      }

      return json({ success: true, refunded: refundSession });

    } else {
      // Create new booking
      const { consultant, date, time, phone } = body;
      if (!consultant || !date || !time || !phone) {
        return err("Consultant, Date, Time, and Phone Number are required", 400);
      }

      // Verify active consulting plan and non-zero session balances
      if (profile.subscription_status !== "consulting" && profile.role !== "admin") {
        return err("Consulting plan upgrade required.", 403);
      }
      if (profile.consulting_sessions_remaining <= 0 && profile.role !== "admin") {
        return err("No prepaid sessions remaining this month.", 400);
      }

      // Verify 7-day advance booking window
      const selectedDate = new Date(`${date}T00:00:00`);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const minLeadDate = new Date(today);
      minLeadDate.setDate(today.getDate() + 7);

      if (selectedDate < minLeadDate) {
        return err("Prepaid sessions require a minimum of 7 days advance booking lead time.", 400);
      }

      // Decrement balance and update phone in profile if not already set
      if (profile.role !== "admin") {
        await env.DB.prepare(
          "UPDATE organiser_users SET consulting_sessions_remaining = consulting_sessions_remaining - 1, phone = ? WHERE id = ?"
        ).bind(phone, user.uid).run();
      } else {
        await env.DB.prepare("UPDATE organiser_users SET phone = ? WHERE id = ?").bind(phone, user.uid).run();
      }

      // Save Booking
      const result = await env.DB.prepare(
        "INSERT INTO organiser_consulting_bookings (user_id, consultant, booking_date, booking_time, phone) VALUES (?, ?, ?, ?, ?)"
      ).bind(user.uid, consultant, date, time, phone).run();

      // Alert Sonny & Tom of Booking
      if (env.RESEND_API_KEY) {
        const emailPayload = {
          from: "support@whitecollaracademy.com",
          to: "saggarsonny@gmail.com, thomas.webster@gmail.com",
          subject: `New Case Consulting Booked: ${consultant === "sonny" ? "Sonny" : "Tom"}`,
          html: `<p>A new prepaid consulting session has been booked:</p>
                 <ul>
                   <li><strong>Client:</strong> ${user.email}</li>
                   <li><strong>Phone:</strong> ${phone}</li>
                   <li><strong>Consultant:</strong> ${consultant === "sonny" ? "Dr. Sonny Saggar" : "Dr. Thomas Webster"}</li>
                   <li><strong>Date:</strong> ${date}</li>
                   <li><strong>Time:</strong> ${time}</li>
                 </ul>`
        };

        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${env.RESEND_API_KEY}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify(emailPayload)
        });
      }

      return json({ success: true, id: result.lastRowId });
    }
  } catch (e) {
    if (e instanceof Response) return e;
    return err(e.message, 500);
  }
}
