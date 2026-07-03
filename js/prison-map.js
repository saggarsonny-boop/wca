// Premium, clean state dropdown selector and facilities navigator.
// Replaces the SVG map completely with a highly functional, responsive design.
// Groups multi-facility complexes by city.
(function () {
  const STATE_NAMES = {
    AL: 'Alabama', AK: 'Alaska', AZ: 'Arizona', AR: 'Arkansas', CA: 'California',
    CO: 'Colorado', CT: 'Connecticut', DE: 'Delaware', FL: 'Florida', GA: 'Georgia',
    HI: 'Hawaii', ID: 'Idaho', IL: 'Illinois', IN: 'Indiana', IA: 'Iowa',
    KS: 'Kansas', KY: 'Kentucky', LA: 'Louisiana', ME: 'Maine', MD: 'Maryland',
    MA: 'Massachusetts', MI: 'Michigan', MIN: 'Minnesota', MN: 'Minnesota', MS: 'Mississippi',
    MO: 'Missouri', MT: 'Montana', NE: 'Nebraska', NV: 'Nevada', NH: 'New Hampshire',
    NJ: 'New Jersey', NM: 'New Mexico', NY: 'New York', NC: 'North Carolina',
    ND: 'North Dakota', OH: 'Ohio', OK: 'Oklahoma', OR: 'Oregon', PA: 'Pennsylvania',
    RI: 'Rhode Island', SC: 'South Carolina', SD: 'South Dakota', TN: 'Tennessee',
    TX: 'Texas', UT: 'Utah', VT: 'Vermont', VA: 'Virginia', WA: 'Washington',
    WV: 'West Virginia', WI: 'Wisconsin', WY: 'Wyoming', DC: 'District of Columbia'
  };

  const STYLE_BLOCK = `
    .wca-map-container {
      padding: 1.5rem;
      background: var(--bg-alt, #f7fafc);
      border-radius: 8px;
      border: 1px solid var(--border, #e2e8f0);
      display: flex;
      flex-direction: column;
      gap: 1rem;
      font-family: var(--font-sans, system-ui, -apple-system, sans-serif);
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    }
    .wca-map-title {
      font-size: 1.1rem;
      font-weight: 600;
      color: var(--text, #1a202c);
      margin: 0;
    }
    .wca-map-select-row {
      display: flex;
      gap: 0.75rem;
    }
    .wca-map-select {
      flex: 1;
      padding: 0.75rem;
      border-radius: 6px;
      border: 1px solid var(--border, #e2e8f0);
      background: var(--bg, #ffffff);
      color: var(--text, #1a202c);
      font-size: 1rem;
      font-weight: 500;
      outline: none;
      cursor: pointer;
      transition: border-color 0.2s;
    }
    .wca-map-select:focus {
      border-color: var(--accent, #2c4a7c);
    }
    .wca-map-clear-btn {
      padding: 0.75rem 1.25rem;
      font-size: 0.9rem;
      font-weight: 600;
      border-radius: 6px;
      border: 1px solid var(--border, #e2e8f0);
      background: var(--bg, #ffffff);
      color: var(--text-soft, #718096);
      cursor: pointer;
      transition: all 0.2s;
    }
    .wca-map-clear-btn:hover {
      background: var(--bg-alt, #f7fafc);
      color: var(--text, #1a202c);
    }
    .wca-map-facilities-list {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      max-height: 380px;
      overflow-y: auto;
      border: 1px solid var(--border, #e2e8f0);
      border-radius: 6px;
      background: var(--bg, #ffffff);
      padding: 0.5rem;
    }
    .wca-map-complex-container {
      border: 1px solid var(--border, #e2e8f0);
      border-radius: 4px;
      overflow: hidden;
      margin-bottom: 0.25rem;
    }
    .wca-map-complex-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem 1rem;
      background: #edf2f7;
      cursor: pointer;
      font-weight: 600;
      font-size: 0.95rem;
      color: var(--text, #1a202c);
      user-select: none;
    }
    .wca-map-complex-header:hover {
      background: #e2e8f0;
    }
    .wca-map-complex-list {
      display: flex;
      flex-direction: column;
      background: var(--bg, #ffffff);
    }
    .wca-map-facility-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem 1rem;
      background: var(--bg, #ffffff);
      cursor: pointer;
      transition: background 0.2s;
      border-bottom: 1px solid var(--border, #e2e8f0);
    }
    .wca-map-facility-item:last-child {
      border-bottom: none;
    }
    .wca-map-facility-item:hover {
      background: #f7fafc;
    }
    .wca-map-facility-name {
      font-weight: 500;
      font-size: 0.95rem;
      color: var(--text, #1a202c);
    }
    .wca-map-facility-meta {
      font-size: 0.8rem;
      color: var(--text-soft, #718096);
      background: var(--bg-alt, #f7fafc);
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
      border: 1px solid var(--border, #e2e8f0);
      text-transform: capitalize;
    }
    .wca-map-placeholder {
      padding: 2rem;
      text-align: center;
      color: var(--text-soft, #718096);
      font-size: 0.95rem;
      border: 1px dashed var(--border, #e2e8f0);
      border-radius: 6px;
      background: var(--bg, #ffffff);
    }
  `;

  function initPrisonMap(containerId, facilities, onSelect) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Inject styles if not already present
    if (!document.getElementById("wca-map-styles")) {
      const style = document.createElement("style");
      style.id = "wca-map-styles";
      style.textContent = STYLE_BLOCK;
      document.head.appendChild(style);
    }

    // Group facilities by state
    const byState = {};
    facilities.forEach(f => {
      if (!f.state) return;
      (byState[f.state] = byState[f.state] || []).push(f);
    });

    // Get sorted states list
    const sortedStates = Object.keys(byState).sort((a, b) => {
      const nameA = STATE_NAMES[a] || a;
      const nameB = STATE_NAMES[b] || b;
      return nameA.localeCompare(nameB);
    });

    // Build DOM
    const wrapper = document.createElement("div");
    wrapper.className = "wca-map-container";

    const title = document.createElement("h3");
    title.className = "wca-map-title";
    title.textContent = "Browse Facilities by State";
    wrapper.appendChild(title);

    const selectRow = document.createElement("div");
    selectRow.className = "wca-map-select-row";

    const select = document.createElement("select");
    select.className = "wca-map-select";
    
    const defaultOpt = document.createElement("option");
    defaultOpt.value = "";
    defaultOpt.textContent = "Choose a State...";
    select.appendChild(defaultOpt);

    sortedStates.forEach(state => {
      const opt = document.createElement("option");
      opt.value = state;
      const name = STATE_NAMES[state] || state;
      const count = byState[state].length;
      opt.textContent = `${name} (${count} facilit${count > 1 ? "ies" : "y"})`;
      select.appendChild(opt);
    });
    selectRow.appendChild(select);

    const clearBtn = document.createElement("button");
    clearBtn.type = "button";
    clearBtn.className = "wca-map-clear-btn";
    clearBtn.textContent = "Clear Filter";
    clearBtn.style.display = "none";
    selectRow.appendChild(clearBtn);

    wrapper.appendChild(selectRow);

    const listContainer = document.createElement("div");
    wrapper.appendChild(listContainer);

    function showPlaceholder() {
      listContainer.innerHTML = `
        <div class="wca-map-placeholder">
          Select a state above to view and select available facilities.
        </div>
      `;
      clearBtn.style.display = "none";
    }

    function renderFacilities(state) {
      if (!state) {
        showPlaceholder();
        return;
      }

      clearBtn.style.display = "inline-block";
      listContainer.innerHTML = "";

      const list = document.createElement("div");
      list.className = "wca-map-facilities-list";

      const stateFacilities = byState[state] || [];
      
      // Group facilities in this state by city
      const byCity = {};
      stateFacilities.forEach(f => {
        (byCity[f.city] = byCity[f.city] || []).push(f);
      });

      Object.keys(byCity).sort().forEach(city => {
        const group = byCity[city];
        if (group.length > 1) {
          // Multi-facility complex
          const complexContainer = document.createElement("div");
          complexContainer.className = "wca-map-complex-container";

          const header = document.createElement("div");
          header.className = "wca-map-complex-header";
          header.innerHTML = `<span>${city}, ${state} (${group.length} facilities)</span> <span>▶</span>`;

          const nestedList = document.createElement("div");
          nestedList.className = "wca-map-complex-list";

          group.sort((a, b) => a.name.localeCompare(b.name)).forEach(f => {
            const item = document.createElement("div");
            item.className = "wca-map-facility-item";
            
            const nameSpan = document.createElement("span");
            nameSpan.className = "wca-map-facility-name";
            nameSpan.textContent = `├── ${f.name}`;

            const typeSpan = document.createElement("span");
            typeSpan.className = "wca-map-facility-meta";
            typeSpan.textContent = f.security_level || f.type;

            item.appendChild(nameSpan);
            item.appendChild(typeSpan);

            item.addEventListener("click", () => {
              onSelect(f.id);
            });

            nestedList.appendChild(item);
          });

          complexContainer.appendChild(header);
          complexContainer.appendChild(nestedList);

          // Add toggle action
          let expanded = true;
          header.addEventListener("click", () => {
            expanded = !expanded;
            nestedList.style.display = expanded ? "flex" : "none";
            header.querySelector("span:last-child").textContent = expanded ? "▶" : "▼";
          });

          list.appendChild(complexContainer);
        } else {
          // Single facility
          const f = group[0];
          const item = document.createElement("div");
          item.className = "wca-map-facility-item";
          item.style.border = "1px solid var(--border, #e2e8f0)";
          item.style.borderRadius = "4px";
          item.style.marginBottom = "0.25rem";

          const nameSpan = document.createElement("span");
          nameSpan.className = "wca-map-facility-name";
          nameSpan.textContent = f.name;

          const typeSpan = document.createElement("span");
          typeSpan.className = "wca-map-facility-meta";
          typeSpan.textContent = `${f.city} (${f.security_level || f.type})`;

          item.appendChild(nameSpan);
          item.appendChild(typeSpan);

          item.addEventListener("click", () => {
            onSelect(f.id);
          });

          list.appendChild(item);
        }
      });

      listContainer.appendChild(list);
    }

    select.addEventListener("change", (e) => {
      renderFacilities(e.target.value);
    });

    clearBtn.addEventListener("click", () => {
      select.value = "";
      renderFacilities("");
    });

    // Initialize with placeholder
    showPlaceholder();

    container.innerHTML = "";
    container.appendChild(wrapper);
  }

  window.WCA_initPrisonMap = initPrisonMap;
})();
