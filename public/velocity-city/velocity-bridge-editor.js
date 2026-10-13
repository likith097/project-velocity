/* PROJECT VELOCITY — BRIDGE MASTER EDITOR V1 */

const EDITOR_ID = "velocity-bridge-master-panel";
const MARKER = "velocity-bridge-master-v1";

function startBridgeEditor() {
  if (document.getElementById(EDITOR_ID)) return;

  const status = window.velocityGLBBridges;

  if (!status || status.status === "loading") {
    requestAnimationFrame(startBridgeEditor);
    return;
  }

  if (!status.group || !status.group.children.length) {
    console.error("[Bridge Editor] No bridge models available.");
    return;
  }

  const bridges = status.group.children.filter(
    object => object.name.startsWith("Bridge ")
  );

  if (!bridges.length) {
    console.error("[Bridge Editor] Bridge holders not found.");
    return;
  }

  const originals = new Map();

  function snapshot(object) {
    return {
      position: {
        x: object.position.x,
        y: object.position.y,
        z: object.position.z
      },
      rotation: {
        x: object.rotation.x,
        y: object.rotation.y,
        z: object.rotation.z
      },
      scale: {
        x: object.scale.x,
        y: object.scale.y,
        z: object.scale.z
      },
      visible: object.visible
    };
  }

  function apply(object, transform) {
    if (!object || !transform) return;

    const p = transform.position || {};
    const r = transform.rotation || {};
    const s = transform.scale || {};

    for (const axis of ["x", "y", "z"]) {
      if (Number.isFinite(p[axis])) {
        object.position[axis] = p[axis];
      }

      if (Number.isFinite(r[axis])) {
        object.rotation[axis] = r[axis];
      }

      if (Number.isFinite(s[axis]) && s[axis] > 0) {
        object.scale[axis] = s[axis];
      }
    }

    if (typeof transform.visible === "boolean") {
      object.visible = transform.visible;
    }

    object.updateMatrixWorld(true);
  }

  bridges.forEach(object => {
    originals.set(object.name, snapshot(object));
  });

  let selected = bridges[0];

  const panel = document.createElement("div");
  panel.id = EDITOR_ID;

  Object.assign(panel.style, {
    position: "fixed",
    top: "80px",
    right: "16px",
    width: "310px",
    maxHeight: "calc(100vh - 100px)",
    overflowY: "auto",
    padding: "16px",
    background: "rgba(10, 17, 29, 0.96)",
    color: "#edf7ff",
    border: "1px solid #48baff",
    borderRadius: "12px",
    boxShadow: "0 12px 35px rgba(0,0,0,.5)",
    zIndex: "999999",
    fontFamily: "Arial, sans-serif",
    fontSize: "13px"
  });

  const title = document.createElement("div");
  title.textContent = "PROJECT VELOCITY — BRIDGES";

  Object.assign(title.style, {
    fontWeight: "bold",
    fontSize: "15px",
    color: "#67d4ff",
    marginBottom: "12px"
  });

  panel.appendChild(title);

  const selector = document.createElement("select");

  Object.assign(selector.style, {
    width: "100%",
    padding: "9px",
    marginBottom: "12px",
    background: "#15283d",
    color: "white",
    border: "1px solid #467da5",
    borderRadius: "6px"
  });

  bridges.forEach((object, index) => {
    const option = document.createElement("option");
    option.value = object.name;
    option.textContent = `${index + 1}. ${object.name}`;
    selector.appendChild(option);
  });

  panel.appendChild(selector);

  const fields = {};

  function makeField(labelText, key, step) {
    const row = document.createElement("div");

    Object.assign(row.style, {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "8px",
      marginBottom: "8px"
    });

    const label = document.createElement("label");
    label.textContent = labelText;
    label.style.flex = "1";

    const input = document.createElement("input");
    input.type = "number";
    input.step = String(step);

    Object.assign(input.style, {
      width: "110px",
      padding: "6px",
      background: "#15283d",
      color: "#ffffff",
      border: "1px solid #42627e",
      borderRadius: "5px"
    });

    row.appendChild(label);
    row.appendChild(input);
    panel.appendChild(row);

    fields[key] = input;

    input.addEventListener("input", () => {
      const value = Number(input.value);

      if (input.value.trim() === "" || !Number.isFinite(value)) {
        return;
      }

      if (key === "x") selected.position.x = value;
      if (key === "y") selected.position.y = value;
      if (key === "z") selected.position.z = value;

      if (key === "rotation") {
        selected.rotation.y = value * Math.PI / 180;
      }

      if (key === "scaleX" && value > 0) {
        selected.scale.x = value;
      }

      if (key === "scaleY" && value > 0) {
        selected.scale.y = value;
      }

      if (key === "scaleZ" && value > 0) {
        selected.scale.z = value;
      }

      selected.updateMatrixWorld(true);
    });
  }

  makeField("Position X", "x", 0.5);
  makeField("Height Y", "y", 0.1);
  makeField("Position Z", "z", 0.5);
  makeField("Rotation (degrees)", "rotation", 1);
  makeField("Scale X", "scaleX", 0.05);
  makeField("Scale Y", "scaleY", 0.05);
  makeField("Scale Z", "scaleZ", 0.05);

  const visibleRow = document.createElement("label");

  Object.assign(visibleRow.style, {
    display: "flex",
    gap: "8px",
    alignItems: "center",
    margin: "12px 0"
  });

  const visibleInput = document.createElement("input");
  visibleInput.type = "checkbox";

  visibleRow.appendChild(visibleInput);
  visibleRow.appendChild(document.createTextNode("Bridge visible"));
  panel.appendChild(visibleRow);

  visibleInput.addEventListener("change", () => {
    selected.visible = visibleInput.checked;
  });

  function refresh() {
    fields.x.value = selected.position.x.toFixed(3);
    fields.y.value = selected.position.y.toFixed(3);
    fields.z.value = selected.position.z.toFixed(3);

    fields.rotation.value = (
      selected.rotation.y * 180 / Math.PI
    ).toFixed(2);

    fields.scaleX.value = selected.scale.x.toFixed(4);
    fields.scaleY.value = selected.scale.y.toFixed(4);
    fields.scaleZ.value = selected.scale.z.toFixed(4);

    visibleInput.checked = selected.visible;
    selector.value = selected.name;
  }

  selector.addEventListener("change", () => {
    const next = bridges.find(
      object => object.name === selector.value
    );

    if (next) {
      selected = next;
      refresh();
    }
  });

  function makeButton(text, color, callback) {
    const button = document.createElement("button");
    button.textContent = text;

    Object.assign(button.style, {
      display: "block",
      width: "100%",
      padding: "10px",
      marginTop: "8px",
      background: color,
      color: "white",
      border: "none",
      borderRadius: "6px",
      cursor: "pointer",
      fontWeight: "bold"
    });

    button.addEventListener("click", callback);
    panel.appendChild(button);

    return button;
  }

  function exportData() {
    return {
      project: "Project Velocity",
      version: "bridge-master-v1",
      bridgeCount: bridges.length,
      bridges: bridges.map((object, index) => ({
        id: object.name,
        index,
        transform: snapshot(object)
      }))
    };
  }

  makeButton("RESET SELECTED BRIDGE", "#6d536d", () => {
    apply(selected, originals.get(selected.name));
    refresh();
  });

  makeButton("EXPORT ALL 8 BRIDGES — JSON", "#087ca5", () => {
    const data = exportData();

    const blob = new Blob(
      [JSON.stringify(data, null, 2)],
      { type: "application/json" }
    );

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "project-velocity-final-bridges.json";

    document.body.appendChild(link);
    link.click();
    link.remove();

    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });

  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = ".json,application/json";
  fileInput.style.display = "none";

  panel.appendChild(fileInput);

  makeButton("IMPORT BRIDGE JSON", "#345e83", () => {
    fileInput.click();
  });

  fileInput.addEventListener("change", async () => {
    const file = fileInput.files?.[0];
    if (!file) return;

    try {
      const data = JSON.parse(await file.text());

      if (
        data.version !== "bridge-master-v1" ||
        !Array.isArray(data.bridges)
      ) {
        throw new Error("Not a Project Velocity bridge JSON file.");
      }

      let applied = 0;

      for (const entry of data.bridges) {
        const object = bridges.find(
          bridge => bridge.name === entry.id
        );

        if (object && entry.transform) {
          apply(object, entry.transform);
          applied++;
        }
      }

      refresh();
      alert(`Restored ${applied} bridge transforms.`);
    } catch (error) {
      alert("Import failed: " + error.message);
    }

    fileInput.value = "";
  });

  makeButton("HIDE / SHOW EDITOR", "#394b5e", () => {
    panel.style.display = "none";
    toggle.style.display = "block";
  });

  const toggle = document.createElement("button");
  toggle.id = "velocity-bridge-editor-toggle";
  toggle.textContent = "BRIDGE EDITOR";

  Object.assign(toggle.style, {
    position: "fixed",
    top: "80px",
    right: "16px",
    padding: "12px",
    background: "#087ca5",
    color: "white",
    border: "none",
    borderRadius: "8px",
    zIndex: "999999",
    cursor: "pointer",
    display: "none"
  });

  toggle.addEventListener("click", () => {
    panel.style.display = "block";
    toggle.style.display = "none";
  });

  document.body.appendChild(panel);
  document.body.appendChild(toggle);

  refresh();

  window.velocityBridgeEditor = {
    bridges,
    panel,
    exportData,
    select(name) {
      const object = bridges.find(b => b.name === name);
      if (object) {
        selected = object;
        refresh();
      }
    },
    status: "ready"
  };

  console.log(
    `[Velocity] Bridge Master Editor ready: ${bridges.length} bridges`
  );
}

startBridgeEditor();