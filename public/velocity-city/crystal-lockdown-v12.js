// VELOCITY_LOCKDOWN_V12

export function createCrystalLockdownV12(
  THREE,scene,crystals
) {
  const group=new THREE.Group();
  group.name="Velocity Four-Way Lockdown V12";
  scene.add(group);

  const corridors=[-480,-300,-120,120,300,480];
  const mainTowers=crystals.filter(
    c=>c.name!=="CONTACT"
  );

  const rectangles=[];
  const barriers=[];
  const lamps=[];

  function adjacentSignals(value) {
    const lower=corridors.filter(v=>v<value).at(-1);
    const upper=corridors.find(v=>v>value);

    return [
      lower??value-180,
      upper??value+180
    ];
  }

  function addRectangle(x1,x2,z1,z2) {
    rectangles.push({
      minX:Math.min(x1,x2),
      maxX:Math.max(x1,x2),
      minZ:Math.min(z1,z2),
      maxZ:Math.max(z1,z2)
    });
  }

  // Actual road corridors between signal intersections.
  for(const tower of mainTowers) {
    const [west,east]=adjacentSignals(tower.x);
    const [north,south]=adjacentSignals(tower.z);

    addRectangle(
      west,east,
      tower.z-18,tower.z+18
    );

    addRectangle(
      tower.x-18,tower.x+18,
      north,south
    );
  }

  // CONTACT is near the canal, not on a regular
  // four-way street intersection.
  const contact=crystals.find(c=>c.name==="CONTACT");

  if(contact) {
    addRectangle(
      contact.x-45,contact.x+45,
      contact.z-45,contact.z+45
    );
  }

  function restricted(x,z) {
    return rectangles.some(r=>
      x>=r.minX && x<=r.maxX &&
      z>=r.minZ && z<=r.maxZ
    );
  }

  function segmentRestricted(ax,az,bx,bz) {
    const length=Math.hypot(bx-ax,bz-az);
    const steps=Math.max(1,Math.ceil(length/8));

    for(let i=0;i<=steps;i++) {
      const t=i/steps;

      if(restricted(
        ax+(bx-ax)*t,
        az+(bz-az)*t
      )) return true;
    }

    return false;
  }

  // Shared low-poly barrier geometry and materials.
  const barrierGeometry=new THREE.BoxGeometry(1,1,1);

  const concrete=new THREE.MeshStandardMaterial({
    color:0x59636d,
    roughness:0.9
  });

  const hazard=new THREE.MeshBasicMaterial({
    color:0xffc22d
  });

  const dark=new THREE.MeshBasicMaterial({
    color:0x10151c
  });

  const warningLight=new THREE.MeshBasicMaterial({
    color:0xff243c
  });

  function cube(parent,mat,w,h,d,x,y,z) {
    const mesh=new THREE.Mesh(barrierGeometry,mat);
    mesh.scale.set(w,h,d);
    mesh.position.set(x,y,z);
    parent.add(mesh);
    return mesh;
  }

  function barricade(x,z,rotation=0) {
    const root=new THREE.Group();
    root.position.set(x,0,z);
    root.rotation.y=rotation;
    group.add(root);

    cube(root,concrete,19,2.3,2,0,1.15,0);
    cube(root,dark,19.5,0.25,2.2,0,0.15,0);

    for(let i=-8;i<=8;i+=2) {
      const stripe=cube(
        root,hazard,0.9,0.7,2.1,
        i,1.7,0
      );
      stripe.rotation.z=-0.45;
    }

    for(const side of [-1,1]) {
      cube(
        root,dark,0.25,3.1,0.25,
        side*8.7,3,0
      );

      const lamp=cube(
        root,warningLight,0.9,0.6,0.9,
        side*8.7,4.65,0
      );

      lamps.push(lamp);
    }

    barriers.push(root);
  }

  function sign(text,x,y,z,width=19) {
    const canvas=document.createElement("canvas");
    canvas.width=1024;
    canvas.height=256;

    const ctx=canvas.getContext("2d");

    ctx.fillStyle="#090f18";
    ctx.fillRect(0,0,1024,256);

    ctx.strokeStyle="#ffbe2e";
    ctx.lineWidth=14;
    ctx.strokeRect(8,8,1008,240);

    ctx.fillStyle="#ffffff";
    ctx.textAlign="center";
    ctx.textBaseline="middle";
    ctx.font="900 66px Arial";
    ctx.fillText(text,512,128,950);

    const texture=new THREE.CanvasTexture(canvas);
    texture.colorSpace=THREE.SRGBColorSpace;

    const sprite=new THREE.Sprite(
      new THREE.SpriteMaterial({
        map:texture,
        transparent:true
      })
    );

    sprite.position.set(x,y,z);
    sprite.scale.set(width,width/4,1);
    group.add(sprite);
  }

  // Barricades are visual: checkpoint access remains
  // governed by the existing V8 security system.
  for(const tower of mainTowers) {
    const [west,east]=adjacentSignals(tower.x);
    const [north,south]=adjacentSignals(tower.z);

    const arms=[
      {axis:"x",end:west,dir:-1},
      {axis:"x",end:east,dir:1},
      {axis:"z",end:north,dir:-1},
      {axis:"z",end:south,dir:1}
    ];

    for(const arm of arms.filter(a=>a.axis==="z" && a.dir===-1)) {
      const start=arm.axis==="x"?tower.x:tower.z;
      const length=Math.abs(arm.end-start);

      // Defensive barriers begin near the signal.
      // Existing V9 barricades protect the inner base.
      const distances=[
        Math.max(35,length-15),
        Math.max(35,length-45),
        Math.max(35,length-75)
      ];

      for(const distance of new Set(distances)) {
        const coordinate=start+arm.dir*distance;

        const x=arm.axis==="x"?coordinate:tower.x;
        const z=arm.axis==="z"?coordinate:tower.z;

        barricade(
          x,z,
          arm.axis==="z"?0:Math.PI/2
        );
      }

      const signDistance=Math.max(35,length-25);
      const sx=arm.axis==="x"
        ?start+arm.dir*signDistance
        :tower.x;
      const sz=arm.axis==="z"
        ?start+arm.dir*signDistance
        :tower.z;

      sign("ACCESS RESTRICTED",sx,9,sz);
    }

    sign(
      "DANGER - HIGH VOLTAGE",
      tower.x-20,9,tower.z-28,
      19
    );

    sign(
      "MILITARY CHECKPOINT",
      tower.x+20,9,tower.z-28,
      19
    );
  }

  // CONTACT: smaller protected approach due to canal.
  if(contact) {
    for(const [x,z,r] of [
      [contact.x-38,contact.z,Math.PI/2],
      [contact.x+38,contact.z,Math.PI/2],
      [contact.x,contact.z-38,0],
      [contact.x,contact.z+38,0]
    ]) {
      barricade(x,z,r);
    }

    sign(
      "ACCESS RESTRICTED",
      contact.x,11,contact.z-43
    );
  }

  function pruneTraffic(traffic) {
    if(!traffic?.cars) {
      return {removed:0,remaining:0};
    }

    let removed=0;

    for(let i=traffic.cars.length-1;i>=0;i--) {
      const car=traffic.cars[i];
      const mesh=car?.mesh;

      if(!mesh) continue;

      // A vehicle moves along its entire assigned
      // corridor. Remove it if that route intersects
      // any protected road section.
      const axis=car.axis;
      const x=mesh.position.x;
      const z=mesh.position.z;

      let intersects=false;

      if(axis==="x") {
        intersects=segmentRestricted(
          -600,z,600,z
        );
      } else if(axis==="z") {
        intersects=segmentRestricted(
          x,-600,x,600
        );
      } else {
        intersects=restricted(x,z);
      }

      if(!restricted(x,z)) continue;

      if(mesh.parent) mesh.parent.remove(mesh);

      mesh.traverse(object=>{
        if(object.isMesh && object.geometry) {
          // Materials and geometry may be shared.
          // Do not dispose shared resources here.
        }
      });

      traffic.cars.splice(i,1);
      removed++;
    }

    return {
      removed,
      remaining:traffic.cars.length
    };
  }

  function prunePedestrianNetwork(network) {
    const nodes=network?.userData?.nodes;

    if(!Array.isArray(nodes)) {
      return {removedEdges:0};
    }

    let removedEdges=0;

    for(let i=0;i<nodes.length;i++) {
      const a=nodes[i];

      const before=a.neighbors.length;

      a.neighbors=a.neighbors.filter(j=>{
        const b=nodes[j];

        if(!b) return false;

        return !segmentRestricted(
          a.x,a.z,b.x,b.z
        );
      });

      removedEdges+=before-a.neighbors.length;
    }

    // Existing edge metadata must match new connectivity.
    const edges=network.userData.edges;

    if(Array.isArray(edges)) {
      for(let i=edges.length-1;i>=0;i--) {
        const e=edges[i];
        const a=nodes[e.a];
        const b=nodes[e.b];

        if(!a || !b ||
          !a.neighbors.includes(e.b) ||
          !b.neighbors.includes(e.a)) {
          edges.splice(i,1);
        }
      }
    }

    return {removedEdges};
  }

  let time=0;

  function update(dt) {
    time+=Math.min(dt||0,0.1);

    const flash=Math.floor(time*4)%2===0;

    for(const lamp of lamps) {
      lamp.visible=flash;
    }
  }

  return {
    group,
    rectangles,
    restricted,
    pruneTraffic,
    prunePedestrianNetwork,
    update
  };
}