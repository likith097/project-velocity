// VELOCITY_CRYSTAL_FORTRESS_V13
// Four crystal districts only. LK Tower and CONTACT excluded.

export function createCrystalFortressV13(THREE, scene, crystals) {
  const group = new THREE.Group();
  group.name = "Velocity Crystal Fortresses V13";
  scene.add(group);

  const signals = [-480, -300, -120, 120, 300, 480];

  const towers = crystals.filter(
    crystal => crystal.name !== "CONTACT"
  );

  const steel = new THREE.MeshStandardMaterial({
    color: 0x283744,
    metalness: 0.75,
    roughness: 0.4
  });

  const mesh = new THREE.MeshBasicMaterial({
    color: 0x8296a3,
    transparent: true,
    opacity: 0.25,
    side: THREE.DoubleSide,
    depthWrite: false
  });

  const red = new THREE.MeshBasicMaterial({
    color: 0xff3344
  });

  const amber = new THREE.MeshBasicMaterial({
    color: 0xffc247
  });

  const geometry = new THREE.BoxGeometry(1, 1, 1);

  function block(parent, material, w, h, d, x, y, z) {
    const object = new THREE.Mesh(geometry, material);
    object.scale.set(w, h, d);
    object.position.set(x, y, z);
    parent.add(object);
    return object;
  }

  function nearestSignals(value) {
    const lower = signals.filter(v => v < value).at(-1);
    const upper = signals.find(v => v > value);

    return [
      lower ?? value - 180,
      upper ?? value + 180
    ];
  }

  const fortresses = [];
  const gates = [];

  const WIDTH = 40;
  const HALF = WIDTH / 2;
  const HEIGHT = 22;
  const POST_SPACING = 15;

  function buildArm(parent, tower, axis, direction, end) {
    const start = axis === "x" ? tower.x : tower.z;
    end = end - direction * 12; const distance = Math.abs(end - start);

    // Preserve the immediate crystal base and V8 checkpoint.
    const innerOffset = 27;

    const length = distance - innerOffset;

    if (length <= 0) return;

    const startCoordinate = start + direction * innerOffset;
    const centerCoordinate =
      startCoordinate + direction * length / 2;

    const arm = new THREE.Group();
    arm.name = `${tower.name} ${axis} ${direction} Fortress Arm`;
    parent.add(arm);

    if (axis === "z") {
      for (const side of [-1, 1]) {
        const wallX = tower.x + side * HALF;

        block(
          arm, mesh,
          0.3, HEIGHT, length,
          wallX, HEIGHT / 2, centerCoordinate
        );

        block(
          arm, steel,
          0.7, 0.7, length,
          wallX, HEIGHT, centerCoordinate
        );

        for (let d = 0; d <= length; d += POST_SPACING) {
          const z = startCoordinate + direction * d;

          block(
            arm, steel,
            0.65, HEIGHT, 0.65,
            wallX, HEIGHT / 2, z
          );
        }
      }

      block(
        arm, mesh,
        WIDTH, 0.25, length,
        tower.x, HEIGHT, centerCoordinate
      );

      for (let d = 0; d <= length; d += POST_SPACING) {
        const z = startCoordinate + direction * d;

        block(
          arm, steel,
          WIDTH, 0.5, 0.65,
          tower.x, HEIGHT, z
        );
      }
    } else {
      for (const side of [-1, 1]) {
        const wallZ = tower.z + side * HALF;

        block(
          arm, mesh,
          length, HEIGHT, 0.3,
          centerCoordinate, HEIGHT / 2, wallZ
        );

        block(
          arm, steel,
          length, 0.7, 0.7,
          centerCoordinate, HEIGHT, wallZ
        );

        for (let d = 0; d <= length; d += POST_SPACING) {
          const x = startCoordinate + direction * d;

          block(
            arm, steel,
            0.65, HEIGHT, 0.65,
            x, HEIGHT / 2, wallZ
          );
        }
      }

      block(
        arm, mesh,
        length, 0.25, WIDTH,
        centerCoordinate, HEIGHT, tower.z
      );

      for (let d = 0; d <= length; d += POST_SPACING) {
        const x = startCoordinate + direction * d;

        block(
          arm, steel,
          0.65, 0.5, WIDTH,
          x, HEIGHT, tower.z
        );
      }
    }

    // Traffic-signal entrance frame.
    const gateCoordinate = end - direction * 3;

    const gateX = axis === "x" ? gateCoordinate : tower.x;
    const gateZ = axis === "z" ? gateCoordinate : tower.z;

    const gate = new THREE.Group();
    gate.name = `${tower.name} Security Gate`;
    gate.position.set(gateX, 0, gateZ);
    parent.add(gate);

    if (axis === "z") {
      for (const side of [-1, 1]) {
        block(
          gate, steel,
          1.3, HEIGHT, 1.3,
          side * HALF, HEIGHT / 2, 0
        );
      }

      block(
        gate, steel,
        WIDTH, 1.2, 1.2,
        0, HEIGHT, 0
      );

      block(
        gate, red,
        WIDTH - 3, 0.5, 0.5,
        0, HEIGHT - 3, 0
      );

      block(
        gate, amber,
        WIDTH - 3, 0.4, 0.4,
        0, 5, 0
      );
    } else {
      for (const side of [-1, 1]) {
        block(
          gate, steel,
          1.3, HEIGHT, 1.3,
          0, HEIGHT / 2, side * HALF
        );
      }

      block(
        gate, steel,
        1.2, 1.2, WIDTH,
        0, HEIGHT, 0
      );

      block(
        gate, red,
        0.5, 0.5, WIDTH - 3,
        0, HEIGHT - 3, 0
      );

      block(
        gate, amber,
        0.4, 0.4, WIDTH - 3,
        0, 5, 0
      );
    }

    gates.push({
      tower: tower.name,
      axis,
      direction,
      x: gateX,
      z: gateZ,
      group: gate
    });
  }

  for (const tower of towers) {
    const fortress = new THREE.Group();
    fortress.name = `${tower.name} Crystal Fortress V13`;
    group.add(fortress);

    const [west, east] = nearestSignals(tower.x);
    const [north, south] = nearestSignals(tower.z);

    buildArm(fortress, tower, "x", -1, west);
    buildArm(fortress, tower, "x", 1, east);
    buildArm(fortress, tower, "z", -1, north);
    buildArm(fortress, tower, "z", 1, south);

    fortresses.push({
      name: tower.name,
      x: tower.x,
      z: tower.z,
      group: fortress
    });
  }

  return {
    group,
    fortresses,
    gates
  };
}
