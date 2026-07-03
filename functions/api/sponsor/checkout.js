import { json, err } from "../../_shared/response.js";

export async function onRequestPost({ request, env }) {
  try {
    const body = await request.json();
    const { facility_id, tier_id, sponsor_name, sponsor_email, sponsor_phone, message, is_anonymous } = body;

    if (!facility_id || !tier_id || !sponsor_name || !sponsor_email) {
      return err("Facility, tier, name, and email are required.");
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sponsor_email)) {
      return err("Please enter a valid email address.");
    }

    const facility = await env.DB.prepare(
      "SELECT id, name FROM facilities WHERE id = ? AND is_active = 1"
    ).bind(facility_id).first();
    if (!facility) return err("That facility is not available.", 400);

    const tier = await env.DB.prepare(
      "SELECT id, name, amount_cents, book_count FROM sponsorship_tiers WHERE id = ? AND is_active = 1"
    ).bind(tier_id).first();
    if (!tier) return err("That sponsorship tier is not available.", 400);

    const sponsorshipId = crypto.randomUUID();
    await env.DB.prepare(
      `INSERT INTO sponsorships
         (id, facility_id, tier_id, sponsor_name, sponsor_email, sponsor_phone, amount_cents, book_count, message, is_anonymous, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', datetime('now'))`
    ).bind(
      sponsorshipId, facility_id, tier_id, sponsor_name, sponsor_email, sponsor_phone || "",
      tier.amount_cents, tier.book_count, message || "", is_anonymous ? 1 : 0
    ).run();

    const origin = new URL(request.url).origin;

    const params = new URLSearchParams({
      "line_items[0][price_data][currency]": "usd",
      "line_items[0][price_data][unit_amount]": String(tier.amount_cents),
      "line_items[0][price_data][product_data][name]": `${tier.name} — ${facility.name}`,
      "line_items[0][quantity]": "1",
      mode: "payment",
      success_url: `${origin}/sponsor/success.html?id=${sponsorshipId}`,
      cancel_url: `${origin}/sponsor.html`,
      customer_email: sponsor_email,
      "metadata[type]": "sponsorship",
      "metadata[sponsorship_id]": sponsorshipId,
      "metadata[facility_id]": facility_id,
    });

    const resp = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: params.toString()
    });

    if (!resp.ok) {
      const errBody = await resp.text();
      console.error("Stripe sponsorship checkout error", resp.status, errBody);
      return err("Could not start checkout. Please try again.", 503);
    }

    const session = await resp.json();

    await env.DB.prepare(
      "UPDATE sponsorships SET stripe_checkout_session_id = ?, updated_at = datetime('now') WHERE id = ?"
    ).bind(session.id, sponsorshipId).run();

    return json({ url: session.url });
  } catch (e) {
    if (e instanceof Response) return e;
    console.error("sponsor checkout error", e);
    return err("Server error", 500);
  }
}
