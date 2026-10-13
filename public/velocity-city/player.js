
import * as THREE from 'three';

// Project Velocity â€” original portfolio-style player and camera.
// Uses the E5.5 city's existing building and bridge collision data.

const WALK_SPEED = 7;
const RUN_SPEED = 12;
const ACCELERATION = 10;
const CHARACTER_TURN_SPEED = 12;

const CAMERA_DISTANCE = 9;
const CAMERA_TARGET_HEIGHT = 1.6;
const CAMERA_FOLLOW_SPEED = 9;
const CAMERA_LOOK_SPEED = 12;
const MOUSE_SENSITIVITY = 0.0025;
const HORIZONTAL_SENSITIVITY = 0.0045;

const MIN_PITCH = -1.35;
const MAX_PITCH = 1.35;
const DEFAULT_PITCH = 0.28;

export function createFreeRoamPlayer(scene, camera, controls, buildingGroup) {
  const group = new THREE.Group();
  group.name = 'Project Velocity Player';

  const jacket = new THREE.MeshStandardMaterial({ color: 0x17c5de });
  const pants = new THREE.MeshStandardMaterial({ color: 0x18293d });
  const skin = new THREE.MeshStandardMaterial({ color: 0xc58e6e });

  const torso = new THREE.Mesh(
    new THREE.BoxGeometry(1.2, 1.5, 0.75),
    jacket
  );
  torso.position.y = 1.65;
  group.add(torso);

  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.47, 12, 8),
    skin
  );
  head.position.y = 2.8;
  group.add(head);

  const legs = [];
  for (const side of [-1, 1]) {
    const pivot = new THREE.Group();
    pivot.position.set(side * 0.35, 0.95, 0);

    const leg = new THREE.Mesh(
      new THREE.BoxGeometry(0.38, 1, 0.45),
      pants
    );
    leg.position.y = -0.5;
    pivot.add(leg);
    group.add(pivot);
    legs.push(pivot);
  }

  // VELOCITY_EXPLORER_COMPLETE_DETAIL_V1
  // Procedural character enhancements. Existing movement references remain intact.

  const detailMaterials = {
    hair: new THREE.MeshStandardMaterial({ color: 0x20212a, roughness: 0.88 }),
    eye: new THREE.MeshStandardMaterial({ color: 0x171b23, roughness: 0.4 }),
    dark: new THREE.MeshStandardMaterial({ color: 0x111d2a, roughness: 0.8 }),
    fabric: new THREE.MeshStandardMaterial({ color: 0x263c50, roughness: 0.9 }),
    accent: new THREE.MeshStandardMaterial({ color: 0x087d98, metalness: 0.4, roughness: 0.35 }),
    metal: new THREE.MeshStandardMaterial({ color: 0xa9c5d0, metalness: 0.65, roughness: 0.32 })
  };

  function addCharacterDetail(name, geometry, material, x, y, z) {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = name;
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);
    return mesh;
  }

  // Hair cap and fringe.
  addCharacterDetail(
    "Explorer Hair",
    new THREE.SphereGeometry(0.465, 20, 14),
    detailMaterials.hair, 0, 3.02, -0.035
  ).scale.set(1.02, 0.55, 1.02);

  addCharacterDetail(
    "Explorer Fringe",
    new THREE.SphereGeometry(0.31, 16, 10),
    detailMaterials.hair, 0, 3.015, 0.31
  ).scale.set(1, 0.38, 0.55);

  // Face: eyes, eyebrows, ears and nose.
  for (const side of [-1, 1]) {
    addCharacterDetail(
      "Explorer Ear",
      new THREE.SphereGeometry(0.09, 12, 8),
      skin, side * 0.445, 2.79, 0
    );

    addCharacterDetail(
      "Explorer Eye",
      new THREE.SphereGeometry(0.052, 12, 8),
      detailMaterials.eye, side * 0.16, 2.83, 0.418
    );

    addCharacterDetail(
      "Explorer Eyebrow",
      new THREE.BoxGeometry(0.15, 0.035, 0.035),
      detailMaterials.hair, side * 0.16, 2.92, 0.415
    );
  }

  addCharacterDetail(
    "Explorer Nose",
    new THREE.SphereGeometry(0.065, 12, 8),
    skin, 0, 2.75, 0.45
  );

  // VELOCITY_FACIAL_DETAILS_V1
  // Youthful, clean-shaven face with detailed eyes and subtle expression.

  const faceWhite = new THREE.MeshStandardMaterial({
    color: 0xf4f0e9,
    roughness: 0.55
  });

  const irisMaterial = new THREE.MeshStandardMaterial({
    color: 0x49362b,
    roughness: 0.35
  });

  const pupilMaterial = new THREE.MeshStandardMaterial({
    color: 0x10141c,
    roughness: 0.2
  });

  const lipMaterial = new THREE.MeshStandardMaterial({
    color: 0x995e59,
    roughness: 0.85
  });

  const highlightMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff
  });

  // Replace the old dark-dot eyes with layered eyes.
  for (const object of group.children) {
    if (object.name === "Explorer Eye") {
      object.visible = false;
    }
  }

  for (const side of [-1, 1]) {
    const eyeX = side * 0.16;

    const eyeWhite = addCharacterDetail(
      "Explorer Eye White",
      new THREE.SphereGeometry(0.075, 16, 12),
      faceWhite,
      eyeX, 2.83, 0.414
    );
    eyeWhite.scale.set(1.18, 0.72, 0.38);

    const iris = addCharacterDetail(
      "Explorer Iris",
      new THREE.SphereGeometry(0.043, 16, 12),
      irisMaterial,
      eyeX, 2.83, 0.444
    );
    iris.scale.z = 0.55;

    addCharacterDetail(
      "Explorer Pupil",
      new THREE.SphereGeometry(0.023, 12, 10),
      pupilMaterial,
      eyeX, 2.83, 0.466
    ).scale.z = 0.5;

    addCharacterDetail(
      "Explorer Eye Highlight",
      new THREE.SphereGeometry(0.010, 8, 6),
      highlightMaterial,
      eyeX - 0.012, 2.847, 0.479
    );

    // Thin eyelid lines frame each eye.
    const upperLid = addCharacterDetail(
      "Explorer Upper Eyelid",
      new THREE.BoxGeometry(0.155, 0.018, 0.018),
      detailMaterials.hair,
      eyeX, 2.884, 0.438
    );
    upperLid.rotation.z = side * 0.045;

    addCharacterDetail(
      "Explorer Lower Eyelid",
      new THREE.BoxGeometry(0.13, 0.012, 0.015),
      skin,
      eyeX, 2.781, 0.437
    );

    // Subtle cheek definition.
    const cheek = addCharacterDetail(
      "Explorer Cheek",
      new THREE.SphereGeometry(0.095, 12, 10),
      skin,
      side * 0.265, 2.665, 0.33
    );
    cheek.scale.set(1.05, 0.48, 0.45);
  }

  // Subtle clean-shaven mouth.
  const upperLip = addCharacterDetail(
    "Explorer Upper Lip",
    new THREE.SphereGeometry(0.12, 16, 8),
    lipMaterial,
    0, 2.565, 0.393
  );
  upperLip.scale.set(1, 0.17, 0.24);

  const lowerLip = addCharacterDetail(
    "Explorer Lower Lip",
    new THREE.SphereGeometry(0.11, 16, 8),
    lipMaterial,
    0, 2.538, 0.388
  );
  lowerLip.scale.set(1, 0.15, 0.23);

  // Soft chin definition, matching the existing skin tone.
  const chin = addCharacterDetail(
    "Explorer Chin",
    new THREE.SphereGeometry(0.14, 12, 10),
    skin,
    0, 2.425, 0.205
  );
  chin.scale.set(1.1, 0.42, 0.65);
  // VELOCITY_FACE_REFINEMENT_V2
  // Refine existing facial meshes without adding duplicate features.
  // Coordinates are relative to the original character group.

  for (const feature of group.children) {
    if (!feature.name.startsWith("Explorer")) continue;

    switch (feature.name) {
      case "Explorer Cheek":
      case "Explorer Chin":
        // Remove the unnatural spherical bumps.
        feature.visible = false;
        break;

      case "Explorer Eye White":
        // Smaller, flatter eyes.
        feature.scale.set(0.95, 0.62, 0.22);
        feature.position.z = 0.432;
        break;

      case "Explorer Iris":
        feature.scale.set(0.85, 0.85, 0.25);
        feature.position.z = 0.448;
        break;

      case "Explorer Pupil":
        feature.scale.set(0.85, 0.85, 0.3);
        feature.position.z = 0.460;
        break;

      case "Explorer Eye Highlight":
        feature.scale.setScalar(0.75);
        feature.position.z = 0.468;
        break;

      case "Explorer Upper Eyelid":
        feature.position.y = 2.873;
        feature.position.z = 0.433;
        feature.scale.y = 0.75;
        break;

      case "Explorer Lower Eyelid":
        feature.position.y = 2.793;
        feature.position.z = 0.431;
        break;

      case "Explorer Nose":
        // Flatten the original spherical nose.
        feature.scale.set(0.75, 1.05, 0.55);
        feature.position.z = 0.445;
        break;

      case "Explorer Upper Lip":
        feature.scale.set(0.95, 0.14, 0.15);
        feature.position.z = 0.401;
        break;

      case "Explorer Lower Lip":
        feature.scale.set(0.90, 0.12, 0.15);
        feature.position.z = 0.398;
        break;

      case "Explorer Eyebrow":
        feature.scale.set(1.05, 0.8, 0.75);
        feature.position.z = 0.425;
        break;
    }
  }
  // Jacket zipper, harness straps and chest pockets.
  addCharacterDetail(
    "Explorer Jacket Zipper",
    new THREE.BoxGeometry(0.025, 0.95, 0.025),
    detailMaterials.metal, 0, 1.68, 0.405
  );

  for (const side of [-1, 1]) {
    const strap = addCharacterDetail(
      "Explorer Shoulder Harness",
      new THREE.BoxGeometry(0.11, 0.72, 0.045),
      detailMaterials.dark, side * 0.31, 1.91, 0.418
    );
    strap.rotation.z = side * -0.2;

    addCharacterDetail(
      "Explorer Harness Buckle",
      new THREE.BoxGeometry(0.13, 0.10, 0.035),
      detailMaterials.metal, side * 0.31, 1.63, 0.455
    );

    addCharacterDetail(
      "Explorer Jacket Pocket",
      new THREE.BoxGeometry(0.25, 0.25, 0.055),
      detailMaterials.fabric, side * 0.37, 1.73, 0.414
    );

    addCharacterDetail(
      "Explorer Pocket Flap",
      new THREE.BoxGeometry(0.27, 0.06, 0.065),
      detailMaterials.accent, side * 0.37, 1.87, 0.425
    );

    // Cargo pockets and knee reinforcement.
    addCharacterDetail(
      "Explorer Cargo Pocket",
      new THREE.BoxGeometry(0.29, 0.28, 0.06),
      detailMaterials.fabric, side * 0.36, 0.59, 0.24
    );

    addCharacterDetail(
      "Explorer Cargo Flap",
      new THREE.BoxGeometry(0.30, 0.055, 0.07),
      detailMaterials.accent, side * 0.36, 0.735, 0.25
    );

    addCharacterDetail(
      "Explorer Knee Guard",
      new THREE.BoxGeometry(0.29, 0.18, 0.065),
      detailMaterials.dark, side * 0.35, 0.29, 0.245
    );

    // Boots and visible lace bars.
    addCharacterDetail(
      "Explorer Boot",
      new THREE.BoxGeometry(0.43, 0.23, 0.65),
      detailMaterials.dark, side * 0.35, 0.11, 0.10
    );

    addCharacterDetail(
      "Explorer Boot Sole",
      new THREE.BoxGeometry(0.445, 0.065, 0.67),
      detailMaterials.dark, side * 0.35, 0.035, 0.10
    );

    for (let lace = 0; lace < 3; lace++) {
      addCharacterDetail(
        "Explorer Boot Lace",
        new THREE.BoxGeometry(0.16, 0.022, 0.025),
        detailMaterials.metal,
        side * 0.35, 0.12 + lace * 0.045, 0.432
      );
    }
  }

  // Waist belt and buckle.
  addCharacterDetail(
    "Explorer Utility Belt",
    new THREE.BoxGeometry(1.02, 0.11, 0.78),
    detailMaterials.dark, 0, 1.015, 0
  );

  addCharacterDetail(
    "Explorer Belt Buckle",
    new THREE.BoxGeometry(0.16, 0.10, 0.035),
    detailMaterials.metal, 0, 1.015, 0.414
  );

  // Backpack and illuminated status panel.
  addCharacterDetail(
    "Explorer Backpack",
    new THREE.BoxGeometry(0.68, 0.86, 0.28),
    detailMaterials.dark, 0, 1.78, -0.49
  );

  addCharacterDetail(
    "Explorer Backpack Panel",
    new THREE.BoxGeometry(0.43, 0.31, 0.035),
    detailMaterials.fabric, 0, 1.82, -0.645
  );

  addCharacterDetail(
    "Explorer Backpack Status Light",
    new THREE.BoxGeometry(0.20, 0.045, 0.025),
    detailMaterials.accent, 0, 1.90, -0.67
  );

  addCharacterDetail(
    "Explorer Chest Insignia",
    new THREE.BoxGeometry(0.19, 0.09, 0.035),
    detailMaterials.accent, 0.29, 1.92, 0.405
  );
  // VELOCITY_ARTICULATED_ARMS_V1
  // Shoulder-pivot arms replace the previous static sleeve and hand meshes.
  const animatedArms = [];

  for (const side of [-1, 1]) {
    const armPivot = new THREE.Group();
    armPivot.name = side < 0
      ? "Explorer Left Arm Pivot"
      : "Explorer Right Arm Pivot";

    armPivot.position.set(side * 0.69, 2.12, 0);
    group.add(armPivot);

    const sleeve = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.175, 0.55, 4, 10),
      jacket
    );
    sleeve.name = "Explorer Animated Sleeve";
    sleeve.position.set(side * 0.035, -0.39, 0);
    sleeve.rotation.z = side * -0.08;
    sleeve.castShadow = true;
    armPivot.add(sleeve);

    const cuff = new THREE.Mesh(
      new THREE.CylinderGeometry(0.16, 0.16, 0.12, 12),
      detailMaterials.accent
    );
    cuff.position.set(side * 0.065, -0.69, 0);
    armPivot.add(cuff);

    const hand = new THREE.Mesh(
      new THREE.SphereGeometry(0.135, 12, 10),
      skin
    );
    hand.position.set(side * 0.07, -0.83, 0.025);
    armPivot.add(hand);

    armPivot.traverse(object => {
      if (object.isMesh) {
        object.castShadow = true;
        object.receiveShadow = true;
      }
    });

    animatedArms.push(armPivot);
  }

  // VELOCITY_ARTICULATED_ELBOWS_V1
  // Convert each existing arm into a two-segment articulated limb.
  const animatedElbows = [];

  for (let i = 0; i < animatedArms.length; i++) {
    const shoulder = animatedArms[i];
    const side = i === 0 ? -1 : 1;

    // Hide the original rigid sleeve; replace it with two segments.
    const originalSleeve = shoulder.children.find(
      child => child.name === "Explorer Animated Sleeve"
    );

    if (originalSleeve) originalSleeve.visible = false;

    // Remove the old cuff and hand from direct shoulder attachment.
    const originalCuff = shoulder.children.find(
      child => child.isMesh &&
        child.geometry?.type === "CylinderGeometry"
    );

    const originalHand = shoulder.children.find(
      child => child.isMesh &&
        child.geometry?.type === "SphereGeometry"
    );

    if (originalCuff) originalCuff.visible = false;
    if (originalHand) originalHand.visible = false;

    const upperArm = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.17, 0.20, 4, 10),
      jacket
    );
    upperArm.name = "Explorer Upper Arm";
    upperArm.position.set(side * 0.025, -0.23, 0);
    upperArm.castShadow = true;
    shoulder.add(upperArm);

    const elbow = new THREE.Group();
    elbow.name = "Explorer Elbow Pivot";
    elbow.position.set(side * 0.045, -0.46, 0);
    shoulder.add(elbow);

    const forearm = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.145, 0.18, 4, 10),
      jacket
    );
    forearm.name = "Explorer Forearm";
    forearm.position.set(0, -0.18, 0);
    forearm.castShadow = true;
    elbow.add(forearm);

    const cuff = new THREE.Mesh(
      new THREE.CylinderGeometry(0.15, 0.15, 0.12, 12),
      detailMaterials.accent
    );
    cuff.position.set(0, -0.34, 0);
    elbow.add(cuff);

    const hand = new THREE.Mesh(
      new THREE.SphereGeometry(0.135, 12, 10),
      skin
    );
    hand.position.set(0, -0.48, 0.025);
    hand.castShadow = true;
    elbow.add(hand);

    elbow.rotation.x = -0.15;
    animatedElbows.push(elbow);
  }
  // Hide the former non-articulated accessories to prevent duplicates.
  for (const object of group.children) {
    if (
      object.name === "Explorer Sleeve" ||
      object.name === "Explorer Cuff" ||
      object.name === "Explorer Hand"
    ) {
      object.visible = false;
    }
  }
  // VELOCITY_ARTICULATED_FOOTWEAR_V1
  // Parent boots, soles and laces to the existing animated leg pivots.

  for (const object of group.children) {
    if (/^Explorer Boot$|^Explorer Boot Sole$|^Explorer Boot Lace$/.test(object.name)) {
      object.visible = false;
    }
  }

  for (let i = 0; i < legs.length; i++) {
    const foot = new THREE.Group();
    foot.name = i === 0
      ? "Explorer Left Articulated Footwear"
      : "Explorer Right Articulated Footwear";

    // Local coordinates are relative to the leg pivot.
    const boot = new THREE.Mesh(
      new THREE.BoxGeometry(0.43, 0.23, 0.65),
      detailMaterials.dark
    );
    boot.name = "Animated Explorer Boot";
    boot.position.set(0, -0.84, 0.10);
    boot.castShadow = true;
    foot.add(boot);

    const sole = new THREE.Mesh(
      new THREE.BoxGeometry(0.445, 0.065, 0.67),
      detailMaterials.sole
    );
    sole.name = "Animated Explorer Boot Sole";
    sole.position.set(0, -0.915, 0.10);
    sole.castShadow = true;
    foot.add(sole);

    for (let lace = 0; lace < 3; lace++) {
      const laceMesh = new THREE.Mesh(
        new THREE.BoxGeometry(0.16, 0.022, 0.025),
        detailMaterials.buckle
      );
      laceMesh.name = "Animated Explorer Boot Lace";
      laceMesh.position.set(0, -0.83 + lace * 0.045, 0.432);
      foot.add(laceMesh);
    }

    // Inherit walking, running and seated rotations automatically.
    legs[i].add(foot);
  }
  // VELOCITY_CLOTHING_FOLLOWS_BODY_V1
  // Reparent visible accessories while preserving their local world placement.

  let attachedToHead = 0;
  let attachedToTorso = 0;
  let attachedToLegs = 0;

  const existingAccessories = [...group.children];

  for (const accessory of existingAccessories) {
    if (!accessory.name.startsWith("Explorer")) continue;
    if (!accessory.visible) continue;
    if (accessory === torso || accessory === head) continue;

    // Arm pivots already contain their animated sleeves and hands.
    if (accessory.name.includes("Arm Pivot")) continue;

    let parent = torso;

    if (/Hair|Fringe|Eye|Eyebrow|Ear|Nose/.test(accessory.name)) {
      parent = head;
      attachedToHead++;
    } else if (/Cargo|Knee Guard/.test(accessory.name)) {
      // Side is determined by the accessory's existing X position.
      parent = accessory.position.x < 0 ? legs[0] : legs[1];
      attachedToLegs++;
    } else {
      // Jacket, neck, harness, pockets, insignia, belt and backpack.
      attachedToTorso++;
    }

    // Convert group-local coordinates to parent-local coordinates.
    accessory.position.sub(parent.position);
    parent.add(accessory);
  }

  console.log("[Velocity] Clothing attachment hierarchy", {
    head: attachedToHead,
    torso: attachedToTorso,
    legs: attachedToLegs
  });
  // VELOCITY_ARTICULATED_KNEES_V1
  // Retain existing hip pivots and add lower-leg knee joints.
  const animatedKnees = [];

  for (let i = 0; i < legs.length; i++) {
    const hip = legs[i];

    const originalLeg = hip.children.find(
      child => child.isMesh &&
        child.geometry?.type === "BoxGeometry" &&
        child.material === pants
    );

    if (originalLeg) originalLeg.visible = false;

    const upperLeg = new THREE.Mesh(
      new THREE.BoxGeometry(0.38, 0.52, 0.45),
      pants
    );
    upperLeg.name = "Explorer Upper Leg";
    upperLeg.position.y = -0.26;
    upperLeg.castShadow = true;
    hip.add(upperLeg);

    const knee = new THREE.Group();
    knee.name = "Explorer Knee Pivot";
    knee.position.y = -0.52;
    hip.add(knee);

    const lowerLeg = new THREE.Mesh(
      new THREE.BoxGeometry(0.36, 0.48, 0.42),
      pants
    );
    lowerLeg.name = "Explorer Lower Leg";
    lowerLeg.position.y = -0.24;
    lowerLeg.castShadow = true;
    knee.add(lowerLeg);

    // Transfer existing articulated footwear to the lower leg.
    const footwear = hip.children.find(
      child => child.name?.includes("Articulated Footwear")
    );

    if (footwear) {
      footwear.position.y += 0.52;
      knee.add(footwear);
    }

    animatedKnees.push(knee);
  }
  // VELOCITY_DETECTIVE_OUTFIT_V1
  // Modern detective outfit with a dark trench coat.

  const detectiveCoat = new THREE.MeshStandardMaterial({
    color: 0x292c33,
    roughness: 0.88
  });

  const detectiveShirt = new THREE.MeshStandardMaterial({
    color: 0x11151d,
    roughness: 0.9
  });

  const detectiveLeather = new THREE.MeshStandardMaterial({
    color: 0x17191e,
    roughness: 0.65
  });

  const detectiveSilver = new THREE.MeshStandardMaterial({
    color: 0x9ca7b4,
    metalness: 0.7,
    roughness: 0.3
  });

  // Replace bright jacket and trouser colors.
  jacket.color.setHex(0x292c33);
  pants.color.setHex(0x171b24);

  detailMaterials.fabric.color.setHex(0x252a32);
  detailMaterials.accent.color.setHex(0x414852);

  // Dark shirt visible through the open trench coat.
  const shirt = new THREE.Mesh(
    new THREE.BoxGeometry(0.48, 1.05, 0.035),
    detectiveShirt
  );
  shirt.name = "Detective Shirt";
  shirt.position.set(0, 0.05, 0.39);
  torso.add(shirt);

  // Coat lapels.
  for (const side of [-1, 1]) {
    const lapel = new THREE.Mesh(
      new THREE.BoxGeometry(0.24, 0.72, 0.065),
      detectiveCoat
    );
    lapel.name = "Detective Coat Lapel";
    lapel.position.set(side * 0.23, 0.28, 0.44);
    lapel.rotation.z = side * 0.28;
    lapel.castShadow = true;
    torso.add(lapel);

    // Long coat panels below the waist.
    const coatTail = new THREE.Mesh(
      new THREE.BoxGeometry(0.52, 0.72, 0.52),
      detectiveCoat
    );
    coatTail.name = "Detective Coat Tail";
    coatTail.position.set(side * 0.31, -1.03, 0);
    coatTail.castShadow = true;
    torso.add(coatTail);

    // Leather gloves attached to articulated forearms.
    if (animatedElbows[side < 0 ? 0 : 1]) {
      const elbow = animatedElbows[side < 0 ? 0 : 1];

      for (const child of elbow.children) {
        if (
          child.isMesh &&
          child.geometry?.type === "SphereGeometry"
        ) {
          child.material = detectiveLeather;
        }
      }
    }
  }

  // Detective badge on the coat.
  const badge = new THREE.Mesh(
    new THREE.CylinderGeometry(0.095, 0.095, 0.018, 6),
    detectiveSilver
  );
  badge.name = "Detective Badge";
  badge.rotation.x = Math.PI / 2;
  badge.position.set(-0.35, 0.31, 0.46);
  torso.add(badge);

  // Coat buttons.
  for (let i = 0; i < 3; i++) {
    const button = new THREE.Mesh(
      new THREE.SphereGeometry(0.028, 8, 6),
      detectiveSilver
    );
    button.name = "Detective Coat Button";
    button.position.set(0.19, 0.06 - i * 0.27, 0.46);
    torso.add(button);
  }
  // VELOCITY_REMOVE_BACKPACK_V1
  // Remove backpack and all attached decorative components.
  // Preserve the trench coat and character animations.

  torso.traverse(object => {
    if (
      object.name === "Explorer Backpack" ||
      object.name === "Explorer Backpack Panel" ||
      object.name === "Explorer Backpack Status Light"
    ) {
      object.visible = false;
    }
  });
  // VELOCITY_FULL_TRENCH_COAT_V2
  // Closed charcoal trench coat, full sleeves, no detective badge.

  const trenchMaterial = new THREE.MeshStandardMaterial({
    color: 0x252830,
    roughness: 0.9,
    metalness: 0.02
  });

  const trenchTrim = new THREE.MeshStandardMaterial({
    color: 0x171a20,
    roughness: 0.85
  });

  // Remove the detective badge.
  for (const object of torso.children) {
    if (object.name === "Detective Badge") {
      object.visible = false;
    }

    // Hide the previously exposed shirt.
    if (object.name === "Detective Shirt") {
      object.visible = false;
    }

    // Replace old lapels with the new closed-coat design.
    if (object.name === "Detective Coat Lapel") {
      object.visible = false;
    }

    // Preserve existing tails but match the new coat material.
    if (object.name === "Detective Coat Tail") {
      object.material = trenchMaterial;
    }
  }

  // Match the original torso and sleeves to the trench coat.
  torso.material = trenchMaterial;
  jacket.color.setHex(0x252830);

  // Full front panel to cover the torso.
  const coatFront = new THREE.Mesh(
    new THREE.BoxGeometry(1.12, 1.36, 0.065),
    trenchMaterial
  );
  coatFront.name = "Explorer Trench Coat Front";
  coatFront.position.set(0, -0.02, 0.41);
  coatFront.castShadow = true;
  torso.add(coatFront);

  // Center seam.
  const coatSeam = new THREE.Mesh(
    new THREE.BoxGeometry(0.025, 1.20, 0.018),
    trenchTrim
  );
  coatSeam.name = "Explorer Trench Coat Seam";
  coatSeam.position.set(0.10, -0.03, 0.455);
  torso.add(coatSeam);

  // Raised trench coat collar.
  for (const side of [-1, 1]) {
    const collar = new THREE.Mesh(
      new THREE.BoxGeometry(0.36, 0.29, 0.12),
      trenchMaterial
    );
    collar.name = "Explorer Trench Collar";
    collar.position.set(side * 0.38, 0.73, 0.12);
    collar.rotation.z = side * 0.22;
    collar.castShadow = true;
    torso.add(collar);
  }

  // Full-length sleeves on the existing articulated arms.
  for (let i = 0; i < animatedArms.length; i++) {
    const shoulder = animatedArms[i];

    shoulder.traverse(object => {
      if (!object.isMesh) return;

      if (
        object.name === "Explorer Upper Arm" ||
        object.name === "Explorer Forearm"
      ) {
        object.material = trenchMaterial;
      }
    });

    // Upper sleeve covers the shoulder-to-elbow section.
    const upperSleeve = new THREE.Mesh(
      new THREE.CylinderGeometry(0.215, 0.19, 0.43, 12),
      trenchMaterial
    );
    upperSleeve.name = "Explorer Trench Upper Sleeve";
    upperSleeve.position.set(0, -0.23, 0);
    upperSleeve.castShadow = true;
    shoulder.add(upperSleeve);

    // Lower sleeve follows the articulated elbow.
    const elbow = animatedElbows[i];

    if (elbow) {
      const lowerSleeve = new THREE.Mesh(
        new THREE.CylinderGeometry(0.19, 0.175, 0.42, 12),
        trenchMaterial
      );
      lowerSleeve.name = "Explorer Trench Lower Sleeve";
      lowerSleeve.position.set(0, -0.20, 0);
      lowerSleeve.castShadow = true;
      elbow.add(lowerSleeve);

      const sleeveCuff = new THREE.Mesh(
        new THREE.CylinderGeometry(0.185, 0.185, 0.075, 12),
        trenchTrim
      );
      sleeveCuff.name = "Explorer Trench Sleeve Cuff";
      sleeveCuff.position.set(0, -0.38, 0);
      elbow.add(sleeveCuff);
    }
  }

  // Hide original bright jacket accessories that would overlap the coat.
  torso.traverse(object => {
    if (
      object.name?.startsWith("Explorer") &&
      /Jacket Zipper|Jacket Pocket|Pocket Flap|Shoulder Harness|Harness Buckle|Chest Insignia/.test(object.name)
    ) {
      object.visible = false;
    }
  });
  // VELOCITY_COWBOY_STYLE_V2
  // Detective cowboy hat and sunglasses.
  // All positions are local to the animated head.

  const cowboyHatMaterial = new THREE.MeshStandardMaterial({
    color: 0x101014,
    roughness: 0.88
  });

  const cowboyHatBandMaterial = new THREE.MeshStandardMaterial({
    color: 0x34343c,
    metalness: 0.25,
    roughness: 0.55
  });

  const detectiveGlassesFrame = new THREE.MeshStandardMaterial({
    color: 0x090b10,
    metalness: 0.35,
    roughness: 0.3
  });

  const detectiveGlassesLens = new THREE.MeshStandardMaterial({
    color: 0x080d16,
    metalness: 0.2,
    roughness: 0.12
  });

  function addDetectiveHeadMesh(name, geometry, material, x, y, z) {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = name;
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    head.add(mesh);
    return mesh;
  }

  // Cowboy hat: wide, slightly oval brim.
  const cowboyBrim = addDetectiveHeadMesh(
    "Detective Cowboy Brim",
    new THREE.CylinderGeometry(0.73, 0.73, 0.055, 40),
    cowboyHatMaterial,
    0, 0.38, 0
  );
  cowboyBrim.scale.z = 0.77;

  // Raised side edges give the brim a western silhouette.
  for (const side of [-1, 1]) {
    const edge = addDetectiveHeadMesh(
      "Detective Cowboy Raised Edge",
      new THREE.BoxGeometry(0.23, 0.065, 0.75),
      cowboyHatMaterial,
      side * 0.59, 0.45, 0
    );
    edge.rotation.z = side * 0.18;
  }

  // Tall crown.
  const cowboyCrown = addDetectiveHeadMesh(
    "Detective Cowboy Crown",
    new THREE.CylinderGeometry(0.36, 0.43, 0.43, 24),
    cowboyHatMaterial,
    0, 0.62, -0.02
  );
  cowboyCrown.scale.z = 0.88;

  // Hat band.
  const cowboyBand = addDetectiveHeadMesh(
    "Detective Cowboy Band",
    new THREE.CylinderGeometry(0.432, 0.435, 0.065, 24),
    cowboyHatBandMaterial,
    0, 0.455, -0.02
  );
  cowboyBand.scale.z = 0.89;

  // Dark sunglasses.
  for (const side of [-1, 1]) {
    const lensX = side * 0.175;

    const frame = addDetectiveHeadMesh(
      "Detective Sunglasses Frame",
      new THREE.BoxGeometry(0.31, 0.17, 0.045),
      detectiveGlassesFrame,
      lensX, 0.035, 0.445
    );
    frame.rotation.z = side * -0.045;

    const lens = addDetectiveHeadMesh(
      "Detective Sunglasses Lens",
      new THREE.BoxGeometry(0.275, 0.135, 0.018),
      detectiveGlassesLens,
      lensX, 0.035, 0.475
    );
    lens.rotation.z = side * -0.045;

    const temple = addDetectiveHeadMesh(
      "Detective Sunglasses Temple",
      new THREE.BoxGeometry(0.19, 0.035, 0.035),
      detectiveGlassesFrame,
      side * 0.395, 0.065, 0.25
    );
    temple.rotation.y = side * 0.32;
  }

  addDetectiveHeadMesh(
    "Detective Sunglasses Bridge",
    new THREE.BoxGeometry(0.095, 0.035, 0.045),
    detectiveGlassesFrame,
    0, 0.065, 0.467
  );

  // Hide facial eyes behind the sunglasses.
  head.traverse(object => {
    if (
      object.name === "Explorer Eye" ||
      object.name === "Explorer Eye White" ||
      object.name === "Explorer Iris" ||
      object.name === "Explorer Pupil" ||
      object.name === "Explorer Eye Highlight"
    ) {
      object.visible = false;
    }
  });

  // Remove any remaining backpack or badge objects.
  group.traverse(object => {
    if (/backpack|rucksack|detective badge/i.test(object.name || "")) {
      object.visible = false;
    }
  });
  // VELOCITY_FUTURISTIC_ROBOT_V2
  // Sci-fi robot appearance on the existing animated character rig.

  const robotArmorV2 = new THREE.MeshStandardMaterial({
    color: 0x222c38, metalness: 0.8, roughness: 0.3
  });
  const robotDarkV2 = new THREE.MeshStandardMaterial({
    color: 0x0a1019, metalness: 0.65, roughness: 0.36
  });
  const robotSilverV2 = new THREE.MeshStandardMaterial({
    color: 0x8294a5, metalness: 0.88, roughness: 0.24
  });
  const robotGlowV2 = new THREE.MeshStandardMaterial({
    color: 0x00d5ff,
    emissive: 0x00bfff,
    emissiveIntensity: 2.5,
    roughness: 0.2
  });

  function addRobotV2(parent, name, geometry, material, x, y, z) {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = name;
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  }

  // Remove earlier human, detective and cowboy cosmetic meshes.
  const oldCosmeticNames = [
    "Explorer Hair", "Explorer Fringe", "Explorer Eye",
    "Explorer Iris", "Explorer Pupil", "Explorer Eyebrow",
    "Explorer Nose", "Explorer Ear", "Explorer Cheek",
    "Explorer Chin", "Explorer Upper Lip", "Explorer Lower Lip",
    "Explorer Cowboy", "Explorer Sunglasses",
    "Detective Cowboy", "Detective Sunglasses",
    "Detective Shirt", "Detective Coat", "Detective Badge",
    "Explorer Trench", "Backpack", "Rucksack"
  ];

  group.traverse(object => {
    const name = object.name || "";
    if (oldCosmeticNames.some(term =>
      name.toLowerCase().includes(term.toLowerCase())
    )) {
      object.visible = false;
    }
  });

  torso.material = robotArmorV2;
  head.material = robotDarkV2;

  // Armored robot helmet.
  const helmetV2 = addRobotV2(
    head, "Robot V2 Helmet",
    new THREE.SphereGeometry(0.49, 24, 16),
    robotArmorV2, 0, 0, 0
  );
  helmetV2.scale.set(1.05, 1.05, 0.98);

  addRobotV2(
    head, "Robot V2 Faceplate",
    new THREE.BoxGeometry(0.72, 0.30, 0.11),
    robotDarkV2, 0, 0.035, 0.43
  );

  addRobotV2(
    head, "Robot V2 Cyan Visor",
    new THREE.BoxGeometry(0.63, 0.075, 0.035),
    robotGlowV2, 0, 0.065, 0.505
  );

  for (const side of [-1, 1]) {
    addRobotV2(
      head, "Robot V2 Helmet Side",
      new THREE.BoxGeometry(0.10, 0.32, 0.35),
      robotSilverV2, side * 0.46, -0.025, 0.02
    );
  }

  // Chest armor and illuminated core.
  addRobotV2(
    torso, "Robot V2 Chest Armor",
    new THREE.BoxGeometry(1.14, 0.83, 0.13),
    robotArmorV2, 0, 0.24, 0.42
  );

  addRobotV2(
    torso, "Robot V2 Core Housing",
    new THREE.CylinderGeometry(0.16, 0.16, 0.06, 24),
    robotDarkV2, 0, 0.25, 0.52
  ).rotation.x = Math.PI / 2;

  addRobotV2(
    torso, "Robot V2 Energy Core",
    new THREE.CylinderGeometry(0.105, 0.105, 0.07, 24),
    robotGlowV2, 0, 0.25, 0.56
  ).rotation.x = Math.PI / 2;

  addRobotV2(
    torso, "Robot V2 Waist Armor",
    new THREE.BoxGeometry(1.0, 0.26, 0.65),
    robotDarkV2, 0, -0.58, 0
  );

  // Robotic arms attached to existing animated pivots.
  for (let i = 0; i < animatedArms.length; i++) {
    const shoulder = animatedArms[i];

    addRobotV2(
      shoulder, "Robot V2 Shoulder",
      new THREE.SphereGeometry(0.25, 16, 12),
      robotSilverV2, 0, -0.08, 0
    ).scale.set(1.1, 0.8, 1.0);

    addRobotV2(
      shoulder, "Robot V2 Upper Arm",
      new THREE.CylinderGeometry(0.20, 0.17, 0.43, 12),
      robotArmorV2, 0, -0.25, 0
    );

    const elbow = animatedElbows[i];
    if (elbow) {
      addRobotV2(
        elbow, "Robot V2 Forearm",
        new THREE.CylinderGeometry(0.18, 0.21, 0.42, 12),
        robotArmorV2, 0, -0.20, 0
      );

      addRobotV2(
        elbow, "Robot V2 Wrist Light",
        new THREE.CylinderGeometry(0.19, 0.19, 0.035, 12),
        robotGlowV2, 0, -0.38, 0
      );
    }
  }

  // Metallic finish for existing leg meshes.
  group.traverse(object => {
    if (!object.isMesh || !object.name) return;
    if (/leg|knee|shin|boot|foot|shoe/i.test(object.name)) {
      object.material = robotArmorV2;
    }
  });

  // Final cleanup: hide remaining detective accessories.
  group.traverse(object => {
    if (/backpack|rucksack|cowboy|sunglasses|detective badge/i
      .test(object.name || "")) {
      object.visible = false;
    }
  });
  group.position.set(-480, 0.9, 540);
  scene.add(group);

  const buildings = buildingGroup.userData.placedBuildings || [];
  const keys = new Set();
  // VELOCITY_SECRET_CHEATS_V1
  let godMode = false;
  let falling = false;
  let fallSpeed = 0;

  const GOD_SPEED = 65;
  const GOD_TURBO = 210;
  const GOD_HEIGHT = 65;

  const cheatKeys = new Set();

  const destinations = {
    Digit1: [-300, 120],
    Digit2: [-300, -120],
    Digit3: [300, -120],
    Digit4: [300, 120],
    Digit0: [120, 120]
  };

  function snapCheatCamera() {
    smoothedTarget.copy(group.position);
    smoothedTarget.y += CAMERA_TARGET_HEIGHT;

    const distance = CAMERA_DISTANCE * Math.cos(pitch);

    camera.position.set(
      group.position.x + Math.sin(yaw) * distance,
      group.position.y + CAMERA_TARGET_HEIGHT +
        Math.sin(pitch) * CAMERA_DISTANCE,
      group.position.z + Math.cos(yaw) * distance
    );

    camera.lookAt(smoothedTarget);
    protectCamera();
  }

  function activateGodMode() {
    if (!enabled) setEnabled(true);
    if (seated) standUp();

    godMode = true;
    airborne = false;
    verticalSpeed = 0;
    falling = false;
    fallSpeed = 0;

    keys.clear();
    cheatKeys.clear();

    velocity.set(0, 0, 0);
    desiredVelocity.set(0, 0, 0);

    group.position.y = Math.max(group.position.y, GOD_HEIGHT);

    snapCheatCamera();
    updateCheatUI();

    console.log("[Velocity Cheats] GOD MODE ACTIVATED");
  }

  function disableGodMode() {
    if (!godMode) return;

    godMode = false;
    falling = true;
    fallSpeed = 0;

    keys.clear();
    cheatKeys.clear();

    velocity.set(0, 0, 0);
    desiredVelocity.set(0, 0, 0);

    updateCheatUI();

    console.log("[Velocity Cheats] Vertical landing started");
  }

  function cheatTeleport(code) {
    const destination = destinations[code];
    if (!destination) return;

    group.position.x = destination[0];
    group.position.z = destination[1];
    group.position.y = Math.max(group.position.y, GOD_HEIGHT);

    velocity.set(0, 0, 0);
    desiredVelocity.set(0, 0, 0);

    snapCheatCamera();
  }

  // Developer interface.
  const cheatPanel = document.createElement("div");

  cheatPanel.id = "velocity-cheat-panel";
  cheatPanel.style.cssText = `
    position:fixed;
    right:18px;
    bottom:22px;
    z-index:2147483000;
    font-family:Arial,sans-serif;
    color:white;
    pointer-events:auto;
  `;

  const cheatButton = document.createElement("button");
  cheatButton.textContent = "⌘ Cheat Codes";
  cheatButton.style.cssText = `
    background:#121b2b;
    color:#72e9ff;
    border:1px solid #39cde9;
    border-radius:10px;
    padding:12px 17px;
    cursor:pointer;
    font-weight:700;
    box-shadow:0 5px 25px #0008;
  `;

  const cheatBox = document.createElement("div");
  cheatBox.style.cssText = `
    display:none;
    width:250px;
    margin-bottom:10px;
    padding:18px;
    background:#101827f2;
    border:1px solid #39cde9;
    border-radius:12px;
    box-shadow:0 10px 35px #0009;
  `;

  const cheatTitle = document.createElement("div");
  cheatTitle.textContent = "PROJECT VELOCITY // CHEATS";
  cheatTitle.style.cssText = `
    font-size:12px;
    font-weight:bold;
    letter-spacing:1px;
    color:#72e9ff;
    margin-bottom:12px;
  `;

  const cheatInput = document.createElement("input");
  cheatInput.type = "password";
  cheatInput.placeholder = "Enter secret code";
  cheatInput.autocomplete = "off";
  cheatInput.style.cssText = `
    box-sizing:border-box;
    width:100%;
    padding:11px;
    background:#202c40;
    color:white;
    border:1px solid #465b76;
    border-radius:7px;
    outline:none;
  `;

  const activateButton = document.createElement("button");
  activateButton.textContent = "Activate Cheat Code";
  activateButton.style.cssText = `
    width:100%;
    margin-top:10px;
    padding:11px;
    border:0;
    border-radius:7px;
    background:#22b8d2;
    color:#06131a;
    font-weight:bold;
    cursor:pointer;
  `;

  const disableButton = document.createElement("button");
  disableButton.textContent = "Disable Cheat Code";
  disableButton.style.cssText = `
    width:100%;
    margin-top:10px;
    padding:11px;
    border:1px solid #ff6e6e;
    border-radius:7px;
    background:#57232b;
    color:white;
    font-weight:bold;
    cursor:pointer;
    display:none;
  `;

  const cheatStatus = document.createElement("div");
  cheatStatus.style.cssText = `
    margin-top:10px;
    font-size:11px;
    color:#b3c4d8;
    line-height:1.6;
  `;

  cheatBox.append(
    cheatTitle,
    cheatInput,
    activateButton,
    disableButton,
    cheatStatus
  );

  cheatPanel.append(cheatBox, cheatButton);
  document.body.appendChild(cheatPanel);

  function updateCheatUI() {
    activateButton.style.display = godMode ? "none" : "block";
    cheatInput.style.display = godMode ? "none" : "block";
    disableButton.style.display = godMode ? "block" : "none";

    cheatStatus.textContent = godMode
      ? "GOD MODE ACTIVE | WASD: Fly | Space/Ctrl: Height | Shift: Turbo | 0-4: Teleport"
      : falling
        ? "Cheat disabled. Landing vertically..."
        : "Enter the secret code to unlock flying.";

    cheatButton.textContent = godMode
      ? "⚡ GOD MODE"
      : "⌘ Cheat Codes";
  }

  cheatButton.addEventListener("click", () => {
    cheatBox.style.display =
      cheatBox.style.display === "none" ? "block" : "none";

    if (cheatBox.style.display === "block" && !godMode) {
      cheatInput.focus();
    }
  });

  function submitCheat() {
    if (cheatInput.value.trim().toLowerCase() === "likith") {
      activateGodMode();
      cheatInput.value = "";
    } else {
      cheatStatus.textContent = "Invalid cheat code.";
      cheatInput.value = "";
    }
  }

  activateButton.addEventListener("click", submitCheat);

  cheatInput.addEventListener("keydown", event => {
    event.stopPropagation();
    if (event.key === "Enter") submitCheat();
  });

  cheatInput.addEventListener("keyup", event => {
    event.stopPropagation();
  });

  disableButton.addEventListener("click", disableGodMode);

  updateCheatUI();


  // VELOCITY_BENCH_SITTING_V1
  let seated = false;
  let seatPosition = null;
  let seatRotation = 0;

  // VELOCITY_SITTING_POSE_FIX_V1
  // Keep direct-child character details aligned with the seated torso/head.
  const sittingDetailPositions = [];

  for (const object of group.children) {
    if (!object.name.startsWith("Explorer")) continue;

    // Leg accessories and footwear stay at their original heights.
    if (/Boot|Lace|Cargo|Knee Guard/i.test(object.name)) continue;

    const isArmPivot = object.name.includes("Arm Pivot");

    sittingDetailPositions.push({
      object,
      originalY: object.position.y,
      sittingOffset: isArmPivot ? -0.18 : -0.30
    });
  }

  function setExplorerSittingPose(sitting) {
    for (const item of sittingDetailPositions) {
      item.object.position.y =
        item.originalY + (sitting ? item.sittingOffset : 0);
    }

    // Arms extend gently forward while seated.
    for (let i = 0; i < animatedArms.length; i++) {
      animatedArms[i].rotation.x = sitting ? -0.75 : 0;
      animatedArms[i].rotation.z = i === 0 ? -0.08 : 0.08;
    }
  }
  function sitAt(x, y, z, rotation) {
    if (!enabled || seated) return false;

    seated = true;
    seatPosition = new THREE.Vector3(x, y, z);
    seatRotation = rotation;

    velocity.set(0, 0, 0);
    desiredVelocity.set(0, 0, 0);
    keys.clear();

    group.position.copy(seatPosition);
    group.rotation.y = seatRotation;

    torso.position.y = 1.35;
    head.position.y = 2.5;

    legs[0].rotation.x = -Math.PI / 2;
    legs[1].rotation.x = -Math.PI / 2;

    setExplorerSittingPose(true);

    return true;
  }

  function standUp() {
    if (!seated) return false;

    seated = false;

    torso.position.y = 1.65;
    head.position.y = 2.8;

    legs[0].rotation.x = 0;
    legs[1].rotation.x = 0;

    setExplorerSittingPose(false);

    // VELOCITY_BENCH_SAFE_EXIT_V1
    // Move the player outside the bench collision boundary.
    const exitDistance = 3.2;

    const forwardX = Math.sin(seatRotation);
    const forwardZ = Math.cos(seatRotation);

    const exitX = group.position.x + forwardX * exitDistance;
    const exitZ = group.position.z + forwardZ * exitDistance;

    if (!collides(exitX, exitZ)) {
      group.position.x = exitX;
      group.position.z = exitZ;
    }

    // Rooftop walking and edge-fall physics.
    const surface = landingSurface(
      group.position.x,
      group.position.z,
      group.position.y + 0.25
    );

    if (group.position.y > surface + 0.1 || airborne) {
      airborne = true;
      verticalSpeed += 32 * dt;
      group.position.y -= verticalSpeed * dt;

      if (group.position.y <= surface) {
        group.position.y = surface;
        verticalSpeed = 0;
        airborne = false;
      }
    } else {
      group.position.y = surface;
      verticalSpeed = 0;
      airborne = false;
    }

    velocity.set(0, 0, 0);
    desiredVelocity.set(0, 0, 0);
    keys.clear();

    seatPosition = null;
    return true;
  }


  let enabled = false;
  let yaw = 0;
  let pitch = DEFAULT_PITCH;
  let animationTime = 0;

  // VELOCITY_SMOOTH_GAIT_V1
  // Smoothly blend between walking and sprinting.
  let gaitSprintBlend = 0;

  const velocity = new THREE.Vector3();
  const desiredVelocity = new THREE.Vector3();
  const smoothedTarget = new THREE.Vector3();
  const desiredTarget = new THREE.Vector3();
  const desiredCamera = new THREE.Vector3();

  const movementKeys = new Set([
    'KeyW', 'KeyA', 'KeyS', 'KeyD',
    'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
    'ShiftLeft', 'ShiftRight'
  ]);

  const canvas = camera.parent?.userData?.canvas ||
    controls.domElement;

  // VELOCITY_FURNITURE_COLLISION_V1
  const furniture = scene.getObjectByName("Velocity Street Furniture");

  const furnitureColliders = [];

  if (furniture) {
    const matrix = new THREE.Matrix4();
    const position = new THREE.Vector3();
    const rotation = new THREE.Quaternion();
    const scale = new THREE.Vector3();

    for (const mesh of furniture.children) {
      if (!mesh.isInstancedMesh) continue;

      let radius = 0;

      if (mesh.name === "Velocity benchSeat") radius = 2.0;
      if (mesh.name.toLowerCase().includes("tree")) radius = 1.5;
      if (mesh.name.toLowerCase().includes("lamp")) radius = 0.9;
      if (mesh.name.toLowerCase().includes("light")) radius = 0.9;

      if (!radius) continue;

      for (let i = 0; i < mesh.count; i++) {
        mesh.getMatrixAt(i, matrix);
        matrix.decompose(position, rotation, scale);

        furnitureColliders.push({
          x: position.x,
          z: position.z,
          radius
        });
      }
    }
  }
  // VELOCITY_ROOFTOP_PHYSICS_V1
  let airborne = false;
  let verticalSpeed = 0;

  function rooftopAt(x, z, currentY = Infinity) {
    let result = null;

    for (const b of buildings) {
      if (!Number.isFinite(b.roofY)) continue;

      const inside =
        Math.abs(x - b.x) <= b.width / 2 - 0.5 &&
        Math.abs(z - b.z) <= b.depth / 2 - 0.5;

      if (!inside) continue;

      const roof = b.roofY + 0.4;

      if (roof > currentY + 0.15) continue;

      if (!result || roof > result.y) {
        result = { y: roof, building: b };
      }
    }

    return result;
  }

  function landingSurface(x, z, currentY = Infinity) {
    const ground = groundY(x, z);
    const rooftop = rooftopAt(x, z, currentY);

    return rooftop
      ? Math.max(ground, rooftop.y)
      : ground;
  }

  function rooftopUnderPlayer() {
    const roof = rooftopAt(
      group.position.x,
      group.position.z,
      group.position.y + 0.25
    );

    return roof &&
      Math.abs(group.position.y - roof.y) < 1.2;
  }

  // VELOCITY_ELEVATOR_GROUND_ACCESS_V1
  // Prevent obsolete building collisions from blocking elevator entrances.
  const elevatorGroundEntrances = [
    [-285, 300],
    [315, -300],
    [-285, -300],
    [315, 300],
    [-60, 75]
  ];

  function nearElevatorEntrance(x, z) {
    return elevatorGroundEntrances.some(([ex, ez]) =>
      Math.hypot(x - ex, z - ez) < 9
    );
  }

  function collides(x, z) {
    if (nearElevatorEntrance(x, z)) return false;
    for (const object of furnitureColliders) {
      if (
        Math.hypot(x - object.x, z - object.z) <
        object.radius + 0.45
      ) return true;
    }
    if (Math.abs(x) > 598 || Math.abs(z) > 598) return true;

    for (const b of buildings) {
      if (
        Math.abs(x - b.x) < b.width / 2 + 1 &&
        Math.abs(z - b.z) < b.depth / 2 + 1
      ) {
        const roof = Number.isFinite(b.roofY)
          ? b.roofY + 0.4
          : Infinity;

        // Above the roof, horizontal movement is allowed.
        if (group.position.y >= roof - 0.5) continue;

        return true;
      }
    }

    // VELOCITY_EXPLORER_MOVEMENT_V1: No arbitrary circular barrier.
    // VELOCITY_EXPLORER_LANDMARKS_V2 : Reserved project areas are freely explorable.

    if (Math.abs(x) < 32.5 || Math.abs(z) < 32.5) {
      const bridges = [-480, -300, -120, 120, 300, 480];

      const eastWest =
        Math.abs(x) <= 42.5 &&
        bridges.some(v => Math.abs(z - v) <= 9);

      const northSouth =
        Math.abs(z) <= 42.5 &&
        bridges.some(v => Math.abs(x - v) <= 9);

      const lkAccess =
        (Math.abs(x) <= 9 && Math.abs(z) <= 120) ||
        (Math.abs(z) <= 9 && Math.abs(x) <= 120);

      if (!eastWest && !northSouth && !lkAccess) return true;
    }

    return false;
  }

  function groundY(x, z) {
    const bridges = [-480, -300, -120, 120, 300, 480];

    if (
      Math.abs(x) <= 42.5 &&
      bridges.some(v => Math.abs(z - v) <= 9)
    ) return 0.93;

    if (
      Math.abs(z) <= 42.5 &&
      bridges.some(v => Math.abs(x - v) <= 9)
    ) return 0.93;

    if (
      Math.abs(x) <= 9 &&
      Math.abs(z) >= 47.5 &&
      Math.abs(z) <= 120
    ) {
      const d = Math.abs(z);
      return d <= 90 ? 4.5 : Math.max(
        0.9, 4.5 - (d - 90) * 3.6 / 30
      );
    }

    if (
      Math.abs(z) <= 9 &&
      Math.abs(x) >= 47.5 &&
      Math.abs(x) <= 120
    ) {
      const d = Math.abs(x);
      return d <= 90 ? 4.5 : Math.max(
        0.9, 4.5 - (d - 90) * 3.6 / 30
      );
    }

    if (
      Math.abs(x) <= 47.5 &&
      Math.abs(z) <= 47.5
    ) return 3;

    return 0.9;
  }

  function onKeyDown(event) {
    if (godMode && !event.repeat && destinations[event.code]) {
      event.preventDefault();
      cheatTeleport(event.code);
      return;
    }

    if (godMode && [
      "KeyW", "KeyA", "KeyS", "KeyD",
      "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight",
      "Space", "ControlLeft", "ControlRight",
      "ShiftLeft", "ShiftRight"
    ].includes(event.code)) {
      event.preventDefault();
      cheatKeys.add(event.code);
      return;
    }

    if (falling) {
      event.preventDefault();
      return;
    }

    if (!enabled) return;

    if (
      event.target instanceof HTMLInputElement ||
      event.target instanceof HTMLTextAreaElement
    ) return;

    if (movementKeys.has(event.code)) {
      event.preventDefault();
      keys.add(event.code);
    }
  }

  function onKeyUp(event) {
    cheatKeys.delete(event.code);
    keys.delete(event.code);
  }

  // VELOCITY_CAMERA_COLLISION_V1
  // Prevent the third-person camera from passing through buildings.
  const cameraCollisionRay = new THREE.Raycaster();
  const cameraCollisionDirection = new THREE.Vector3();
  const cameraCollisionTarget = new THREE.Vector3();
  const cameraCollisionMeshes = [];

  buildingGroup.traverse(object => {
    if (object.isMesh && object.geometry?.type === "BoxGeometry") {
      cameraCollisionMeshes.push(object);
    }
  });

  function protectCamera() {
    cameraCollisionTarget.copy(group.position);
    cameraCollisionTarget.y += CAMERA_TARGET_HEIGHT;

    cameraCollisionDirection
      .copy(camera.position)
      .sub(cameraCollisionTarget);

    const distance = cameraCollisionDirection.length();

    if (distance < 0.01) return;

    cameraCollisionDirection.normalize();

    cameraCollisionRay.set(
      cameraCollisionTarget,
      cameraCollisionDirection
    );

    cameraCollisionRay.near = 0;
    cameraCollisionRay.far = distance;

    const hits = cameraCollisionRay.intersectObjects(
      cameraCollisionMeshes,
      false
    );

    if (hits.length > 0) {
      const safeDistance = Math.max(0.7, hits[0].distance - 0.6);

      camera.position
        .copy(cameraCollisionTarget)
        .addScaledVector(cameraCollisionDirection, safeDistance);
    }
  }

  function onMouseMove(event) {
    if (!enabled) return;

    if (
      document.pointerLockElement !== canvas &&
      event.target !== canvas
    ) return;

    yaw -= event.movementX * HORIZONTAL_SENSITIVITY;

    pitch = THREE.MathUtils.clamp(
      pitch + event.movementY * MOUSE_SENSITIVITY,
      MIN_PITCH,
      MAX_PITCH
    );
  }

  function onCanvasClick() {
    if (!enabled) return;

    if (document.pointerLockElement !== canvas) {
      canvas.requestPointerLock?.().catch(() => {});
    }
  }

  function onBlur() {
    keys.clear();
    cheatKeys.clear();
  }

  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
  window.addEventListener('blur', onBlur);
  canvas.addEventListener('mousemove', onMouseMove);
  canvas.addEventListener('click', onCanvasClick);

  function setEnabled(value) {
    enabled = Boolean(value);
    keys.clear();
    velocity.set(0, 0, 0);
    desiredVelocity.set(0, 0, 0);

    controls.enabled = !enabled;
    group.visible = enabled;

    if (enabled) {
      group.position.y = groundY(
        group.position.x,
        group.position.z
      );

      smoothedTarget.copy(group.position);
      smoothedTarget.y += CAMERA_TARGET_HEIGHT;

      const horizontalDistance =
        CAMERA_DISTANCE * Math.cos(pitch);

      camera.position.set(
        group.position.x + Math.sin(yaw) * horizontalDistance,
        smoothedTarget.y + Math.sin(pitch) * CAMERA_DISTANCE,
        group.position.z + Math.cos(yaw) * horizontalDistance
      );

      const upwardLook = Math.max(0, -Math.tan(pitch) * CAMERA_DISTANCE);
const lookTarget = smoothedTarget.clone();
lookTarget.y += Math.min(upwardLook, 75);
camera.lookAt(lookTarget);
    } else if (document.pointerLockElement === canvas) {
      document.exitPointerLock();
    }
  }

  function update(delta) {
    if (!enabled) return;

    const dt = Math.min(delta, 0.05);
    if (godMode) {
      const horizontal =
        Number(cheatKeys.has("KeyD") || cheatKeys.has("ArrowRight")) -
        Number(cheatKeys.has("KeyA") || cheatKeys.has("ArrowLeft"));

      const forward =
        Number(cheatKeys.has("KeyW") || cheatKeys.has("ArrowUp")) -
        Number(cheatKeys.has("KeyS") || cheatKeys.has("ArrowDown"));

      const vertical =
        Number(cheatKeys.has("Space")) -
        Number(cheatKeys.has("ControlLeft") ||
               cheatKeys.has("ControlRight"));

      const direction = new THREE.Vector3(
        -Math.sin(yaw) * forward + Math.cos(yaw) * horizontal,
        vertical,
        -Math.cos(yaw) * forward - Math.sin(yaw) * horizontal
      );

      if (direction.lengthSq() > 0) {
        direction.normalize();

        const turbo =
          cheatKeys.has("ShiftLeft") ||
          cheatKeys.has("ShiftRight");

        direction.multiplyScalar(
          (turbo ? GOD_TURBO : GOD_SPEED) * dt
        );

        group.position.add(direction);

        group.position.x = THREE.MathUtils.clamp(
          group.position.x, -590, 590
        );

        group.position.z = THREE.MathUtils.clamp(
          group.position.z, -590, 590
        );

        group.position.y = THREE.MathUtils.clamp(
          group.position.y, 2, 650
        );
      }

      snapCheatCamera();
      return;
    }

    if (falling) {
      const previousY = group.position.y;
      fallSpeed += 32 * dt;
      group.position.y -= fallSpeed * dt;

      const landingY = landingSurface(
        group.position.x,
        group.position.z,
        previousY
      );

      if (group.position.y <= landingY) {
        group.position.y = landingY;
        falling = false;
        airborne = false;
        fallSpeed = 0;
        verticalSpeed = 0;
        updateCheatUI();
      }

      snapCheatCamera();
      return;
    }

    if (seated) {
      group.position.copy(seatPosition);
      group.rotation.y = seatRotation;
      velocity.set(0, 0, 0);
      desiredVelocity.set(0, 0, 0);
      keys.clear();
      return;
    }


    const horizontal =
      Number(keys.has('KeyD') || keys.has('ArrowRight')) -
      Number(keys.has('KeyA') || keys.has('ArrowLeft'));

    const vertical =
      Number(keys.has('KeyW') || keys.has('ArrowUp')) -
      Number(keys.has('KeyS') || keys.has('ArrowDown'));

    const moving = horizontal !== 0 || vertical !== 0;

    const sprint =
      keys.has('ShiftLeft') || keys.has('ShiftRight');

    const speed = sprint ? RUN_SPEED : WALK_SPEED;

    const forwardX = -Math.sin(yaw);
    const forwardZ = -Math.cos(yaw);
    const rightX = Math.cos(yaw);
    const rightZ = -Math.sin(yaw);

    if (moving) {
      const length = Math.hypot(horizontal, vertical);

      desiredVelocity.set(
        (forwardX * vertical + rightX * horizontal) / length,
        0,
        (forwardZ * vertical + rightZ * horizontal) / length
      ).multiplyScalar(speed);
    } else {
      desiredVelocity.set(0, 0, 0);
    }

    const movementSmoothing =
      1 - Math.exp(-ACCELERATION * dt);

    velocity.lerp(desiredVelocity, movementSmoothing);

    const nextX = group.position.x + velocity.x * dt;
    const nextZ = group.position.z + velocity.z * dt;

    // Sliding collisions allow movement along building walls.
    if (!collides(nextX, group.position.z)) {
      group.position.x = nextX;
    } else {
      velocity.x = 0;
    }

    if (!collides(group.position.x, nextZ)) {
      group.position.z = nextZ;
    } else {
      velocity.z = 0;
    }

    // Rooftop walking and edge-fall physics.
    const surface = landingSurface(
      group.position.x,
      group.position.z,
      group.position.y + 0.25
    );

    if (group.position.y > surface + 0.1 || airborne) {
      airborne = true;
      verticalSpeed += 32 * dt;
      group.position.y -= verticalSpeed * dt;

      if (group.position.y <= surface) {
        group.position.y = surface;
        verticalSpeed = 0;
        airborne = false;
      }
    } else {
      group.position.y = surface;
      verticalSpeed = 0;
      airborne = false;
    }

    const actualSpeed = velocity.length();

    if (actualSpeed > 0.15) {
      const targetRotation = Math.atan2(
        velocity.x,
        velocity.z
      );

      const difference = Math.atan2(
        Math.sin(targetRotation - group.rotation.y),
        Math.cos(targetRotation - group.rotation.y)
      );

      const turnSmoothing =
        1 - Math.exp(-CHARACTER_TURN_SPEED * dt);

      group.rotation.y += difference * turnSmoothing;

      animationTime += dt * actualSpeed;

      // Faster cadence and a longer stride when sprinting.
      // Gradually transition stride cadence and amplitude.
      const gaitTarget = sprint ? 1 : 0;
      const gaitEase = 1 - Math.exp(-5 * dt);

      gaitSprintBlend +=
        (gaitTarget - gaitSprintBlend) * gaitEase;

      const strideFrequency =
        1.8 + gaitSprintBlend * 1.0;

      const strideAmplitude =
        0.48 + gaitSprintBlend * 0.20;
      const stride =
        Math.sin(animationTime * strideFrequency) * strideAmplitude;
      // VELOCITY_RUNNING_POSTURE_V1
      // Forward running lean with a smooth return toward upright.
      const runningLean = -0.10 * gaitSprintBlend;
      const postureEase = 1 - Math.exp(-7 * dt);

      torso.rotation.x +=
        (runningLean - torso.rotation.x) * postureEase;

      head.rotation.x +=
        (runningLean * 0.45 - head.rotation.x) * postureEase;
      // VELOCITY_NATURAL_BODY_MOTION_V1
      // Keep the torso, its clothing, and head details moving together.
      const bodyBounce =
        Math.abs(Math.sin(animationTime * strideFrequency * 2)) *
        (sprint ? 0.065 : 0.035);

      torso.position.y = 1.65 + bodyBounce;
      head.position.y =
        2.8 + bodyBounce * 0.8 +
        Math.sin(animationTime * strideFrequency) * 0.012;


      // VELOCITY_HEAD_GESTURES_V1
      // Small head movements while walking or sprinting.
      const headMotion = Math.sin(
        animationTime * strideFrequency
      );

      head.rotation.y +=
        (headMotion * (sprint ? 0.045 : 0.025) -
        head.rotation.y) * (1 - Math.exp(-7 * dt));

      head.rotation.z +=
        (headMotion * (sprint ? 0.025 : 0.015) -
        head.rotation.z) * (1 - Math.exp(-7 * dt));
      legs[0].rotation.x = stride;
      legs[1].rotation.x = -stride;
      // Procedural knee bending follows the alternating stride.
      for (let i = 0; i < animatedKnees.length; i++) {
        const phase = i === 0 ? stride : -stride;
        const targetBend =
          Math.max(0, -phase) * (sprint ? 0.95 : 0.65);

        animatedKnees[i].rotation.x +=
          (targetBend - animatedKnees[i].rotation.x) *
          (1 - Math.exp(-14 * dt));
      }


      // Arms counter-swing naturally against the legs.
      animatedArms[0].rotation.x = -stride * 0.78;
      animatedArms[1].rotation.x = stride * 0.78;

      // Bend elbows naturally with each step.
      for (let i = 0; i < animatedElbows.length; i++) {
        const phase = i === 0 ? stride : -stride;
        const elbowBend =
          -0.18 - Math.max(0, phase) * (sprint ? 0.95 : 0.45);

        animatedElbows[i].rotation.x +=
          (elbowBend - animatedElbows[i].rotation.x) *
          (1 - Math.exp(-12 * dt));
      }
      // VELOCITY_NATURAL_SHOULDER_MOTION_V1
      // Subtle shoulder sway follows the stride without moving the torso
      // independently of its separately positioned accessories.
      const shoulderSway =
        Math.sin(animationTime * strideFrequency) *
        (sprint ? 0.12 : 0.075);

      animatedArms[0].rotation.z = -0.08 - shoulderSway;
      animatedArms[1].rotation.z = 0.08 + shoulderSway;
    } else {
      // Return the upper body to neutral when standing still.
      const postureSettle = 1 - Math.exp(-6 * dt);

      torso.rotation.x +=
        (0 - torso.rotation.x) * postureSettle;

      head.rotation.x +=
        (0 - head.rotation.x) * postureSettle;
      // VELOCITY_IDLE_BREATHING_V1
      // Subtle standing breath; torso accessories follow their parent.
      animationTime += dt;

      const breathing = Math.sin(animationTime * 1.5);

      torso.position.y = 1.65 + breathing * 0.012;
      head.position.y = 2.8 + breathing * 0.018;

      // Gentle idle head turns and relaxed shoulder movement.
      const idleHeadTurn = Math.sin(animationTime * 0.42) * 0.085;
      const idleHeadTilt = Math.sin(animationTime * 0.33) * 0.018;
      const idleEase = 1 - Math.exp(-3 * dt);

      head.rotation.y +=
        (idleHeadTurn - head.rotation.y) * idleEase;
      head.rotation.z +=
        (idleHeadTilt - head.rotation.z) * idleEase;

      // Return elbows to a comfortable resting position.
      for (const elbow of animatedElbows) {
        elbow.rotation.x +=
          (-0.15 - elbow.rotation.x) *
          (1 - Math.exp(-6 * dt));
      }
      // Relax both knees when the explorer stops moving.
      for (const knee of animatedKnees) {
        knee.rotation.x +=
          (0 - knee.rotation.x) *
          (1 - Math.exp(-10 * dt));
      }
      // Smoothly settle into a relaxed idle stance.
      const settle = 1 - Math.exp(-10 * dt);

      legs[0].rotation.x += (0 - legs[0].rotation.x) * settle;
      legs[1].rotation.x += (0 - legs[1].rotation.x) * settle;

      animatedArms[0].rotation.x +=
        (0 - animatedArms[0].rotation.x) * settle;
      animatedArms[1].rotation.x +=
        (0 - animatedArms[1].rotation.x) * settle;

      animatedArms[0].rotation.z +=
        (-0.08 - animatedArms[0].rotation.z) * settle;
      animatedArms[1].rotation.z +=
        (0.08 - animatedArms[1].rotation.z) * settle;
    }

    desiredTarget.copy(group.position);
    desiredTarget.y += CAMERA_TARGET_HEIGHT;

    const followSmoothing =
      1 - Math.exp(-CAMERA_FOLLOW_SPEED * dt);

    smoothedTarget.lerp(
      desiredTarget,
      followSmoothing
    );

    const horizontalDistance =
      CAMERA_DISTANCE * Math.cos(pitch);

    desiredCamera.set(
      smoothedTarget.x +
        Math.sin(yaw) * horizontalDistance,
      smoothedTarget.y +
        Math.sin(pitch) * CAMERA_DISTANCE,
      smoothedTarget.z +
        Math.cos(yaw) * horizontalDistance
    );

    camera.position.lerp(
      desiredCamera,
      followSmoothing
    );

    // VELOCITY_CAMERA_GROUND_PROTECTION_V3
    const cameraGround = groundY(
      camera.position.x,
      camera.position.z
    );

    camera.position.y = Math.max(
      camera.position.y,
      cameraGround + 2.5
    );

    const previousRotation = camera.quaternion.clone();

    const upwardLook = Math.max(0, -Math.tan(pitch) * CAMERA_DISTANCE);
const lookTarget = smoothedTarget.clone();
lookTarget.y += Math.min(upwardLook, 75);
camera.lookAt(lookTarget);

    const targetRotation = camera.quaternion.clone();

    camera.quaternion.copy(previousRotation);

    camera.quaternion.slerp(
      targetRotation,
      1 - Math.exp(-CAMERA_LOOK_SPEED * dt)
    );

    protectCamera();
  }

  function teleport(x, z) {
    if (collides(x, z)) return false;

    group.position.set(x, groundY(x, z), z);

    velocity.set(0, 0, 0);
    desiredVelocity.set(0, 0, 0);
    keys.clear();

    smoothedTarget.copy(group.position);
    smoothedTarget.y += CAMERA_TARGET_HEIGHT;

    return true;
  }

  setEnabled(false);

  return {
    group,
    sitAt,
    standUp,
    get seated() { return seated; },
    get godMode() { return godMode; },
    setEnabled,
    update,
    teleport,
    get enabled() {
      return enabled;
    }
  };
}


