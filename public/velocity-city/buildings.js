import * as THREE from "three";

export function createCityBuildings(scene) {
  const group = new THREE.Group();
  group.name = "E5.5D.8 - 240 Buildings";

  const districts = [
    {
      name: "Skills",
      center: [-300, -300],
      color: 0x9eb5c5,
      glass: 0x659ab6,
      minHeight: 25,
      maxHeight: 70,
      style: "campus"
    },
    {
      name: "Tech Park",
      center: [300, -300],
      color: 0x899eaf,
      glass: 0x52b9d7,
      minHeight: 45,
      maxHeight: 160,
      style: "tower"
    },
    {
      name: "Projects",
      center: [-300, 300],
      color: 0xb7a99d,
      glass: 0x4c9fb3,
      minHeight: 25,
      maxHeight: 85,
      style: "studio"
    },
    {
      name: "Career",
      center: [300, 300],
      color: 0xa8aeb8,
      glass: 0x789ec6,
      minHeight: 40,
      maxHeight: 130,
      style: "tower"
    }
  ];

  const reservedProjectSites = [
    { name: "AI Career Copilot", x: -445, z: 240 },
    { name: "CINEORA", x: -300, z: 350 },
    { name: "Project Velocity HQ", x: -175, z: 460 }
  ];

  const roads = [-480, -300, -120, 120, 300, 480];
  const roadHalfWidth = 10;
  const canalHalfWidth = 32.5;
  const landmarkClearance = 48;

  // Safe buildable intervals between existing roads.
  // These values preserve a minimum 4 m road setback.
  const bands = [
    [45, 106],
    [134, 286],
    [314, 466],
    [494, 590]
  ];

  const placedBuildings = [];

  function random(seed) {
    const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
    return x - Math.floor(x);
  }

  function material(color, options = {}) {
    return new THREE.MeshStandardMaterial({
      color,
      roughness: 0.68,
      metalness: 0.15,
      ...options
    });
  }

  const roofMaterial = material(0x35465a);

  const darkGlass = material(0x284e68, {
    metalness: 0.48,
    roughness: 0.24
  });

  function addBox(parent, w, h, d, mat, x, y, z) {
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(w, h, d),
      mat
    );
    mesh.position.set(x, y, z);
    parent.add(mesh);
    return mesh;
  }

  // VELOCITY_PROCEDURAL_FACADE_TEXTURE_V1
  // Small shared canvas textures: no external image files.
  const facadeTextureCache = new Map();

  function createFacadeTexture(style, baseColor) {
    const key = `${style}-${baseColor}`;
    if (facadeTextureCache.has(key)) {
      return facadeTextureCache.get(key);
    }

    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 256;

    const ctx = canvas.getContext("2d");
    const color = `#${Number(baseColor).toString(16).padStart(6, "0")}`;

    ctx.fillStyle = color;
    ctx.fillRect(0, 0, 256, 256);

    // Subtle architectural panel divisions.
    const tower = style === "tower";
    const columns = tower ? 8 : 6;
    const rows = tower ? 12 : 8;
    const cellW = 256 / columns;
    const cellH = 256 / rows;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < columns; col++) {
        const variation = (row * 13 + col * 7) % 5;
        const brightness = 22 + variation * 4;

        ctx.fillStyle = tower
          ? `rgba(85,190,225,${0.10 + variation * 0.025})`
          : `rgba(210,225,235,${0.06 + variation * 0.018})`;

        ctx.fillRect(
          col * cellW + 2,
          row * cellH + 2,
          cellW - 4,
          cellH - 4
        );

        // Fine, dark window frames.
        ctx.fillStyle = `rgba(10,22,34,${0.24 + brightness / 255})`;
        ctx.fillRect(col * cellW, row * cellH, cellW, 2);
        ctx.fillRect(col * cellW, row * cellH, 2, cellH);
      }
    }

    // Fine horizontal floor bands.
    ctx.fillStyle = "rgba(220,240,255,0.12)";
    for (let y = 0; y < 256; y += tower ? 21 : 32) {
      ctx.fillRect(0, y, 256, 1);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.generateMipmaps = true;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.anisotropy = 2;

    facadeTextureCache.set(key, texture);
    return texture;
  }

  // VELOCITY_240_INSTANCED_BUILDINGS_V1
  // Four lightweight meshes, one for each district.
  const districtInstances = new Map();
  const sharedGeometry = new THREE.BoxGeometry(1, 1, 1);
  const instanceTransform = new THREE.Object3D();

  function addBuilding(config) {
    const {
      x, z, width, depth, height,
      bodyMaterial, style
    } = config;

    const key = style;

    if (!districtInstances.has(key)) {
      const mesh = new THREE.InstancedMesh(
        sharedGeometry,
        new THREE.MeshLambertMaterial({
          color: bodyMaterial.color,
          map: createFacadeTexture(style, bodyMaterial.color.getHex()),
        }),
        style === "tower" ? 120 : 60
      );

      mesh.name = `Velocity ${style} Buildings`;
      mesh.count = 0;
      mesh.frustumCulled = false;

      districtInstances.set(key, mesh);
      group.add(mesh);
    }

    const mesh = districtInstances.get(key);

    instanceTransform.position.set(
      x,
      height / 2 + 1,
      z
    );

    instanceTransform.scale.set(
      width,
      height,
      depth
    );

    instanceTransform.rotation.set(0, 0, 0);
    instanceTransform.updateMatrix();

    mesh.setMatrixAt(
      mesh.count,
      instanceTransform.matrix
    );

    mesh.count++;
    mesh.instanceMatrix.needsUpdate = true;

    return mesh;
  }
  // VELOCITY_FACADE_DETAILS_V1
  // Instanced facade details: windows, doors and roof trim.
  const facadeParts = [];
  const windowGeometry = new THREE.PlaneGeometry(1, 1);
  const doorGeometry = new THREE.PlaneGeometry(1, 1);
  const trimGeometry = new THREE.BoxGeometry(1, 1, 1);

  const windowMaterial = new THREE.MeshBasicMaterial({
    color: 0xffd69b,
    side: THREE.DoubleSide,
    toneMapped: false
  });

  const doorMaterial = new THREE.MeshBasicMaterial({
    color: 0x142d45,
    side: THREE.DoubleSide
  });

  const trimMaterial = new THREE.MeshLambertMaterial({
    color: 0x657b91
  });

  const facadeTransform = new THREE.Object3D();

  function addFacadeInstances(geometry, material, transforms, name) {
    if (!transforms.length) return;

    const mesh = new THREE.InstancedMesh(
      geometry,
      material,
      transforms.length
    );

    mesh.name = name;
    mesh.frustumCulled = false;

    transforms.forEach((transform, index) => {
      facadeTransform.position.set(
        transform.x,
        transform.y,
        transform.z
      );

      facadeTransform.rotation.set(
        0,
        transform.rotation || 0,
        0
      );

      facadeTransform.scale.set(
        transform.width,
        transform.height,
        transform.depth || 1
      );

      facadeTransform.updateMatrix();
      mesh.setMatrixAt(index, facadeTransform.matrix);
    });

    mesh.instanceMatrix.needsUpdate = true;
    group.add(mesh);
    facadeParts.push(mesh);
  }

  function buildFacadeDetails() {
    const windows = [];
    const doors = [];
    const trims = [];

    // Read the actual building instances and their transforms.
    const matrix = new THREE.Matrix4();
    const position = new THREE.Vector3();
    const quaternion = new THREE.Quaternion();
    const scale = new THREE.Vector3();

    for (const mesh of districtInstances.values()) {
      for (let i = 0; i < mesh.count; i++) {
        mesh.getMatrixAt(i, matrix);
        matrix.decompose(position, quaternion, scale);

        const x = position.x;
        const z = position.z;
        const width = scale.x;
        const height = scale.y;
        const depth = scale.z;

        const baseY = position.y - height / 2;
        const floors = Math.max(1, Math.floor(height / 4.5));
        const columnsX = Math.max(2, Math.floor(width / 5));
        const columnsZ = Math.max(2, Math.floor(depth / 5));

        for (let floor = 0; floor < floors; floor++) {
          const y = baseY + 3.2 + floor * 4.5;

          if (y > baseY + height - 1.2) continue;

          for (let col = 0; col < columnsX; col++) {
            const wx = x - width / 2 +
              (col + 0.5) * width / columnsX;

            windows.push({
              x: wx,
              y,
              z: z + depth / 2 + 0.055,
              width: 1.65,
              height: 2.1
            });

            windows.push({
              x: wx,
              y,
              z: z - depth / 2 - 0.055,
              width: 1.65,
              height: 2.1,
              rotation: Math.PI
            });
          }

          for (let col = 0; col < columnsZ; col++) {
            const wz = z - depth / 2 +
              (col + 0.5) * depth / columnsZ;

            windows.push({
              x: x + width / 2 + 0.055,
              y,
              z: wz,
              width: 1.65,
              height: 2.1,
              rotation: Math.PI / 2
            });

            windows.push({
              x: x - width / 2 - 0.055,
              y,
              z: wz,
              width: 1.65,
              height: 2.1,
              rotation: -Math.PI / 2
            });
          }
        }

        doors.push({
          x,
          y: baseY + 2.05,
          z: z + depth / 2 + 0.09,
          width: 3.4,
          height: 4.1
        });

        trims.push({
          x,
          y: baseY + height + 0.25,
          z,
          width: width + 0.6,
          height: 0.5,
          depth: depth + 0.6
        });
      }
    }

    addFacadeInstances(
      windowGeometry,
      windowMaterial,
      windows,
      "Velocity Illuminated Windows"
    );

    addFacadeInstances(
      doorGeometry,
      doorMaterial,
      doors,
      "Velocity Glass Doors"
    );

    addFacadeInstances(
      trimGeometry,
      trimMaterial,
      trims,
      "Velocity Roof Trim"
    );

    console.log("VELOCITY FACADES", {
      windows: windows.length,
      doors: doors.length,
      roofTrims: trims.length
    });
  }
  function intersects(a, b, padding = 0) {
    return (
      Math.abs(a.x - b.x) <
        (a.width + b.width) / 2 + padding &&
      Math.abs(a.z - b.z) <
        (a.depth + b.depth) / 2 + padding
    );
  }

  // VELOCITY_CRYSTAL_LANDING_CLEARANCE_V1
  // Reserve open ground around all five elevator landing positions.
  const crystalLandings = [
    { name: "PROJECTS", x: -285, z: 300 },
    { name: "EXPERIENCE", x: 315, z: -300 },
    { name: "SKILLS", x: -285, z: -300 },
    { name: "ABOUT", x: 315, z: 300 },
    { name: "CONTACT", x: -60, z: 75 }
  ];

  function blocksCrystalLanding(plot) {
    const clearance = 12;
    for (const landing of crystalLandings) {
      if (
        Math.abs(plot.x - landing.x) <=
          (plot.width + 3) / 2 + clearance &&
        Math.abs(plot.z - landing.z) <=
          (plot.depth + 3) / 2 + clearance
      ) return true;
    }
    return false;
  }
  function isValidPlot(plot) {
    if (blocksCrystalLanding(plot)) return false;
    const roofWidth = plot.width + 3;
    const roofDepth = plot.depth + 3;

    const roof = {
      x: plot.x,
      z: plot.z,
      width: roofWidth,
      depth: roofDepth
    };

    if (
      Math.abs(plot.x) - roofWidth / 2 <= canalHalfWidth ||
      Math.abs(plot.z) - roofDepth / 2 <= canalHalfWidth
    ) return false;

    if (
      Math.abs(plot.x) + roofWidth / 2 > 600 ||
      Math.abs(plot.z) + roofDepth / 2 > 600
    ) return false;

    for (const road of roads) {
      if (
        Math.abs(plot.x - road) <
          roofWidth / 2 + roadHalfWidth + 4 ||
        Math.abs(plot.z - road) <
          roofDepth / 2 + roadHalfWidth + 4
      ) return false;
    }

    for (const site of reservedProjectSites) {
      if (
        Math.abs(plot.x - site.x) <
          roofWidth / 2 + landmarkClearance &&
        Math.abs(plot.z - site.z) <
          roofDepth / 2 + landmarkClearance
      ) return false;
    }

    for (const other of placedBuildings) {
      if (intersects(roof, other, 3)) return false;
    }

    return true;
  }

  // Generate a regular grid of plots inside one road block.
  function createBlockPlots(district, districtIndex, bx, bz) {
    const [x0, x1] = bands[bx];
    const [z0, z1] = bands[bz];

    const blockWidth = x1 - x0;
    const blockDepth = z1 - z0;

    const cols = blockWidth >= 150
      ? 4 : blockWidth >= 90 ? 2 : 1;

    const rows = blockDepth >= 150
      ? 4 : blockDepth >= 90 ? 2 : 1;

    const cellWidth = blockWidth / cols;
    const cellDepth = blockDepth / rows;

    const signX = district.center[0] < 0 ? -1 : 1;
    const signZ = district.center[1] < 0 ? -1 : 1;

    const plots = [];

    for (let col = 0; col < cols; col++) {
      for (let row = 0; row < rows; row++) {
        const seed =
          districtIndex * 100000 +
          bx * 10000 +
          bz * 1000 +
          col * 100 +
          row * 10 + 1;

        // Keep sufficient gaps between adjacent plots.
        const maxWidth = Math.min(42, cellWidth - 7);
        const maxDepth = Math.min(42, cellDepth - 7);

        const width =
          28 + random(seed + 1) * (maxWidth - 28);

        const depth =
          28 + random(seed + 2) * (maxDepth - 28);

        const x = signX * (
          x0 + (col + 0.5) * cellWidth
        );

        const z = signZ * (
          z0 + (row + 0.5) * cellDepth
        );

        plots.push({
          x, z, width, depth,
          blockX: bx,
          blockZ: bz,
          seed
        });
      }
    }

    return plots;
  }

  let total = 0;
  const counts = {};

  districts.forEach((district, districtIndex) => {
    const bodyMaterial = material(district.color);

    const glassMaterial = material(district.glass, {
      metalness: 0.42,
      roughness: 0.25
    });

    // All 16 road blocks participate in development.
    const blocks = [];

    for (let bx = 0; bx < 4; bx++) {
      for (let bz = 0; bz < 4; bz++) {
        const plots = createBlockPlots(
          district, districtIndex, bx, bz
        );

        // Deterministic variation within each block.
        plots.sort((a, b) =>
          random(a.seed + 300) -
          random(b.seed + 300)
        );

        blocks.push(plots);
      }
    }

    // Round-robin selection distributes buildings
    // across the district rather than filling one block.
    let districtCount = 0;
    let pass = 0;

    while (districtCount < 60) {
      let addedThisPass = 0;

      for (
        let blockIndex = 0;
        blockIndex < blocks.length && districtCount < 60;
        blockIndex++
      ) {
        const block = blocks[blockIndex];

        if (pass >= block.length) continue;

        const plot = block[pass];

        if (!isValidPlot(plot)) continue;

        const height =
          (district.minHeight +
          random(plot.seed + 20) *
          (district.maxHeight - district.minHeight)) * 0.35;

        addBuilding({
          name:
            `${district.name} Building ${districtCount + 1}`,
          x: plot.x,
          z: plot.z,
          width: plot.width,
          depth: plot.depth,
          height,
          bodyMaterial,
          glassMaterial,
          style: district.style
        });

        placedBuildings.push({
          x: plot.x,
          z: plot.z,
          width: plot.width + 3,
          depth: plot.depth + 3,
          height: height,
          roofY: height + 0.9
        });

        districtCount++;
        total++;
        addedThisPass++;
      }

      pass++;

      if (
        addedThisPass === 0 &&
        blocks.every(block => pass >= block.length)
      ) {
        throw new Error(
          `${district.name}: only ${districtCount} valid plots`
        );
      }
    }

    counts[district.name] = districtCount;

    if (districtCount !== 60) {
      throw new Error(
        `${district.name}: expected 60, got ${districtCount}`
      );
    }
  });

  buildFacadeDetails();

  if (total !== 240) {
    throw new Error(
      `E5.5D.8 expected 240 buildings, got ${total}`
    );
  }

  group.userData.placementVersion = "E5.5D.8";
  group.userData.buildingCount = total;
  group.userData.districtBuildingCount = 60;
  group.userData.districtCounts = counts;
  group.userData.reservedProjectSites = reservedProjectSites;
  group.userData.placedBuildings = placedBuildings;
  group.userData.pedestrianPathsPending = true;

  // Add to scene only after all validation succeeds.
  scene.add(group);

  console.log("E5.5D.8 BUILDING GRID", {
    total,
    districts: counts,
    reservedProjectSites: reservedProjectSites.length
  });

  return group;
}



