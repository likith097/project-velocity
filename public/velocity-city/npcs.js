import * as THREE from 'three';

// VELOCITY_NPC_BENCH_ROUTINE_V1
// Pedestrians follow graph edges, occasionally sit on actual
// street-furniture benches, then resume their sidewalk journey.

export function createNPCPedestrians(scene, pedestrianNetwork, count = 64) {
  const nodes = pedestrianNetwork.userData.nodes;
  const group = new THREE.Group();
  group.name = 'E5.5D.9 - NPC Pedestrians';
  scene.add(group);

  const bodyGeo = new THREE.CylinderGeometry(.55, .62, 1.4, 6);
  const headGeo = new THREE.SphereGeometry(.43, 8, 6);
  const legGeo = new THREE.BoxGeometry(.3, 1, .34);

  const skin = new THREE.MeshStandardMaterial({color:0xc9916c});
  const trousers = new THREE.MeshStandardMaterial({color:0x273748});
  const shirtColors = [
    0x43a4c3, 0xe8ad5e, 0x9d79cc,
    0x7ec38d, 0xd77f8a, 0xc3c6cd
  ];
  const shirts = shirtColors.map(
    color => new THREE.MeshStandardMaterial({color})
  );

  const pedestrians = [];
  const byDistrict = new Map();

  nodes.forEach((n, i) => {
    if (!n.neighbors.length) return;
    if (!byDistrict.has(n.district)) {
      byDistrict.set(n.district, []);
    }
    byDistrict.get(n.district).push(i);
  });

  const districts = ['WN', 'EN', 'WS', 'ES'];

  for (let i = 0; i < count; i++) {
    const district = 'WN';
    const available = byDistrict.get(district) || [];
    if (!available.length) continue;

    const start = available[(i * 41 + 17) % available.length];
    const root = new THREE.Group();

    const torso = new THREE.Mesh(
      bodyGeo, shirts[i % shirts.length]
    );
    torso.position.y = 1.55;
    root.add(torso);

    const head = new THREE.Mesh(headGeo, skin);
    head.position.y = 2.65;
    root.add(head);

    const legs = [];

    for (const side of [-1, 1]) {
      const pivot = new THREE.Group();
      pivot.position.set(side * .3, .9, 0);

      const leg = new THREE.Mesh(legGeo, trousers);
      leg.position.y = -.5;
      pivot.add(leg);
      root.add(pivot);
      legs.push(pivot);
    }

    root.position.set(nodes[start].x, .9, nodes[start].z);
    group.add(root);

    pedestrians.push({
      root, torso, head, legs,
      district,
      from: start,
      to: -1,
      last: -1,
      progress: 0,
      speed: 2 + (i % 7) * .16,
      phase: i * 1.7,
      state: 'walking',
      bench: null,
      benchProgress: 0,
      restTime: 0,
      cooldown: 12 + Math.random() * 20
    });
  }

  // Bench metadata comes from city-street-furniture.js.
  // Lookup is lazy so creation order does not matter.
  let benches = [];
  let benchSource = null;
  let benchLookupTimer = 0;
  const occupied = new Set();

  function findBenches() {
    const furniture = scene.getObjectByName(
      'Velocity Street Furniture'
    );

    if (!furniture || !Array.isArray(furniture.userData.benches)) {
      return;
    }

    if (furniture === benchSource) return;

    benchSource = furniture;
    benches = furniture.userData.benches.map((b, index) => ({
      ...b,
      id: index
    }));
  }

  function chooseBench(p, a, b) {
    if (p.cooldown > 0 || !benches.length) return;

    // Not every passing NPC sits down.
    if (Math.random() > .30) return;

    const dx = b.x - a.x;
    const dz = b.z - a.z;
    const lengthSq = dx * dx + dz * dz;
    if (lengthSq < .001) return;

    const candidates = [];

    for (const bench of benches) {
      if (occupied.has(bench.id)) continue;

      // Project the bench onto the current sidewalk edge.
      const t = (
        (bench.x - a.x) * dx +
        (bench.z - a.z) * dz
      ) / lengthSq;

      if (t <= p.progress + .04 || t >= .96) continue;

      const nearestX = a.x + dx * t;
      const nearestZ = a.z + dz * t;

      const distance = Math.hypot(
        bench.x - nearestX,
        bench.z - nearestZ
      );

      // Only use benches directly alongside this sidewalk.
      if (distance > 3.5) continue;

      // Never send NPCs across district boundaries.
      const benchDistrict =
        `${bench.x < 0 ? 'W' : 'E'}` +
        `${bench.z < 0 ? 'N' : 'S'}`;

      if (benchDistrict !== p.district) continue;

      candidates.push({bench, t});
    }

    if (!candidates.length) return;

    const selected = candidates[
      Math.floor(Math.random() * candidates.length)
    ];

    occupied.add(selected.bench.id);
    p.bench = selected.bench;
    p.benchProgress = selected.t;
  }

  function beginSitting(p) {
    if (!p.bench) return;

    p.state = 'sitting';
    p.restTime = 10 + Math.random() * 20;

    // Place NPC at the actual bench, facing its front.
    p.root.position.set(p.bench.x, .9, p.bench.z);
    p.root.rotation.y = p.bench.rotation || 0;

    // Lower torso and head to seated proportions.
    p.torso.position.y = 1.15;
    p.head.position.y = 2.25;

    for (const leg of p.legs) {
      leg.rotation.x = -Math.PI / 2;
    }
  }

  function finishSitting(p) {
    occupied.delete(p.bench.id);

    p.state = 'walking';
    p.bench = null;
    p.restTime = 0;
    p.cooldown = 25 + Math.random() * 40;

    p.torso.position.y = 1.55;
    p.head.position.y = 2.65;

    for (const leg of p.legs) {
      leg.rotation.x = 0;
    }

    // Resume the exact sidewalk edge used before sitting.
    if (p.to >= 0) {
      const a = nodes[p.from];
      const b = nodes[p.to];

      p.root.position.set(
        a.x + (b.x - a.x) * p.progress,
        .9,
        a.z + (b.z - a.z) * p.progress
      );
      p.root.rotation.y = Math.atan2(
        b.x - a.x,
        b.z - a.z
      );
    }
  }

  let elapsed = 0;

    // VELOCITY_DISTRICT_ONLY_NPCS_V1
  let activeDistrict = null;

  function getDistrict(position) {
    return `${position.x < 0 ? 'W' : 'E'}${position.z < 0 ? 'N' : 'S'}`;
  }

  function moveNPCsToDistrict(district, playerPosition) {
    const districtNodes = byDistrict.get(district) || [];

    // Prioritize sidewalks closest to the actual player.
    const available = [...districtNodes].sort((a, b) => {
      const da =
        (nodes[a].x - playerPosition.x) ** 2 +
        (nodes[a].z - playerPosition.z) ** 2;

      const db =
        (nodes[b].x - playerPosition.x) ** 2 +
        (nodes[b].z - playerPosition.z) ** 2;

      return da - db;
    }).slice(0, 24);

    if (!available.length) return;

    occupied.clear();

    pedestrians.forEach((p, i) => {
      const start = available[(i * 41 + 17) % available.length];

      p.district = district;
      p.from = start;
      p.to = -1;
      p.last = -1;
      p.progress = 0;
      p.state = 'walking';
      p.bench = null;
      p.benchProgress = 0;
      p.restTime = 0;
      p.cooldown = 5 + Math.random() * 15;

      p.torso.position.y = 1.55;
      p.head.position.y = 2.65;

      p.legs.forEach(leg => {
        leg.rotation.x = 0;
      });

      p.root.position.set(
        nodes[start].x,
        .9,
        nodes[start].z
      );
      p.root.visible = true;
    });

    activeDistrict = district;

    console.log(
      'VELOCITY NPC DISTRICT',
      district,
      pedestrians.length,
      'active pedestrians'
    );
  }
  // VELOCITY_NPC_TRAFFIC_RULES_V1
  const crosswalkEdges = new Set(
    (pedestrianNetwork.userData.edges || [])
      .filter(edge => edge.kind === 'crosswalk')
      .map(edge =>
        `${Math.min(edge.a, edge.b)}:${Math.max(edge.a, edge.b)}`
      )
  );

  function isCrosswalk(from, to) {
    return crosswalkEdges.has(
      `${Math.min(from, to)}:${Math.max(from, to)}`
    );
  }

  function canStartCrossing(from, to, trafficSystem) {
    if (!isCrosswalk(from, to)) return true;

    // Fail closed: never enter the road without signal data.
    if (!trafficSystem ||
        typeof trafficSystem.getSignalTime !== 'function') {
      return false;
    }

    const a = nodes[from];
    const b = nodes[to];
    const time = trafficSystem.getSignalTime() % 32;

    const crossingX = Math.abs(b.x - a.x) >
                      Math.abs(b.z - a.z);

    // Crossing along X intersects north-south vehicle traffic.
    // Its safe window is within the north-south red phase.
    if (crossingX) {
      return time >= 17 && time <= 23;
    }

    // Crossing along Z intersects east-west vehicle traffic.
    // Its safe window is within the east-west red phase.
    return time >= 0 && time <= 8;
  }
  function update(dt, cameraPosition, trafficSystem) {
    const step = Math.min(Math.max(dt || 0, 0), .05);
    elapsed += step;

    // Use the supplied player position when available.
    // Otherwise, the camera determines the active district.
    if (cameraPosition) {
      const currentDistrict = getDistrict(cameraPosition);

      if (currentDistrict !== activeDistrict) {
        moveNPCsToDistrict(currentDistrict, cameraPosition);
      }
    }

    benchLookupTimer -= step;
    if (benchLookupTimer <= 0) {
      findBenches();
      benchLookupTimer = 3;
    }

    for (const p of pedestrians) {
      const visible = !cameraPosition ||
        p.root.position.distanceToSquared(cameraPosition) <
        350 * 350;

      p.root.visible = visible;

      if (p.state === 'sitting') {
        p.restTime -= step;

        if (p.restTime <= 0) {
          finishSitting(p);
        }
        continue;
      }

      p.cooldown = Math.max(0, p.cooldown - step);

      if (p.to < 0) {
        const options = nodes[p.from].neighbors.filter(
          id => nodes[id].district === p.district
        );

        if (!options.length) continue;

        const alternatives = options.filter(
          id => id !== p.last
        );

        const choices = alternatives.length
          ? alternatives
          : options;

        p.to = choices[
          Math.floor(Math.random() * choices.length)
        ];
        p.progress = 0;

        // Wait at the curb until the crossing phase is safe.
        if (!canStartCrossing(p.from, p.to, trafficSystem)) {
          p.to = -1;
          p.legs[0].rotation.x = 0;
          p.legs[1].rotation.x = 0;
          continue;
        }

        chooseBench(p, nodes[p.from], nodes[p.to]);
      }

      const a = nodes[p.from];
      const b = nodes[p.to];
      const dx = b.x - a.x;
      const dz = b.z - a.z;
      const length = Math.hypot(dx, dz);

      const crossing = isCrosswalk(p.from, p.to);
      const movementSpeed = crossing ? 5.0 : p.speed;
      p.progress += step * movementSpeed / Math.max(length, .01);

      // Stop at a reserved bench along the current edge.
      if (
        p.bench &&
        p.progress >= p.benchProgress
      ) {
        p.progress = p.benchProgress;
        beginSitting(p);
        continue;
      }

      if (p.progress >= 1) {
        p.last = p.from;
        p.from = p.to;
        p.to = -1;
        p.progress = 0;
        p.root.position.set(b.x, .9, b.z);
      } else {
        p.root.position.set(
          a.x + dx * p.progress,
          .9,
          a.z + dz * p.progress
        );
      }

      p.root.rotation.y = Math.atan2(dx, dz);

      if (visible) {
        const swing = Math.sin(elapsed * 8 + p.phase) * .45;
        p.legs[0].rotation.x = swing;
        p.legs[1].rotation.x = -swing;
      }
    }
  }

  return {group, pedestrians, update};
}