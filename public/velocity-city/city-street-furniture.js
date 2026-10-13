// VELOCITY_SIDEWALK_FURNITURE_V2
import * as THREE from "three";

// VELOCITY_STREET_FURNITURE_V1
// Lightweight instanced streetlights, traffic signals, benches and trees.

export function createCityStreetFurniture(scene) {
  const group = new THREE.Group();
  group.name = "Velocity Street Furniture";

  const dark = new THREE.MeshLambertMaterial({ color: 0x202b39 });
  const wood = new THREE.MeshLambertMaterial({ color: 0x916b4e });
  const bark = new THREE.MeshLambertMaterial({ color: 0x66513e });
  const leaves = new THREE.MeshLambertMaterial({ color: 0x286c52 });

  const glow = new THREE.MeshBasicMaterial({
    color: 0xffd28a,
    toneMapped: false
  });

  const red = new THREE.MeshBasicMaterial({ color: 0xff3434, toneMapped: false });
  const amber = new THREE.MeshBasicMaterial({ color: 0xffba35, toneMapped: false });
  const green = new THREE.MeshBasicMaterial({ color: 0x36ff8d, toneMapped: false });

  const parts = new Map();
  const transform = new THREE.Object3D();

  function add(type, geometry, material, x, y, z, sx, sy, sz, rotation = 0) {
    if (!parts.has(type)) {
      parts.set(type, {
        geometry,
        material,
        instances: []
      });
    }

    parts.get(type).instances.push({
      x, y, z, sx, sy, sz, rotation
    });
  }

  const box = new THREE.BoxGeometry(1, 1, 1);
  const cylinder = new THREE.CylinderGeometry(0.5, 0.5, 1, 6);
  const sphere = new THREE.SphereGeometry(0.5, 6, 5);
  const cone = new THREE.ConeGeometry(0.5, 1, 7);

  function streetlight(x, z) {
    add("lampPole", cylinder, dark, x, 5.5, z, 0.3, 11, 0.3);
    add("lampArm", box, dark, x + 1.4, 10.8, z, 3, 0.18, 0.18);
    add("lampHead", box, glow, x + 2.7, 10.65, z, 1.2, 0.22, 0.65);
  }

  // VELOCITY_FLORIDA_MAST_ARMS_V1
  // VELOCITY_FLORIDA_DOUBLE_ARM_V3
  // Two diagonal stands, two perpendicular arms each,
  // one traffic-light head per arm.
  function trafficLight(x, z) {
    const cx = x - 12;
    const cz = z - 12;
    const corner = 12;
    const poleHeight = 12.5;
    const armHeight = 12;
    const armLength = 24;

    const stands = [
      { px: cx + corner, pz: cz + corner, dx: -1, dz: -1 },
      { px: cx - corner, pz: cz - corner, dx: 1, dz: 1 }
    ];

    function signalHead(axis, hx, hz, face) {
      const ns = axis === "NS";

      add("traffic" + axis + "Body", box, dark,
        hx, 11.2, hz,
        ns ? 3.6 : 0.85,
        1.25,
        ns ? 0.85 : 3.6);

      add("trafficHanger", box, dark,
        hx, 11.65, hz, 0.16, 0.7, 0.16);

      const positions = [-1.1, 0, 1.1];
      const names = ["Red", "Amber", "Green"];
      const materials = [red, amber, green];

      for (let i = 0; i < 3; i++) {
        add("traffic" + axis + names[i],
          sphere, materials[i],
          ns ? hx + positions[i] : hx + face * 0.48,
          11.2,
          ns ? hz + face * 0.48 : hz + positions[i],
          ns ? 0.52 : 0.2,
          0.52,
          ns ? 0.2 : 0.52);
      }
    }

    for (const stand of stands) {
      const { px, pz, dx, dz } = stand;

      // One vertical pole per stand.
      add("trafficPole", cylinder, dark,
        px, poleHeight / 2, pz,
        0.48, poleHeight, 0.48);

      // Arm 1: extends along the X axis.
      add("trafficArmX", box, dark,
        px + dx * armLength / 2, armHeight, pz,
        armLength, 0.32, 0.32);

      // Arm 2: extends along the Z axis (90 degrees).
      add("trafficArmZ", box, dark,
        px, armHeight, pz + dz * armLength / 2,
        0.32, 0.32, armLength);

      // Exactly one signal head per arm.
      signalHead("NS", px + dx * 17, pz, dz);
      signalHead("EW", px, pz + dz * 17, dx);
    }
  }
  // VELOCITY_BENCH_LAYOUT_V3
  // Bench faces the road; rotation is around the Y axis.
  function bench(x, z, rotation = 0) {
    const c = Math.cos(rotation);
    const s = Math.sin(rotation);

    function piece(type, material, dx, dy, dz, sx, sy, sz) {
      const px = x + dx * c + dz * s;
      const pz = z - dx * s + dz * c;

      add(type, box, material, px, dy + 0.94, pz,
          sx, sy, sz, rotation);
    }

    piece("benchSeat", wood, 0, 0.55, 0, 3.5, 0.25, 1.1);
    piece("benchBack", wood, 0, 1.4, -0.45, 3.5, 1.3, 0.2);
    piece("benchLeg", dark, -1.2, -0.1, 0, 0.2, 1.3, 0.65);
    piece("benchLeg", dark, 1.2, -0.1, 0, 0.2, 1.3, 0.65);
  }
  function tree(x, z, height = 8) {
    add("treeTrunk", cylinder, bark, x, height * 0.25, z, 0.8, height * 0.5, 0.8);
    add("treeCrown", cone, leaves, x, height * 0.75, z, height * 0.55, height * 0.8, height * 0.55);
  }

  // Furniture follows the four major road corridors in both axes.
  const roads = [-480, -300, -120, 120, 300, 480];

  for (const road of roads) {
    for (let p = -550; p <= 550; p += 55) {
      // Keep canal approaches and main intersections clear.
      if (Math.abs(p) < 55) continue;
      if (roads.some(r => Math.abs(p - r) < 22)) continue;

      streetlight(road + 12, p);
      streetlight(p, road + 12);
    }
  }

  for (const x of [-480, -300, -120, 120, 300, 480]) {
    for (const z of [-300, -120, 120, 300]) {
      trafficLight(x + 12, z + 12);
    }
  }

  // VELOCITY_BENCH_LAYOUT_V3
  // Place benches halfway between lamp posts, avoiding intersections.
  // Streetlights are spaced at 55 units.
  // Benches sit at the midpoint between consecutive streetlights.

  let benchesPlaced = 0;
  const benchPositions = [];

  for (const road of roads) {
    for (let p = -522.5; p <= 522.5; p += 110) {
      if (Math.abs(p) < 55) continue;
      if (roads.some(r => Math.abs(p - r) < 28)) continue;

      // This sidewalk lies on the positive X side of a north-south road.
      // The bench front (+Z locally) faces toward negative X.
      const x = road + 12;
      const z = p;

      bench(x, z, -Math.PI / 2);

      benchPositions.push({ x, z, rotation: -Math.PI / 2, seatY: 1.615 });
      benchesPlaced++;
    }
  }

  // Trees occupy separate gaps, away from benches and lamps.
  for (const road of roads) {
    for (let p = -500; p <= 500; p += 110) {
      if (Math.abs(p) < 55) continue;
      if (roads.some(r => Math.abs(p - r) < 30)) continue;

      const x = road + 13.5;
      const z = p;

      const nearBench = benchPositions.some(
        b => Math.hypot(b.x - x, b.z - z) < 12
      );

      const nearLamp = Math.abs(
        (p + 550) % 55
      ) < 12;

      if (!nearBench && !nearLamp) {
        tree(x, z, 8);
      }
    }
  }

  console.log("VELOCITY BENCH PLACEMENT", {
    benches: benchesPlaced
  });
  for (const [name, part] of parts) {
    const mesh = new THREE.InstancedMesh(
      part.geometry,
      part.material,
      part.instances.length
    );

    mesh.name = `Velocity ${name}`;
    mesh.frustumCulled = false;

    part.instances.forEach((item, i) => {
      transform.position.set(item.x, item.y, item.z);
      transform.rotation.set(0, item.rotation, 0);
      transform.scale.set(item.sx, item.sy, item.sz);
      transform.updateMatrix();
      mesh.setMatrixAt(i, transform.matrix);
    });

    mesh.instanceMatrix.needsUpdate = true;
    group.add(mesh);
  }

  scene.add(group);

  console.log("VELOCITY STREET FURNITURE", {
    meshes: group.children.length,
    instances: [...parts.values()].reduce(
      (sum, p) => sum + p.instances.length, 0
    )
  });

  group.userData.benches = benchPositions;
  return group;
}