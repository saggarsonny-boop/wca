/**
 * Email capture form handler.
 * Posts to /api/subscribe (Cloudflare Pages Function).
 */
(function () {
  const form = document.getElementById("subscribe-form");
  if (!form) return;

  const status = document.getElementById("subscribe-status");

  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    const email = form.querySelector('input[type="email"]').value.trim();
    const btn   = form.querySelector('button[type="submit"]');

    if (!email) return;

    btn.disabled = true;
    setStatus("", "");

    try {
      const res  = await fetch("/api/subscribe", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email })
      });
      const data = await res.json();

      if (res.ok) {
        setStatus("Thank you — check your inbox.", "ok");
        form.reset();
      } else {
        setStatus(data.error || "Something went wrong. Please try again.", "err");
        btn.disabled = false;
      }
    } catch (_) {
      setStatus("Could not connect. Please try again.", "err");
      btn.disabled = false;
    }
  });

  function setStatus(msg, type) {
    if (!status) return;
    status.textContent = msg;
    status.className   = "form-status" + (type ? " form-status--" + type : "");
  }
}());
