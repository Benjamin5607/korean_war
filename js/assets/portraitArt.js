/** Dialogue speaker portraits — PNG bust illustrations */
import { getPortraitAsset } from "../data/imageAssets.js";

export function getPortraitUrl(speakerId, faction) {
  return getPortraitAsset(speakerId, faction);
}
