import * as THREE from "three";

// VELOCITY_ROAD_BLOCKADES_V1
// Barricades only at road ends without canal bridges.

export function createCityRoadBlockades(scene) {
  const group = new THREE.Group();
  group.name = "Velocity Road Closed Barricades";

  const red = new THREE.MeshStandardMaterial({
    color: 0xd92c32,
    roughness: 0.45
  });

  const white = new THREE.MeshStandardMaterial({
    color: 0xf5f1e8,
    roughness: 0.5
  });

  const dark = new THREE.MeshStandardMaterial({
    color: 0x30353c,
    roughness: 0.8
  });

  const amber = new THREE.MeshBasicMaterial({
    color: 0xffad23
  });

  function box(parent, w, h, d, material, x, y, z) {
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(w, h, d),
      material
    );

    mesh.position.set(x, y, z);
    parent.add(mesh);
    return mesh;
  }

  function makeSignTexture() {
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 512;

    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "#fff7e8";
    ctx.fillRect(0, 0, 1024, 512);

    ctx.strokeStyle = "#d92c32";
    ctx.lineWidth = 30;
    ctx.strokeRect(18, 18, 988, 476);

    ctx.fillStyle = "#161616";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.font = "bold 130px Arial";
    ctx.fillText("ROAD CLOSED", 512, 185);

    ctx.font = "bold 83px Arial";
    ctx.fillText("DO NOT CROSS", 512, 335);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;

    return texture;
  }

  const signMaterial = new THREE.MeshBasicMaterial({
    map: makeSignTexture(),
    side: THREE.DoubleSide
  });

  const lamps = [];

  function barricade(x, z, rotation = 0) {
    const root = new THREE.Group();

    root.position.set(x, 0.95, z);
    root.rotation.y = rotation;

    // Main reflective barricade.
    box(root, 17, 1.4, 0.35, white, 0, 1.9, 0);

    // Alternating red diagonal stripes.
    for (let i = 0; i < 9; i++) {
      const stripe = box(
        root, 1.15, 1.45, 0.06,
        red, -7.4 + i * 1.85, 1.9, 0.22
      );

      stripe.rotation.z = -0.35;
    }

    // Support posts.
    for (const px of [-7.5, 7.5]) {
      box(root, 0.45, 2.6, 0.45, dark, px, 1.3, 0);

      box(root, 1.5, 0.25, 1.4, dark, px, 0.15, 0);

      const lamp = new THREE.Mesh(
        new THREE.SphereGeometry(0.28, 8, 6),
        amber.clone()
      );

      lamp.position.set(px, 2.85, 0);
      root.add(lamp);

      lamps.push(lamp);
    }

    // Sign mounted above the barricade.
    box(root, 8.8, 3.2, 0.2, dark, 0, 4.15, 0);

    const sign = new THREE.Mesh(
      new THREE.PlaneGeometry(8.4, 2.9),
      signMaterial
    );

    sign.position.set(0, 4.15, 0.15);
    root.add(sign);

    const backSign = sign.clone();
    backSign.rotation.y = Math.PI;
    backSign.position.z = -0.15;
    root.add(backSign);

    group.add(root);
  }

  // The X = +/-480 roads have no bridges across the Z = 0 canal.
  for (const x of [-480, 480]) {
    barricade(x, -43);
    barricade(x, 43);
  }

  scene.add(group);

  let elapsed = 0;

  function update(dt) {
    elapsed += Math.min(dt || 0, 0.05);

    const visible = Math.sin(elapsed * 4) > 0;

    for (const lamp of lamps) {
      lamp.visible = visible;
    }
  }

  console.log(
    "[Velocity Road Blockades] 4 canal dead-end barricades installed"
  );

  return {
    group,
    update,
    count: 4
  };
}