import * as THREE from "three";

const TRAFFIC_COUNT = 16;
const trafficGroup = new THREE.Group();
trafficGroup.name = "Velocity Moving Traffic E5.5D13";

const state = {
  status: "loading",
  expected: TRAFFIC_COUNT,
  loaded: 0,
  enabled: true,
  speedMultiplier: 1,
  group: trafficGroup,
  cars: []
};

window.velocityMovingTraffic = state;

const colors = [
  0x00bfff,
  0xff3344,
  0xffffff,
  0x222833,
  0xffcc22,
  0x12d9a0,
  0x9955ff,
  0xd9d9d9
];

function createCar(color) {
  const car = new THREE.Group();

  const bodyMaterial = new THREE.MeshStandardMaterial({
    color,
    metalness: 0.65,
    roughness: 0.3
  });

  const glassMaterial = new THREE.MeshStandardMaterial({
    color: 0x142a40,
    metalness: 0.25,
    roughness: 0.18
  });

  const wheelMaterial = new THREE.MeshStandardMaterial({
    color: 0x101114,
    roughness: 0.9
  });

  const body = new THREE.Mesh(
    new THREE.BoxGeometry(2.1, 0.65, 4.2),
    bodyMaterial
  );

  body.position.y = 0.65;
  car.add(body);

  const cabin = new THREE.Mesh(
    new THREE.BoxGeometry(1.7, 0.65, 2.1),
    glassMaterial
  );

  cabin.position.set(0, 1.28, -0.2);
  car.add(cabin);

  const wheelGeometry = new THREE.CylinderGeometry(
    0.43, 0.43, 0.26, 12
  );

  wheelGeometry.rotateZ(Math.PI / 2);

  for (const x of [-1.08, 1.08]) {
    for (const z of [-1.35, 1.35]) {
      const wheel = new THREE.Mesh(
        wheelGeometry,
        wheelMaterial
      );

      wheel.position.set(x, 0.43, z);
      car.add(wheel);
    }
  }

  const headlightMaterial = new THREE.MeshBasicMaterial({
    color: 0xfff4c8
  });

  const taillightMaterial = new THREE.MeshBasicMaterial({
    color: 0xff2035
  });

  for (const x of [-0.75, 0.75]) {
    const headlight = new THREE.Mesh(
      new THREE.BoxGeometry(0.38, 0.18, 0.06),
      headlightMaterial
    );

    headlight.position.set(x, 0.72, -2.13);
    car.add(headlight);

    const taillight = new THREE.Mesh(
      new THREE.BoxGeometry(0.38, 0.18, 0.06),
      taillightMaterial
    );

    taillight.position.set(x, 0.72, 2.13);
    car.add(taillight);
  }

  car.traverse(object => {
    if (object.isMesh) {
      object.castShadow = false;
      object.receiveShadow = false;
    }
  });

  return car;
}

// Cars use the existing bridge-aligned road corridors.
// The route coordinates are intentionally kept separate
// from the finalized city and bridge geometry.

const corridors = [
  { axis: "x", fixed: -300 },
  { axis: "x", fixed: -120 },
  { axis: "x", fixed: 120 },
  { axis: "x", fixed: 300 },
  { axis: "z", fixed: -300 },
  { axis: "z", fixed: -120 },
  { axis: "z", fixed: 120 },
  { axis: "z", fixed: 300 }
];

const vehicles = [];

function install(scene) {
  if (state.status !== "loading") return;

  scene.add(trafficGroup);

  for (let i = 0; i < TRAFFIC_COUNT; i++) {
    const corridor = corridors[i % corridors.length];

    const direction = i % 2 === 0 ? 1 : -1;
    const laneOffset = direction * 3.4;

    const car = createCar(colors[i % colors.length]);

    const travelDistance = 960;
    const start = -480 + (i * 137) % 960;

    const vehicle = {
      mesh: car,
      corridor,
      direction,
      laneOffset,
      distance: start,
      speed: 9 + (i % 5) * 1.5,
      travelDistance
    };

    trafficGroup.add(car);
    vehicles.push(vehicle);
    state.cars.push(car);
  }

  state.loaded = vehicles.length;
  state.status = "ready";

  console.log(
    `[Velocity Traffic] ${state.loaded} moving cars ready`
  );
}

function updateCar(vehicle, delta) {
  vehicle.distance +=
    vehicle.speed *
    vehicle.direction *
    delta *
    state.speedMultiplier;

  if (vehicle.distance > 480) {
    vehicle.distance = -480;
  }

  if (vehicle.distance < -480) {
    vehicle.distance = 480;
  }

  const car = vehicle.mesh;

  if (vehicle.corridor.axis === "x") {
    car.position.set(
      vehicle.distance,
      1.25,
      vehicle.corridor.fixed + vehicle.laneOffset
    );

    car.rotation.y =
      vehicle.direction > 0
        ? -Math.PI / 2
        : Math.PI / 2;
  } else {
    car.position.set(
      vehicle.corridor.fixed + vehicle.laneOffset,
      1.25,
      vehicle.distance
    );

    car.rotation.y =
      vehicle.direction > 0
        ? Math.PI
        : 0;
  }
}

let previousTime = performance.now();

function animate(time) {
  requestAnimationFrame(animate);

  const delta = Math.min(
    (time - previousTime) / 1000,
    0.05
  );

  previousTime = time;

  trafficGroup.visible = state.enabled;

  if (!state.enabled) return;

  for (const vehicle of vehicles) {
    updateCar(vehicle, delta);
  }
}

function waitForScene() {
  const bridgeScene =
    window.velocityGLBBridges?.group?.parent;

  if (bridgeScene && bridgeScene.isScene) {
    install(bridgeScene);
    requestAnimationFrame(animate);
    return;
  }

  setTimeout(waitForScene, 250);
}

waitForScene();