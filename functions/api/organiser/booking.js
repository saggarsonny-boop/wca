import { requireAuth } from "../../_shared/auth.js";
import { json, err } from "../../_shared/response.js";

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
      // Admins see all bookings
      const bookings = await env.DB.prepare(`
        SELECT b.*, u.email as client_email 
        FROM organiser_consulting_bookings b
        JOIN organiser_users u ON b.user_id = u.id
        ORDER BY b.booking_date ASC, b.booking_time ASC
      `).all();
      return json(bookings.results || []);
    } else {
      // Clients see their own bookings
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
    const { consultant, date, time } = await request.json();

    if (!consultant || !date || !time) {
      return err("Consultant, Date, and Time are required", 400);
    }

    // 1. Enforce 7-day advance booking window
    const selectedDate = new Date(`${date}T00:00:00`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const minLeadDate = new Date(today);
    minLeadDate.setDate(today.getDate() + 7);

    if (selectedDate < minLeadDate) {
      return err("Prepaid sessions require a minimum of 7 days advance booking lead time.", 400);
    }

    // 2. Save booking
    const result = await env.DB.prepare(
      "INSERT INTO organiser_consulting_bookings (user_id, consultant, booking_date, booking_time) VALUES (?, ?, ?, ?)"
    ).bind(user.uid, consultant, date, time).run();

    // Send notifications to consultant
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
          subject: `New Case Consulting Booked: ${consultant}`,
          html: `<p>A new prepaid consulting session has been booked by <strong>${user.email}</strong>:</p><ul><li><strong>Consultant:</strong> ${consultant === "sonny" ? "Dr. Sonny Saggar" : "Dr. Thomas Webster"}</li><li><strong>Date:</strong> ${date}</li><li><strong>Time:</strong> ${time}</li></ul>`
        })
      });
    }

    return json({ success: true, id: result.lastRowId });
  } catch (e) {
    if (e instanceof Response) return e;
    return err(e.message, 500);
  }
}
