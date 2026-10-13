/* VELOCITY_MASTER_BUILDING_EDITOR_V1 */
(function () {
  "use strict";

  const existing = document.getElementById("velocity-lk-controls");
  if (existing) existing.remove();

  const style = document.createElement("style");
  style.textContent = `
    #velocity-master-editor {
      position: fixed;
      top: 70px;
      right: 16px;
      width: 315px;
      max-height: calc(100vh - 90px);
      overflow-y: auto;
      background: rgba(6,13,26,.96);
      border: 1px solid #40caff;
      border-radius: 12px;
      padding: 16px;
      color: #e8f7ff;
      z-index: 999999;
      font: 12px Arial,sans-serif;
      box-shadow: 0 12px 36px #0009;
    }
    #velocity-master-editor h3 {
      color: #52d4ff;
      margin: 0 0 12px;
      font-size: 16px;
    }
    #velocity-master-editor label {
      display: block;
      margin: 10px 0 4px;
    }
    #velocity-master-editor select,
    #velocity-master-editor button {
      width: 100%;
      padding: 9px;
      color: white;
      background: #14273e;
      border: 1px solid #45637b;
      border-radius: 6px;
      box-sizing: border-box;
    }
    #velocity-master-editor button {
      cursor: pointer;
      margin-top: 8px;
    }
    #velocity-master-editor button:hover {
      background: #1c4a68;
    }
    #velocity-master-editor input[type=range] {
      width: 100%;
      accent-color: #52d4ff;
    }
    #velocity-master-editor .value {
      float: right;
      color: #52d4ff;
    }
    #velocity-master-editor #velocity-editor-status {
      color: #9ebaca;
      margin-top: 12px;
      line-height: 1.5;
    }
    #velocity-master-editor .editor-actions {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 6px;
    }
    #velocity-master-editor .editor-actions button {
      font-size: 11px;
    }
  `;
  document.head.appendChild(style);

  const panel = document.createElement("div");
  panel.id = "velocity-master-editor";
  panel.innerHTML = `
    <h3>VELOCITY BUILDING EDITOR</h3>
    <label>Building category</label>
    <select id="vbe-category">
      <option value="all">All buildings</option>
      <option value="landmark">LK Tower + Crystals</option>
      <option value="district">District buildings</option>
    </select>
    <label>Select building</label>
    <select id="vbe-building"></select>
    <div id="vbe-sliders"></div>
    <div class="editor-actions">
      <button id="vbe-reset">Reset selected</button>
      <button id="vbe-reset-all">Reset all</button>
      <button id="vbe-copy">Copy JSON</button>
      <button id="vbe-download">Download JSON</button>
    </div>
    <div id="velocity-editor-status">Waiting for city...</div>
  `;
  document.body.appendChild(panel);

  const $ = id => document.getElementById(id);

  const categorySelect = $("vbe-category");
  const buildingSelect = $("vbe-building");
  const sliderContainer = $("vbe-sliders");
  const status = $("velocity-editor-status");

  const fields = [
    ["scale", "Overall Scale", .2, 5, .05, 1],
    ["height", "Height Multiplier", .2, 5, .05, 1],
    ["x", "Position X Offset", -200, 200, 1, 0],
    ["y", "Position Y Offset", -100, 200, 1, 0],
    ["z", "Position Z Offset", -200, 200, 1, 0],
    ["rotation", "Rotation Degrees", -180, 180, 1, 0]
  ];

  const objects = new Map();
  const controls = new Map();
  const sliders = new Map();

  let selectedId = null;

  function defaultControls() {
    return {
      scale: 1,
      height: 1,
      x: 0,
      y: 0,
      z: 0,
      rotation: 0
    };
  }

  function register(id, name, category, object) {
    if (!object || !object.isObject3D || objects.has(id)) return;

    objects.set(id, {
      id,
      name,
      category,
      object,
      original: {
        position: object.position.clone(),
        scale: object.scale.clone(),
        rotation: object.rotation.y
      }
    });

    controls.set(id, defaultControls());
  }

  function discover() {
    const lk =
      window.velocityLandmarkBuildings?.lkTower ||
      window.velocityLKTower?.model;

    register("lk-tower", "LK Tower", "landmark", lk);

    const crystals =
      window.velocityLandmarkBuildings?.crystalBuildings || [];

    for (const entry of crystals) {
      register(
        "crystal-" + entry.name.toLowerCase(),
        entry.name + " Crystal Building",
        "landmark",
        entry.building
      );
    }

    const replacements =
      window.velocityArchitecture?.replacements || [];

    replacements.forEach((entry, index) => {
      const object =
        entry?.model ||
        entry?.object ||
        entry?.group ||
        entry?.mesh ||
        (entry?.isObject3D ? entry : null);

      register(
        "district-" + String(index + 1).padStart(3, "0"),
        "District Building " + String(index + 1).padStart(3, "0"),
        "district",
        object
      );
    });
  }

  function apply(id) {
    const entry = objects.get(id);
    const state = controls.get(id);

    if (!entry || !state) return;

    const obj = entry.object;
    const original = entry.original;

    obj.scale.set(
      original.scale.x * state.scale,
      original.scale.y * state.scale * state.height,
      original.scale.z * state.scale
    );

    obj.position.set(
      original.position.x + state.x,
      original.position.y + state.y,
      original.position.z + state.z
    );

    obj.rotation.y =
      original.rotation + state.rotation * Math.PI / 180;

    obj.updateMatrixWorld(true);
  }

  function refreshSelect() {
    const filter = categorySelect.value;
    const previous = selectedId;

    buildingSelect.innerHTML = "";

    for (const entry of objects.values()) {
      if (filter !== "all" && entry.category !== filter) continue;

      const option = document.createElement("option");
      option.value = entry.id;
      option.textContent = entry.name;
      buildingSelect.appendChild(option);
    }

    if (
      previous &&
      [...buildingSelect.options].some(o => o.value === previous)
    ) {
      buildingSelect.value = previous;
    }

    selectedId = buildingSelect.value || null;
    updateSliders();
    updateStatus();
  }

  function updateSliders() {
    const state = controls.get(selectedId);
    if (!state) return;

    for (const [key] of fields) {
      sliders.get(key).value = state[key];
      $("vbe-value-" + key).textContent = state[key];
    }
  }

  function updateStatus() {
    const districtCount =
      [...objects.values()].filter(o => o.category === "district").length;

    const landmarkCount =
      [...objects.values()].filter(o => o.category === "landmark").length;

    status.textContent =
      "Connected: " + objects.size +
      " buildings | Landmarks: " + landmarkCount +
      " | Districts: " + districtCount +
      " | Selected: " + (selectedId || "none");
  }

  for (const [key, label, min, max, step, initial] of fields) {
    const wrapper = document.createElement("label");

    const title = document.createElement("span");
    title.textContent = label;

    const value = document.createElement("span");
    value.id = "vbe-value-" + key;
    value.className = "value";
    value.textContent = initial;

    const input = document.createElement("input");
    input.type = "range";
    input.min = min;
    input.max = max;
    input.step = step;
    input.value = initial;

    input.addEventListener("input", () => {
      if (!selectedId) return;

      const state = controls.get(selectedId);
      state[key] = Number(input.value);
      value.textContent = input.value;
      apply(selectedId);
    });

    wrapper.append(title, value, input);
    sliderContainer.appendChild(wrapper);
    sliders.set(key, input);
  }

  categorySelect.addEventListener("change", refreshSelect);

  buildingSelect.addEventListener("change", () => {
    selectedId = buildingSelect.value;
    updateSliders();
    updateStatus();
  });

  $("vbe-reset").addEventListener("click", () => {
    if (!selectedId) return;
    controls.set(selectedId, defaultControls());
    apply(selectedId);
    updateSliders();
  });

  $("vbe-reset-all").addEventListener("click", () => {
    if (!confirm("Reset every building to its original transform?")) return;

    for (const id of objects.keys()) {
      controls.set(id, defaultControls());
      apply(id);
    }

    updateSliders();
  });

  function exportJSON() {
    const buildings = [];

    for (const entry of objects.values()) {
      const obj = entry.object;

      buildings.push({
        id: entry.id,
        name: entry.name,
        category: entry.category,
        controls: { ...controls.get(entry.id) },
        transform: {
          position: {
            x: obj.position.x,
            y: obj.position.y,
            z: obj.position.z
          },
          scale: {
            x: obj.scale.x,
            y: obj.scale.y,
            z: obj.scale.z
          },
          rotationYRadians: obj.rotation.y
        }
      });
    }

    return JSON.stringify({
      project: "Project Velocity",
      version: "building-editor-v1",
      buildingCount: buildings.length,
      buildings
    }, null, 2);
  }

  $("vbe-copy").addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(exportJSON());
      status.textContent = "All building coordinates copied.";
    } catch {
      status.textContent = "Clipboard failed. Use Download JSON.";
    }
  });

  $("vbe-download").addEventListener("click", () => {
    const blob = new Blob(
      [exportJSON()],
      { type: "application/json" }
    );

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "velocity-all-buildings.json";
    link.click();

    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });

  function poll() {
    const before = objects.size;

    discover();

    if (objects.size !== before) {
      refreshSelect();
    }

    if (objects.size < 246) {
      setTimeout(poll, 1000);
    }
  }

  poll();

  window.velocityBuildingEditor = {
    objects,
    controls,
    apply,
    exportJSON,
    refresh: () => {
      discover();
      refreshSelect();
    }
  };

})();