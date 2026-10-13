import * as THREE from "three";

// VELOCITY_DISTRICT_BILLBOARDS_V3
export function createCityBillboards(scene, player = null, buildings = null) {
  const group = new THREE.Group();
  group.name = "Velocity District Billboards V3";
  scene.add(group);

  const districts = [
    { name: "Projects", sx: -1, sz: 1, color: "#28d8ec" },
    { name: "Skills", sx: -1, sz: -1, color: "#72a7ff" },
    { name: "Tech Park", sx: 1, sz: -1, color: "#b99aff" },
    { name: "Career", sx: 1, sz: 1, color: "#ffbb69" }
  ];

  const brands = [
    ["FIZZORA", "REFRESHMENT"],
    ["STRYDE", "SPORTSWEAR"],
    ["BURGERDOCK", "FOOD"],
    ["NEXORA", "ELECTRONICS"],
    ["BREWHAVEN", "COFFEE"],
    ["FLIXORA", "ENTERTAINMENT"],
    ["VOLTIX", "MOBILITY"],
    ["KICKLAB", "FOOTWEAR"],
    ["QUICKCART", "SHOPPING"],
    ["BEATWAVE", "MUSIC"],
    ["SKYLINK", "CONNECTIVITY"],
    ["URBANA", "FASHION"],
    ["LUMORA", "HOME"],
    ["NORTHBYTE", "COMPUTING"],
    ["SOLSTICE", "TRAVEL"],
    ["PIXELNEST", "CREATIVE"],
    ["FRESHCOVE", "GROCERIES"],
    ["AEROLINE", "TRANSPORT"],
    ["NOVAFIT", "FITNESS"],
    ["MOONBEAN", "CAFE"]
  ];

  const campaigns = [
    "YOUR CITY. YOUR WAY.",
    "MAKE EVERY DAY COUNT.",
    "DISCOVER SOMETHING NEW.",
    "THE NEXT BIG THING.",
    "BUILT FOR YOUR WORLD.",
    "LIVE A LITTLE LOUDER.",
    "EVERY MOMENT MATTERS.",
    "FIND YOUR NEXT FAVORITE.",
    "MORE THAN EXPECTED.",
    "GO BEYOND ORDINARY.",
    "FRESH IDEAS START HERE.",
    "THE FUTURE LOOKS GOOD.",
    "BRING YOUR DAY TO LIFE.",
    "MADE TO MOVE WITH YOU.",
    "EXPLORE MORE EVERY DAY.",
    "A BETTER KIND OF EVERYDAY.",
    "YOUR NEXT STOP STARTS HERE.",
    "MAKE ROOM FOR MORE.",
    "INSPIRED BY CITY LIFE.",
    "TAKE THE SCENIC ROUTE."
  ];

  const palettes = [
    ["#ffdc69", "#422344"],
    ["#78f1d0", "#103f43"],
    ["#ff8fae", "#452036"],
    ["#9dc6ff", "#172d53"],
    ["#f6a66a", "#502b28"],
    ["#d4a9ff", "#32224f"],
    ["#aef77e", "#203e31"],
    ["#ffffff", "#263044"],
    ["#67e2f2", "#123b55"],
    ["#ffbbd9", "#4b2446"]
  ];

  const WIDTH = 24;
  const HEIGHT = 12;
  const COUNT = 100;
  const roads = [-480, -300, -120, 120, 300, 480];

  const panelGeometry = new THREE.PlaneGeometry(WIDTH, HEIGHT);
  const frameGeometry = new THREE.BoxGeometry(24.4, 12.4, 0.3);
  const postGeometry = new THREE.BoxGeometry(0.7, 10, 0.7);

  const frameMaterial = new THREE.MeshBasicMaterial({
    color: 0x263342
  });

  const postMaterial = new THREE.MeshLambertMaterial({
    color: 0x657383
  });

  const billboardObjects = [];
  const textures = [];

  function makeTexture(index, districtIndex) {
    const district = districts[districtIndex];

    const brandIndex = (index * 7 + districtIndex * 3) % brands.length;
    const campaignIndex = (index * 3 + Math.floor(index / 20) + districtIndex) % campaigns.length;
    const paletteIndex = (index + districtIndex * 3) % palettes.length;

    const brand = brands[brandIndex];
    const slogan = campaigns[campaignIndex];
    const [accent, background] = palettes[paletteIndex];

    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 256;

    const ctx = canvas.getContext("2d");
    const gradient = ctx.createLinearGradient(0, 0, 512, 256);
    gradient.addColorStop(0, background);
    gradient.addColorStop(1, "#080e18");

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 512, 256);

    // Distinctive graphic treatment for each advertisement.
    ctx.save();
    ctx.translate(412, 122);
    ctx.rotate(-0.25 + (index % 5) * 0.1);

    ctx.strokeStyle = accent;
    ctx.lineWidth = 4;
    ctx.globalAlpha = 0.6;

    const motif = index % 5;

    if (motif === 0) {
      for (let r = 25; r <= 95; r += 20) {
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.stroke();
      }
    } else if (motif === 1) {
      for (let j = 0; j < 5; j++) {
        ctx.strokeRect(-65 + j * 13, -65 + j * 13, 105, 105);
      }
    } else if (motif === 2) {
      for (let j = -3; j <= 3; j++) {
        ctx.beginPath();
        ctx.moveTo(j * 25, -95);
        ctx.lineTo(j * 25 + 65, 95);
        ctx.stroke();
      }
    } else if (motif === 3) {
      for (let j = 0; j < 5; j++) {
        ctx.beginPath();
        ctx.arc(j * 20 - 40, j * 12 - 30, 30, 0, Math.PI * 2);
        ctx.stroke();
      }
    } else {
      ctx.beginPath();
      ctx.moveTo(-70, 65);
      ctx.lineTo(0, -80);
      ctx.lineTo(75, 65);
      ctx.closePath();
      ctx.stroke();
    }

    ctx.restore();

    ctx.fillStyle = accent;
    ctx.fillRect(25, 34, 60, 5);

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 46px Arial";
    ctx.fillText(brand[0], 25, 124, 365);

    ctx.fillStyle = accent;
    ctx.font = "bold 16px Arial";
    ctx.fillText(slogan, 27, 164, 365);

    ctx.fillStyle = "#b9c4d2";
    ctx.font = "12px Arial";
    ctx.fillText(brand[1], 27, 208);

    ctx.fillStyle = district.color;
    ctx.font = "bold 11px Arial";
    ctx.fillText(
      `${district.name.toUpperCase()} / ${String(index + 1).padStart(3, "0")}`,
      335, 235
    );

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 2;

    return texture;
  }

  // Collect potential roadside sites in each district.
  function generateSites(district) {
    const sites = [];
    const positiveX = district.sx > 0;
    const positiveZ = district.sz > 0;

    const districtXRoads = roads.filter(r =>
      positiveX ? r > 0 : r < 0
    );

    const districtZRoads = roads.filter(r =>
      positiveZ ? r > 0 : r < 0
    );

    const xMin = positiveX ? 40 : -580;
    const xMax = positiveX ? 580 : -40;
    const zMin = positiveZ ? 40 : -580;
    const zMax = positiveZ ? 580 : -40;

    const plots = buildings?.userData?.placedBuildings || [];
    const reserved = buildings?.userData?.reservedProjectSites || [];

    function allowed(x, z) {
      if (Math.abs(x) < 45 || Math.abs(z) < 45) return false;

      if (roads.some(rx =>
        roads.some(rz =>
          Math.abs(x - rx) < 55 &&
          Math.abs(z - rz) < 55
        )
      )) return false;

      if (reserved.some(p =>
        Math.hypot(x - p.x, z - p.z) < 55
      )) return false;

      if (plots.some(p =>
        Math.abs(x - p.x) < p.width / 2 + 5 &&
        Math.abs(z - p.z) < p.depth / 2 + 5
      )) return false;

      return true;
    }

    function addStreetSites(road, horizontal) {
      const min = horizontal ? xMin : zMin;
      const max = horizontal ? xMax : zMax;

      const crossings = roads
        .filter(r => r >= min && r <= max)
        .sort((a, b) => a - b);

      const boundaries = [min, ...crossings, max];

      for (let i = 0; i < boundaries.length - 1; i++) {
        const start = boundaries[i];
        const end = boundaries[i + 1];
        const length = end - start;

        if (length < 100) continue;

        // Two billboards per street segment.
        for (const fraction of [0.35, 0.65]) {
          const coordinate = start + length * fraction;

          const x = horizontal
            ? coordinate
            : road + (positiveX ? -20 : 20);

          const z = horizontal
            ? road + (positiveZ ? -20 : 20)
            : coordinate;

          if (!allowed(x, z)) continue;

          sites.push({
            x,
            z,
            rotation: horizontal
              ? (positiveZ ? 0 : Math.PI)
              : (positiveX ? Math.PI / 2 : -Math.PI / 2)
          });
        }
      }
    }

    for (const road of districtXRoads) {
      addStreetSites(road, false);
    }

    for (const road of districtZRoads) {
      addStreetSites(road, true);
    }

    // Avoid any remaining overlapping billboard placements.
    const selected = [];

    for (const site of sites) {
      if (selected.some(p =>
        Math.hypot(p.x - site.x, p.z - site.z) < 45
      )) continue;

      selected.push(site);
    }

    return selected;
  }
  const districtSites = districts.map(generateSites);

  for (let i = 0; i < COUNT; i++) {
    const billboard = new THREE.Group();

    const post = new THREE.Mesh(postGeometry, postMaterial);
    post.position.y = 5;
    billboard.add(post);

    const frame = new THREE.Mesh(frameGeometry, frameMaterial);
    frame.position.y = 16;
    billboard.add(frame);

    const material = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      side: THREE.DoubleSide,
      toneMapped: false
    });

    const panel = new THREE.Mesh(panelGeometry, material);
    panel.position.set(0, 16, 0.2);
    billboard.add(panel);

    group.add(billboard);
    billboardObjects.push({ billboard, material });
  }

  let activeDistrict = -1;

  function districtAt(x, z) {
    if (x < 0 && z >= 0) return 0;
    if (x < 0 && z < 0) return 1;
    if (x >= 0 && z < 0) return 2;
    return 3;
  }

  function activateDistrict(index) {
    if (index === activeDistrict) return;

    // Dispose the previous district's GPU textures.
    for (const texture of textures) texture.dispose();
    textures.length = 0;

    const sites = districtSites[index];

    for (let i = 0; i < COUNT; i++) {
      const object = billboardObjects[i];
      const site = sites[i];

      if (!site) {
        object.billboard.visible = false;
        continue;
      }

      object.billboard.visible = true;
      object.billboard.position.set(site.x, 0, site.z);
      object.billboard.rotation.y = site.rotation;

      const texture = makeTexture(i, index);
      textures.push(texture);
      object.material.map = texture;
      object.material.needsUpdate = true;
    }

    activeDistrict = index;

// VELOCITY_BILLBOARD_DEBUG_V1
console.log("[Billboard Debug]", {
  district: districts[index].name,
  totalObjects: billboardObjects.length,
  visibleObjects: billboardObjects.filter(
    item => item.billboard.visible
  ).length,
  firstFivePositions: billboardObjects.slice(0, 5).map(
    item => ({
      x: item.billboard.position.x,
      y: item.billboard.position.y,
      z: item.billboard.position.z,
      visible: item.billboard.visible
    })
  ),
  sceneAttached: group.parent === scene
});

    console.log(
      "Velocity Billboard V3:",
      districts[index].name,
      Math.min(COUNT, sites.length),
      "active billboards"
    );
  }

  function update() {
    const position = player?.group?.position;

    if (!position) return;

    const index = districtAt(position.x, position.z);
    if (index !== activeDistrict) activateDistrict(index);
  }

  // If no player is supplied, show Projects by default.
  if (!player) activateDistrict(0);
  else update();

  return {
    group,
    update,
    activateDistrict,
    get activeDistrict() {
      return activeDistrict;
    },
    get siteCounts() {
      return districtSites.map(sites => sites.length);
    }
  };
}
