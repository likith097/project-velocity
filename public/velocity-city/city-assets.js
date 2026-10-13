import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

const loader = new GLTFLoader();

const entries = [
  {
    name: "Sci-Fi Bridge",
    url: "./assets/models/bridges/scifi-bridge.glb",
    position: [-140, 0, -760],
    width: 85
  },
  {
    name: "Skyscraper",
    url: "./assets/models/buildings/skyscraper.glb",
    position: [-55, 0, -760],
    width: 25
  },
  {
    name: "Large Building",
    url: "./assets/models/buildings/large-building.glb",
    position: [5, 0, -760],
    width: 28
  },
  {
    name: "Low Building",
    url: "./assets/models/buildings/low-building.glb",
    position: [65, 0, -760],
    width: 25
  },
  {
    name: "Boat",
    url: "./assets/models/environment/boat.glb",
    position: [125, 0, -760],
    width: 15
  },
  {
    name: "Crystals",
    url: "./assets/models/landmarks/crystals.glb",
    position: [180, 0, -760],
    width: 12
  }
];

export async function createCityAssetPreview(scene) {
  const group = new THREE.Group();
  group.name = "E5.5D10 Asset Preview";
  scene.add(group);

  const results = [];

  for (const entry of entries) {
    try {
      const gltf = await loader.loadAsync(entry.url);
      const model = gltf.scene;

      model.name = entry.name;
      model.updateMatrixWorld(true);

      const bounds = new THREE.Box3().setFromObject(model);
      const size = bounds.getSize(new THREE.Vector3());

      if (
        !Number.isFinite(size.x) ||
        !Number.isFinite(size.y) ||
        !Number.isFinite(size.z) ||
        Math.max(size.x, size.y, size.z) <= 0
      ) {
        throw new Error("Invalid model dimensions");
      }

      const horizontalSize = Math.max(size.x, size.z);
      const scale = entry.width / horizontalSize;

      model.scale.multiplyScalar(scale);
      model.updateMatrixWorld(true);

      const fittedBounds = new THREE.Box3().setFromObject(model);
      const center = fittedBounds.getCenter(new THREE.Vector3());

      model.position.x += entry.position[0] - center.x;
      model.position.y += entry.position[1] - fittedBounds.min.y;
      model.position.z += entry.position[2] - center.z;

      model.traverse(object => {
        if (object.isMesh) {
          object.castShadow = true;
          object.receiveShadow = true;
        }
      });

      group.add(model);

      results.push({
        name: entry.name,
        loaded: true,
        originalDimensions: size.toArray()
      });

      console.log("[Velocity Assets] Loaded:", entry.name, size);
    } catch (error) {
      console.error("[Velocity Assets] Failed:", entry.name, error);
      results.push({ name: entry.name, loaded: false });
    }
  }

  window.velocityAssetPreview = {
    group,
    results,
    show() {
      group.visible = true;
    },
    hide() {
      group.visible = false;
    }
  };

  console.table(results);
  return group;
}