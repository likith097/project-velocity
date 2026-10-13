// VELOCITY_CIVILIAN_EXCLUSION_V11

export function createCivilianExclusion(
  THREE,
  crystals,
  cityTraffic,
  npcSystem
) {
  const EXCLUSION_RADIUS = 120;
  const radiusSquared =
    EXCLUSION_RADIUS * EXCLUSION_RADIUS;

  const tempPosition = new THREE.Vector3();

  const centers = crystals.map(entry => ({
    name: entry.name,
    x: entry.x,
    z: entry.z
  }));

  function isRestricted(x,z) {
    for(const center of centers) {
      const dx=x-center.x;
      const dz=z-center.z;

      if(dx*dx+dz*dz <= radiusSquared) {
        return true;
      }
    }

    return false;
  }

  function getObjectPosition(object) {
    if(!object?.isObject3D) return null;

    object.getWorldPosition(tempPosition);

    return {
      x:tempPosition.x,
      z:tempPosition.z
    };
  }

  function applyExclusion() {
    let hiddenCars=0;
    let hiddenNPCs=0;

    // Active city-traffic.js:
    // cars[i].mesh is the actual moving vehicle.
    const cars=cityTraffic?.cars || [];

    for(const car of cars) {
      const mesh=car?.mesh;
      if(!mesh) continue;

      const position=getObjectPosition(mesh);
      if(!position) continue;

      const restricted=isRestricted(
        position.x,
        position.z
      );

      mesh.visible=!restricted;

      if(restricted) hiddenCars++;
    }

    // Active npcs.js:
    // pedestrians[i].root is the complete NPC.
    const pedestrians=npcSystem?.pedestrians || [];

    for(const npc of pedestrians) {
      const root=npc?.root;
      if(!root) continue;

      const position=getObjectPosition(root);
      if(!position) continue;

      const restricted=isRestricted(
        position.x,
        position.z
      );

      // Preserve the NPC system's normal distance
      // visibility behavior outside the lockdown.
      if(restricted) {
        root.visible=false;
        hiddenNPCs++;
      }
    }

    return {
      hiddenCars,
      hiddenNPCs
    };
  }

  let reportTimer=0;
  let lastReport={
    hiddenCars:0,
    hiddenNPCs:0
  };

  function update(dt) {
    lastReport=applyExclusion();

    reportTimer+=dt;

    if(reportTimer>=10) {
      reportTimer=0;

      console.debug(
        "[Velocity V11] Restricted streets:",
        lastReport.hiddenCars,
        "civilian vehicles excluded;",
        lastReport.hiddenNPCs,
        "pedestrians excluded"
      );
    }
  }

  return {
    update,
    isRestricted,
    get stats() {
      return {...lastReport};
    },
    exclusionRadius:EXCLUSION_RADIUS
  };
}