import * as THREE from "three";

// VELOCITY_MATERIAL_REFINEMENT_5D5
// Strong district palettes and restrained metallic finishes.
// Preserves geometry, texture maps, and the existing public API.

const palettes = [
  {
    name: "Skills",
    facades: [0x526d85, 0x607f98, 0x3f5870],
    glass: 0x3988bd,
    metal: 0xb8c8d4
  },
  {
    name: "Tech Park",
    facades: [0x253744, 0x304b5b, 0x3b5967],
    glass: 0x08b9d0,
    metal: 0x9bb8c4
  },
  {
    name: "Projects",
    facades: [0x3d304d, 0x51415f, 0x343f53],
    glass: 0x9272d8,
    metal: 0xb4a7c8
  },
  {
    name: "Career",
    facades: [0x454b54, 0x5a626c, 0x6c747d],
    glass: 0x8db9d4,
    metal: 0xc3ad8e
  }
];

const materialCache = new Map();

function classifyMaterial(mesh, material) {
  const name = `${mesh.name || ""} ${material.name || ""}`.toLowerCase();

  if (/glass|glazing|window|curtain.?wall|transparent/.test(name)) {
    return "glass";
  }

  if (/metal|steel|chrome|aluminium|aluminum|silver|trim|frame|rail/.test(name)) {
    return "metal";
  }

  if (material.metalness >= 0.65 && material.roughness <= 0.3) {
    return "metal";
  }

  return "facade";
}

function getRefinedMaterial(
  original,
  role,
  palette,
  districtIndex,
  buildingIndex
) {
  // Vary facade colors between buildings, not overlapping meshes.
  const variant = role === "facade"
    ? buildingIndex % palette.facades.length
    : 0;

  const key = [
    original.uuid,
    role,
    districtIndex,
    variant
  ].join(":");

  if (materialCache.has(key)) {
    return materialCache.get(key);
  }

  const material = original.clone();

  const colorHex = role === "facade"
    ? palette.facades[variant]
    : palette[role];

  const target = new THREE.Color(colorHex);

  if (material.color) {
    if (material.map) {
      // Preserve existing texture detail while adding a restrained tint.
      material.color.lerp(target, 0.38);
    } else {
      // Plain, nearly-white GLBs need a stronger color correction.
      material.color.copy(target);
    }
  }

  if (role === "facade") {
    material.metalness = Math.max(material.metalness, 0.18);
    material.roughness = 0.52;
  } else if (role === "glass") {
    material.metalness = Math.max(material.metalness, 0.45);
    material.roughness = Math.min(material.roughness, 0.28);
  } else {
    material.metalness = Math.max(material.metalness, 0.78);
    material.roughness = 0.28;
  }

  // Keep original transparency, opacity, maps, and render-side settings.
  material.needsUpdate = true;
  materialCache.set(key, material);

  return material;
}

function recolorBuilding(model, districtIndex, buildingIndex) {
  const palette = palettes[districtIndex];
  let processedMeshes = 0;

  model.traverse(child => {
    if (!child.isMesh || !child.material) return;

    const wasArray = Array.isArray(child.material);
    const originals = wasArray ? child.material : [child.material];

    const refined = originals.map(original => {
      if (!original?.color) return original;

      const role = classifyMaterial(child, original);

      return getRefinedMaterial(
        original,
        role,
        palette,
        districtIndex,
        buildingIndex
      );
    });

    child.material = wasArray ? refined : refined[0];
    processedMeshes++;
  });

  return processedMeshes;
}

export function applyVelocityDistrictColors(architecture) {
  if (!architecture?.replacements?.length) {
    console.warn("[Velocity Materials] Architecture not ready.");
    return;
  }

  materialCache.clear();

  const counts = palettes.map(palette => ({
    district: palette.name,
    buildings: 0,
    meshes: 0
  }));

  architecture.replacements.forEach((entry, index) => {
    if (!entry.model) return;

    const districtIndex = Math.min(
      palettes.length - 1,
      Math.floor(index / 60)
    );

    counts[districtIndex].buildings++;

    counts[districtIndex].meshes += recolorBuilding(
      entry.model,
      districtIndex,
      index
    );
  });

  console.log("[Velocity Materials] Phase 5D.5", {
    buildings: counts.reduce((sum, item) => sum + item.buildings, 0),
    meshes: counts.reduce((sum, item) => sum + item.meshes, 0),
    districts: counts,
    cachedMaterialVariants: materialCache.size
  });
}