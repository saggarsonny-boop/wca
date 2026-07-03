document.addEventListener("DOMContentLoaded", function () {
  const btn = document.getElementById("hamburgerBtn");
  const menu = document.getElementById("navMenu");
  if (!btn || !menu) return;

  function setOpen(isOpen) {
    btn.classList.toggle("open", isOpen);
    menu.classList.toggle("open", isOpen);
    menu.setAttribute("aria-hidden", String(!isOpen));
    btn.setAttribute("aria-expanded", String(isOpen));
  }

  btn.addEventListener("click", function (e) {
    e.stopPropagation();
    setOpen(!menu.classList.contains("open"));
  });

  document.addEventListener("click", function (e) {
    if (menu.classList.contains("open") && !e.target.closest(".site-header")) {
      setOpen(false);
    }
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && menu.classList.contains("open")) {
      setOpen(false);
      btn.focus();
    }
  });
});
