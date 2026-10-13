import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

const ASSET_ROOT = "./assets/velocity-world-pack/bridges/";

const bridgePlans = [
  { axis: "x", coordinate: -300, model: "scifi-bridge.glb" },
  { axis: "x", coordinate: -120, model: "scifi-bridge.glb" },
  { axis: "x", coordinate: 120, model: "scifi-bridge.glb" },
  { axis: "x", coordinate: 300, model: "scifi-bridge.glb" },

  { axis: "z", coordinate: -300, model: "Bridge by CreativeTrio - orI7eNSB38.glb" },
  { axis: "z", coordinate: -120, model: "Small Bridge by Quaternius - j4KsIuJYnq.glb" },
  { axis: "z", coordinate: 120, model: "Small Bridge by Quaternius - j4KsIuJYnq.glb" },
  { axis: "z", coordinate: 300, model: "Bridge by CreativeTrio - orI7eNSB38.glb" }
];

export async function installVelocityGLBBridges(scene) {
  if (!scene) throw new Error("Velocity bridge scene missing");

  const existing = scene.getObjectByName("Velocity GLB Bridges");
  if (existing) {
    scene.remove(existing);
  }

  const group = new THREE.Group();
  group.name = "Velocity GLB Bridges";
  scene.add(group);

  const loader = new GLTFLoader();
  const cache = new Map();

  const status = {
    expected: bridgePlans.length,
    loaded: 0,
    failed: 0,
    status: "loading",
    group
  };

  window.velocityGLBBridges = status;

  async function getModel(name) {
    if (!cache.has(name)) {
      const url = ASSET_ROOT + encodeURIComponent(name);
      cache.set(name, loader.loadAsync(url));
    }

    return cache.get(name);
  }

  /* VELOCITY_FINAL_BRIDGE_TRANSFORMS_V1 */
const finalBridgeTransforms = {"Bridge z 120":{"position":{"x":120,"y":0.93,"z":0},"rotation":{"x":0,"y":1.5707963267948966,"z":0},"scale":{"x":2,"y":1,"z":1},"visible":true},"Bridge x 120":{"position":{"x":0.5,"y":-3.8,"z":120},"rotation":{"x":0,"y":0,"z":0},"scale":{"x":1.1,"y":1,"z":1},"visible":true},"Bridge z -300":{"position":{"x":-302.5,"y":-10.1,"z":7},"rotation":{"x":0,"y":1.5707963267948966,"z":0},"scale":{"x":1.3,"y":1,"z":1},"visible":true},"Bridge x -120":{"position":{"x":1,"y":-4.4,"z":-120},"rotation":{"x":0,"y":0,"z":0},"scale":{"x":1.1,"y":1.05,"z":1},"visible":true},"Bridge z 300":{"position":{"x":300,"y":-11.6,"z":7},"rotation":{"x":0,"y":1.5707963267948966,"z":0},"scale":{"x":1.35,"y":1,"z":1},"visible":true},"Bridge x -300":{"position":{"x":0,"y":-3.9,"z":-300},"rotation":{"x":0,"y":0,"z":0},"scale":{"x":1.15,"y":1,"z":1},"visible":true},"Bridge x 300":{"position":{"x":0,"y":-4.5,"z":300},"rotation":{"x":0,"y":0,"z":0},"scale":{"x":1.15,"y":1,"z":1},"visible":true},"Bridge z -120":{"position":{"x":-120,"y":1.1,"z":0},"rotation":{"x":0,"y":1.5707963267948966,"z":0},"scale":{"x":1.8,"y":1,"z":1},"visible":true}};

for (const plan of bridgePlans) {
    try {
      const gltf = await getModel(plan.model);
      const bridge = gltf.scene.clone(true);

      const bounds = new THREE.Box3().setFromObject(bridge);
      const size = bounds.getSize(new THREE.Vector3());
      const center = bounds.getCenter(new THREE.Vector3());

      // Center model geometry before scaling.
      bridge.position.sub(center);

      const holder = new THREE.Group();
      holder.name = `Bridge ${plan.axis} ${plan.coordinate}`;

      holder.add(bridge);

      // Longest horizontal model dimension is aligned to road direction.
      const longestIsX = size.x >= size.z;

      if (plan.axis === "x") {
        holder.rotation.y = longestIsX ? 0 : Math.PI / 2;
      } else {
        holder.rotation.y = longestIsX ? Math.PI / 2 : 0;
      }

      const length = Math.max(size.x, size.z);
      const width = Math.min(size.x, size.z);

      const targetLength = 85;
      const targetWidth = 20;

      // Uniform scaling preserves bridge proportions.
      const scale = Math.min(
        targetLength / Math.max(length, 0.001),
        targetWidth / Math.max(width, 0.001)
      );

      bridge.scale.setScalar(scale);

      // Existing road deck top is approximately y = 0.93.
      // Keep bridge geometry centered near deck elevation for inspection.
      const targetY = 0.93;

      if (plan.axis === "x") {
        holder.position.set(0, targetY, plan.coordinate);
      } else {
        holder.position.set(plan.coordinate, targetY, 0);
      }

      const finalBridge = finalBridgeTransforms[holder.name];

if (finalBridge) {
  const p = finalBridge.position;
  const r = finalBridge.rotation;
  const s = finalBridge.scale;

  holder.position.set(p.x, p.y, p.z);
  holder.rotation.set(r.x, r.y, r.z);
  holder.scale.set(s.x, s.y, s.z);
  holder.visible = finalBridge.visible;
}

group.add(holder);
      status.loaded++;

    } catch (error) {
      status.failed++;
      console.error("Bridge failed:", plan.model, error);
    }
  }

  status.status = status.failed === 0 ? "ready" : "partial";

  console.log(
    `[Velocity] GLB bridges: ${status.loaded}/${status.expected} loaded`
  );

  return status;
}