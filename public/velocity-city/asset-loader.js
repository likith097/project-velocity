import * as THREE from "three";
import {GLTFLoader} from "three/addons/loaders/GLTFLoader.js";

const loader = new GLTFLoader();

export async function loadCityAsset(scene, options) {
  const {
    url,
    name = "City Asset",
    position = [0, 0, 0],
    rotation = [0, 0, 0],
    scale = 1,
    visible = true
  } = options;

  if (!url) {
    throw new Error("Asset URL is required.");
  }

  const gltf = await loader.loadAsync(url);
  const model = gltf.scene;

  model.name = name;
  model.position.set(...position);
  model.rotation.set(...rotation);

  if (Array.isArray(scale)) {
    model.scale.set(...scale);
  } else {
    model.scale.setScalar(scale);
  }

  model.visible = visible;

  model.traverse(object => {
    if (object.isMesh) {
      object.castShadow = true;
      object.receiveShadow = true;
    }
  });

  scene.add(model);

  return model;
}

export function createCityAssetManager(scene) {
  const assets = new Map();

  return {
    async add(id, options) {
      if (assets.has(id)) {
        throw new Error(`Duplicate asset ID: ${id}`);
      }

      const model = await loadCityAsset(scene, options);
      assets.set(id, model);
      return model;
    },

    get(id) {
      return assets.get(id);
    },

    remove(id) {
      const model = assets.get(id);
      if (!model) return false;

      scene.remove(model);
      assets.delete(id);
      return true;
    },

    list() {
      return [...assets.keys()];
    }
  };
}