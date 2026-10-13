// VELOCITY_ELEVATOR_PLAZA_V7

export function createCrystalElevators(
  THREE,scene,camera,controls,player,crystals,crystalHeight
) {
  const DURATION=15;
  const BASE_Y=2;
  const TOP_Y=crystalHeight-35;
  const START_OFFSET=15;
  const END_OFFSET=44;
  const PLAZA_OFFSET=65;
  const PLAZA_RADIUS=20;
  const SPEED=9;

  const group=new THREE.Group();
  group.name="Velocity V7 Elevator Plazas";
  scene.add(group);

  const towers=[];
  const keys=new Set();

  let phase="ground";
  let active=null;
  let nearest=null;
  let progress=0;
  let activationTime=0;
  let savedPosition=null;
  let savedDamping=true;

  let yaw=0;
  let pitch=0.18;
  let distance=8;

  const canvas=document.querySelector("canvas");

  const prompt=document.createElement("div");
  prompt.id="velocity-elevator-prompt";
  prompt.style.cssText=`
    position:fixed;
    left:50%;
    bottom:18%;
    transform:translateX(-50%);
    z-index:10001;
    padding:12px 20px;
    background:rgba(5,15,30,.93);
    border:1px solid #6cecff;
    border-radius:12px;
    color:white;
    font:700 14px Arial,sans-serif;
    text-align:center;
    pointer-events:none;
    display:none;
  `;
  document.body.appendChild(prompt);

  function mat(color,opacity=1,glow=0) {
    return new THREE.MeshStandardMaterial({
      color,
      metalness:0.35,
      roughness:0.3,
      transparent:opacity<1,
      opacity,
      depthWrite:opacity===1,
      emissive:color,
      emissiveIntensity:glow,
      side:THREE.DoubleSide
    });
  }

  const dark=mat(0x193044);
  const steel=mat(0x6b8498);
  const glass=mat(0x79eaff,0.13,0.08);

  function cylinder(parent,r1,r2,h,y,material,segments=32) {
    const mesh=new THREE.Mesh(
      new THREE.CylinderGeometry(r1,r2,h,segments),
      material
    );
    mesh.position.y=y;
    parent.add(mesh);
    return mesh;
  }

  function ring(parent,r,y,material,tube=0.13) {
    const mesh=new THREE.Mesh(
      new THREE.TorusGeometry(r,tube,8,64),
      material
    );
    mesh.rotation.x=Math.PI/2;
    mesh.position.y=y;
    parent.add(mesh);
    return mesh;
  }

  function beam(parent,x1,y1,z1,x2,y2,z2,r,material) {
    const a=new THREE.Vector3(x1,y1,z1);
    const b=new THREE.Vector3(x2,y2,z2);
    const delta=b.clone().sub(a);
    const mesh=new THREE.Mesh(
      new THREE.CylinderGeometry(r,r,delta.length(),8),
      material
    );
    mesh.position.copy(a).add(b).multiplyScalar(0.5);
    mesh.quaternion.setFromUnitVectors(
      new THREE.Vector3(0,1,0),
      delta.normalize()
    );
    parent.add(mesh);
    return mesh;
  }

  for(const entry of crystals) {
    const root=new THREE.Group();
    root.position.set(entry.x,0,entry.z);
    group.add(root);

    const accent=mat(entry.color,1,0.55);
    const glow=mat(entry.color,0.7,0.8);

    // Vertical elevator shaft.
    const shaftX=START_OFFSET;

    cylinder(root,5.4,5.4,0.6,0.45,accent);

    const shaftGlass=new THREE.Mesh(
      new THREE.CylinderGeometry(
        5.2,5.2,TOP_Y-12,24,1,true
      ),
      glass
    );
    shaftGlass.position.set(
      shaftX,(TOP_Y-12)/2,0
    );
    root.add(shaftGlass);

    for(let i=0;i<4;i++) {
      const a=i*Math.PI/2+Math.PI/4;
      beam(
        root,
        shaftX+Math.cos(a)*5.2,0,
        Math.sin(a)*5.2,
        shaftX+Math.cos(a)*5.2,TOP_Y-10,
        Math.sin(a)*5.2,
        0.15,steel
      );
    }

    // Upper horizontal guideway.
    beam(
      root,
      START_OFFSET,TOP_Y+5,0,
      END_OFFSET,TOP_Y+5,0,
      0.4,accent
    );

    beam(
      root,
      START_OFFSET,TOP_Y-2,0,
      END_OFFSET,TOP_Y-2,0,
      0.24,steel
    );

    // Cabin moves along the vertical + outward route.
    const cabin=new THREE.Group();
    root.add(cabin);

    cylinder(cabin,4.4,4.4,0.6,-0.55,dark);
    cylinder(cabin,4.4,4.4,0.4,4.6,accent);

    const shell=new THREE.Mesh(
      new THREE.CylinderGeometry(
        4.35,4.35,5.2,24,1,true
      ),
      glass
    );
    shell.position.y=2;
    cabin.add(shell);

    ring(cabin,4.45,4.45,accent);
    ring(cabin,4.4,-0.25,accent);

    // Large separate observation plaza.
    const plaza=new THREE.Group();
    plaza.position.set(PLAZA_OFFSET,TOP_Y,0);
    root.add(plaza);

    cylinder(
      plaza,
      PLAZA_RADIUS,
      PLAZA_RADIUS,
      1.3,
      -0.9,
      dark,
      64
    );

    ring(
      plaza,
      PLAZA_RADIUS-0.7,
      -0.18,
      accent,
      0.22
    );

    ring(plaza,12,-0.18,glow);
    ring(plaza,7,-0.18,glow);

    // Outer guardrail with opening toward elevator.
    for(let i=0;i<48;i++) {
      const a=i*Math.PI*2/48;

      // Leave a western entrance.
      if(Math.cos(a)<-0.9) continue;

      const x=Math.cos(a)*(PLAZA_RADIUS-0.7);
      const z=Math.sin(a)*(PLAZA_RADIUS-0.7);

      beam(
        plaza,x,-0.1,z,
        x,2,z,
        0.11,steel
      );
    }

    // Curved rail above the posts.
    for(let i=0;i<48;i++) {
      const a=i*Math.PI*2/48;
      const b=(i+1)*Math.PI*2/48;

      if(Math.cos(a)<-0.9 ||
         Math.cos(b)<-0.9) continue;

      beam(
        plaza,
        Math.cos(a)*(PLAZA_RADIUS-0.7),2,
        Math.sin(a)*(PLAZA_RADIUS-0.7),
        Math.cos(b)*(PLAZA_RADIUS-0.7),2,
        Math.sin(b)*(PLAZA_RADIUS-0.7),
        0.11,glow
      );
    }

    // Wide connecting walkway.
    const bridgeStart=END_OFFSET;
    const bridgeEnd=PLAZA_OFFSET-8;
    const bridgeLength=bridgeEnd-bridgeStart;

    const bridge=new THREE.Mesh(
      new THREE.BoxGeometry(
        bridgeLength+2,0.9,10
      ),
      dark
    );
    bridge.position.set(
      (bridgeStart+bridgeEnd)/2,
      TOP_Y-0.8,
      0
    );
    root.add(bridge);

    for(const side of [-1,1]) {
      const z=side*5;

      beam(
        root,
        bridgeStart,TOP_Y+1.8,z,
        bridgeEnd,TOP_Y+1.8,z,
        0.12,accent
      );

      for(let x=bridgeStart;x<=bridgeEnd;x+=4) {
        beam(
          root,
          x,TOP_Y-0.3,z,
          x,TOP_Y+1.8,z,
          0.1,steel
        );
      }
    }

    // Floating interactive crystal.
    const crystalHolder=new THREE.Group();
    crystalHolder.position.set(PLAZA_OFFSET,TOP_Y,0);
    root.add(crystalHolder);

    cylinder(
      crystalHolder,2.7,3.4,0.9,0.3,steel,12
    );
    cylinder(
      crystalHolder,1.8,2.5,1.1,1.2,accent,10
    );

    const floating=new THREE.Group();
    floating.position.y=5;
    crystalHolder.add(floating);

    const crystalMaterial=mat(entry.color,0.95,1.5);

    const core=new THREE.Mesh(
      new THREE.OctahedronGeometry(2.7,0),
      crystalMaterial
    );
    floating.add(core);

    const orbitRings=[];

    for(let i=0;i<3;i++) {
      const orbit=new THREE.Mesh(
        new THREE.TorusGeometry(
          3.6+i*0.35,0.07,8,48
        ),
        glow
      );
      orbit.rotation.set(
        i*0.65,
        i*0.4,
        i*0.9
      );
      floating.add(orbit);
      orbitRings.push(orbit);
    }

    const pulseMaterial=new THREE.MeshBasicMaterial({
      color:entry.color,
      transparent:true,
      opacity:0,
      depthWrite:false
    });

    const pulse=ring(
      crystalHolder,3,0.1,pulseMaterial,0.2
    );

    const light=new THREE.PointLight(
      entry.color,1.2,25
    );
    light.position.y=5;
    crystalHolder.add(light);

    towers.push({
      entry,
      root,
      cabin,
      floating,
      crystalMaterial,
      orbitRings,
      pulse,
      light,
      baseX:entry.x+START_OFFSET,
      topX:entry.x+END_OFFSET,
      plazaX:entry.x+PLAZA_OFFSET,
      z:entry.z
    });
  }

  function distanceTo(x,z) {
    const p=player.group.position;
    return Math.hypot(p.x-x,p.z-z);
  }

  function nearCrystal() {
    return active &&
      distanceTo(active.plazaX,active.z)<7;
  }

  function nearLift() {
    return active &&
      distanceTo(active.topX,active.z)<6;
  }

  function ownsCamera() {
    return phase!=="ground" &&
           phase!=="panel";
  }

  function resetCamera() {
    yaw=0;
    pitch=0.18;
    distance=8;
  }

  // Pointer lock = mouse-look without holding a button.
  canvas?.addEventListener("click",()=>{
    if(!ownsCamera()) return;

    if(document.pointerLockElement!==canvas) {
      canvas.requestPointerLock?.().catch(()=>{});
    }
  });

  window.addEventListener("mousemove",event=>{
    if(!ownsCamera()) return;
    if(document.pointerLockElement!==canvas) return;

    yaw-=event.movementX*0.0027;
    pitch+=event.movementY*0.0025;

    pitch=THREE.MathUtils.clamp(
      pitch,-0.9,1.1
    );
  });

  canvas?.addEventListener("wheel",event=>{
    if(!ownsCamera()) return;

    event.preventDefault();

    distance=THREE.MathUtils.clamp(
      distance+Math.sign(event.deltaY),
      4.5,16
    );
  },{passive:false});

  function startRide(tower) {
    if(!tower || phase!=="ground") return;
    if(player.seated) return;


    active=tower;
    savedPosition=player.group.position.clone();
    savedDamping=controls.enableDamping;

    player.setEnabled(false);
    player.group.visible=true;

    controls.enabled=false;
    controls.enableDamping=false;

    progress=0;
    phase="ascending";
    resetCamera();

    player.group.position.set(
      tower.baseX,BASE_Y,tower.z
    );
  }

  function startDescent() {
    if(phase!=="top" || !nearLift()) return;

    progress=0;
    phase="descending";
    keys.clear();
  }

  function finishDescent() {
    const destination=savedPosition?.clone();

    active=null;
    phase="ground";
    keys.clear();

    if(document.pointerLockElement===canvas) {
      document.exitPointerLock();
    }

    if(destination) {
      player.group.position.copy(destination);
    }

    controls.enableDamping=savedDamping;
    controls.enabled=true;
    controls.target.set(player.group.position.x,player.group.position.y+2,player.group.position.z);
    camera.up.set(0,1,0);
    camera.position.set(player.group.position.x+8,player.group.position.y+6,player.group.position.z+10);
    controls.update();
    player.setEnabled(true);

    prompt.style.display="none";
  }

  function openCrystal() {
    if(phase!=="top" || !nearCrystal()) return;


    phase="activating";
    activationTime=0;
    keys.clear();
  }

  window.addEventListener("keydown",event=>{
    if(phase==="top" &&
       ["KeyW","KeyA","KeyS","KeyD",
        "ArrowUp","ArrowDown",
        "ArrowLeft","ArrowRight",
        "Space"].includes(event.code)) {
      keys.add(event.code);
      event.preventDefault();
    }

    if(event.repeat) return;

    if(event.code==="KeyI") {
      if(phase==="ground" && nearest) {
        startRide(nearest);
        event.preventDefault();
      } else if(phase==="top" && nearLift()) {
        startDescent();
        event.preventDefault();
      }
    }

    if(event.code==="KeyE" && phase==="top") {
      openCrystal();
      event.preventDefault();
    }

    if(event.code==="KeyR" && ownsCamera()) {
      resetCamera();
      event.preventDefault();
    }
  });

  window.addEventListener("keyup",event=>{
    keys.delete(event.code);
  });

  window.addEventListener("blur",()=>{
    keys.clear();
  });

  window.addEventListener("message",event=>{
    if(event.origin!==window.location.origin ||
       event.source!==window.parent ||
       event.data?.source!=="velocity-react") return;

    if(event.data.type==="RESUME_PLAYER" &&
       phase==="panel") {
      phase="top";
      player.setEnabled(false);
      player.group.visible=true;
      controls.enabled=false;
      controls.enableDamping=false;
    }
  });

  function enforcePlazaBoundary() {
    if(!active || player.godMode) return;

    const p=player.group.position;
    const dx=p.x-active.plazaX;
    const dz=p.z-active.z;
    const radius=PLAZA_RADIUS-1.8;

    const onPlaza=Math.hypot(dx,dz)<=radius;
    const onBridge=
      p.x>=active.topX-4 &&
      p.x<=active.plazaX &&
      Math.abs(dz)<=4.5;
    const onLift=
      Math.hypot(p.x-active.topX,dz)<=4.2;

    if(onPlaza || onBridge || onLift) return;

    const distance=Math.hypot(dx,dz);

    if(distance>0.001) {
      p.x=active.plazaX+dx/distance*radius;
      p.z=active.z+dz/distance*radius;
    } else {
      p.x=active.plazaX;
      p.z=active.z;
    }
  }
  function moveOnPlaza(dt) {
    const p=player.group.position;

    let forward=0;
    let strafe=0;

    if(keys.has("KeyW") || keys.has("ArrowUp")) forward++;
    if(keys.has("KeyS") || keys.has("ArrowDown")) forward--;
    if(keys.has("KeyD") || keys.has("ArrowRight")) strafe++;
    if(keys.has("KeyA") || keys.has("ArrowLeft")) strafe--;

    const magnitude=Math.hypot(forward,strafe);

    if(magnitude===0) return;

    forward/=magnitude;
    strafe/=magnitude;

    const dx=
      -Math.sin(yaw)*forward+
      Math.cos(yaw)*strafe;

    const dz=
      -Math.cos(yaw)*forward-
      Math.sin(yaw)*strafe;

    const nextX=p.x+dx*SPEED*dt;
    const nextZ=p.z+dz*SPEED*dt;

    // Walkway from cabin to the large circular plaza.
    const onBridge=
      nextX>=active.topX-4 &&
      nextX<=active.plazaX &&
      Math.abs(nextZ-active.z)<=4.5;

    // Circular plaza movement.
    const onPlaza=
      Math.hypot(
        nextX-active.plazaX,
        nextZ-active.z
      )<=PLAZA_RADIUS-1.6;

    // Cabin landing.
    const onLift=
      Math.hypot(
        nextX-active.topX,
        nextZ-active.z
      )<=4.2;

    if(onBridge || onPlaza || onLift) {
      p.x=nextX;
      p.z=nextZ;
      player.group.rotation.y=Math.atan2(dx,dz);
    }
  }

  function updateCamera(dt) {
    if(!active) return;

    const p=player.group.position;
    const target=new THREE.Vector3(
      p.x,p.y+2.3,p.z
    );

    const horizontal=Math.cos(pitch)*distance;

    const desired=new THREE.Vector3(
      target.x+Math.sin(yaw)*horizontal,
      target.y+Math.sin(pitch)*distance,
      target.z+Math.cos(yaw)*horizontal
    );

    camera.up.set(0,1,0);

    camera.position.lerp(
      desired,
      1-Math.exp(-15*dt)
    );

    camera.lookAt(target);
  }

  function updateRide(dt) {
    progress=Math.min(
      1,progress+dt/DURATION
    );

    const t=progress;

    // Last 25% of ascent shifts cabin outward.
    // First 25% of descent brings it back.
    let verticalT;
    let outwardT;

    if(phase==="ascending") {
      verticalT=Math.min(1,t/0.75);
      outwardT=Math.max(0,(t-0.75)/0.25);
    } else {
      outwardT=1-Math.min(1,t/0.25);
      verticalT=1-Math.max(0,(t-0.25)/0.75);
    }

    const smooth=v=>v*v*(3-2*v);

    const x=THREE.MathUtils.lerp(
      active.baseX,
      active.topX,
      smooth(outwardT)
    );

    const y=THREE.MathUtils.lerp(
      BASE_Y,
      TOP_Y,
      smooth(verticalT)
    );

    active.cabin.position.set(
      x-active.entry.x,y,0
    );

    player.group.position.set(
      x,y,active.z
    );

    if(progress>=1) {
      if(phase==="ascending") {
        phase="top";
        keys.clear();
      } else {
        finishDescent();
      }
    }
  }

  function updateCrystals(dt) {
    const time=performance.now()*0.001;

    for(const tower of towers) {
      const crystal=tower.floating;

      crystal.rotation.y+=dt*0.5;
      crystal.position.y=
        5+Math.sin(time*1.7)*0.35;

      tower.orbitRings.forEach((ring,i)=>{
        ring.rotation.x+=dt*(0.25+i*0.12);
        ring.rotation.y+=dt*(0.4+i*0.15);
      });

      const activating=
        phase==="activating" &&
        active===tower;

      if(activating) {
        const t=Math.min(
          1,activationTime/1.5
        );

        crystal.rotation.y+=dt*5;
        crystal.scale.setScalar(1+t*0.3);

        tower.crystalMaterial.emissiveIntensity=
          1.5+t*5;

        tower.light.intensity=1.2+t*5;
        tower.pulse.scale.setScalar(1+t*5);
        tower.pulse.material.opacity=(1-t)*0.85;
      } else {
        crystal.scale.setScalar(1);
        tower.crystalMaterial.emissiveIntensity=1.5;
        tower.light.intensity=1.2;
        tower.pulse.material.opacity=0;
        tower.pulse.scale.setScalar(1);
      }
    }
  }

  function update(dt) {
    dt=Math.min(dt,0.1);
    updateCrystals(dt);

    if(phase==="ground") {
      nearest=null;
      let best=8;

      if(player.enabled && !player.seated) {
        for(const tower of towers) {
          const d=distanceTo(
            tower.baseX,tower.z
          );

          if(
            d<best
          ) {
            best=d;
            nearest=tower;
          }
        }
      }

      // VELOCITY_ELEVATOR_DEBUG_V1
      if (!window.velocityElevatorDebug) {
        window.velocityElevatorDebug = () => ({
          phase,
          playerEnabled: player.enabled,
          seated: player.seated,
          nearest: nearest?.entry?.name ?? null,
          towers: towers.map(t => ({
            name: t.entry.name,
            distance: Number(distanceTo(t.baseX, t.z).toFixed(2)),
            authorized: window.velocityCrystalSecurity?.isAuthorized?.(t.entry.name)
          }))
        });
      }

      prompt.style.display=
        nearest?"block":"none";

      if(nearest) {
        prompt.textContent=
          `PRESS I - ${nearest.entry.name} ELEVATOR`;
      }
      return;
    }

    if(phase==="panel") {
      prompt.style.display="none";
      return;
    }

    if(!active) return;

    if(phase==="ascending" ||
       phase==="descending") {
      updateRide(dt);
    }

    if(phase==="top" && !player.godMode) {
      player.group.position.y=TOP_Y;
      enforcePlazaBoundary();
      moveOnPlaza(dt);
      enforcePlazaBoundary();
    }

    if(phase==="activating") {
      activationTime+=dt;

      if(activationTime>=1.5) {
        phase="panel";

        if(document.pointerLockElement===canvas) {
          document.exitPointerLock();
        }

        window.parent.postMessage({
          source:"velocity-city",
          type:"OPEN_DISTRICT",
          district:active.entry.name
        },window.location.origin);

        return;
      }
    }

    if(phase==="ground") return;

    player.group.visible=true;
    if(!player.godMode) updateCamera(dt);

    if(phase==="top") {
      prompt.textContent=nearCrystal()
        ? `PRESS E - VIEW ${active.entry.name}`
        : nearLift()
          ? "WASD - EXPLORE | I - DESCEND"
          : "WASD - EXPLORE CRYSTAL PLAZA";
    } else if(phase==="activating") {
      prompt.textContent="CRYSTAL ACTIVATING...";
    } else {
      const seconds=Math.ceil(
        DURATION*(1-progress)
      );
      prompt.textContent=
        `${phase==="ascending"?"ASCENDING":"DESCENDING"} | ${seconds}s`;
    }

    prompt.style.display="block";
  }

  function fastTravelToCrystal(name) {
    const tower=towers.find(t=>t.entry.name===name);

    if(!tower) {
      console.error("[Velocity Fast Travel] Tower not found:", name,
        "Available:", towers.map(t=>t.entry.name));
      return false;
    }

    if(phase!=="ground" && phase!=="top") {
      console.warn("[Velocity Fast Travel] Elevator is not idle:",
        { requested:name, phase, active:active?.entry?.name });
      return false;
    }

    if(player.seated) {
      console.warn("[Velocity Fast Travel] Player is seated.");
      return false;
    }

    console.info("[Velocity Fast Travel] Starting:", name);

    active=tower;
    savedPosition=new THREE.Vector3(tower.baseX,BASE_Y,tower.z);
    savedDamping=controls.enableDamping;

    player.setEnabled(false);
    player.group.visible=true;
    controls.enabled=false;
    controls.enableDamping=false;

    keys.clear();
    progress=1;
    tower.cabin.position.set(tower.topX-tower.entry.x,TOP_Y,0);
    phase="top";
    resetCamera();

    player.group.position.set(
      tower.plazaX-4,TOP_Y,tower.z
    );

    // VELOCITY_FAST_TRAVEL_CAMERA_SYNC_V1
    // Place the camera at its initial rooftop position
    // before smooth camera updates begin.
    const target = new THREE.Vector3(
      player.group.position.x,
      player.group.position.y + 2.3,
      player.group.position.z
    );

    const horizontal = Math.cos(pitch) * distance;

    camera.up.set(0, 1, 0);
    camera.position.set(
      target.x + Math.sin(yaw) * horizontal,
      target.y + Math.sin(pitch) * distance,
      target.z + Math.cos(yaw) * horizontal
    );
    camera.lookAt(target);

    return true;
  }
  return {
    group,
    towers,
    fastTravelToCrystal,
    update,
    get phase(){return phase;},
    get active(){return active;}
  };
}