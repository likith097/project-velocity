const FINAL_WATERFRONT_TRANSFORMS = [{"id":"dock-north","transform":{"position":{"x":-210,"y":0.6,"z":-34},"rotation":{"x":0,"y":0,"z":0},"scale":{"x":1,"y":1,"z":1},"visible":true}},{"id":"dock-south","transform":{"position":{"x":210,"y":0.6,"z":34},"rotation":{"x":0,"y":0,"z":0},"scale":{"x":1,"y":1,"z":1},"visible":true}},{"id":"dock-east","transform":{"position":{"x":34,"y":0.6,"z":-215},"rotation":{"x":0,"y":0,"z":0},"scale":{"x":1,"y":1,"z":1},"visible":true}},{"id":"dock-west","transform":{"position":{"x":-34,"y":0.6,"z":215},"rotation":{"x":0,"y":0,"z":0},"scale":{"x":1,"y":1,"z":1},"visible":true}},{"id":"speedboat-01","transform":{"position":{"x":-252.5,"y":0.3,"z":0},"rotation":{"x":0,"y":1.5707963267948966,"z":0},"scale":{"x":1,"y":1,"z":1},"visible":true}},{"id":"speedboat-02","transform":{"position":{"x":215,"y":0.3,"z":0},"rotation":{"x":0,"y":1.5707963267948966,"z":0},"scale":{"x":1,"y":1,"z":1},"visible":true}},{"id":"speedboat-03","transform":{"position":{"x":-65,"y":0.3,"z":0},"rotation":{"x":0,"y":1.5707963267948966,"z":0},"scale":{"x":1,"y":1,"z":1},"visible":true}},{"id":"speedboat-04","transform":{"position":{"x":65,"y":0.3,"z":0},"rotation":{"x":0,"y":0,"z":0},"scale":{"x":1,"y":1,"z":1},"visible":true}},{"id":"sailboat-01","transform":{"position":{"x":0,"y":0.3,"z":-210},"rotation":{"x":0,"y":0,"z":0},"scale":{"x":1,"y":1,"z":1},"visible":true}},{"id":"sailboat-02","transform":{"position":{"x":0,"y":0.3,"z":210},"rotation":{"x":0,"y":0,"z":0},"scale":{"x":1,"y":1,"z":1},"visible":true}},{"id":"houseboat-01","transform":{"position":{"x":-395,"y":0.3,"z":0},"rotation":{"x":0,"y":0,"z":0},"scale":{"x":1,"y":1,"z":1},"visible":true}},{"id":"houseboat-02","transform":{"position":{"x":395,"y":0.3,"z":0},"rotation":{"x":0,"y":0,"z":0},"scale":{"x":1,"y":1,"z":1},"visible":true}},{"id":"fishing-boat","transform":{"position":{"x":0,"y":0.3,"z":-395},"rotation":{"x":0,"y":0,"z":0},"scale":{"x":1,"y":1,"z":1},"visible":true}},{"id":"tugboat-01","transform":{"position":{"x":0,"y":0.3,"z":395},"rotation":{"x":0,"y":0,"z":0},"scale":{"x":1,"y":1,"z":1},"visible":true}},{"id":"cargo-ship-01","transform":{"position":{"x":-490,"y":0.3,"z":0},"rotation":{"x":0,"y":1.5707963267948966,"z":0},"scale":{"x":1,"y":1,"z":1},"visible":true}},{"id":"cargo-ship-02","transform":{"position":{"x":490,"y":0.3,"z":0},"rotation":{"x":0,"y":4.71238898038469,"z":0},"scale":{"x":1,"y":1,"z":1},"visible":true}},{"id":"cargo-ship-03","transform":{"position":{"x":0,"y":0.3,"z":-490},"rotation":{"x":0,"y":0,"z":0},"scale":{"x":1,"y":1,"z":1},"visible":true}},{"id":"small-ship-01","transform":{"position":{"x":0,"y":0.3,"z":490},"rotation":{"x":0,"y":0,"z":0},"scale":{"x":1,"y":1,"z":1},"visible":true}},{"id":"buoy-01","transform":{"position":{"x":-170,"y":0.2,"z":10},"rotation":{"x":0,"y":0,"z":0},"scale":{"x":1,"y":1,"z":1},"visible":true}},{"id":"buoy-02","transform":{"position":{"x":170,"y":0.2,"z":-10},"rotation":{"x":0,"y":0,"z":0},"scale":{"x":1,"y":1,"z":1},"visible":true}},{"id":"buoy-03","transform":{"position":{"x":10,"y":0.2,"z":-365},"rotation":{"x":0,"y":0,"z":0},"scale":{"x":1,"y":1,"z":1},"visible":true}},{"id":"buoy-04","transform":{"position":{"x":-10,"y":0.2,"z":365},"rotation":{"x":0,"y":0,"z":0},"scale":{"x":1,"y":1,"z":1},"visible":true}},{"id":"cargo-stack-01","transform":{"position":{"x":-210,"y":0.7,"z":-60},"rotation":{"x":0,"y":0,"z":0},"scale":{"x":1,"y":1,"z":1},"visible":true}},{"id":"cargo-stack-02","transform":{"position":{"x":-185,"y":0.7,"z":-60},"rotation":{"x":0,"y":0,"z":0},"scale":{"x":1,"y":1,"z":1},"visible":true}},{"id":"cargo-stack-03","transform":{"position":{"x":185,"y":0.7,"z":60},"rotation":{"x":0,"y":0,"z":0},"scale":{"x":1,"y":1,"z":1},"visible":true}},{"id":"cargo-stack-04","transform":{"position":{"x":210,"y":0.7,"z":60},"rotation":{"x":0,"y":0,"z":0},"scale":{"x":1,"y":1,"z":1},"visible":true}},{"id":"cargo-stack-05","transform":{"position":{"x":230,"y":0.7,"z":60},"rotation":{"x":0,"y":0,"z":0},"scale":{"x":1,"y":1,"z":1},"visible":true}},{"id":"cargo-stack-06","transform":{"position":{"x":-230,"y":0.7,"z":-60},"rotation":{"x":0,"y":0,"z":0},"scale":{"x":1,"y":1,"z":1},"visible":true}},{"id":"water-tower","transform":{"position":{"x":-255,"y":0.8,"z":-85},"rotation":{"x":0,"y":0,"z":0},"scale":{"x":1,"y":1,"z":1},"visible":true}}];
/* PROJECT VELOCITY E5.5D12 — WATERFRONT WORLD PACK */

import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

const ROOT = "./assets/velocity-world-pack/";

const PLANS = [
  // DOCKS — canal banks
  ["dock-north", "docks", "Dock Wide by Quaternius - XndOrGa7rN.glb", -210, 0.6, -34, 32, 14],
  ["dock-south", "docks", "Dock Wide by Quaternius - XndOrGa7rN.glb", 210, 0.6, 34, 32, 14],
  ["dock-east", "docks", "ramp-wide.glb", 34, 0.6, -215, 24, 12],
  ["dock-west", "docks", "ramp.glb", -34, 0.6, 215, 20, 12],

  // BOATS — canal interiors
  ["speedboat-01", "boats", "boat-speed-a.glb", -215, 0.3, 0, 22, 9],
  ["speedboat-02", "boats", "boat-speed-b.glb", 215, 0.3, 0, 22, 9],
  ["speedboat-03", "boats", "boat-speed-c.glb", -65, 0.3, 0, 20, 8],
  ["speedboat-04", "boats", "boat-speed-d.glb", 65, 0.3, 0, 20, 8],
  ["sailboat-01", "boats", "boat-sail-a.glb", 0, 0.3, -210, 27, 10],
  ["sailboat-02", "boats", "boat-sail-b.glb", 0, 0.3, 210, 27, 10],
  ["houseboat-01", "boats", "boat-house-a.glb", -395, 0.3, 0, 30, 12],
  ["houseboat-02", "boats", "boat-house-b.glb", 395, 0.3, 0, 30, 12],
  ["fishing-boat", "boats", "boat-fishing-small.glb", 0, 0.3, -395, 20, 9],
  ["tugboat-01", "boats", "boat-tug-a.glb", 0, 0.3, 395, 27, 11],

  // SHIPS — larger vessels, fitted to available canal width
  ["cargo-ship-01", "ships", "ship-cargo-a.glb", -490, 0.3, 0, 58, 17],
  ["cargo-ship-02", "ships", "ship-cargo-b.glb", 490, 0.3, 0, 58, 17],
  ["cargo-ship-03", "ships", "ship-cargo-c.glb", 0, 0.3, -490, 58, 17],
  ["small-ship-01", "ships", "ship-small.glb", 0, 0.3, 490, 38, 15],

  // WATERFRONT DETAILS — placed near banks
  ["buoy-01", "waterfront", "buoy.glb", -170, 0.2, 10, 3, 3],
  ["buoy-02", "waterfront", "buoy-flag.glb", 170, 0.2, -10, 3, 3],
  ["buoy-03", "waterfront", "buoy.glb", 10, 0.2, -365, 3, 3],
  ["buoy-04", "waterfront", "buoy-flag.glb", -10, 0.2, 365, 3, 3],

  // CARGO — landside staging areas
  ["cargo-stack-01", "waterfront", "cargo-container-a.glb", -210, 0.7, -60, 18, 8],
  ["cargo-stack-02", "waterfront", "cargo-container-b.glb", -185, 0.7, -60, 18, 8],
  ["cargo-stack-03", "waterfront", "cargo-container-c.glb", 185, 0.7, 60, 18, 8],
  ["cargo-stack-04", "waterfront", "shipping-container-a.glb", 210, 0.7, 60, 18, 8],
  ["cargo-stack-05", "waterfront", "shipping-container-b.glb", 230, 0.7, 60, 18, 8],
  ["cargo-stack-06", "waterfront", "shipping-container-c.glb", -230, 0.7, -60, 18, 8],

  // ENVIRONMENT — industrial accents
  ["water-tower", "environment", "water-tower.glb", -255, 0.8, -85, 16, 16],
  ["solar-panel", "environment", "solar-panel.glb", 255, 0.8, 85, 12, 12]
];

const loader = new GLTFLoader();
const cache = new Map();

function loadModel(category, filename) {
  const path = ROOT + category + "/" + encodeURIComponent(filename);

  if (!cache.has(path)) {
    cache.set(path, loader.loadAsync(path));
  }

  return cache.get(path);
}

function transformOf(object) {
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

function applyTransform(object, transform) {
  if (!object || !transform) return;

  for (const axis of ["x", "y", "z"]) {
    const p = transform.position?.[axis];
    const r = transform.rotation?.[axis];
    const s = transform.scale?.[axis];

    if (Number.isFinite(p)) object.position[axis] = p;
    if (Number.isFinite(r)) object.rotation[axis] = r;
    if (Number.isFinite(s) && s > 0) object.scale[axis] = s;
  }

  if (typeof transform.visible === "boolean") {
    object.visible = transform.visible;
  }

  object.updateMatrixWorld(true);
}

async function installWorld(scene) {
  if (window.velocityWaterfrontWorld) return;

  const group = new THREE.Group();
  group.name = "Velocity Waterfront World";
  scene.add(group);

  const status = {
    status: "loading",
    expected: PLANS.length,
    loaded: 0,
    failed: 0,
    objects: [],
    group
  };

  window.velocityWaterfrontWorld = status;

  for (const plan of PLANS) {
    const [id, category, filename, x, y, z, maxLength, maxWidth] = plan;

    try {
      const gltf = await loadModel(category, filename);
      const model = gltf.scene.clone(true);

      const box = new THREE.Box3().setFromObject(model);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());

      if (
        !Number.isFinite(size.x) ||
        !Number.isFinite(size.y) ||
        !Number.isFinite(size.z) ||
        Math.max(size.x, size.y, size.z) <= 0
      ) {
        throw new Error("Invalid model dimensions");
      }

      const holder = new THREE.Group();
      holder.name = id;

      // Fit the model to its initial placement envelope.
      const horizontalLength = Math.max(size.x, size.z);
      const horizontalWidth = Math.min(size.x, size.z);

      const scale = Math.min(
        maxLength / Math.max(horizontalLength, 0.001),
        maxWidth / Math.max(horizontalWidth, 0.001),
        10
      );

      // Center horizontally and put the model's bottom at holder Y.
      model.position.set(
        -center.x,
        -box.min.y,
        -center.z
      );

      // A separate pivot lets the editor adjust the whole object.
      const pivot = new THREE.Group();
      pivot.scale.setScalar(scale);
      pivot.add(model);
      holder.add(pivot);

      holder.position.set(x, y, z);

      group.add(holder);
      status.objects.push(holder);
      status.loaded++;

    } catch (error) {
      status.failed++;
      console.warn("[Velocity Waterfront] Failed:", filename, error);
    }
  }

  status.status = status.failed === 0 ? "ready" : "partial";

  console.log(
    `[Velocity Waterfront] ${status.loaded}/${status.expected} models loaded`
  );

  // Final 29 waterfront placements baked from approved export.
  const finalTransforms = new Map(FINAL_WATERFRONT_TRANSFORMS.map(entry => [entry.id, entry.transform]));
  let applied = 0;
  for (const object of status.objects) {
    const saved = finalTransforms.get(object.name);
    if (saved) { applyTransform(object, saved); applied++; }
  }
  status.finalTransformsApplied = applied;
  status.editorDisabled = true;
  console.log(`[Velocity Waterfront] Saved transforms: ${applied}/29`);
}

function createEditor(status) {
  const objects = status.objects;

  if (!objects.length) return;
  if (document.getElementById("velocity-waterfront-editor")) return;

  let selected = objects[0];

  const originals = new Map(
    objects.map(object => [object.name, transformOf(object)])
  );

  const panel = document.createElement("div");
  panel.id = "velocity-waterfront-editor";

  Object.assign(panel.style, {
    position: "fixed",
    right: "16px",
    top: "80px",
    width: "310px",
    maxHeight: "calc(100vh - 100px)",
    overflowY: "auto",
    padding: "16px",
    background: "rgba(8, 20, 33, 0.97)",
    color: "#eefaff",
    border: "1px solid #35c9e8",
    borderRadius: "12px",
    zIndex: "999999",
    font: "13px Arial, sans-serif",
    boxShadow: "0 12px 32px rgba(0,0,0,.55)"
  });

  const heading = document.createElement("h3");
  heading.textContent = "VELOCITY — WATERFRONT";
  heading.style.cssText =
    "margin:0 0 12px;color:#65ddf5;font-size:15px";
  panel.appendChild(heading);

  const info = document.createElement("div");
  info.textContent = `${status.loaded} loaded | ${status.failed} failed`;
  info.style.marginBottom = "10px";
  panel.appendChild(info);

  const selector = document.createElement("select");
  selector.style.cssText =
    "width:100%;padding:9px;margin-bottom:12px;background:#173149;color:white;border:1px solid #487c99;border-radius:6px";

  objects.forEach(object => {
    const option = document.createElement("option");
    option.value = object.name;
    option.textContent = object.name;
    selector.appendChild(option);
  });

  panel.appendChild(selector);

  const fields = {};

  function addField(labelText, key, step) {
    const row = document.createElement("div");
    row.style.cssText =
      "display:flex;justify-content:space-between;align-items:center;gap:8px;margin:7px 0";

    const label = document.createElement("label");
    label.textContent = labelText;

    const input = document.createElement("input");
    input.type = "number";
    input.step = String(step);
    input.style.cssText =
      "width:110px;padding:6px;background:#173149;color:white;border:1px solid #487c99;border-radius:5px";

    row.append(label, input);
    panel.appendChild(row);
    fields[key] = input;

    input.addEventListener("input", () => {
      if (input.value.trim() === "") return;

      const value = Number(input.value);
      if (!Number.isFinite(value)) return;

      if (key === "x") selected.position.x = value;
      if (key === "y") selected.position.y = value;
      if (key === "z") selected.position.z = value;

      if (key === "rotation") {
        selected.rotation.y = value * Math.PI / 180;
      }

      if (key === "scaleX" && value > 0) selected.scale.x = value;
      if (key === "scaleY" && value > 0) selected.scale.y = value;
      if (key === "scaleZ" && value > 0) selected.scale.z = value;

      selected.updateMatrixWorld(true);
    });
  }

  addField("Position X", "x", 0.5);
  addField("Height Y", "y", 0.1);
  addField("Position Z", "z", 0.5);
  addField("Rotation degrees", "rotation", 1);
  addField("Scale X", "scaleX", 0.05);
  addField("Scale Y", "scaleY", 0.05);
  addField("Scale Z", "scaleZ", 0.05);

  const visibilityLabel = document.createElement("label");
  visibilityLabel.style.cssText =
    "display:flex;gap:8px;align-items:center;margin:12px 0";

  const visibility = document.createElement("input");
  visibility.type = "checkbox";

  visibilityLabel.append(
    visibility,
    document.createTextNode("Object visible")
  );

  panel.appendChild(visibilityLabel);

  visibility.addEventListener("change", () => {
    selected.visible = visibility.checked;
  });

  function refresh() {
    fields.x.value = selected.position.x.toFixed(3);
    fields.y.value = selected.position.y.toFixed(3);
    fields.z.value = selected.position.z.toFixed(3);
    fields.rotation.value =
      (selected.rotation.y * 180 / Math.PI).toFixed(2);
    fields.scaleX.value = selected.scale.x.toFixed(4);
    fields.scaleY.value = selected.scale.y.toFixed(4);
    fields.scaleZ.value = selected.scale.z.toFixed(4);
    visibility.checked = selected.visible;
    selector.value = selected.name;
  }

  selector.addEventListener("change", () => {
    selected = objects.find(o => o.name === selector.value) || selected;
    refresh();
  });

  function addButton(text, callback, color = "#087da1") {
    const button = document.createElement("button");
    button.textContent = text;
    button.style.cssText =
      `display:block;width:100%;padding:10px;margin-top:8px;background:${color};color:white;border:0;border-radius:6px;cursor:pointer;font-weight:bold`;

    button.addEventListener("click", callback);
    panel.appendChild(button);
  }

  function exportData() {
    return {
      project: "Project Velocity",
      version: "waterfront-master-v1",
      objectCount: objects.length,
      objects: objects.map(object => ({
        id: object.name,
        transform: transformOf(object)
      }))
    };
  }

  addButton("RESET SELECTED", () => {
    applyTransform(selected, originals.get(selected.name));
    refresh();
  }, "#625272");

  addButton("EXPORT WATERFRONT JSON", () => {
    const blob = new Blob(
      [JSON.stringify(exportData(), null, 2)],
      { type: "application/json" }
    );

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "project-velocity-final-waterfront.json";

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

  addButton("IMPORT WATERFRONT JSON", () => {
    fileInput.click();
  }, "#345e83");

  fileInput.addEventListener("change", async () => {
    const file = fileInput.files?.[0];
    if (!file) return;

    try {
      const data = JSON.parse(await file.text());

      if (
        data.version !== "waterfront-master-v1" ||
        !Array.isArray(data.objects)
      ) {
        throw new Error("Invalid waterfront JSON");
      }

      let count = 0;

      for (const entry of data.objects) {
        const object = objects.find(o => o.name === entry.id);

        if (object && entry.transform) {
          applyTransform(object, entry.transform);
          count++;
        }
      }

      refresh();
      alert(`Restored ${count} waterfront objects.`);
    } catch (error) {
      alert("Import failed: " + error.message);
    }

    fileInput.value = "";
  });

  const toggle = document.createElement("button");
  toggle.textContent = "WATERFRONT EDITOR";
  toggle.style.cssText =
    "position:fixed;right:16px;top:80px;padding:12px;background:#087da1;color:white;border:0;border-radius:8px;z-index:999999;display:none;cursor:pointer";

  addButton("HIDE EDITOR", () => {
    panel.style.display = "none";
    toggle.style.display = "block";
  }, "#43566a");

  toggle.addEventListener("click", () => {
    panel.style.display = "block";
    toggle.style.display = "none";
  });

  document.body.append(panel, toggle);

  refresh();

  window.velocityWaterfrontEditor = {
    status: "ready",
    objects,
    exportData,
    panel
  };
}

function waitForScene() {
  // Reuse the existing bridge system's scene, avoiding changes
  // to the protected city initialization code.
  const bridgeStatus = window.velocityGLBBridges;

  if (bridgeStatus?.group?.parent) {
    installWorld(bridgeStatus.group.parent).catch(error => {
      console.error("[Velocity Waterfront] Initialization failed:", error);
    });
    return;
  }

  requestAnimationFrame(waitForScene);
}

waitForScene();