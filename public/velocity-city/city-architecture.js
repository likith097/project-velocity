import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

const loader = new GLTFLoader();
const assets = [{"name":"building-a","url":"./assets/library-glb/Models/GLB%20format/building-a.glb"},{"name":"building-b","url":"./assets/library-glb/Models/GLB%20format/building-b.glb"},{"name":"building-c","url":"./assets/library-glb/Models/GLB%20format/building-c.glb"},{"name":"building-d","url":"./assets/library-glb/Models/GLB%20format/building-d.glb"},{"name":"building-e","url":"./assets/library-glb/Models/GLB%20format/building-e.glb"},{"name":"building-f","url":"./assets/library-glb/Models/GLB%20format/building-f.glb"},{"name":"building-g","url":"./assets/library-glb/Models/GLB%20format/building-g.glb"},{"name":"building-h","url":"./assets/library-glb/Models/GLB%20format/building-h.glb"},{"name":"building-i","url":"./assets/library-glb/Models/GLB%20format/building-i.glb"},{"name":"building-j","url":"./assets/library-glb/Models/GLB%20format/building-j.glb"},{"name":"building-k","url":"./assets/library-glb/Models/GLB%20format/building-k.glb"},{"name":"building-l","url":"./assets/library-glb/Models/GLB%20format/building-l.glb"},{"name":"building-m","url":"./assets/library-glb/Models/GLB%20format/building-m.glb"},{"name":"building-n","url":"./assets/library-glb/Models/GLB%20format/building-n.glb"},{"name":"building-o","url":"./assets/library-glb/Models/GLB%20format/building-o.glb"},{"name":"building-p","url":"./assets/library-glb/Models/GLB%20format/building-p.glb"},{"name":"building-q","url":"./assets/library-glb/Models/GLB%20format/building-q.glb"},{"name":"building-r","url":"./assets/library-glb/Models/GLB%20format/building-r.glb"},{"name":"building-s","url":"./assets/library-glb/Models/GLB%20format/building-s.glb"},{"name":"building-skyscraper-a","url":"./assets/library-glb/Models/GLB%20format/building-skyscraper-a.glb"},{"name":"building-skyscraper-b","url":"./assets/library-glb/Models/GLB%20format/building-skyscraper-b.glb"},{"name":"building-skyscraper-c","url":"./assets/library-glb/Models/GLB%20format/building-skyscraper-c.glb"},{"name":"building-skyscraper-d","url":"./assets/library-glb/Models/GLB%20format/building-skyscraper-d.glb"},{"name":"building-skyscraper-e","url":"./assets/library-glb/Models/GLB%20format/building-skyscraper-e.glb"},{"name":"building-t","url":"./assets/library-glb/Models/GLB%20format/building-t.glb"},{"name":"low-detail-building-a","url":"./assets/library-glb/Models/GLB%20format/low-detail-building-a.glb"},{"name":"low-detail-building-b","url":"./assets/library-glb/Models/GLB%20format/low-detail-building-b.glb"},{"name":"low-detail-building-c","url":"./assets/library-glb/Models/GLB%20format/low-detail-building-c.glb"},{"name":"low-detail-building-d","url":"./assets/library-glb/Models/GLB%20format/low-detail-building-d.glb"},{"name":"low-detail-building-e","url":"./assets/library-glb/Models/GLB%20format/low-detail-building-e.glb"},{"name":"low-detail-building-f","url":"./assets/library-glb/Models/GLB%20format/low-detail-building-f.glb"},{"name":"low-detail-building-g","url":"./assets/library-glb/Models/GLB%20format/low-detail-building-g.glb"},{"name":"low-detail-building-h","url":"./assets/library-glb/Models/GLB%20format/low-detail-building-h.glb"},{"name":"low-detail-building-i","url":"./assets/library-glb/Models/GLB%20format/low-detail-building-i.glb"},{"name":"low-detail-building-j","url":"./assets/library-glb/Models/GLB%20format/low-detail-building-j.glb"},{"name":"low-detail-building-k","url":"./assets/library-glb/Models/GLB%20format/low-detail-building-k.glb"},{"name":"low-detail-building-l","url":"./assets/library-glb/Models/GLB%20format/low-detail-building-l.glb"},{"name":"low-detail-building-m","url":"./assets/library-glb/Models/GLB%20format/low-detail-building-m.glb"},{"name":"low-detail-building-n","url":"./assets/library-glb/Models/GLB%20format/low-detail-building-n.glb"},{"name":"low-detail-building-wide-a","url":"./assets/library-glb/Models/GLB%20format/low-detail-building-wide-a.glb"},{"name":"low-detail-building-wide-b","url":"./assets/library-glb/Models/GLB%20format/low-detail-building-wide-b.glb"}];

const districtNames = [
  "Skills District",
  "Tech Park",
  "Projects District",
  "Career District"
];

function getBounds(object) {
  return new THREE.Box3().setFromObject(object);
}

function fitBuilding(source, plot, districtIndex) {
  const model = source.clone(true);
  model.updateMatrixWorld(true);

  const original = getBounds(model);
  const size = original.getSize(new THREE.Vector3());

  if (
    !Number.isFinite(size.x) ||
    !Number.isFinite(size.y) ||
    !Number.isFinite(size.z) ||
    Math.min(size.x, size.y, size.z) <= 0
  ) {
    throw new Error("Invalid model dimensions");
  }

  const footprintScale = Math.min(
    plot.width * 0.88 / size.x,
    plot.depth * 0.88 / size.z
  );

  const districtMaxHeights = [38, 78, 52, 90];
  const maxHeight = districtMaxHeights[districtIndex];

  const heightScale = maxHeight / size.y;

  const scale = Math.min(footprintScale, heightScale);

  model.scale.multiplyScalar(scale);
  model.updateMatrixWorld(true);

  const fitted = getBounds(model);
  const center = fitted.getCenter(new THREE.Vector3());

  model.position.x += plot.x - center.x;
  model.position.z += plot.z - center.z;
  model.position.y += 0.45 - fitted.min.y;

  model.traverse(child => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });

  return model;
}

function findOriginal(group, plot) {
  return group.children.find(child => {
    return (
      Math.abs(child.position.x - plot.x) < 0.5 &&
      Math.abs(child.position.z - plot.z) < 0.5
    );
  });
}

/* VELOCITY_MODERN_SKYLINE_5D4A
   District-aware architectural selection.
   Preserves all existing building plots and GLB loading.
*/
function chooseAsset(loaded, districtIndex, buildingIndex) {
  const skyscrapers = loaded.filter(item =>
    item.name.startsWith("building-skyscraper-")
  );

  const standard = loaded.filter(item =>
    /^building-[a-t]$/.test(item.name)
  );

  const lowDetail = loaded.filter(item =>
    item.name.startsWith("low-detail-building-")
  );

  const localIndex = buildingIndex % 60;

  function pick(pool, seed) {
    if (!pool.length) return null;
    return pool[seed % pool.length];
  }

  const seed = buildingIndex * 17 + districtIndex * 29;

  let chosen;

  if (districtIndex === 0) {
    // Skills: modern campus with occasional taller landmarks.
    chosen =
      localIndex % 7 === 0
        ? pick(skyscrapers, seed)
        : localIndex % 4 === 0
          ? pick(lowDetail, seed)
          : pick(standard, seed);

  } else if (districtIndex === 1) {
    // Tech Park: strongest futuristic skyline.
    chosen =
      localIndex % 3 !== 0
        ? pick(skyscrapers, seed)
        : pick(standard, seed);

  } else if (districtIndex === 2) {
    // Projects: varied creative district.
    chosen =
      localIndex % 5 === 0
        ? pick(skyscrapers, seed)
        : localIndex % 3 === 0
          ? pick(lowDetail, seed)
          : pick(standard, seed);

  } else {
    // Career: modern corporate towers.
    chosen =
      localIndex % 2 === 0
        ? pick(skyscrapers, seed)
        : pick(standard, seed);
  }

  return chosen || pick(loaded, seed);
}
export async function createCityArchitecture(scene, cityBuildings) {
  const plots = cityBuildings.userData.placedBuildings;

  if (!Array.isArray(plots) || plots.length !== 240) {
    throw new Error("Expected exactly 240 building plots");
  }

  const originalBuildings = plots.map(plot =>
    findOriginal(cityBuildings, plot)
  );

  const missing = originalBuildings.filter(item => !item).length;
  const uniqueOriginals = new Set(
    originalBuildings.filter(Boolean)
  ).size;

  if (missing > 0 || uniqueOriginals !== 240) {
    throw new Error(
      `Building match validation failed: ${missing} missing, ` +
      `${uniqueOriginals} unique originals. Nothing replaced.`
    );
  }

  const loaded = [];

  for (const asset of assets) {
    try {
      const gltf = await loader.loadAsync(asset.url);

      loaded.push({
        name: asset.name,
        scene: gltf.scene
      });
    } catch (error) {
      console.warn("[Velocity 5C] Asset failed:", asset.name, error);
    }
  }

  if (loaded.length < 30) {
    throw new Error(
      `Only ${loaded.length}/41 architecture models loaded`
    );
  }

  const group = new THREE.Group();
  group.name = "Velocity Phase 5C Architecture";

  const replacements = [];

  for (let i = 0; i < plots.length; i++) {
    const plot = plots[i];
    const districtIndex = Math.floor(i / 60);

    const asset = chooseAsset(loaded, districtIndex, i);

    const model = fitBuilding(
      asset.scene,
      plot,
      districtIndex
    );

    model.name = `${districtNames[districtIndex]} GLB ${i + 1}`;
    group.add(model);

    replacements.push({
      model,
      original: originalBuildings[i],
      district: districtNames[districtIndex],
      asset: asset.name
    });
  }

  // Commit only after all 240 replacements are ready.
  scene.add(group);

  for (const item of replacements) {
    item.original.visible = false;
  }

  window.velocityArchitecture = {
    group,
    replacements,
    show() {
      group.visible = true;
      replacements.forEach(item => {
        item.original.visible = false;
      });
    },
    hide() {
      group.visible = false;
      replacements.forEach(item => {
        item.original.visible = true;
      });
    }
  };

  console.log("[Velocity Architecture] Phase 5C", {
    availableModels: loaded.length,
    placedModels: replacements.length,
    hiddenOriginals: replacements.filter(
      item => !item.original.visible
    ).length,
    districts: districtNames
  });

  return group;
}