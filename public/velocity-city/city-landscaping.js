import * as THREE from "three";

// VELOCITY_LANDSCAPING_V2
// Procedural parks, parking lots and sidewalk-connected entrances.

export function createCityLandscaping(scene, buildings) {
  const group = new THREE.Group();
  group.name = "Velocity City Landscaping V2";

  const roads = [-480, -300, -120, 120, 300, 480];
  const roadSegments = [
    [-600, -490], [-470, -310], [-290, -130],
    [-110, -35], [35, 110], [130, 290],
    [310, 470], [490, 600]
  ];

  const plots = buildings?.userData?.placedBuildings || [];
  const reserved = buildings?.userData?.reservedProjectSites || [];
  const occupied = [];

  const materials = {
    asphalt: new THREE.MeshLambertMaterial({ color: 0x34383d }),
    line: new THREE.MeshBasicMaterial({ color: 0xe5e4d8 }),
    gravel: new THREE.MeshLambertMaterial({ color: 0xb49a70 }),
    grass: new THREE.MeshLambertMaterial({ color: 0x438b46 }),
    tree: new THREE.MeshLambertMaterial({ color: 0x26703a }),
    treeAlt: new THREE.MeshLambertMaterial({ color: 0x3c8746 }),
    trunk: new THREE.MeshLambertMaterial({ color: 0x745238 }),
    shore: new THREE.MeshLambertMaterial({ color: 0x9e8b65 }),
    water: new THREE.MeshPhongMaterial({
      color: 0x298ba4,
      transparent: true,
      opacity: 0.88,
      shininess: 85
    }),
    duck: new THREE.MeshLambertMaterial({ color: 0xf2ead8 }),
    beak: new THREE.MeshLambertMaterial({ color: 0xf0b344 }),
    eye: new THREE.MeshBasicMaterial({ color: 0x202020 }),
    car: [
      0x526d86, 0xb65b4c, 0xeeeeee, 0x344b44, 0x9a9ba0
    ].map(color => new THREE.MeshLambertMaterial({ color }))
  };

  const plane = new THREE.PlaneGeometry(1, 1);
  const trunkGeo = new THREE.CylinderGeometry(0.35, 0.55, 4, 6);
  const crownGeo = new THREE.ConeGeometry(2.7, 7, 7);
  const carGeo = new THREE.BoxGeometry(2.8, 1.4, 5);
  const duckBodyGeo = new THREE.SphereGeometry(0.85, 8, 6);
  const duckHeadGeo = new THREE.SphereGeometry(0.42, 8, 6);
  const duckBeakGeo = new THREE.ConeGeometry(0.2, 0.55, 5);

  let seed = 24681357;

  function random() {
    seed = (1664525 * seed + 1013904223) >>> 0;
    return seed / 4294967296;
  }

  function rectangle(x, z, width, depth, material, y = 0.46) {
    const mesh = new THREE.Mesh(plane, material);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.set(x, y, z);
    mesh.scale.set(width, depth, 1);
    group.add(mesh);
    return mesh;
  }

  function intersects(x, z, width, depth, b, margin = 0) {
    return (
      Math.abs(x - b.x) < (width + b.width) / 2 + margin &&
      Math.abs(z - b.z) < (depth + b.depth) / 2 + margin
    );
  }

  function clear(x, z, width, depth) {
    if (
      Math.abs(x) + width / 2 > 585 ||
      Math.abs(z) + depth / 2 > 585
    ) return false;

    if (
      Math.abs(x) < width / 2 + 42 ||
      Math.abs(z) < depth / 2 + 42
    ) return false;

    for (const road of roads) {
      if (
        Math.abs(x - road) < width / 2 + 17 ||
        Math.abs(z - road) < depth / 2 + 17
      ) return false;
    }

    for (const b of plots) {
      if (intersects(x, z, width, depth, b, 8)) return false;
    }

    for (const site of reserved) {
      if (
        Math.abs(x - site.x) < width / 2 + 65 &&
        Math.abs(z - site.z) < depth / 2 + 65
      ) return false;
    }

    for (const b of occupied) {
      if (intersects(x, z, width, depth, b, 12)) return false;
    }

    return true;
  }

  // Find an existing sidewalk and the direction toward it.
  function findEntrance(x, z, width, depth) {
    const candidates = [];

    for (const road of roads) {
      for (const side of [-1, 1]) {
        const sidewalkX = road + side * 12;
        const sidewalkZ = road + side * 12;

        // North-south sidewalk.
        if (roadSegments.some(([a, b]) => z >= a && z <= b)) {
          const dx = sidewalkX - x;
          const facing = Math.sign(dx);

          if (facing !== 0 && facing === -side) {
            const edgeX = x + facing * width / 2;
            const distance = Math.abs(sidewalkX - edgeX);

            if (distance >= 0 && distance < 70) {
              candidates.push({
                axis: "x",
                x: sidewalkX,
                z,
                direction: facing,
                distance
              });
            }
          }
        }

        // East-west sidewalk.
        if (Math.abs(x) >= 35 && Math.abs(x) <= 600) {
          const dz = sidewalkZ - z;
          const facing = Math.sign(dz);

          if (facing !== 0 && facing === -side) {
            const edgeZ = z + facing * depth / 2;
            const distance = Math.abs(sidewalkZ - edgeZ);

            if (distance >= 0 && distance < 70) {
              candidates.push({
                axis: "z",
                x,
                z: sidewalkZ,
                direction: facing,
                distance
              });
            }
          }
        }
      }
    }

    candidates.sort((a, b) => a.distance - b.distance);
    return candidates[0] || null;
  }

  function accessPath(x, z, width, depth, entrance, parking) {
    const pathWidth = parking ? 7 : 3.5;

    if (entrance.axis === "x") {
      const edgeX = x + entrance.direction * width / 2;
      const centerX = (edgeX + entrance.x) / 2;

      rectangle(
        centerX, z,
        Math.abs(edgeX - entrance.x) + 1.5,
        pathWidth,
        materials.gravel,
        0.84
      );
    } else {
      const edgeZ = z + entrance.direction * depth / 2;
      const centerZ = (edgeZ + entrance.z) / 2;

      rectangle(
        x, centerZ,
        pathWidth,
        Math.abs(edgeZ - entrance.z) + 1.5,
        materials.gravel,
        0.84
      );
    }
  }

  function tree(x, z, scale = 1) {
    const root = new THREE.Group();
    root.position.set(x, 0.45, z);
    root.scale.setScalar(scale);

    const trunk = new THREE.Mesh(trunkGeo, materials.trunk);
    trunk.position.y = 2;
    root.add(trunk);

    const crown = new THREE.Mesh(
      crownGeo,
      random() > 0.5 ? materials.tree : materials.treeAlt
    );
    crown.position.y = 7;
    root.add(crown);

    group.add(root);
  }

  const ducks = [];

  function duck(x, z, phase) {
    const root = new THREE.Group();
    root.position.set(x, 0.68, z);

    const body = new THREE.Mesh(duckBodyGeo, materials.duck);
    body.scale.set(1, 0.55, 0.7);
    root.add(body);

    const head = new THREE.Mesh(duckHeadGeo, materials.duck);
    head.position.set(0.55, 0.32, 0);
    root.add(head);

    const beak = new THREE.Mesh(duckBeakGeo, materials.beak);
    beak.rotation.z = -Math.PI / 2;
    beak.position.set(0.98, 0.26, 0);
    root.add(beak);

    const eye = new THREE.Mesh(
      new THREE.SphereGeometry(0.06, 5, 4),
      materials.eye
    );
    eye.position.set(0.82, 0.47, 0.24);
    root.add(eye);

    group.add(root);
    ducks.push({ root, x, z, phase });
  }

  function pond(x, z, width, depth, entrance) {
    rectangle(x, z, width, depth, materials.grass);

    const shore = new THREE.Mesh(
      new THREE.CircleGeometry(1, 32),
      materials.shore
    );
    shore.rotation.x = -Math.PI / 2;
    shore.position.set(x, 0.49, z);
    shore.scale.set(width * 0.39, depth * 0.38, 1);
    group.add(shore);

    const water = new THREE.Mesh(
      new THREE.CircleGeometry(1, 32),
      materials.water
    );
    water.rotation.x = -Math.PI / 2;
    water.position.set(x, 0.51, z);
    water.scale.set(width * 0.33, depth * 0.32, 1);
    group.add(water);

    for (let i = 0; i < 7; i++) {
      const angle = i * Math.PI * 2 / 7;
      tree(
        x + Math.cos(angle) * width * 0.45,
        z + Math.sin(angle) * depth * 0.44,
        0.65 + random() * 0.3
      );
    }

    for (let i = 0; i < 3; i++) {
      const angle = random() * Math.PI * 2;
      const radius = 2 + random() * 3;
      duck(
        x + Math.cos(angle) * radius,
        z + Math.sin(angle) * radius,
        random() * Math.PI * 2
      );
    }

    accessPath(x, z, width, depth, entrance, false);
  }

  function parking(x, z, width, depth, entrance) {
    rectangle(x, z, width, depth, materials.asphalt);

    const bays = Math.floor((width - 5) / 6.5);

    for (let i = 0; i <= bays; i++) {
      const px = x - bays * 6.5 / 2 + i * 6.5;

      for (const row of [-1, 1]) {
        rectangle(
          px,
          z + row * depth * 0.27,
          0.18,
          depth * 0.25,
          materials.line,
          0.49
        );
      }
    }

    for (let i = 0; i < Math.min(bays, 5); i++) {
      if (random() < 0.55) {
        const car = new THREE.Mesh(
          carGeo,
          materials.car[Math.floor(random() * materials.car.length)]
        );

        car.position.set(
          x - bays * 6.5 / 2 + i * 6.5 + 3,
          1.25,
          z + depth * 0.27
        );

        group.add(car);
      }
    }

    tree(x - width * 0.35, z + depth / 2 + 3, 0.75);
    tree(x + width * 0.35, z + depth / 2 + 3, 0.75);

    accessPath(x, z, width, depth, entrance, true);
  }

  // VELOCITY_ROADSIDE_TREES_V1
  // Spaced vegetation on grass verges; keep road junctions clear.
  const shrubMaterial = new THREE.MeshLambertMaterial({
    color: 0x548b42
  });
  const shrubGeometry = new THREE.IcosahedronGeometry(1, 0);

  const roadsideVegetation = new THREE.Group();
  roadsideVegetation.name = "Velocity Roadside Trees and Shrubs";
  group.add(roadsideVegetation);

  function roadsideShrub(x, z, size = 1) {
    const shrub = new THREE.Mesh(shrubGeometry, shrubMaterial);
    shrub.position.set(x, 0.555 + size * 0.65, z);
    shrub.scale.set(size * 1.15, size * 0.75, size);
    shrub.castShadow = false;
    shrub.receiveShadow = false;
    roadsideVegetation.add(shrub);
  }

  // Plant along both sides of each road segment, not through junctions.
  for (const road of roads) {
    for (const side of [-1, 1]) {
      const vergeX = road + side * 21.5;

      for (const [start, end] of roadSegments) {
        for (let z = start + 28; z < end - 20; z += 48) {
          if (Math.abs(z) < 65) continue;

          // Trees sit toward the outer edge of the grass strip.
          const treeX = vergeX + side * 3.5;

          // Keep trees away from known building footprints and landmarks.
          const treeBlocked = plots.some(p =>
            Math.abs(treeX - p.x) < p.width / 2 + 4 &&
            Math.abs(z - p.z) < p.depth / 2 + 4
          ) || reserved.some(p =>
            Math.hypot(treeX - p.x, z - p.z) < 58
          );

          if (!treeBlocked) {
            tree(treeX, z, 0.72 + random() * 0.22);
          } else {
            roadsideShrub(vergeX, z, 0.8);
          }
        }
      }
    }
  }

  // A few low shrubs on wider outer verge areas.
  for (const road of roads) {
    for (const side of [-1, 1]) {
      const shrubZ = road + side * 21.5;

      for (let x = -550; x <= 550; x += 72) {
        if (Math.abs(x) < 75 || Math.abs(shrubZ) < 65) continue;

        const blocked = plots.some(p =>
          Math.abs(x - p.x) < p.width / 2 + 3 &&
          Math.abs(shrubZ - p.z) < p.depth / 2 + 3
        ) || reserved.some(p =>
          Math.hypot(x - p.x, shrubZ - p.z) < 55
        );

        if (!blocked) {
          roadsideShrub(x, shrubZ, 0.65 + random() * 0.35);
        }
      }
    }
  }

  console.log("[Velocity] Roadside vegetation installed", {
    trees: roadsideVegetation.parent
      ? group.children.filter(child =>
          child.name === "Velocity Street Tree"
        ).length
      : 0,
    shrubs: roadsideVegetation.children.length
  });
  // VELOCITY_ROADSIDE_VERGES_V1
  // Continuous lightweight grass and gravel strips along road corridors.
  const vergeGrass = new THREE.MeshLambertMaterial({ color: 0x508849 });
  const vergeGravel = new THREE.MeshLambertMaterial({ color: 0xa99a80 });

  const vergeGroup = new THREE.Group();
  vergeGroup.name = "Velocity Roadside Grass and Gravel";
  group.add(vergeGroup);

  const vergeGeometry = new THREE.PlaneGeometry(1, 1);

  function vergeStrip(x, z, width, depth, mat) {
    const mesh = new THREE.Mesh(vergeGeometry, mat);
    mesh.rotation.x = -Math.PI / 2;
    // Keep roadside materials above the terrain to prevent z-fighting.
    // Existing road and sidewalk surfaces remain untouched.
    mesh.position.set(x, mat === vergeGravel ? 0.535 : 0.555, z);
    mesh.scale.set(width, depth, 1);
    mesh.receiveShadow = false;
    mesh.castShadow = false;
    vergeGroup.add(mesh);
  }

  // Roadside strips stay outside the existing 4-unit sidewalks.
  // Leave intersections, the central waterfront and bridge approaches clear.
  const vergeOffset = 10 + 4 + 2.5;

  for (const road of roads) {
    for (const side of [-1, 1]) {
      const offset = road + side * vergeOffset;

      // North-south road verges, following existing road segments.
      for (const [start, end] of roadSegments) {
        const length = end - start;
        const mid = (start + end) / 2;

        // Gravel edge nearest the sidewalk.
        vergeStrip(offset, mid, 3, length, vergeGravel);

        // Grass strip immediately outside the gravel.
        vergeStrip(
          offset + side * 5,
          mid,
          7,
          length,
          vergeGrass
        );
      }

      // East-west roads are split at the central canal.
      for (const centerX of [-317.5, 317.5]) {
        vergeStrip(
          centerX,
          offset,
          565,
          3,
          vergeGravel
        );

        vergeStrip(
          centerX,
          offset + side * 5,
          565,
          7,
          vergeGrass
        );
      }
    }
  }

  console.log("[Velocity] Roadside verges installed", {
    strips: vergeGroup.children.length
  });
  const districts = [
    { name: "Projects", sx: -1, sz: 1 },
    { name: "Skills", sx: -1, sz: -1 },
    { name: "Tech Park", sx: 1, sz: -1 },
    { name: "Career", sx: 1, sz: 1 }
  ];

  const counts = {};

  for (const district of districts) {
    counts[district.name] = { parking: 0, ponds: 0 };

    const minX = district.sx > 0 ? 55 : -570;
    const maxX = district.sx > 0 ? 570 : -55;
    const minZ = district.sz > 0 ? 55 : -570;
    const maxZ = district.sz > 0 ? 570 : -55;

    for (let x = minX + 35; x < maxX - 35; x += 48) {
      for (let z = minZ + 35; z < maxZ - 35; z += 48) {
        const width = 36;
        const depth = 36;

        if (!clear(x, z, width, depth)) continue;

        const entrance = findEntrance(x, z, width, depth);
        if (!entrance) continue;

        const isPond =
          counts[district.name].ponds < 5 &&
          random() < 0.3;

        if (isPond) {
          pond(x, z, width, depth, entrance);
          counts[district.name].ponds++;
        } else {
          parking(x, z, width, depth, entrance);
          counts[district.name].parking++;
        }

        occupied.push({ x, z, width, depth });
      }
    }
  }

  scene.add(group);

  let time = 0;

  function update(dt) {
    time += Math.min(dt || 0, 0.05);

    for (const item of ducks) {
      const t = time * 0.35 + item.phase;
      item.root.position.x = item.x + Math.cos(t) * 0.55;
      item.root.position.z = item.z + Math.sin(t) * 0.55;
      item.root.rotation.y = -t;
      item.root.position.y = 0.68 + Math.sin(t * 2) * 0.025;
    }
  }

  console.log("[Velocity Landscaping V2]", {
    districts: counts,
    ducks: ducks.length,
    total: occupied.length
  });

  return { group, update, counts };
}