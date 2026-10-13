// VELOCITY_HIGH_SECURITY_V9

export function createCrystalHighSecurity(
  THREE, scene, camera, crystals
) {
  const root = new THREE.Group();
  root.name = "Velocity High Security V9";
  scene.add(root);

  const animatedLights = [];
  const signs = [];

  const material = (color,glow=0) =>
    new THREE.MeshStandardMaterial({
      color,
      metalness:0.3,
      roughness:0.5,
      emissive:color,
      emissiveIntensity:glow
    });

  const navy=material(0x172b51);
  const black=material(0x111a24);
  const silver=material(0x8295a6);
  const white=material(0xe4edf5);
  const yellow=material(0xffc843,0.2);
  const electric=material(0x36e8ff,0.65);

  function box(parent,w,h,d,x,y,z,mat) {
    const mesh=new THREE.Mesh(
      new THREE.BoxGeometry(w,h,d),mat
    );
    mesh.position.set(x,y,z);
    parent.add(mesh);
    return mesh;
  }

  function cylinder(parent,r1,r2,h,x,y,z,mat) {
    const mesh=new THREE.Mesh(
      new THREE.CylinderGeometry(
        r1,r2,h,12
      ),
      mat
    );
    mesh.position.set(x,y,z);
    parent.add(mesh);
    return mesh;
  }

  function officer(parent,x,z,rotation=0) {
    const person=new THREE.Group();
    person.position.set(x,0,z);
    person.rotation.y=rotation;
    parent.add(person);

    // Boots and legs.
    for(const side of [-1,1]) {
      box(
        person,0.55,1.6,0.65,
        side*0.36,0.8,0,
        navy
      );

      box(
        person,0.7,0.35,1,
        side*0.36,0.17,-0.12,
        black
      );
    }

    // Uniform and protective vest.
    box(
      person,1.55,1.85,0.85,
      0,2.45,0,
      navy
    );

    box(
      person,1.65,1.3,1,
      0,2.5,-0.08,
      black
    );

    // Arms.
    for(const side of [-1,1]) {
      box(
        person,0.42,1.65,0.5,
        side*1.05,2.45,0,
        navy
      );
    }

    // Neck and head.
    cylinder(
      person,0.3,0.3,0.4,
      0,3.6,0,
      material(0xb88c6b)
    );

    const head=new THREE.Mesh(
      new THREE.SphereGeometry(
        0.58,12,8
      ),
      material(0xb88c6b)
    );
    head.position.y=4.05;
    person.add(head);

    // Police cap.
    cylinder(
      person,0.65,0.65,0.3,
      0,4.52,0,
      navy
    );

    box(
      person,1.35,0.12,0.65,
      0,4.38,-0.38,
      black
    );

    // Reflective badge.
    box(
      person,0.23,0.28,0.07,
      -0.4,2.9,-0.59,
      yellow
    );

    return person;
  }

  function barrier(parent,x,z,rotation=0) {
    const group=new THREE.Group();
    group.position.set(x,0,z);
    group.rotation.y=rotation;
    parent.add(group);

    box(
      group,8,1.35,1.1,
      0,0.8,0,
      silver
    );

    for(let i=-3;i<=3;i+=2) {
      box(
        group,1,0.5,1.18,
        i,1.25,0,
        yellow
      );
    }

    for(const side of [-1,1]) {
      box(
        group,0.6,0.7,1.6,
        side*3.5,0.35,0,
        black
      );
    }
  }

  function policeVehicle(parent,x,z,rotation=0) {
    const car=new THREE.Group();
    car.position.set(x,0,z);
    car.rotation.y=rotation;
    parent.add(car);

    box(
      car,7.5,1.5,3.5,
      0,1.2,0,
      white
    );

    box(
      car,4,1.5,3,
      0,2.3,0,
      navy
    );

    box(
      car,7.6,0.35,3.6,
      0,1.45,0,
      navy
    );

    for(const side of [-1,1]) {
      for(const axle of [-2.5,2.5]) {
        const wheel=new THREE.Mesh(
          new THREE.CylinderGeometry(
            0.7,0.7,0.4,12
          ),
          black
        );
        wheel.rotation.x=Math.PI/2;
        wheel.position.set(
          axle,0.65,side*1.75
        );
        car.add(wheel);
      }
    }

    const left=box(
      car,0.85,0.3,0.75,
      -0.55,3.25,0,
      new THREE.MeshBasicMaterial({
        color:0xff2440
      })
    );

    const right=box(
      car,0.85,0.3,0.75,
      0.55,3.25,0,
      new THREE.MeshBasicMaterial({
        color:0x2478ff
      })
    );

    animatedLights.push({
      left,right
    });
  }

  function makeSign(parent,text,x,y,z,width=14) {
    const canvas=document.createElement("canvas");
    canvas.width=1024;
    canvas.height=256;
    const ctx=canvas.getContext("2d");

    ctx.fillStyle="#121417";
    ctx.fillRect(0,0,1024,256);

    ctx.fillStyle="#B91C26";
    ctx.fillRect(0,0,1024,64);

    ctx.fillStyle="#FFFFFF";
    ctx.textAlign="center";
    ctx.textBaseline="middle";
    ctx.font="bold 37px Arial";
    ctx.fillText("RESTRICTED SECURITY ZONE",512,32,950);

    ctx.fillStyle="#FFFFFF";
    ctx.font="bold 66px Arial";
    ctx.fillText(text,512,143,950);

    ctx.fillStyle="#F2BE38";
    ctx.fillRect(0,225,1024,31);

    const texture=new THREE.CanvasTexture(canvas);
    texture.colorSpace=THREE.SRGBColorSpace;

    const signHeight=width/4;
    const signY=4.5+signHeight/2;

    const signGroup=new THREE.Group();
    signGroup.position.set(x,0,z);

    const faceMaterial=new THREE.MeshBasicMaterial({
      map:texture,
      side:THREE.FrontSide
    });

    for(const rotation of [0,Math.PI]) {
      const face=new THREE.Mesh(
        new THREE.PlaneGeometry(width,signHeight),
        faceMaterial
      );
      face.rotation.y=rotation;
      face.position.set(
        0,signY,
        Math.cos(rotation)*0.13
      );
      signGroup.add(face);
    }

    const postMaterial=new THREE.MeshStandardMaterial({
      color:0x50565c,
      metalness:0.8,
      roughness:0.4
    });

    for(const offset of [-width*0.38,width*0.38]) {
      const post=new THREE.Mesh(
        new THREE.BoxGeometry(0.22,signY,0.22),
        postMaterial
      );
      post.position.set(offset,signY/2,0);
      signGroup.add(post);
    }

    parent.add(signGroup);
    signs.push(signGroup);
    return signGroup;
  }

  for(const entry of crystals) {
    const compound=new THREE.Group();
    compound.position.set(
      entry.x,0,entry.z
    );
    root.add(compound);

    // Guard positions: 12 officers per compound.
    const officers=[
      [-7,-30,0],
      [7,-30,0],
      [-12,-22,0],
      [12,-22,0],
      [-20,-20,Math.PI/2],
      [20,-20,-Math.PI/2],
      [-20,20,Math.PI/2],
      [20,20,-Math.PI/2],
      [-7,19,Math.PI],
      [7,19,Math.PI],
      [10,-5,Math.PI/2],
      [19,7,-Math.PI/2]
    ];

    for(const [x,z,r] of officers) {
      officer(compound,x,z,r);
    }

    // Additional police vehicles on approaches.
    for(const [x,z,r] of [
      [-17,-65,0],
      [17,-65,0],
      [-60,-17,Math.PI/2],
      [-60,17,Math.PI/2],
      [60,-17,-Math.PI/2],
      [60,17,-Math.PI/2],
      [-17,65,Math.PI],
      [17,65,Math.PI]
    ]) {
      policeVehicle(compound,x,z,r);
    }

    // Layered barricades from streets to perimeter.
    for(const depth of [-75,-55,-40]) {
      for(const x of [-28,-18,18,28]) {
        barrier(compound,x,depth);
      }
    }

    for(const depth of [40,55,75]) {
      for(const x of [-28,-18,18,28]) {
        barrier(compound,x,depth);
      }
    }

    for(const side of [-1,1]) {
      for(const x of [40,55,75]) {
        for(const z of [-28,-18,18,28]) {
          barrier(
            compound,
            side*x,z,
            Math.PI/2
          );
        }
      }
    }

    // Camera-facing signs.
    makeSign(
      compound,
      `${entry.name} - RESTRICTED`,
      0,13,-25,
      18
    );

    makeSign(
      compound,
      "SECURITY CHECKPOINT",
      0,9,-35,
      16
    );

    makeSign(
      compound,
      "AUTHORIZED PERSONNEL ONLY",
      0,8,28,
      18
    );

    makeSign(
      compound,
      "POLICE ROADBLOCK",
      0,6,-58,
      16
    );
  }

  let elapsed=0;

  function update(dt) {
    elapsed+=dt;

    const flash=Math.sin(
      elapsed*12
    )>0;

    for(const lights of animatedLights) {
      lights.left.visible=flash;
      lights.right.visible=!flash;
    }

    // Sprites automatically face the active camera.
    // No manual billboard rotation is required.
  }

  return {
    group:root,
    signs,
    update
  };
}