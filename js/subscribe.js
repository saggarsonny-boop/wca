/**
 * Email capture form handler with Press-and-Hold human verification.
 * Posts to /api/subscribe (Cloudflare Pages Function).
 */
(function () {
  const form = document.getElementById("subscribe-form");
  if (!form) return;

  const status = document.getElementById("subscribe-status");
  const btn = form.querySelector('button[type="submit"]');
  if (!btn) return;

  // Dynamically convert standard button to btn-hold markup
  if (!btn.querySelector(".btn-hold__text")) {
    btn.innerHTML = `<span class="btn-hold__progress"></span><span class="btn-hold__text">Press & hold to send</span>`;
  }
  btn.classList.add("btn-hold");

  let holdTimer = null;
  let holdSuccess = false;

  function startHold(e) {
    if (holdSuccess || btn.disabled) return;
    btn.classList.add("holding");
    holdTimer = setTimeout(() => {
      holdSuccess = true;
      btn.classList.remove("holding");
      btn.classList.add("success");
      btn.querySelector(".btn-hold__text").textContent = "Verified";
      
      // Dispatch submit event to trigger handler
      form.dispatchEvent(new Event("submit"));
    }, 1500); // 1.5 seconds hold duration
  }

  function cancelHold() {
    if (holdSuccess) return;
    clearTimeout(holdTimer);
    btn.classList.remove("holding");
  }

  // Mouse and Touch event bindings for desktop and mobile hold gesture
  btn.addEventListener("mousedown", startHold);
  btn.addEventListener("touchstart", startHold);
  btn.addEventListener("mouseup", cancelHold);
  btn.addEventListener("mouseleave", cancelHold);
  btn.addEventListener("touchend", cancelHold);

  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    
    // Block submission if hold gesture did not complete
    if (!holdSuccess) {
      setStatus("Please press and hold the button to submit.", "err");
      return;
    }

    const email = form.querySelector('input[type="email"]').value.trim();
    const phone_confirm = form.querySelector('input[name="phone_confirm"]')?.value;

    if (!email) {
      holdSuccess = false;
      btn.classList.remove("success");
      btn.querySelector(".btn-hold__text").textContent = "Press & hold to send";
      return;
    }

    btn.disabled = true;
    setStatus("", "");

    try {
      const res  = await fetch("/api/subscribe", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email, phone_confirm })
      });
      const data = await res.json();

      if (res.ok) {
        setStatus("Thank you — check your inbox.", "ok");
        form.reset();
        
        // Reset hold state after successful submission
        setTimeout(() => {
          holdSuccess = false;
          btn.classList.remove("success");
          btn.querySelector(".btn-hold__text").textContent = "Press & hold to send";
          btn.disabled = false;
        }, 2000);
      } else {
        setStatus(data.error || "Something went wrong. Please try again.", "err");
        resetBtn();
      }
    } catch (_) {
      setStatus("Could not connect. Please try again.", "err");
      resetBtn();
    }
  });

  function resetBtn() {
    holdSuccess = false;
    btn.classList.remove("success");
    btn.querySelector(".btn-hold__text").textContent = "Press & hold to send";
    btn.disabled = false;
  }

  function setStatus(msg, type) {
    if (!status) return;
    status.textContent = msg;
    status.className   = "form-status" + (type ? " form-status--" + type : "");
  }
}());
