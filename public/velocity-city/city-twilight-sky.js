import * as THREE from "three";

// VELOCITY_TWILIGHT_SKY_V1
// Fixed sunset, cratered moon, stars, moving clouds, birds and aircraft.

export function createVelocityTwilightSky(scene) {
  const root = new THREE.Group();
  root.name = "Velocity Permanent Twilight Sky";
  scene.add(root);

  const skyRadius = 3700;

  // Smooth permanent twilight gradient.
  const skyGeometry = new THREE.SphereGeometry(skyRadius, 48, 32);
  const skyMaterial = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    uniforms: {},
    vertexShader: `
      varying vec3 vDirection;
      void main() {
        vec4 worldPosition = modelMatrix * vec4(position, 1.0);
        vDirection = normalize(worldPosition.xyz);
        gl_Position = projectionMatrix * viewMatrix * worldPosition;
      }
    `,
    fragmentShader: `
      varying vec3 vDirection;
      void main() {
        float h = normalize(vDirection).y;
        vec3 horizon = vec3(0.92, 0.39, 0.30);
        vec3 rose = vec3(0.48, 0.30, 0.52);
        vec3 dusk = vec3(0.105, 0.15, 0.34);
        vec3 zenith = vec3(0.025, 0.045, 0.13);

        vec3 color = mix(horizon, rose, smoothstep(-0.02, 0.12, h));
        color = mix(color, dusk, smoothstep(0.08, 0.42, h));
        color = mix(color, zenith, smoothstep(0.38, 0.88, h));

        gl_FragColor = vec4(color, 1.0);
      }
    `
  });

  const sky = new THREE.Mesh(skyGeometry, skyMaterial);
  sky.renderOrder = -1000;
  root.add(sky);

  // Create a detailed procedural lunar surface texture.
  // No external image downloads are required.
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");

  const lunarGradient = ctx.createLinearGradient(0, 0, 1024, 512);
  lunarGradient.addColorStop(0, "#777a83");
  lunarGradient.addColorStop(0.5, "#c4c3bd");
  lunarGradient.addColorStop(1, "#777984");
  ctx.fillStyle = lunarGradient;
  ctx.fillRect(0, 0, 1024, 512);

  let seed = 731942;
  function random() {
    seed = (1664525 * seed + 1013904223) >>> 0;
    return seed / 4294967296;
  }

  // Lunar maria and mottled terrain.
  for (let i = 0; i < 9500; i++) {
    const x = random() * 1024;
    const y = random() * 512;
    const r = 1 + random() * 9;
    const shade = Math.floor(90 + random() * 115);
    ctx.fillStyle = `rgba(${shade},${shade},${shade + 3},${0.035 + random() * 0.13})`;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // Crater rims, dark floors and subtle inner highlights.
  for (let i = 0; i < 240; i++) {
    const x = random() * 1024;
    const y = random() * 512;
    const r = 2 + Math.pow(random(), 2) * 29;

    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(48,51,57,0.18)";
    ctx.fill();

    ctx.beginPath();
    ctx.ellipse(x - r * 0.1, y - r * 0.13, r * 0.9, r * 0.78, 0, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(239,238,226,0.24)";
    ctx.lineWidth = Math.max(1, r * 0.09);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(x + r * 0.12, y + r * 0.12, r * 0.68, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(54,56,62,0.12)";
    ctx.fill();
  }

  const moonTexture = new THREE.CanvasTexture(canvas);
  moonTexture.colorSpace = THREE.SRGBColorSpace;
  moonTexture.anisotropy = 4;

  const moon = new THREE.Mesh(
    new THREE.SphereGeometry(54, 64, 48),
    new THREE.MeshBasicMaterial({
      map: moonTexture,
      color: 0xd6d5d0
    })
  );
  moon.name = "Velocity Cratered Twilight Moon";
  moon.position.set(1750, 720, -500);
  root.add(moon);

  // VELOCITY_SOFT_RADIAL_HALOS_V1
  // Shared radial glow: transparent edges prevent square sprite artifacts.
  const glowCanvas = document.createElement("canvas");
  glowCanvas.width = 128;
  glowCanvas.height = 128;

  const glowContext = glowCanvas.getContext("2d");
  const glowGradient = glowContext.createRadialGradient(
    64, 64, 2, 64, 64, 64
  );
  glowGradient.addColorStop(0, "rgba(255,255,255,0.8)");
  glowGradient.addColorStop(0.22, "rgba(255,255,255,0.35)");
  glowGradient.addColorStop(0.55, "rgba(255,255,255,0.09)");
  glowGradient.addColorStop(1, "rgba(255,255,255,0)");

  glowContext.fillStyle = glowGradient;
  glowContext.fillRect(0, 0, 128, 128);

  const radialGlowTexture = new THREE.CanvasTexture(glowCanvas);
  radialGlowTexture.colorSpace = THREE.SRGBColorSpace;

  const halo = new THREE.Sprite(new THREE.SpriteMaterial({
    map: radialGlowTexture,
    color: 0x9aaddd,
    transparent: true,
    opacity: 0.32,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    toneMapped: false
  }));

  halo.name = "Velocity Soft Moon Halo";
  halo.position.copy(moon.position);
  halo.scale.set(155, 155, 1);
  root.add(halo);

  // Fixed setting sun, opposite the moon.
  const sun = new THREE.Mesh(
    new THREE.SphereGeometry(47, 40, 32),
    new THREE.MeshBasicMaterial({ color: 0xffb16f })
  );
  sun.name = "Velocity Setting Sun";
  sun.position.set(-1750, 510, -500);
  root.add(sun);

  const sunHalo = new THREE.Sprite(new THREE.SpriteMaterial({
    map: radialGlowTexture,
    color: 0xff985e,
    transparent: true,
    opacity: 0.48,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    toneMapped: false
  }));

  sunHalo.name = "Velocity Soft Sunset Glow";
  sunHalo.position.copy(sun.position);
  sunHalo.scale.set(175, 175, 1);
  root.add(sunHalo);

  // Fixed stars across the upper sky.
  const starPositions = [];
  for (let i = 0; i < 1800; i++) {
    const a = random() * Math.PI * 2;
    const h = 0.12 + random() * 0.88;
    const radius = 3450;
    const horizontal = Math.sqrt(1 - h * h);

    starPositions.push(
      Math.cos(a) * horizontal * radius,
      h * radius,
      Math.sin(a) * horizontal * radius
    );
  }

  const starGeometry = new THREE.BufferGeometry();
  starGeometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(starPositions, 3)
  );

  const stars = new THREE.Points(
    starGeometry,
    new THREE.PointsMaterial({
      color: 0xe5e9ff,
      size: 3.2,
      sizeAttenuation: false,
      transparent: true,
      opacity: 0.82,
      depthWrite: false
    })
  );
  stars.name = "Velocity Twilight Stars";
  root.add(stars);

  // Lightweight cloud banks made from shared sphere geometry.
  const cloudGroup = new THREE.Group();
  cloudGroup.name = "Velocity Moving Twilight Clouds";
  root.add(cloudGroup);

  const cloudGeometry = new THREE.SphereGeometry(1, 10, 7);
  const cloudMaterials = [
    new THREE.MeshLambertMaterial({
      color: 0xc1a0b1, transparent: true, opacity: 0.43
    }),
    new THREE.MeshLambertMaterial({
      color: 0x7d8aaa, transparent: true, opacity: 0.35
    }),
    new THREE.MeshLambertMaterial({
      color: 0xe2a18d, transparent: true, opacity: 0.32
    })
  ];

  const clouds = [];

  for (let i = 0; i < 34; i++) {
    const cloud = new THREE.Group();
    const width = 20 + random() * 35;
    const puffCount = 4 + Math.floor(random() * 4);

    for (let j = 0; j < puffCount; j++) {
      const puff = new THREE.Mesh(
        cloudGeometry,
        cloudMaterials[i % cloudMaterials.length]
      );

      puff.position.set(
        (random() - 0.5) * width,
        random() * 8,
        (random() - 0.5) * 13
      );
      puff.scale.set(
        7 + random() * 12,
        3 + random() * 5,
        5 + random() * 8
      );
      cloud.add(puff);
    }

    cloud.position.set(
      (random() - 0.5) * 2400,
      235 + random() * 180,
      (random() - 0.5) * 2200
    );

    cloud.userData.speed = 1.5 + random() * 3;
    cloud.userData.originZ = cloud.position.z;
    cloudGroup.add(cloud);
    clouds.push(cloud);
  }

  // VELOCITY_SKY_BIRDS_EXPANDED_V1
  // 18 larger birds distributed across the twilight skyline.
  const birdGroup = new THREE.Group();
  birdGroup.name = "Velocity Sky Birds";
  root.add(birdGroup);

  const birdMaterial = new THREE.MeshBasicMaterial({
    color: 0x252c40,
    side: THREE.DoubleSide
  });

  const birds = [];

  for (let i = 0; i < 18; i++) {
    const bird = new THREE.Group();

    const wingGeometry = new THREE.BufferGeometry();
    wingGeometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute([
        -6, 0, 0,
         0, 1.8, 0,
         0, 0, 0,
         0, 0, 0,
         0, 1.8, 0,
         6, 0, 0
      ], 3)
    );
    wingGeometry.computeVertexNormals();

    bird.add(new THREE.Mesh(wingGeometry, birdMaterial));
    bird.position.set(
      -1100 + i * 125,
      130 + (i % 5) * 22,
      -520 + (i % 7) * 145
    );

    birdGroup.add(bird);
    birds.push({
      object: bird,
      originY: bird.position.y,
      phase: random() * Math.PI * 2,
      speed: 8 + random() * 6
    });
  }

  // VELOCITY_MIGRATING_V_FLOCKS_V1
  // Three migrating flocks, nine birds per V formation.
  const migrationFlocks = [];

  if (birds.length > 0) {
    for (let flockIndex = 0; flockIndex < 3; flockIndex++) {
      const flock = new THREE.Group();
      flock.name = `Migrating V Flock ${flockIndex + 1}`;

      // One leading bird and four pairs trailing in a V.
      for (let row = 0; row < 5; row++) {
        const pairCount = row === 0 ? 1 : 2;

        for (let sideIndex = 0; sideIndex < pairCount; sideIndex++) {
          const bird = birds[0].object.clone(true);
          bird.position.set(0, 0, 0);
          bird.rotation.set(0, 0, 0);
          bird.scale.setScalar(0.8);

          const side = row === 0 ? 0 : (sideIndex === 0 ? -1 : 1);

          bird.position.x = -row * 15;
          bird.position.y = -row * 2.2;
          bird.position.z = side * row * 13;

          flock.add(bird);
        }
      }

      flock.position.set(
        -1100 - flockIndex * 650,
        195 + flockIndex * 48,
        -350 + flockIndex * 350
      );

      birdGroup.add(flock);

      migrationFlocks.push({
        object: flock,
        speed: 15 + flockIndex * 3,
        originY: flock.position.y,
        phase: flockIndex * 2.1
      });
    }
  }
  // Small low-detail aircraft, well above the city.
  const planeGroup = new THREE.Group();
  planeGroup.name = "Velocity Distant Aircraft";
  root.add(planeGroup);

  const planeMaterial = new THREE.MeshLambertMaterial({
    color: 0xd4d9e6
  });

  const planes = [];

  for (let i = 0; i < 2; i++) {
    const aircraft = new THREE.Group();

    const fuselage = new THREE.Mesh(
      new THREE.BoxGeometry(2.2, 1.6, 20),
      planeMaterial
    );
    aircraft.add(fuselage);

    const wings = new THREE.Mesh(
      new THREE.BoxGeometry(18, 0.45, 4.2),
      planeMaterial
    );
    aircraft.add(wings);

    const tail = new THREE.Mesh(
      new THREE.BoxGeometry(7, 0.4, 3),
      planeMaterial
    );
    tail.position.z = 7;
    aircraft.add(tail);

    aircraft.position.set(-900 + i * 950, 320 + i * 65, -900 - i * 150);
    planeGroup.add(aircraft);

    planes.push({
      object: aircraft,
      speed: 18 + i * 5
    });
  }

  let time = 0;

  function update(dt) {
    time += Math.min(Math.max(dt || 0, 0), 0.05);

    for (const cloud of clouds) {
      cloud.position.x += cloud.userData.speed * dt;
      if (cloud.position.x > 1350) cloud.position.x = -1350;
    }

    for (const bird of birds) {
      bird.object.position.x += bird.speed * dt;
      bird.object.position.y =
        bird.originY + Math.sin(time * 3 + bird.phase) * 2;

      if (bird.object.position.x > 1200) {
        bird.object.position.x = -1200;
      }
    }
    for (const flock of migrationFlocks) {
      flock.object.position.x += flock.speed * dt;
      flock.object.position.y =
        flock.originY + Math.sin(time * 0.65 + flock.phase) * 3;

      if (flock.object.position.x > 1500) {
        flock.object.position.x = -1500;
      }
    }

    for (const plane of planes) {
      plane.object.position.x += plane.speed * dt;

      if (plane.object.position.x > 1300) {
        plane.object.position.x = -1300;
      }
    }
  }

  console.log("[Velocity Twilight Sky]", {
    stars: 1800,
    clouds: clouds.length,
    birds: birds.length,
    migratingFlocks: migrationFlocks.length,
    planes: planes.length,
    moon: "procedural crater texture"
  });

  return { root, update };
}