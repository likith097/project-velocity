import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

// VELOCITY_STREET_DETAILS_5D2
const assetList = [{"name":"Car by Quaternius - unqqkULtRU.glb","path":"./assets/library-glb/Car%20by%20Quaternius%20-%20unqqkULtRU.glb"},{"name":"Police Car by Quaternius - BwwnUrWGmV.glb","path":"./assets/library-glb/Police%20Car%20by%20Quaternius%20-%20BwwnUrWGmV.glb"},{"name":"Traffic light by Poly by Google - 57rxXzowK8w.glb","path":"./assets/library-glb/Traffic%20light%20by%20Poly%20by%20Google%20-%2057rxXzowK8w.glb"},{"name":"buoy.glb","path":"./assets/library-glb/Models/GLB%20format/buoy.glb"},{"name":"buoy-flag.glb","path":"./assets/library-glb/Models/GLB%20format/buoy-flag.glb"},{"name":"cargo-container-a.glb","path":"./assets/library-glb/Models/GLB%20format/cargo-container-a.glb"},{"name":"cargo-container-b.glb","path":"./assets/library-glb/Models/GLB%20format/cargo-container-b.glb"},{"name":"cargo-container-c.glb","path":"./assets/library-glb/Models/GLB%20format/cargo-container-c.glb"}];
const loader = new GLTFLoader();

function fit(source, targetSize) {
  const model = source.clone(true);
  model.updateMatrixWorld(true);

  const original = new THREE.Box3().setFromObject(model);
  const size = original.getSize(new THREE.Vector3());
  const largest = Math.max(size.x, size.z);

  if (!Number.isFinite(largest) || largest <= 0) return null;

  model.scale.multiplyScalar(targetSize / largest);
  model.updateMatrixWorld(true);

  const bounds = new THREE.Box3().setFromObject(model);
  const center = bounds.getCenter(new THREE.Vector3());

  model.position.sub(center);
  model.position.y += bounds.getSize(new THREE.Vector3()).y / 2;

  model.traverse(child => {
    if (!child.isMesh) return;
    child.castShadow = true;
    child.receiveShadow = true;
  });

  return model;
}

function addAsset(group, source, name, x, y, z, size, rotation = 0) {
  if (!source) return false;

  const model = fit(source, size);
  if (!model) return false;

  model.name = name;
  model.rotation.y = rotation;
  model.position.add(new THREE.Vector3(x, y, z));
  group.add(model);
  return true;
}

function makeTree(group, x, z, height = 8) {
  const tree = new THREE.Group();
  tree.name = "Velocity Street Tree";

  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.35, 0.48, height * 0.42, 6),
    new THREE.MeshStandardMaterial({
      color: 0x665341,
      roughness: 0.95
    })
  );

  trunk.position.y = height * 0.21;

  const crown = new THREE.Mesh(
    new THREE.ConeGeometry(height * 0.27, height * 0.7, 7),
    new THREE.MeshStandardMaterial({
      color: height >= 9 ? 0x3d8b68 : height >= 8 ? 0x2f805e : 0x246b50,
      roughness: 0.85
    })
  );

  crown.position.y = height * 0.68;

  tree.add(trunk, crown);
  tree.position.set(x, 0.45, z);
  group.add(tree);
}

export async function createCityStreetDetails(scene) {
  const group = new THREE.Group();
  group.name = "Velocity Phase 5D.2 Street Details";
  scene.add(group);

  const models = new Map();

  await Promise.all(assetList.map(async entry => {
    try {
      const gltf = await loader.loadAsync(entry.path);
      models.set(entry.name, gltf.scene);
    } catch (error) {
      console.warn("[Velocity Street] Asset failed:", entry.name, error);
    }
  }));

  const get = prefix =>
    models.get(assetList.find(a => a.name.startsWith(prefix))?.name);

  const car = get("Car by Quaternius");
  const police = get("Police Car by Quaternius");
  const traffic = get("Traffic light");
  const buoy = get("buoy.glb");
  const flag = get("buoy-flag");
  const containers = [
    get("cargo-container-a"),
    get("cargo-container-b"),
    get("cargo-container-c")
  ];

  const counts = {
    cars: 0,
    trafficLights: 0,
    buoys: 0,
    cargo: 0,
    trees: 0
  };

  // Parked cars along the outer east/west road corridors.
  for (let i = 0; i < 24; i++) {
    const x = i < 12 ? -475 : 475;
    const z = -525 + (i % 12) * 95;

    const source = i % 8 === 0 ? police : car;

    if (addAsset(
      group, source, `Parked Vehicle ${i + 1}`,
      x, 0.55, z, 5.2,
      i < 12 ? 0 : Math.PI
    )) counts.cars++;
  }

  // Traffic lights near outer road junctions.
  const junctions = [
    [-480, -300], [-480, -120], [-480, 120],
    [-480, 300], [480, -300], [480, -120],
    [480, 120], [480, 300],
    [-300, -480], [300, -480],
    [-300, 480], [300, 480]
  ];

  for (let i = 0; i < junctions.length; i++) {
    const [x, z] = junctions[i];

    if (addAsset(
      group, traffic, `Traffic Signal ${i + 1}`,
      x + 13, 0.45, z + 13,
      3.5, i % 4 * Math.PI / 2
    )) counts.trafficLights++;
  }

  // Floating navigation markers in both canals.
  for (let i = 0; i < 16; i++) {
    const vertical = i < 8;
    const coordinate = -525 + (i % 8) * 150;

    const x = vertical ? (i % 2 ? 16 : -16) : coordinate;
    const z = vertical ? coordinate : (i % 2 ? 16 : -16);

    if (addAsset(
      group, i % 3 === 0 ? flag : buoy,
      `Canal Marker ${i + 1}`,
      x, 0.65, z, 2.5
    )) counts.buoys++;
  }

  // Waterfront cargo installations.
  for (let i = 0; i < 12; i++) {
    const x = i < 6 ? -55 : 55;
    const z = -505 + (i % 6) * 200;

    if (addAsset(
      group,
      containers[i % containers.length],
      `Waterfront Cargo ${i + 1}`,
      x, 0.45, z, 8,
      Math.PI / 2
    )) counts.cargo++;
  }

  // VELOCITY_TREES_REMOVED_V1
  // Trees intentionally disabled for a clean city layout.
  window.velocityStreetDetails = {
    group,
    counts,
    show() { group.visible = true; },
    hide() { group.visible = false; }
  };

  console.log("[Velocity Street Details]", counts);

  return group;
}