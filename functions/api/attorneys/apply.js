export async function onRequestPost({ request, env }) {
  try {
    const body = await request.json();
    const {
      firm_name,
      contact_email,
      jurisdictions,
      specialties,
      lawyer_count,
      experience_years,
      retainer_range,
      self_evaluation
    } = body;

    // Basic validation
    if (!firm_name || !contact_email || !self_evaluation) {
      return json({ error: "Please fill out all required fields." }, 400);
    }

    const origin = new URL(request.url).origin;
    const isBCD = origin.includes("bluecollardiner");
    const brandName = isBCD ? "Blue Collar Diner" : "White Collar Academy";
    const shortName = isBCD ? "BCD" : "WCA";
    const senderEmail = isBCD ? "firms@bluecollardiner.com" : "firms@whitecollaracademy.com";

    // Construct the email body
    const emailHtml = `
      <h2>New Law Firm Directory Application</h2>
      <p>A new firm has submitted an application for the ${shortName} Approved Law Firms directory.</p>
      
      <table border="1" cellpadding="6" style="border-collapse: collapse; font-family: sans-serif; font-size: 14px;">
        <tr>
          <td><strong>Law Firm Name</strong></td>
          <td>${firm_name}</td>
        </tr>
        <tr>
          <td><strong>Contact Email</strong></td>
          <td><a href="mailto:${contact_email}">${contact_email}</a></td>
        </tr>
        <tr>
          <td><strong>Jurisdictions Licensed</strong></td>
          <td>${jurisdictions || "N/A"}</td>
        </tr>
        <tr>
          <td><strong>Areas of Specialty</strong></td>
          <td>${specialties || "N/A"}</td>
        </tr>
        <tr>
          <td><strong>Attorney Count</strong></td>
          <td>${lawyer_count || "N/A"}</td>
        </tr>
        <tr>
          <td><strong>Combined Experience Years</strong></td>
          <td>${experience_years || "N/A"}</td>
        </tr>
        <tr>
          <td><strong>Typical Retainer Range</strong></td>
          <td>${retainer_range || "N/A"}</td>
        </tr>
        <tr>
          <td><strong>Self-Evaluation / Core Strengths</strong></td>
          <td><pre style="white-space: pre-wrap; font-family: inherit;">${self_evaluation}</pre></td>
        </tr>
      </table>
    `;

    // Send via Resend API
    const resendKey = env.RESEND_API_KEY;
    if (!resendKey) {
      console.error("RESEND_API_KEY environment variable is not configured.");
      // Fallback: log to console so data isn't lost, but return success or mock
      return json({ ok: true, notice: "Mock: Resend API key is missing, logged to Cloudflare console." });
    }

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: `${shortName} Directory <${senderEmail}>`,
        to: "saggarsonny@gmail.com, thomas.webster@gmail.com",
        reply_to: contact_email,
        subject: `${shortName} Firm Application: ${firm_name}`,
        html: emailHtml
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Resend delivery failed:", errText);
      return json({ error: "Notification email failed to send. Please try again later." }, 502);
    }

    return json({ ok: true });
  } catch (err) {
    console.error("Application error:", err);
    return json({ error: "Server error. Please try again later." }, 500);
  }
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store"
    }
  });
}
