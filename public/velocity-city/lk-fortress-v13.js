// VELOCITY_LK_FORTRESS_V13
// Four-way fortified LK Tower enclosure.
// Center: (0,0). Traffic-signal boundaries: +/-120.

export function createLKFortressV13(THREE, scene) {
  const group = new THREE.Group();
  group.name = "LK Tower Fortress V13";
  scene.add(group);

  const steel = new THREE.MeshStandardMaterial({
    color: 0x35434e,
    metalness: 0.8,
    roughness: 0.35
  });

  const mesh = new THREE.MeshBasicMaterial({
    color: 0x82949e,
    transparent: true,
    opacity: 0.3,
    side: THREE.DoubleSide,
    depthWrite: false
  });

  const warning = new THREE.MeshBasicMaterial({
    color: 0xff293c
  });

  const geometry = new THREE.BoxGeometry(1, 1, 1);

  function block(w, h, d, x, y, z, material = steel) {
    const object = new THREE.Mesh(geometry, material);
    object.scale.set(w, h, d);
    object.position.set(x, y, z);
    group.add(object);
    return object;
  }

  // Four connected arms: 36 units wide, 20 units tall.
  const arms = [
    { axis: "z", start: -120, end: -45 },
    { axis: "z", start: 45, end: 120 },
    { axis: "x", start: -120, end: -45 },
    { axis: "x", start: 45, end: 120 }
  ];

  const halfWidth = 18;
  const height = 20;
  const spacing = 12;

  for (const arm of arms) {
    const length = arm.end - arm.start;
    const center = (arm.start + arm.end) / 2;

    if (arm.axis === "z") {
      for (const side of [-1, 1]) {
        block(0.35, height, length, side * halfWidth, height / 2, center, mesh);
        block(0.8, 0.8, length, side * halfWidth, height, center);
      }

      block(halfWidth * 2, 0.3, length, 0, height, center, mesh);

      for (let z = arm.start; z <= arm.end; z += spacing) {
        for (const side of [-1, 1]) {
          block(0.65, height, 0.65, side * halfWidth, height / 2, z);
        }
        block(halfWidth * 2, 0.55, 0.65, 0, height, z);
      }
    } else {
      for (const side of [-1, 1]) {
        block(length, height, 0.35, center, height / 2, side * halfWidth, mesh);
        block(length, 0.8, 0.8, center, height, side * halfWidth);
      }

      block(length, 0.3, halfWidth * 2, center, height, 0, mesh);

      for (let x = arm.start; x <= arm.end; x += spacing) {
        for (const side of [-1, 1]) {
          block(0.65, height, 0.65, x, height / 2, side * halfWidth);
        }
        block(0.65, 0.55, halfWidth * 2, x, height, 0);
      }
    }
  }

  // Entrance frames at all four traffic signals.
  const entrances = [
    { x: 0, z: -120, axis: "z" },
    { x: 0, z: 120, axis: "z" },
    { x: -120, z: 0, axis: "x" },
    { x: 120, z: 0, axis: "x" }
  ];

  for (const entrance of entrances) {
    const { x, z, axis } = entrance;

    if (axis === "z") {
      block(1.5, height, 1.5, x - halfWidth, height / 2, z);
      block(1.5, height, 1.5, x + halfWidth, height / 2, z);
      block(halfWidth * 2, 1.5, 1.5, x, height, z);
      block(halfWidth * 2, 0.5, 0.5, x, 12, z, warning);
    } else {
      block(1.5, height, 1.5, x, height / 2, z - halfWidth);
      block(1.5, height, 1.5, x, height / 2, z + halfWidth);
      block(1.5, 1.5, halfWidth * 2, x, height, z);
      block(0.5, 0.5, halfWidth * 2, x, 12, z, warning);
    }
  }

  return {
    group,
    entrances,
    arms
  };
}
