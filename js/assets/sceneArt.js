/** Scene backgrounds — PNG assets (720×400 anime illustrations) */
import { getSceneAsset } from "../data/imageAssets.js";

export function getSceneImage(sceneKey) {
  return getSceneAsset(sceneKey);
}

export function preloadScenes(keys) {
  keys.forEach((k) => {
    const img = new Image();
    img.src = getSceneAsset(k);
  });
}
