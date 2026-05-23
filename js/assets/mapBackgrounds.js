/** Tactical map backgrounds — PNG top-down illustrations */
import { getMapAsset } from "../data/imageAssets.js";

export function getMapBackgroundUrl(geoKey) {
  return getMapAsset(geoKey || "seoul");
}

export function applyMapBackground(stageEl, geoKey) {
  if (!stageEl) return;
  const url = getMapBackgroundUrl(geoKey);
  stageEl.style.backgroundImage = `url('${url}')`;
  stageEl.style.backgroundSize = "100% 100%";
  stageEl.style.backgroundPosition = "center";
}
