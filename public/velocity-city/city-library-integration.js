import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

const loader = new GLTFLoader();
const base = "./assets/library-glb/Models/GLB%20format/";

const assets = [
  "boat-speed-a.glb",
  "boat-speed-b.glb",
  "boat-speed-c.glb",
  "boat-fishing-small.glb",
  "boat-row-small.glb",
  "boat-sail-a.glb",
  "solar-panel-landscape-group.glb"
];

const silverMaterial = new THREE.MeshStandardMaterial({
  color: 0xd9e2e8,
  metalness: 0.9,
  roughness: 0.14,
  envMapIntensity: 1.8
});

function fitModel(source, width) {
  const model = source.clone(true);
  model.updateMatrixWorld(true);

  const bounds = new THREE.Box3().setFromObject(model);
  const size = bounds.getSize(new THREE.Vector3());

  const horizontal = Math.max(size.x, size.z);

  if (!Number.isFinite(horizontal) || horizontal <= 0) {
    throw new Error("Invalid model dimensions");
  }

  model.scale.multiplyScalar(width / horizontal);
  model.updateMatrixWorld(true);

  const fitted = new THREE.Box3().setFromObject(model);
  const center = fitted.getCenter(new THREE.Vector3());

  model.position.sub(center);
  model.position.y += fitted.getSize(new THREE.Vector3()).y / 2;

  return model;
}

function addModel(group, source, name, x, y, z, width, rotation = 0) {
  const model = fitModel(source, width);

  model.name = name;
  model.rotation.y = rotation;
  model.position.add(new THREE.Vector3(x, y, z));

  model.traverse(child => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });

  group.add(model);
  return model;
}

function silverFinish(model) {
  model.traverse(child => {
    if (!child.isMesh) return;
    child.material = silverMaterial;
  });
}

async function waitForArchitecture() {
  for (let attempt = 0; attempt < 180; attempt++) {
    const architecture = window.velocityArchitecture;

    if (
      architecture &&
      Array.isArray(architecture.replacements) &&
      architecture.replacements.length === 240
    ) {
      return architecture;
    }

    await new Promise(resolve => setTimeout(resolve, 100));
  }

  throw new Error("Phase 5C architecture not ready");
}

export async function createCityLibraryIntegration(scene, cityBuildings) {
  const group = new THREE.Group();
  group.name = "Velocity Silver Rooftops and Waterfront";
  scene.add(group);

  const loaded = new Map();
  const results = [];

  for (const name of assets) {
    try {
      const gltf = await loader.loadAsync(
        base + encodeURIComponent(name)
      );

      loaded.set(name, gltf.scene);
      results.push({ name, loaded: true });
    } catch (error) {
      console.warn("[Velocity Assets] Failed:", name, error);
      results.push({ name, loaded: false });
    }
  }

  const boats = [
    ["boat-speed-a.glb", 0, -205, 0],
    ["boat-speed-b.glb", 0, 205, Math.PI],
    ["boat-speed-c.glb", 0, -405, 0],
    ["boat-fishing-small.glb", 0, 405, Math.PI],
    ["boat-row-small.glb", -205, 0, Math.PI / 2],
    ["boat-sail-a.glb", 205, 0, -Math.PI / 2],
    ["boat-speed-a.glb", -405, 0, Math.PI / 2],
    ["boat-speed-b.glb", 405, 0, -Math.PI / 2]
  ];

  let boatCount = 0;

  for (const [type, x, z, rotation] of boats) {
    const source = loaded.get(type);
    if (!source) continue;

    addModel(
      group,
      source,
      `Canal ${type}`,
      x, 0.69, z,
      type.includes("sail") ? 11 : 8,
      rotation
    );

    boatCount++;
  }

  const architecture = await waitForArchitecture();
  const solar = loaded.get("solar-panel-landscape-group.glb");

  let roofCount = 0;

  if (solar) {
    // Use the real GLB architecture, not the old procedural roofs.
    const replacements = architecture.replacements;

    for (let i = 0; i < replacements.length; i += 10) {
      const building = replacements[i].model;
      building.updateMatrixWorld(true);

      const bounds = new THREE.Box3().setFromObject(building);
      const size = bounds.getSize(new THREE.Vector3());
      const center = bounds.getCenter(new THREE.Vector3());

      if (
        size.x < 15 ||
        size.z < 15 ||
        size.y < 5
      ) continue;

      const panel = addModel(
        group,
        solar,
        `Silver Solar ${roofCount + 1}`,
        center.x,
        bounds.max.y + 0.2,
        center.z,
        Math.min(size.x, size.z) * 0.32,
        roofCount % 2 ? Math.PI / 2 : 0
      );

      silverFinish(panel);
      roofCount++;

      if (roofCount >= 24) break;
    }
  }

  window.velocityLibrary = {
    group,
    results,
    show() { group.visible = true; },
    hide() { group.visible = false; }
  };

  console.log("[Velocity Silver Solar]", {
    boats: boatCount,
    silverRooftops: roofCount,
    architecture: architecture.replacements.length
  });

  return group;
}