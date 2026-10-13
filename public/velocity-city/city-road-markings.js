import * as THREE from "three";

// VELOCITY_PHASE_5D7_INSTANCED_ROAD_MARKINGS
// One instanced mesh for all road markings.

export function createCityRoadMarkings(
  roadLayer,
  corridors,
  roadSegments,
  roadWidth
) {
  if (!roadLayer || !Array.isArray(corridors) ||
      !Array.isArray(roadSegments) || roadWidth !== 20) {
    throw new Error("Unexpected road layout; markings not created.");
  }

  const previous = roadLayer.getObjectByName(
    "Velocity Phase 5D.7 Road Markings"
  );
  if (previous) roadLayer.remove(previous);

  const marks = [];
  const white = new THREE.Color(0xeaf4fa);
  const cyan = new THREE.Color(0x47dfff);

  function add(x, z, width, depth, color = white) {
    marks.push({ x, z, width, depth, color });
  }

  const dashLength = 4;
  const dashSpacing = 14;
  const roadY = 0.907;

  // East-west center lines, respecting existing road segments.
  for (const z of corridors) {
    for (const [start, end] of [[-600, -35], [35, 600]]) {
      for (let x = start + 5; x <= end - 5; x += dashSpacing) {
        if (corridors.some(j => Math.abs(x - j) < 15)) continue;
        add(x, z, dashLength, 0.22);
      }
    }
  }

  // North-south center lines, respecting intersection approaches.
  for (const x of corridors) {
    for (const [start, end] of roadSegments) {
      for (let z = start + 5; z <= end - 5; z += dashSpacing) {
        if (corridors.some(j => Math.abs(z - j) < 15)) continue;
        add(x, z, 0.22, dashLength);
      }
    }
  }

  // Stop bars across road approaches at corridor intersections.
  for (const z of corridors) {
    for (const x of corridors) {
      for (const side of [-1, 1]) {
        const stopX = x + side * 11;
        if (Math.abs(stopX) < 35) continue;
        add(stopX, z, 0.28, roadWidth * 0.72);
      }
    }
  }

  for (const x of corridors) {
    for (const z of corridors) {
      for (const side of [-1, 1]) {
        const stopZ = z + side * 11;
        if (Math.abs(stopZ) < 35) continue;
        add(x, stopZ, roadWidth * 0.72, 0.28);
      }
    }
  }

  // Restrained cyan accents at the eight bridge approaches.
  const bridgeApproaches = [
    [-300, -120], [-120, -120], [120, -120], [300, -120],
    [-300, 120], [-120, 120], [120, 120], [300, 120]
  ];

  for (const [x, z] of bridgeApproaches) {
    add(x, z, 2.5, 0.30, cyan);
  }

  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.72,
    metalness: 0.05
  });

  const mesh = new THREE.InstancedMesh(
    geometry,
    material,
    marks.length
  );

  mesh.name = "Velocity Phase 5D.7 Road Markings";
  mesh.frustumCulled = false;
  mesh.castShadow = false;
  mesh.receiveShadow = false;

  const matrix = new THREE.Matrix4();
  const quaternion = new THREE.Quaternion();

  marks.forEach((mark, i) => {
    matrix.compose(
      new THREE.Vector3(mark.x, roadY, mark.z),
      quaternion,
      new THREE.Vector3(mark.width, 0.025, mark.depth)
    );
    mesh.setMatrixAt(i, matrix);
    mesh.setColorAt(i, mark.color);
  });

  mesh.instanceMatrix.needsUpdate = true;
  if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;

  roadLayer.add(mesh);

  window.velocityRoadMarkings = {
    mesh,
    count: marks.length
  };

  console.log("[Velocity Road Markings] Phase 5D.7", {
    markings: marks.length,
    instancedMeshes: 1
  });

  return mesh;
}