(function() {
  // Track page view automatically
  async function track(eventType, details = {}) {
    try {
      await fetch('/api/organiser/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_type: eventType,
          url: window.location.pathname
        })
      });
    } catch (err) {
      console.warn("Analytics telemetry failed:", err);
    }
  }

  // Load tracker
  window.addEventListener('DOMContentLoaded', () => {
    track('pageview');

    // Click tracking on interaction targets
    document.body.addEventListener('click', (e) => {
      const btn = e.target.closest('button, a, input[type="submit"]');
      if (btn) {
        track('click', {
          element_id: btn.id || "",
          element_text: btn.textContent ? btn.textContent.trim().substring(0, 30) : ""
        });
      }
    });
  });
})();
