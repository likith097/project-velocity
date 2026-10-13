// VELOCITY_CRYSTAL_SECURITY_V8
export function createCrystalSecurity(
  THREE, scene, player, crystals, npcSystem, cityTraffic
) {
  const root = new THREE.Group();
  root.name = "Velocity Crystal Security V8";
  scene.add(root);

  const compounds = [];
  const RADIUS = 24;
  const GATE_HALF_WIDTH = 5;
  const GATE_Z = -RADIUS;
  const LIFT_OFFSET = 15;

  const metal = new THREE.MeshStandardMaterial({
    color: 0x25384a,
    metalness: 0.75,
    roughness: 0.28
  });

  const electric = new THREE.MeshStandardMaterial({
    color: 0x49eaff,
    emissive: 0x25dfff,
    emissiveIntensity: 1.6
  });

  const policeWhite = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0
  });

  const policeBlue = new THREE.MeshStandardMaterial({
    color: 0x142c68
  });

  const red = new THREE.MeshBasicMaterial({
    color: 0xff344e
  });

  const blue = new THREE.MeshBasicMaterial({
    color: 0x287dff
  });

  function box(parent,w,h,d,x,y,z,material) {
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(w,h,d),
      material
    );
    mesh.position.set(x,y,z);
    parent.add(mesh);
    return mesh;
  }

  function beam(parent,a,b,r,material) {
    const start = new THREE.Vector3(...a);
    const end = new THREE.Vector3(...b);
    const delta = end.clone().sub(start);

    const mesh = new THREE.Mesh(
      new THREE.CylinderGeometry(
        r,r,delta.length(),8
      ),
      material
    );

    mesh.position.copy(start).add(end).multiplyScalar(0.5);
    mesh.quaternion.setFromUnitVectors(
      new THREE.Vector3(0,1,0),
      delta.normalize()
    );

    parent.add(mesh);
    return mesh;
  }

  function policeCar(parent,x,z,rotation=0) {
    const car = new THREE.Group();
    car.position.set(x,0,z);
    car.rotation.y = rotation;
    parent.add(car);

    box(car,7,1.4,3.3,0,1.1,0,policeWhite);
    box(car,3.8,1.4,2.9,0,2.25,0,policeBlue);

    box(car,7.1,0.35,3.4,0,1.35,0,policeBlue);

    for(const side of [-1,1]) {
      for(const ax of [-2.3,2.3]) {
        const wheel = new THREE.Mesh(
          new THREE.CylinderGeometry(
            0.65,0.65,0.35,12
          ),
          metal
        );
        wheel.rotation.x = Math.PI/2;
        wheel.position.set(ax,0.65,side*1.65);
        car.add(wheel);
      }
    }

    box(car,0.8,0.3,0.7,-0.55,3.1,0,red);
    box(car,0.8,0.3,0.7,0.55,3.1,0,blue);

    return car;
  }

  function barricade(parent,x,z,rotation=0) {
    const block = new THREE.Group();
    block.position.set(x,0,z);
    block.rotation.y = rotation;
    parent.add(block);

    box(block,8,1.5,1,0,0.85,0,metal);

    for(let i=-3;i<=3;i+=2) {
      box(block,1.1,0.5,1.1,i,1.3,0,electric);
    }
  }

  function label(parent,text,x,y,z) {
    const canvas=document.createElement("canvas");
    canvas.width=512;
    canvas.height=128;

    const ctx=canvas.getContext("2d");
    ctx.fillStyle="#121417";
    ctx.fillRect(0,0,512,128);

    ctx.fillStyle="#B91C26";
    ctx.fillRect(0,0,512,28);

    ctx.fillStyle="#FFFFFF";
    ctx.font="bold 35px Arial";
    ctx.textAlign="center";
    ctx.textBaseline="middle";
    ctx.fillText(text,256,78,480);

    const texture=new THREE.CanvasTexture(canvas);
    texture.colorSpace=THREE.SRGBColorSpace;

    const material=new THREE.MeshBasicMaterial({
      map:texture,
      side:THREE.FrontSide
    });

    const group=new THREE.Group();
    group.position.set(x,y,z);

    for(const rotation of [0,Math.PI]) {
      const face=new THREE.Mesh(
        new THREE.PlaneGeometry(13,3.25),
        material
      );
      face.rotation.y=rotation;
      face.position.z=Math.cos(rotation)*0.06;
      group.add(face);
    }

    parent.add(group);
  }

  const dialogue = document.createElement("div");
  dialogue.id = "velocity-security-dialogue";
  dialogue.textContent =
    "";

  dialogue.style.cssText = `
    position:fixed;
    left:50%;
    bottom:26%;
    transform:translateX(-50%);
    z-index:10005;
    max-width:480px;
    width:calc(100% - 40px);
    padding:18px 24px;
    border:1px solid #57eaff;
    border-radius:12px;
    background:rgba(5,15,30,.94);
    color:#ffffff;
    font:600 17px Arial,sans-serif;
    text-align:center;
    box-shadow:0 0 28px #00dfff55;
    pointer-events:none;
    display:none;
  `;

  document.body.appendChild(dialogue);

  const checkpointPrompt = document.createElement("div");
  checkpointPrompt.style.cssText = `
    position:fixed;
    left:50%;
    bottom:18%;
    transform:translateX(-50%);
    z-index:10004;
    padding:12px 18px;
    border:1px solid #52eaff;
    border-radius:10px;
    background:rgba(5,15,30,.93);
    color:white;
    font:700 14px Arial,sans-serif;
    text-align:center;
    pointer-events:none;
    display:none;
  `;

  document.body.appendChild(checkpointPrompt);

  for(const entry of crystals) {
    const compound = new THREE.Group();
    compound.position.set(entry.x,0,entry.z);
    root.add(compound);

    // Square electric fence with a southern checkpoint.
    const corners = [
      [-RADIUS,-RADIUS],
      [ RADIUS,-RADIUS],
      [ RADIUS, RADIUS],
      [-RADIUS, RADIUS]
    ];

    const segments = [];

    for(let i=0;i<4;i++) {
      const a=corners[i];
      const b=corners[(i+1)%4];

      if(i===0) {
        segments.push([
          a,
          [-GATE_HALF_WIDTH,-RADIUS]
        ]);
        segments.push([
          [GATE_HALF_WIDTH,-RADIUS],
          b
        ]);
      } else {
        segments.push([a,b]);
      }
    }

    for(const [a,b] of segments) {
      const length = Math.hypot(
        b[0]-a[0],b[1]-a[1]
      );

      const steps = Math.max(
        1,Math.ceil(length/4)
      );

      for(let i=0;i<=steps;i++) {
        const t=i/steps;
        const x=a[0]+(b[0]-a[0])*t;
        const z=a[1]+(b[1]-a[1])*t;

        beam(
          compound,
          [x,0,z],
          [x,5,z],
          0.13,
          metal
        );
      }

      for(const y of [0.8,2.5,4.5]) {
        beam(
          compound,
          [a[0],y,a[1]],
          [b[0],y,b[1]],
          0.09,
          electric
        );
      }
    }

    // Checkpoint entrance.
    for(const side of [-1,1]) {
      box(
        compound,
        0.8,6,0.8,
        side*GATE_HALF_WIDTH,3,GATE_Z,
        metal
      );
    }

    beam(
      compound,
      [-GATE_HALF_WIDTH,6,GATE_Z],
      [GATE_HALF_WIDTH,6,GATE_Z],
      0.25,electric
    );

    label(
      compound,
      "AUTHORIZED ACCESS",
      0,8,GATE_Z
    );

    // Guard booth.
    box(
      compound,5,4,5,
      -10,2,GATE_Z-4,
      metal
    );

    box(
      compound,4,1.1,0.2,
      -10,2.5,GATE_Z-1.4,
      electric
    );

    // Security barrier, opens only after clearance.
    const gate = new THREE.Group();
    compound.add(gate);

    gate.position.set(0,0,GATE_Z);

    box(
      gate,
      GATE_HALF_WIDTH*2,3.8,0.3,
      0,2,0,
      new THREE.MeshStandardMaterial({
        color:0x1b4254,
        transparent:true,
        opacity:0.45,
        metalness:0.5,
        roughness:0.2
      })
    );

    for(let x=-4;x<=4;x+=2) {
      beam(
        gate,
        [x,0.2,0],
        [x,4,0],
        0.1,electric
      );
    }

    // Police roadblocks on the approaches.
    for(const [x,z,rotation] of [
      [-38,-38,0],
      [38,-38,0],
      [-38,38,0],
      [38,38,0],
      [0,-43,0],
      [0,43,0],
      [-43,0,Math.PI/2],
      [43,0,Math.PI/2]
    ]) {
      barricade(compound,x,z,rotation);
    }

    for(const [x,z,rotation] of [
      [-17,-44,0],
      [17,-44,0],
      [-17,44,Math.PI],
      [17,44,Math.PI],
      [-44,-17,Math.PI/2],
      [44,17,-Math.PI/2]
    ]) {
      policeCar(compound,x,z,rotation);
    }

    label(
      compound,
      `${entry.name} SECURITY`,
      0,7,RADIUS
    );

    compounds.push({
      entry,
      group:compound,
      gate,
      authorized:false,
      entered:false,
      previousPosition:null,
      lastPosition:null
    });
  }

  function inRestrictedArea(x,z,margin=0) {
    return compounds.some(c=>
      Math.abs(x-c.entry.x)<RADIUS+margin &&
      Math.abs(z-c.entry.z)<RADIUS+margin
    );
  }

  // Best-effort filtering of existing independently
  // positioned traffic and pedestrian objects.
  function filterActors() {
    const pedestrians=npcSystem?.pedestrians;

    if(Array.isArray(pedestrians)) {
      for(const npc of pedestrians) {
        const object=npc?.group ||
                     npc?.mesh ||
                     npc?.object ||
                     npc;

        if(!object?.position) continue;

        const x=object.position.x;
        const z=object.position.z;

        if(inRestrictedArea(x,z,12)) {
          if(object.visible!==false) {
            object.visible=false;
            object.userData.velocitySecurityHidden=true;
          }
        } else if(object.userData?.velocitySecurityHidden) {
          object.visible=true;
          delete object.userData.velocitySecurityHidden;
        }
      }
    }

    // Traffic implementations differ. Only touch
    // vehicles when the traffic module exposes them.
    const vehicles=
      cityTraffic?.vehicles ||
      cityTraffic?.cars ||
      cityTraffic?.trafficVehicles;

    if(Array.isArray(vehicles)) {
      for(const vehicle of vehicles) {
        const object=vehicle?.group ||
                     vehicle?.mesh ||
                     vehicle?.object ||
                     vehicle;

        if(!object?.position) continue;

        if(inRestrictedArea(
          object.position.x,
          object.position.z,
          20
        )) {
          if(object.visible!==false) {
            object.visible=false;
            object.userData.velocitySecurityHidden=true;
          }
        } else if(object.userData?.velocitySecurityHidden) {
          object.visible=true;
          delete object.userData.velocitySecurityHidden;
        }
      }
    }
  }

  let dialogueTimer=0;

  window.addEventListener("keydown",event=>{
    if(event.code!=="KeyE" || event.repeat) return;
    if(!player.enabled || player.seated) return;

    const p=player.group.position;

    for(const compound of compounds) {
      const dx=p.x-compound.entry.x;
      const dz=p.z-compound.entry.z;

      const atCheckpoint=
        Math.abs(dx)<7 &&
        dz>=GATE_Z-9 &&
        dz<=GATE_Z+2;

      if(atCheckpoint && !compound.authorized) {
        compound.authorized=true;
        checkpointPrompt.textContent=
          "ACCESS GRANTED - ENTER THE COMPOUND";
        event.preventDefault();
        break;
      }
    }
  });

  function update(dt) {
    filterActors();

    if(!player.enabled || player.seated) {
      checkpointPrompt.style.display="none";
      return;
    }

    const p=player.group.position;
    let promptVisible=false;

    for(const c of compounds) {
      const dx=p.x-c.entry.x;
      const dz=p.z-c.entry.z;

      const atCheckpoint=
        Math.abs(dx)<7 &&
        dz>=GATE_Z-9 &&
        dz<=GATE_Z+2;

      const inside=
        Math.abs(dx)<RADIUS-1 &&
        Math.abs(dz)<RADIUS-1;

      if(atCheckpoint && !c.authorized) {
        checkpointPrompt.textContent=
          "PRESS E - SECURITY CLEARANCE";
        promptVisible=true;
      }

      const desiredGateY=c.authorized ? 5 : 0;

      c.gate.position.y=THREE.MathUtils.lerp(
        c.gate.position.y,
        desiredGateY,
        Math.min(1,dt*5)
      );

      // Prevent walking through the secured perimeter.
      // The southern gate is the only authorized entry.
      if(c.lastPosition) {
        const prevX=c.lastPosition.x-c.entry.x;
        const prevZ=c.lastPosition.z-c.entry.z;

        const previouslyInside=
          Math.abs(prevX)<RADIUS-1 &&
          Math.abs(prevZ)<RADIUS-1;

        if(inside!==previouslyInside) {
          const throughGate=
            Math.abs(dx)<GATE_HALF_WIDTH-1 &&
            Math.abs(prevX)<GATE_HALF_WIDTH-1 &&
            Math.abs(dz+RADIUS)<5 &&
            Math.abs(prevZ+RADIUS)<5;

          if(!throughGate || !c.authorized) {
            p.x=c.lastPosition.x;
            p.z=c.lastPosition.z;
          }
        }
      }

      const nowInside=
        Math.abs(p.x-c.entry.x)<RADIUS-1 &&
        Math.abs(p.z-c.entry.z)<RADIUS-1;

      if(nowInside && c.authorized && !c.entered) {
        c.entered=true;
        dialogue.style.display="block";
        dialogueTimer=4;
      }

      c.lastPosition={
        x:p.x,
        z:p.z
      };
    }

    checkpointPrompt.style.display=
      promptVisible?"block":"none";

    if(dialogueTimer>0) {
      dialogueTimer-=dt;

      if(dialogueTimer<=0) {
        dialogue.style.display="none";
      }
    }
  }

  return {
    group:root,
    compounds,
    update,
    isAuthorized(entryName) {
      return compounds.some(c=>
        c.entry.name===entryName &&
        c.authorized
      );
    },
    inRestrictedArea
  };
}