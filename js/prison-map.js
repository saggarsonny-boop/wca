// Interactive US map for the Sponsor a Prison Library page.
//
// This is a schematic map, not a survey-accurate one: state positions come
// from well-known approximate state centroid coordinates (lat/lon), and
// facility markers are placed near their state's centroid with a small
// deterministic offset (so multiple facilities in one state don't stack
// exactly on top of each other). We don't have precise street-level
// geocoding for every facility, so this deliberately doesn't pretend to.
// It's for browsing/selecting a facility visually, not for real navigation.
(function () {
  const STATE_CENTROIDS = {
    AL: [32.8, -86.8], AZ: [34.2, -111.9], AR: [34.9, -92.4], CA: [37.2, -119.7],
    CO: [39.0, -105.5], CT: [41.6, -72.7], DE: [39.0, -75.5], FL: [28.6, -81.5],
    GA: [32.6, -83.4], ID: [44.2, -114.5], IL: [40.0, -89.2], IN: [39.9, -86.3],
    IA: [42.0, -93.5], KS: [38.5, -98.4], KY: [37.5, -85.3], LA: [31.2, -92.0],
    ME: [45.4, -69.0], MD: [39.0, -76.7], MA: [42.3, -71.8], MI: [44.3, -85.4],
    MN: [46.3, -94.3], MS: [32.7, -89.7], MO: [38.5, -92.6], MT: [47.0, -109.6],
    NE: [41.5, -99.8], NV: [39.3, -116.9], NH: [43.7, -71.6], NJ: [40.1, -74.7],
    NM: [34.4, -106.1], NY: [42.9, -75.5], NC: [35.6, -79.4], ND: [47.5, -100.5],
    OH: [40.3, -82.8], OK: [35.6, -97.5], OR: [44.0, -120.5], PA: [40.9, -77.8],
    RI: [41.7, -71.6], SC: [33.9, -80.9], SD: [44.4, -100.2], TN: [35.9, -86.4],
    TX: [31.5, -99.3], UT: [39.3, -111.7], VT: [44.0, -72.7], VA: [37.5, -78.5],
    WA: [47.4, -120.5], WV: [38.6, -80.6], WI: [44.6, -89.9], WY: [43.0, -107.5],
    DC: [38.9, -77.0]
  };
  // Alaska and Hawaii are drawn as fixed insets (standard US map convention)
  // rather than their real, far-off coordinates.
  const INSET_POSITIONS = {
    AK: { x: 60, y: 480 },
    HI: { x: 180, y: 480 }
  };

  const VB_W = 960;
  const VB_H = 560;
  const LON_MIN = -125, LON_MAX = -66;
  const LAT_MIN = 24, LAT_MAX = 49;

  function project(lat, lon) {
    const x = ((lon - LON_MIN) / (LON_MAX - LON_MIN)) * (VB_W - 60) + 30;
    const y = ((LAT_MAX - lat) / (LAT_MAX - LAT_MIN)) * (VB_H - 80) + 20;
    return { x, y };
  }

  function hashOffset(id, spread) {
    let h = 0;
    for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
    const angle = (h % 360) * (Math.PI / 180);
    const dist = spread * (0.3 + ((h >> 8) % 100) / 140);
    return { dx: Math.cos(angle) * dist, dy: Math.sin(angle) * dist };
  }

  function svgEl(tag, attrs) {
    const el = document.createElementNS("http://www.w3.org/2000/svg", tag);
    for (const k in attrs) el.setAttribute(k, attrs[k]);
    return el;
  }

  function initPrisonMap(containerId, facilities, onSelect) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const byState = {};
    facilities.forEach((f) => {
      if (!f.state) return;
      (byState[f.state] = byState[f.state] || []).push(f);
    });

    const svg = svgEl("svg", {
      viewBox: `0 0 ${VB_W} ${VB_H}`,
      class: "prison-map-svg",
      role: "img",
      "aria-label": "Map of US states with sponsorable federal facilities"
    });

    const statesLayer = svgEl("g", { class: "prison-map-states" });
    const pinsLayer = svgEl("g", { class: "prison-map-pins" });
    svg.appendChild(statesLayer);
    svg.appendChild(pinsLayer);

    let zoomedState = null;

    function stateCenter(abbr) {
      if (INSET_POSITIONS[abbr]) return INSET_POSITIONS[abbr];
      const c = STATE_CENTROIDS[abbr];
      return c ? project(c[0], c[1]) : null;
    }

    function renderStates() {
      statesLayer.innerHTML = "";
      const allAbbrs = new Set([...Object.keys(STATE_CENTROIDS), ...Object.keys(INSET_POSITIONS)]);
      allAbbrs.forEach((abbr) => {
        const pos = stateCenter(abbr);
        if (!pos) return;
        const count = (byState[abbr] || []).length;
        const g = svgEl("g", {
          class: "prison-map-state" + (count ? " has-facilities" : "") + (zoomedState === abbr ? " active" : ""),
          tabindex: count ? "0" : "-1",
          role: "button",
          "aria-label": `${abbr}${count ? `, ${count} facility${count > 1 ? "ies" : ""}` : ""}`
        });
        const r = count ? 12 + Math.min(count, 10) : 6;
        const circle = svgEl("circle", { cx: pos.x, cy: pos.y, r });
        const label = svgEl("text", { x: pos.x, y: pos.y + 4, "text-anchor": "middle" });
        label.textContent = abbr;
        g.appendChild(circle);
        g.appendChild(label);
        if (count) {
          g.addEventListener("click", () => selectState(abbr));
          g.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") { e.preventDefault(); selectState(abbr); }
          });
        }
        statesLayer.appendChild(g);
      });
    }

    function renderPins(abbr) {
      pinsLayer.innerHTML = "";
      const list = byState[abbr] || [];
      const center = stateCenter(abbr);
      if (!center) return;
      list.forEach((f) => {
        const off = hashOffset(f.id, 26);
        const x = center.x + off.dx;
        const y = center.y + off.dy;
        const g = svgEl("g", {
          class: "prison-map-pin",
          tabindex: "0",
          role: "button",
          "aria-label": `Select ${f.name}`
        });
        const dot = svgEl("circle", { cx: x, cy: y, r: 6 });
        g.appendChild(dot);
        g.addEventListener("click", (e) => {
          e.stopPropagation();
          onSelect(f.id);
        });
        g.addEventListener("keydown", (e) => {
          if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSelect(f.id); }
        });
        const title = svgEl("title", {});
        title.textContent = f.name;
        g.appendChild(title);
        pinsLayer.appendChild(g);
      });
    }

    function selectState(abbr) {
      zoomedState = abbr;
      const center = stateCenter(abbr);
      const zoomSize = 170;
      svg.setAttribute(
        "viewBox",
        `${center.x - zoomSize} ${center.y - zoomSize} ${zoomSize * 2} ${zoomSize * 2}`
      );
      renderStates();
      renderPins(abbr);
      resetBtn.style.display = "inline-block";
      stateLabel.textContent = `Facilities in ${abbr}`;
    }

    function resetZoom() {
      zoomedState = null;
      svg.setAttribute("viewBox", `0 0 ${VB_W} ${VB_H}`);
      pinsLayer.innerHTML = "";
      renderStates();
      resetBtn.style.display = "none";
      stateLabel.textContent = "Click a state to see its facilities";
    }

    const controls = document.createElement("div");
    controls.className = "prison-map-controls";

    const stateLabel = document.createElement("span");
    stateLabel.className = "prison-map-state-label";
    stateLabel.textContent = "Click a state to see its facilities";

    const resetBtn = document.createElement("button");
    resetBtn.type = "button";
    resetBtn.className = "prison-map-reset";
    resetBtn.textContent = "← All states";
    resetBtn.style.display = "none";
    resetBtn.addEventListener("click", resetZoom);

    const zoomInBtn = document.createElement("button");
    zoomInBtn.type = "button";
    zoomInBtn.className = "prison-map-zoom-btn";
    zoomInBtn.setAttribute("aria-label", "Zoom in");
    zoomInBtn.textContent = "+";
    const zoomOutBtn = document.createElement("button");
    zoomOutBtn.type = "button";
    zoomOutBtn.className = "prison-map-zoom-btn";
    zoomOutBtn.setAttribute("aria-label", "Zoom out");
    zoomOutBtn.textContent = "−";

    function currentViewBox() {
      return svg.getAttribute("viewBox").split(" ").map(Number);
    }
    function zoomBy(factor) {
      const [x, y, w, h] = currentViewBox();
      const nw = Math.max(80, Math.min(VB_W, w * factor));
      const nh = Math.max(80 * (VB_H / VB_W), Math.min(VB_H, h * factor));
      const cx = x + w / 2, cy = y + h / 2;
      svg.setAttribute("viewBox", `${cx - nw / 2} ${cy - nh / 2} ${nw} ${nh}`);
    }
    zoomInBtn.addEventListener("click", () => zoomBy(0.75));
    zoomOutBtn.addEventListener("click", () => zoomBy(1.33));

    controls.appendChild(stateLabel);
    controls.appendChild(zoomOutBtn);
    controls.appendChild(zoomInBtn);
    controls.appendChild(resetBtn);

    container.innerHTML = "";
    container.appendChild(controls);
    container.appendChild(svg);

    renderStates();
  }

  window.WCA_initPrisonMap = initPrisonMap;
})();
