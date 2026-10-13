import * as THREE from "three";

// E5.5D.9: pedestrian-only navigation. Bridges and canals are NEVER graph edges.
export function createPedestrianNetwork(scene) {
  const group = new THREE.Group();
  group.name = "E5.5D.9 - Pedestrian Network";
  const roadCenters = [-480, -300, -120, 120, 300, 480];
  const safeSegments = [
    [-600, -497], [-463, -317], [-283, -137], [-103, -42],
    [42, 103], [137, 283], [317, 463], [497, 600]
  ];
  const sidewalkMaterial = new THREE.MeshStandardMaterial({color:0xb4bec5,roughness:.95});
  const crosswalkMaterial = new THREE.MeshStandardMaterial({color:0xf0eee5,roughness:.95});
  const walkableAreas = [];
  const nodes = [];
  const edges = [];
  const nodeByKey = new Map();
  const districtFor = (x,z) => `${x < 0 ? 'W':'E'}${z < 0 ? 'N':'S'}`;
  const key = (x,z) => `${x.toFixed(3)},${z.toFixed(3)}`;
  function node(x,z) {
    const k=key(x,z);
    if (nodeByKey.has(k)) return nodeByKey.get(k);
    const id=nodes.length;
    nodes.push({x,z,district:districtFor(x,z),neighbors:[]});
    nodeByKey.set(k,id);
    return id;
  }
  function connect(x1,z1,x2,z2,kind='sidewalk') {
    // Reject any canal crossing, including accidental future edits.
    if (districtFor(x1,z1)!==districtFor(x2,z2)) return;
    const a=node(x1,z1), b=node(x2,z2);
    if (a===b || nodes[a].neighbors.includes(b)) return;
    nodes[a].neighbors.push(b);
    nodes[b].neighbors.push(a);
    edges.push({a,b,kind});
  }
  function addWalkway(x,z,width,depth) {
    const mesh=new THREE.Mesh(new THREE.BoxGeometry(width,.25,depth),sidewalkMaterial);
    mesh.position.set(x,.775,z);
    group.add(mesh);
    walkableAreas.push({x,z,width,depth,type:'sidewalk'});
  }
  for (const z of roadCenters) {
    for (const [a,b] of safeSegments) {
      for (const side of [-1,1]) {
        const lane=z+side*13;
        addWalkway((a+b)/2,lane,b-a,4);
        connect(a,lane,b,lane);
      }
    }
  }
  for (const x of roadCenters) {
    for (const [a,b] of safeSegments) {
      for (const side of [-1,1]) {
        const lane=x+side*13;
        addWalkway(lane,(a+b)/2,4,b-a);
        connect(lane,a,lane,b);
      }
    }
  }
  // Corner turns and marked crossings. All stay 17m from the parallel road
  // centerline; crossing edges are confined to one district.
  for (const x of roadCenters) for (const z of roadCenters) {
    for (const sx of [-1,1]) for (const sz of [-1,1]) {
      const cx=x+sx*17, cz=z+sz*17;
      connect(cx,z+sz*13,cx,cz,'corner');
      connect(x+sx*13,cz,cx,cz,'corner');
    }
    for (const sz of [-1,1]) {
      const cz=z+sz*17;
      connect(x-17,cz,x+17,cz,'crosswalk');
      for (let offset=-8;offset<=8;offset+=4) {
        const stripe=new THREE.Mesh(new THREE.BoxGeometry(1.5,.025,2.3),crosswalkMaterial);
        stripe.position.set(x+offset,.93,cz);
        group.add(stripe);
      }
    }
    for (const sx of [-1,1]) {
      const cx=x+sx*17;
      connect(cx,z-17,cx,z+17,'crosswalk');
      for (let offset=-8;offset<=8;offset+=4) {
        const stripe=new THREE.Mesh(new THREE.BoxGeometry(2.3,.025,1.5),crosswalkMaterial);
        stripe.position.set(cx,.93,z+offset);
        group.add(stripe);
      }
    }
  }
  group.userData.walkableAreas=walkableAreas;
  group.userData.roadCenters=roadCenters;
  group.userData.nodes=nodes;
  group.userData.edges=edges;
  group.userData.npcBridgesAllowed=false;
  group.userData.npcDistrictCrossingAllowed=false;
  group.userData.crosswalksPending=false;
  scene.add(group);
  console.log('E5.5D.9 PEDESTRIAN GRAPH', {sidewalkSegments:walkableAreas.length,nodes:nodes.length,edges:edges.length});
  return group;
}
