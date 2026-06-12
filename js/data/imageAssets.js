/** PNG asset paths — scenes 720×400, maps ~6:7, portraits */

const S = (name) => `assets/scenes/${name}`;
const M = (name) => `assets/maps/${name}`;
const P = (name) => `assets/portraits/${name}`;

export const SCENE_IMAGES = {
  liberation: S("scene-liberation.png"),
  riot: S("scene-riot.png"),
  government: S("scene-liberation.png"),
  yeosu: S("scene-riot.png"),
  songak: S("scene-hill-battle.png"),
  storm: S("scene-storm.png"),
  hanriver: S("scene-hanriver.png"),
  osan: S("scene-storm.png"),
  daejeon: S("scene-storm.png"),
  naktong: S("scene-naktong.png"),
  dabudong: S("scene-hill-battle.png"),
  tongyeong: S("scene-inchon.png"),
  inchon: S("scene-inchon.png"),
  seoul_flag: S("scene-seoul-flag.png"),
  cross38: S("scene-storm.png"),
  pyongyang: S("scene-storm.png"),
  yalu: S("scene-chinese.png"),
  chinese: S("scene-chinese.png"),
  chosin: S("scene-chosin.png"),
  hungnam: S("scene-hungnam.png"),
  retreat14: S("scene-hanriver.png"),
  chipyong: S("scene-hill-battle.png"),
  wonju: S("scene-hill-battle.png"),
  seoul_again: S("scene-seoul-flag.png"),
  imjin: S("scene-hanriver.png"),
  bloody: S("scene-hill-battle.png"),
  heartbreak: S("scene-hill-battle.png"),
  whitehorse: S("scene-chosin.png"),
  sniper: S("scene-hill-battle.png"),
  armistice: S("scene-armistice.png"),
};

export const MAP_IMAGES = {
  seoul: M("map-seoul.png"),
  seoul_center: M("map-seoul.png"),
  han_river_seoul: M("map-han-river.png"),
  naktong: M("map-naktong.png"),
  inchon: M("map-inchon.png"),
  pyongyang: M("map-pyongyang.png"),
  dabudong: M("map-hill.png"),
  bloody_ridge: M("map-hill.png"),
  heartbreak: M("map-hill.png"),
  white_horse: M("map-hill.png"),
  sniper_ridge: M("map-hill.png"),
  punchbowl: M("map-hill.png"),
  kaesong_songak: M("map-hill.png"),
  osan_pass: M("map-hill.png"),
  uijeongbu_corridor: M("map-town.png"),
  chosin: M("map-chosin.png"),
  onjong_pla: M("map-chosin.png"),
  hungnam: M("map-coastal.png"),
  tongyeong: M("map-coastal.png"),
  yeosu: M("map-coastal.png"),
  daegu: M("map-daegu.png"),
  daejeon: M("map-town.png"),
  chipyong: M("map-town.png"),
  wonju: M("map-town.png"),
  jeju: M("map-hill.png"),
  parallel_yangyang: M("map-town.png"),
  imjin: M("map-han-river.png"),
  yalu_chosan: M("map-chosin.png"),
};

export const PORTRAIT_IMAGES = {
  yuh: P("portrait-yuh.png"),
  hodge: P("portrait-hodge.png"),
  mac: P("portrait-macarthur.png"),
  macarthur: P("portrait-macarthur.png"),
  walker: P("portrait-walker.png"),
  paik: P("portrait-paik.png"),
  rhee: P("portrait-rhee.png"),
  kim: P("portrait-kim.png"),
  kang: P("portrait-kim.png"),
  peng: P("portrait-kpa-officer.png"),
  cho: P("portrait-rok-officer.png"),
  song: P("portrait-rok-officer.png"),
  shin: P("portrait-rok-officer.png"),
  son: P("portrait-rok-officer.png"),
  pak: P("portrait-kim.png"),
  smith: P("portrait-us-officer.png"),
  dean: P("portrait-us-officer.png"),
  freeman: P("portrait-us-officer.png"),
  osmith: P("portrait-us-officer.png"),
  ridgway: P("portrait-us-officer.png"),
  almond: P("portrait-us-officer.png"),
  ridgway: P("portrait-us-officer.png"),
  clark: P("portrait-us-officer.png"),
  chae: P("portrait-rok-officer.png"),
  kimh: P("portrait-rok-officer.png"),
  lee: P("portrait-rok-officer.png"),
  lim: P("portrait-rok-officer.png"),
  carne: P("portrait-us-officer.png"),
  monclar: P("portrait-us-officer.png"),
};

export const PORTRAIT_BY_FACTION = {
  rok: P("portrait-rok-officer.png"),
  police: P("portrait-rok-officer.png"),
  us: P("portrait-us-officer.png"),
  un: P("portrait-us-officer.png"),
  kpa: P("portrait-kpa-officer.png"),
  pla: P("portrait-kpa-officer.png"),
  rebel: P("portrait-kim.png"),
};

export const DOCUMENT_TEXTURE = "assets/documents/doc-newspaper.png";

export function getSceneAsset(sceneKey) {
  return SCENE_IMAGES[sceneKey] || SCENE_IMAGES.liberation;
}

export function getMapAsset(geoKey) {
  return MAP_IMAGES[geoKey] || MAP_IMAGES.seoul;
}

export function getPortraitAsset(speakerId, faction) {
  if (speakerId && PORTRAIT_IMAGES[speakerId]) return PORTRAIT_IMAGES[speakerId];
  return PORTRAIT_BY_FACTION[faction] || PORTRAIT_BY_FACTION.rok;
}
