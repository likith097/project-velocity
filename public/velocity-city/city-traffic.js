import * as THREE from "three";

// VELOCITY_TRAFFIC_V1
// Initial traffic test: separate lanes, fixed speeds and safe spacing.

export function createCityTraffic(scene, trafficPlayer = null) {
  const group = new THREE.Group();
  group.name = "Velocity City Traffic";
  scene.add(group);

  const roads = [-480, -300, -120, 120, 300, 480];
  const cars = [];

  const colors = [
    0x1686d9, 0xe84c3d, 0xf4f4f4,
    0x222831, 0xe6b83e, 0x21a67a
  ];

  const bodyGeometry = new THREE.BoxGeometry(3.2, 1, 5.8);
  const cabinGeometry = new THREE.BoxGeometry(2.5, 0.85, 2.8);
  const wheelGeometry = new THREE.CylinderGeometry(0.55, 0.55, 0.32, 10);

  const glass = new THREE.MeshLambertMaterial({ color: 0x20394e });
  const rubber = new THREE.MeshLambertMaterial({ color: 0x17191c });

  // VELOCITY_MIXED_FLEET_V4
  const vehicleTypes = [
    "sedan", "suv", "pickup", "van", "bus", "boxTruck"
  ];

  const metal = new THREE.MeshLambertMaterial({ color: 0xb8c3cb });
  const lights = new THREE.MeshBasicMaterial({ color: 0xffe6a6 });
  const tailLights = new THREE.MeshBasicMaterial({ color: 0xe83c35 });

  function createCar(color, type = "sedan") {
    const car = new THREE.Group();
    car.userData.vehicleType = type;

    const paint = new THREE.MeshLambertMaterial({ color });

    function part(w, h, l, material, x, y, z) {
      const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(w, h, l),
        material
      );
      mesh.position.set(x, y, z);
      car.add(mesh);
      return mesh;
    }

    let width = 3.2;
    let length = 5.8;
    let height = 1.0;
    let cabinLength = 2.8;
    let cabinHeight = 0.85;
    let cabinZ = 0;

    if (type === "suv") {
      width = 3.5;
      length = 6.5;
      height = 1.3;
      cabinLength = 3.9;
      cabinHeight = 1.2;
    } else if (type === "pickup") {
      width = 3.5;
      length = 7.2;
      height = 1.25;
      cabinLength = 2.6;
      cabinHeight = 1.1;
      cabinZ = -1.0;
    } else if (type === "van") {
      width = 3.6;
      length = 7.8;
      height = 1.8;
      cabinLength = 5.2;
      cabinHeight = 1.5;
    } else if (type === "bus") {
      width = 3.8;
      length = 11.5;
      height = 1.6;
      cabinLength = 10.4;
      cabinHeight = 2.1;
    } else if (type === "boxTruck") {
      width = 3.7;
      length = 10.5;
      height = 1.5;
      cabinLength = 2.5;
      cabinHeight = 1.6;
      cabinZ = -3.1;
    }

    part(width, height, length, paint, 0, 1.05, 0);

    if (type === "boxTruck") {
      part(width - 0.1, 2.8, 6.5, metal, 0, 2.8, 1.7);
      part(width - 0.5, cabinHeight, cabinLength,
        glass, 0, 2.1, cabinZ);
    } else {
      part(width - 0.5, cabinHeight, cabinLength,
        glass, 0, 1.6 + height * 0.35, cabinZ);

      if (type === "pickup") {
        part(width - 0.25, 0.2, 2.8, metal, 0, 1.72, 2.05);
      }
    }

    const wheelRadius = type === "bus" || type === "boxTruck"
      ? 0.7 : 0.55;

    const wheelGeo = new THREE.CylinderGeometry(
      wheelRadius, wheelRadius, 0.36, 10
    );

    const wheelPositions = type === "bus"
      ? [-4.2, 0, 4.2]
      : type === "boxTruck"
        ? [-3.6, 3.5]
        : [-length * 0.32, length * 0.32];

    for (const x of [-width / 2, width / 2]) {
      for (const z of wheelPositions) {
        const wheel = new THREE.Mesh(wheelGeo, rubber);
        wheel.rotation.z = Math.PI / 2;
        wheel.position.set(x, 0.55, z);
        car.add(wheel);
      }
    }

    // Front points toward local negative Z.
    for (const x of [-width * 0.33, width * 0.33]) {
      part(0.48, 0.3, 0.08, lights,
        x, 1.05, -length / 2 - 0.05);

      part(0.45, 0.3, 0.08, tailLights,
        x, 1.05, length / 2 + 0.05);
    }

    if (type === "bus") {
      const stripe = new THREE.MeshLambertMaterial({
        color: 0xf1c94e
      });

      for (const x of [-width / 2 - 0.02, width / 2 + 0.02]) {
        part(0.05, 0.25, length - 1, stripe, x, 1.45, 0);
      }
    }

    group.add(car);
    return car;
  }
  // VELOCITY_DISTRICT_FLEET_V5
  // 48 vehicles total, initially concentrated near the player.
  const fleetTypes = [
    ...Array(12).fill("sedan"),
    ...Array(10).fill("suv"),
    ...Array(8).fill("pickup"),
    ...Array(8).fill("van"),
    ...Array(5).fill("bus"),
    ...Array(5).fill("boxTruck")
  ];

  const initialPlayer = trafficPlayer?.group?.position;
  const startX = initialPlayer?.x ?? -300;
  const startZ = initialPlayer?.z ?? 300;

  const roadCandidates = [];

  for (let r = 0; r < roads.length; r++) {
    const axis = r % 2 === 0 ? "z" : "x";
    const road = roads[r];

    for (const direction of [1, -1]) {
      const offset = direction === 1 ? -4.5 : 4.5;

      for (let coordinate = -525; coordinate <= 525; coordinate += 35) {
        const x = axis === "z" ? road + offset : coordinate;
        const z = axis === "x" ? road + offset : coordinate;

        const distance = Math.hypot(x - startX, z - startZ);

        roadCandidates.push({
          x, z, axis, direction, distance
        });
      }
    }
  }

  roadCandidates.sort((a, b) => a.distance - b.distance);

  const selected = [];

  for (const candidate of roadCandidates) {
    if (selected.length >= fleetTypes.length) break;

    const tooClose = selected.some(other =>
      Math.abs(other.x - candidate.x) < 35 &&
      Math.abs(other.z - candidate.z) < 35
    );

    if (!tooClose) selected.push(candidate);
  }

  for (let i = 0; i < selected.length; i++) {
    const position = selected[i];
    const type = fleetTypes[i];

    const car = createCar(colors[i % colors.length], type);
    car.position.set(position.x, 0.9, position.z);

    if (position.axis === "z") {
      car.rotation.y = position.direction === 1 ? Math.PI : 0;
    } else {
      car.rotation.y = position.direction === 1
        ? -Math.PI / 2 : Math.PI / 2;
    }

    cars.push({
      mesh: car,
      axis: position.axis,
      direction: position.direction,
      speed: 14,
      min: -550,
      max: 550
    });
  }

  console.log("Velocity district fleet:", cars.length, "vehicles");
  // VELOCITY_DIRECTIONAL_SIGNALS_V2
  const furniture = scene.getObjectByName("Velocity Street Furniture");
  const signals = { NS: {}, EW: {} };

  if (furniture) {
    for (const mesh of furniture.children) {
      for (const axis of ["NS", "EW"]) {
        for (const color of ["Red", "Amber", "Green"]) {
          if (mesh.name === "Velocity traffic" + axis + color) {
            signals[axis][color.toLowerCase()] = mesh;
          }
        }
      }
    }
  }

  let signalTimer = 0;

  function updateSignals(delta) {
    signalTimer = (signalTimer + delta) % 32;

    let ns = "red";
    let ew = "red";

    if (signalTimer < 12) {
      ns = "green";
    } else if (signalTimer < 15) {
      ns = "amber";
    } else if (signalTimer < 17) {
      // All-red clearance.
    } else if (signalTimer < 29) {
      ew = "green";
    } else {
      ew = "amber";
    }

    for (const [axis, active] of [["NS", ns], ["EW", ew]]) {
      for (const [color, mesh] of Object.entries(signals[axis])) {
        mesh.visible = color === active;
      }
    }
  }
  // VELOCITY_TRAFFIC_V3
  // Conservative movement, signal stops, player and vehicle clearance.
  const crossingX = [-480, -120, 300];
  const crossingZ = [-300, 120, 480];

  function signalFor(axis) {
    const t = signalTimer % 32;
    if (axis === "z") return t < 12 ? "green" : t < 15 ? "amber" : "red";
    return t >= 17 && t < 29 ? "green" : t >= 29 ? "amber" : "red";
  }

  function playerBlocks(car, x, z) {
    if (!trafficPlayer || !trafficPlayer.group) return false;
    const p = trafficPlayer.group.position;
    const a = car.axis;
    const along = (p[a] - car.mesh.position[a]) * car.direction;
    const across = a === "z" ? Math.abs(p.x - x) : Math.abs(p.z - z);
    return across < 5 && along > -5 && along < 17;
  }

  // VELOCITY_SMART_QUEUE_V52
  const vehicleProfiles = {
    sedan:    { length: 5.8, speed: 16 },
    suv:      { length: 6.5, speed: 15 },
    pickup:   { length: 7.2, speed: 14 },
    van:      { length: 7.8, speed: 13 },
    bus:      { length: 11.5, speed: 11 },
    boxTruck: { length: 10.5, speed: 10 }
  };

  for (let i = 0; i < cars.length; i++) {
    const car = cars[i];
    const type = car.mesh.userData.vehicleType || "sedan";
    const profile = vehicleProfiles[type];

    car.length = profile.length;
    car.speed = profile.speed * (0.94 + (i % 4) * 0.025);
    car.currentSpeed = 0;
    car.acceleration = type === "bus" || type === "boxTruck" ? 2.5 : 4.5;
    car.waitingForGap = false;
  }

  function followingGap(car, other) {
    return (car.length + other.length) / 2 + 12;
  }

  function vehicleBlocks(car, x, z) {
    return cars.some(other => {
      if (other === car) return false;

      const axis = car.axis;
      const perpendicular = axis === "z" ? "x" : "z";

      if (other.axis !== axis) {
        return Math.abs(other.mesh.position.x - x) < 7 &&
               Math.abs(other.mesh.position.z - z) < 7;
      }

      if (
        Math.abs(
          other.mesh.position[perpendicular] -
          car.mesh.position[perpendicular]
        ) > 3.5
      ) return false;

      const ahead =
        (other.mesh.position[axis] -
         car.mesh.position[axis]) * car.direction;

      const required = followingGap(car, other) +
        (car.waitingForGap ? 7 : 0);

      return ahead >= -2 && ahead < required;
    });
  }
  // VELOCITY_STOP_LINES_V31
  const signalIntersections = [-480, -300, -120, 120, 300, 480];

  function intersectionBlocks(car, current, next) {
    const axis = car.axis;
    const direction = car.direction;
    const lateral = car.mesh.position[axis === "z" ? "x" : "z"];

    // Each intersection is controlled by its corresponding signal.
    for (const center of signalIntersections) {
      const distance = (center - current) * direction;
      const nextDistance = (center - next) * direction;

      // Check intersections ahead of the vehicle.
      if (distance < -10 || distance > 45) continue;

      const stopDistance = 23;

      // Once the car has crossed its stop line, let it clear.
      if (distance < stopDistance) continue;

      // Prevent crossing the stop line on red or yellow.
      if (signalFor(axis) !== "green" &&
          nextDistance <= stopDistance) {
        return true;
      }

      // Also block if crossing traffic occupies the intersection.
      const ix = axis === "z" ? lateral : center;
      const iz = axis === "z" ? center : lateral;

      const occupied = cars.some(other =>
        other !== car &&
        other.axis !== axis &&
        Math.abs(other.mesh.position.x - ix) < 9 &&
        Math.abs(other.mesh.position.z - iz) < 9
      );

      if (occupied && nextDistance <= stopDistance) {
        return true;
      }
    }

    return false;
  }
  // VELOCITY_QUEUE_MOVEMENT_V53
  function update(delta) {
    const dt = Math.min(Math.max(delta, 0), 0.05);
    updateSignals(dt);

    // Use the positions at the start of the frame for all decisions.
    const positions = cars.map(car => car.mesh.position.clone());
    const nextSpeeds = new Array(cars.length).fill(0);
    const nextPositions = new Array(cars.length).fill(null);

    for (let i = 0; i < cars.length; i++) {
      const car = cars[i];
      const axis = car.axis;
      const direction = car.direction;
      const current = positions[i][axis];

      // Find the nearest vehicle ahead in the same lane.
      let nearestGap = Infinity;
      let leaderSpeed = Infinity;

      for (let j = 0; j < cars.length; j++) {
        if (i === j) continue;

        const other = cars[j];
        if (other.axis !== axis) continue;

        const perpendicular = axis === "z" ? "x" : "z";
        const lateral = Math.abs(
          positions[i][perpendicular] -
          positions[j][perpendicular]
        );

        if (lateral > 3.5) continue;

        const ahead =
          (positions[j][axis] - current) * direction;

        if (ahead <= 0) continue;

        const clearGap =
          ahead - (car.length + other.length) / 2;

        if (clearGap < nearestGap) {
          nearestGap = clearGap;
          leaderSpeed = other.currentSpeed;
        }
      }

      // A stopped car needs a larger opening before restarting.
      const releaseGap = 18;
      const movingGap = 12;

      if (car.waitingForGap) {
        if (nearestGap >= releaseGap) {
          car.waitingForGap = false;
        }
      } else if (nearestGap < movingGap) {
        car.waitingForGap = true;
      }

      const followingBlocked =
        car.waitingForGap ||
        nearestGap < movingGap +
          car.currentSpeed * 0.65;

      // Look ahead for the player.
      const lookAhead = Math.max(
        12,
        car.currentSpeed * 1.2 + car.length
      );

      const playerProbe = positions[i].clone();
      playerProbe[axis] += direction * lookAhead;

      const playerBlocked = playerBlocks(
        car,
        playerProbe.x,
        playerProbe.z
      );

      // Preserve traffic-light stopping behavior.
      const projected = current +
        direction * car.currentSpeed * dt;

      const signalBlocked = intersectionBlocks(
        car,
        current,
        projected
      );

      const mustBrake =
        followingBlocked ||
        playerBlocked ||
        signalBlocked;

      const acceleration = car.acceleration;
      const braking = acceleration * 3;

      let speed = mustBrake
        ? Math.max(0, car.currentSpeed - braking * dt)
        : Math.min(car.speed, car.currentSpeed + acceleration * dt);

      // Never advance into the vehicle ahead.
      if (nearestGap < Infinity) {
        const available = Math.max(0, nearestGap - movingGap);
        speed = Math.min(speed, available / Math.max(dt, 0.001));
      }

      const proposed = current + direction * speed * dt;
      const next = positions[i].clone();
      next[axis] = proposed;

      // Final safety check.
      if (
        playerBlocks(car, next.x, next.z) ||
        intersectionBlocks(car, current, proposed)
      ) {
        speed = 0;
        next[axis] = current;
      }

      const outside = direction > 0
        ? next[axis] > car.max
        : next[axis] < car.min;

      if (outside) {
        const entry = direction > 0 ? car.min : car.max;
        next[axis] = entry;
        speed = 0;
      }

      nextSpeeds[i] = speed;
      nextPositions[i] = next;
    }

    // Apply all movement after every vehicle has been evaluated.
    for (let i = 0; i < cars.length; i++) {
      cars[i].currentSpeed = nextSpeeds[i];
      cars[i].mesh.position.copy(nextPositions[i]);
    }
  }
  console.log("Velocity traffic initialized:", cars.length, "cars");

  return { group, cars, update, getSignalTime: () => signalTimer };
}