export function createCrystalCheckpointsV14(THREE, scene, crystals) {
  const group = new THREE.Group();
  group.name = "Velocity Crystal Checkpoints V14";

  const checkpoints = crystals.filter(c =>
    ["PROJECTS", "EXPERIENCE", "SKILLS", "ABOUT"].includes(c.name)
  );

  const steel = new THREE.MeshStandardMaterial({
    color: 0x536674,
    metalness: 0.65,
    roughness: 0.4
  });

  const meshMaterial = new THREE.MeshBasicMaterial({
    color: 0x8199a7,
    transparent: true,
    opacity: 0.18,
    side: THREE.DoubleSide,
    depthWrite: false
  });

  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const dummy = new THREE.Object3D();

  const frames = [];
  const panels = [];

  function addFrame(x, y, z, sx, sy, sz) {
    frames.push({x, y, z, sx, sy, sz});
  }

  function addPanel(x, y, z, sx, sy, sz) {
    panels.push({x, y, z, sx, sy, sz});
  }

  for (const crystal of checkpoints) {
    // Existing V8 checkpoint is on the north side:
    // crystal center + (-10, -28).
    const cx = crystal.x - 10;
    const cz = crystal.z - 28;

    const width = 13;
    const depth = 11;
    const height = 7;

    const left = cx - width / 2;
    const right = cx + width / 2;
    const front = cz - depth / 2;
    const back = cz + depth / 2;

    // Four corner posts.
    for (const x of [left, right]) {
      for (const z of [front, back]) {
        addFrame(x, height / 2, z, 0.28, height, 0.28);
      }
    }

    // Roof perimeter.
    addFrame(cx, height, front, width, 0.25, 0.25);
    addFrame(cx, height, back, width, 0.25, 0.25);
    addFrame(left, height, cz, 0.25, 0.25, depth);
    addFrame(right, height, cz, 0.25, 0.25, depth);

    // Side mesh panels.
    addPanel(left, height / 2, cz, 0.08, height, depth);
    addPanel(right, height / 2, cz, 0.08, height, depth);

    // Roof mesh.
    addPanel(cx, height, cz, width, 0.08, depth);

    // Keep front and back open for the existing checkpoint.
  }

  function buildInstances(items, material) {
    const instances = new THREE.InstancedMesh(
      geometry,
      material,
      items.length
    );

    instances.instanceMatrix.setUsage(THREE.StaticDrawUsage);

    items.forEach((item, index) => {
      dummy.position.set(item.x, item.y, item.z);
      dummy.rotation.set(0, 0, 0);
      dummy.scale.set(item.sx, item.sy, item.sz);
      dummy.updateMatrix();
      instances.setMatrixAt(index, dummy.matrix);
    });

    instances.instanceMatrix.needsUpdate = true;
    instances.computeBoundingSphere();

    group.add(instances);
    return instances;
  }

  buildInstances(frames, steel);
  buildInstances(panels, meshMaterial);

  scene.add(group);

  return {
    group,
    checkpointCount: checkpoints.length,
    frameCount: frames.length,
    panelCount: panels.length
  };
}
