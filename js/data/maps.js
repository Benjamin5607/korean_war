import { GEO_REGIONS, MAP_TO_GEO } from "./geoMaps.js";
import { getTerrainAt, getTerrainStats } from "../game/terrain.js";

/** Map templates: terrain codes p=plain f=forest c=city b=bunker r=river m=mountain s=snow h=beach */
export const MAP_TEMPLATES = {
  seoul_city: {
    cols: 10, rows: 10,
    terrain: [
      "cccccccccc",
      "ccppppppcc",
      "cppffffppc",
      "cpfpbbpfpc",
      "cppfpfpfpc",
      "cppfpfpfpc",
      "cpfpbbpfpc",
      "cppffffppc",
      "ccppppppcc",
      "cccccccccc",
    ],
    objectives: [{ x: 5, y: 3 }],
    escape: null,
  },
  daegu_riot: {
    cols: 10, rows: 10,
    terrain: [
      "ccccppcccc",
      "ccppppppcc",
      "cppffffppc",
      "cpfpfpfpfc",
      "cppfpfpfpc",
      "cppfpfpfpc",
      "cpfpfpfpfc",
      "cppffffppc",
      "ccppppppcc",
      "ccccppcccc",
    ],
    objectives: [{ x: 4, y: 4 }, { x: 5, y: 5 }],
    escape: null,
  },
  jeju_hill: {
    cols: 10, rows: 10,
    terrain: [
      "mmmmmmpppp",
      "mmmfmfpppp",
      "mmffmfpppp",
      "mffbbffppp",
      "mfffpffppp",
      "mfffpffppp",
      "mffbbffppp",
      "mmffmfpppp",
      "mmmfmfpppp",
      "mmmmmmpppp",
    ],
    objectives: [{ x: 4, y: 3 }],
    escape: null,
  },
  yeosu_street: {
    cols: 10, rows: 10,
    terrain: [
      "cccccccccc",
      "cppbbppccc",
      "cpfpfpfppc",
      "cppfpfpfpc",
      "cppfpfpfpc",
      "cppfpfpfpc",
      "cpfpfpfppc",
      "cppbbppccc",
      "cccccccccc",
      "cccccccccc",
    ],
    objectives: [{ x: 5, y: 4 }],
    escape: null,
  },
  songak_hill: {
    cols: 10, rows: 10,
    terrain: [
      "mmmmmmmmmm",
      "mmmbbbmmmm",
      "mmmbbbmmmm",
      "mmffffmmmm",
      "mmffffmmmm",
      "ppffffpppp",
      "ppffffpppp",
      "pppppppppp",
      "pppppppppp",
      "pppppppppp",
    ],
    objectives: [{ x: 4, y: 2 }, { x: 5, y: 2 }],
    escape: null,
  },
  invasion_625: {
    cols: 10, rows: 12,
    terrain: [
      "pppppppppp",
      "pppppppppp",
      "ppffffpppp",
      "ppffffpppp",
      "pppppppppp",
      "rrrrrrrrrr",
      "pppppppppp",
      "ppffffpppp",
      "ppffffpppp",
      "pppppppppp",
      "pppppppppp",
      "pppppppppp",
    ],
    objectives: [],
    escape: { x: 1, y: 10, w: 2, h: 2 },
  },
  han_river: {
    cols: 10, rows: 12,
    terrain: [
      "cccccccccc",
      "cccccccccc",
      "pppppppppp",
      "pppppppppp",
      "rrrrrrrrrr",
      "rrrrrrrrrr",
      "pppppppppp",
      "pppppppppp",
      "ppffffpppp",
      "ppffffpppp",
      "pppppppppp",
      "pppppppppp",
    ],
    objectives: [],
    escape: { x: 7, y: 8, w: 3, h: 2 },
  },
  osan_hill: {
    cols: 10, rows: 10,
    terrain: [
      "pppppppppp",
      "ppmmmmpppp",
      "ppmbbbpppp",
      "ppmbbbpppp",
      "ppmmmmpppp",
      "pppppppppp",
      "ppffffpppp",
      "ppffffpppp",
      "pppppppppp",
      "pppppppppp",
    ],
    objectives: [{ x: 5, y: 2 }],
    escape: { x: 0, y: 8, w: 2, h: 2 },
  },
  daejeon_city: {
    cols: 10, rows: 10,
    terrain: [
      "cccccccccc",
      "ccppbbppcc",
      "cppfpfpfcc",
      "cppfpfpfcc",
      "cppbbbbfcc",
      "cppbbbbfcc",
      "cppfpfpfcc",
      "ccppbbppcc",
      "cccccccccc",
      "cccccccccc",
    ],
    objectives: [{ x: 5, y: 4 }],
    escape: null,
  },
  naktong_line: {
    cols: 12, rows: 8,
    terrain: [
      "pppppppppppp",
      "ppffffffffff",
      "ppffffffffff",
      "ppffffffffff",
      "rrrrrrrrrrrr",
      "hhhhhhhhhhhh",
      "hhhhhhhhhhhh",
      "hhhhhhhhhhhh",
    ],
    objectives: [{ x: 6, y: 2 }, { x: 8, y: 2 }],
    escape: null,
  },
  dabudong: {
    cols: 10, rows: 10,
    terrain: [
      "mmmmmmmmmm",
      "mmmfffmmmm",
      "mmffbbmmmm",
      "mmfbbbmmmm",
      "mmffbbmmmm",
      "ppffbbpppp",
      "ppffbbpppp",
      "pppppppppp",
      "pppppppppp",
      "pppppppppp",
    ],
    objectives: [{ x: 4, y: 3 }],
    escape: null,
  },
  tongyeong_beach: {
    cols: 10, rows: 10,
    terrain: [
      "pppppppppp",
      "pppppppppp",
      "ppffffpppp",
      "ppffffpppp",
      "hhhhhhhhhh",
      "hhhhhhhhhh",
      "rrrrrrrrrr",
      "pppppppppp",
      "pppppppppp",
      "pppppppppp",
    ],
    objectives: [{ x: 5, y: 3 }],
    escape: null,
  },
  inchon_landing: {
    cols: 10, rows: 10,
    terrain: [
      "pppppppppp",
      "pppppppppp",
      "hhhhhhhhhh",
      "hhhhhhhhhh",
      "cccccccccc",
      "ccppbbppcc",
      "cppfpfpfcc",
      "cppfpfpfcc",
      "cccccccccc",
      "cccccccccc",
    ],
    objectives: [{ x: 5, y: 5 }],
    escape: null,
  },
  seoul_recapture: {
    cols: 10, rows: 10,
    terrain: [
      "cccccccccc",
      "ccbbbbcccc",
      "cbppppbccc",
      "cbpffpbccc",
      "cbpffpbccc",
      "cbpffpbccc",
      "cbppppbccc",
      "ccbbbbcccc",
      "cccccccccc",
      "cccccccccc",
    ],
    objectives: [{ x: 5, y: 4 }],
    escape: null,
  },
  cross_38: {
    cols: 10, rows: 10,
    terrain: [
      "pppppppppp",
      "ppmmmmpppp",
      "ppmbbbpppp",
      "ppmbbbpppp",
      "rrrrrrrrrr",
      "pppppppppp",
      "ppffffpppp",
      "ppffffpppp",
      "pppppppppp",
      "pppppppppp",
    ],
    objectives: [{ x: 5, y: 3 }],
    escape: null,
  },
  pyongyang: {
    cols: 10, rows: 10,
    terrain: [
      "cccccccccc",
      "ccppppppcc",
      "cppffffppc",
      "cpfrrrfppc",
      "cpfrrrfppc",
      "cppffffppc",
      "ccppppppcc",
      "cccccccccc",
      "pppppppppp",
      "pppppppppp",
    ],
    objectives: [{ x: 5, y: 4 }],
    escape: null,
  },
  yalu_river: {
    cols: 10, rows: 10,
    terrain: [
      "pppppppppp",
      "ppmmmmpppp",
      "ppmbbbpppp",
      "rrrrrrrrrr",
      "pppppppppp",
      "ppffffpppp",
      "ppffffpppp",
      "pppppppppp",
      "pppppppppp",
      "pppppppppp",
    ],
    objectives: [{ x: 5, y: 5 }],
    escape: null,
  },
  chinese_night: {
    cols: 10, rows: 10,
    terrain: [
      "ssssssssss",
      "ssffssffss",
      "ssfpssfpss",
      "ssfpbbfpss",
      "ssfpssfpss",
      "ssffssffss",
      "ssssssssss",
      "pppppppppp",
      "pppppppppp",
      "pppppppppp",
    ],
    objectives: [],
    escape: { x: 8, y: 7, w: 2, h: 2 },
  },
  chosin: {
    cols: 10, rows: 12,
    terrain: [
      "ssssssssss",
      "ssmmmmssss",
      "ssmbbbssss",
      "ssmbbbssss",
      "ssmmmmssss",
      "ssssssssss",
      "pppppppppp",
      "ppffffpppp",
      "ppffffpppp",
      "pppppppppp",
      "pppppppppp",
      "pppppppppp",
    ],
    objectives: [],
    escape: { x: 0, y: 10, w: 3, h: 2 },
  },
  hungnam: {
    cols: 10, rows: 10,
    terrain: [
      "pppppppppp",
      "ppccccpppp",
      "ppccccpppp",
      "hhhhhhhhhh",
      "hhhhhhhhhh",
      "rrrrrrrrrr",
      "pppppppppp",
      "pppppppppp",
      "pppppppppp",
      "pppppppppp",
    ],
    objectives: [{ x: 5, y: 3 }],
    escape: { x: 7, y: 7, w: 3, h: 2 },
  },
  seoul_relost: {
    cols: 10, rows: 10,
    terrain: [
      "cccccccccc",
      "ccppppppcc",
      "cppffffppc",
      "cpfrrrfppc",
      "cpfrrrfppc",
      "cppffffppc",
      "ccppppppcc",
      "cccccccccc",
      "pppppppppp",
      "pppppppppp",
    ],
    objectives: [],
    escape: { x: 1, y: 8, w: 3, h: 2 },
  },
  chipyong: {
    cols: 10, rows: 10,
    terrain: [
      "pppppppppp",
      "ppbbbbpppp",
      "ppbbbbpppp",
      "ppffffpppp",
      "ppffffpppp",
      "pppppppppp",
      "pppppppppp",
      "pppppppppp",
      "pppppppppp",
      "pppppppppp",
    ],
    objectives: [{ x: 5, y: 2 }],
    escape: null,
  },
  wonju: {
    cols: 10, rows: 10,
    terrain: [
      "pppppppppp",
      "ppffffpppp",
      "ppfbbbfppp",
      "ppfbbbfppp",
      "ppffffpppp",
      "pppppppppp",
      "mmmmmmpppp",
      "mmmmmmpppp",
      "pppppppppp",
      "pppppppppp",
    ],
    objectives: [{ x: 4, y: 2 }, { x: 5, y: 2 }],
    escape: null,
  },
  seoul_again: {
    cols: 10, rows: 10,
    terrain: [
      "cccccccccc",
      "ccbbbbcccc",
      "cbppppbccc",
      "cbpmmmbccc",
      "cbpmmmbccc",
      "cbppppbccc",
      "ccbbbbcccc",
      "cccccccccc",
      "pppppppppp",
      "pppppppppp",
    ],
    objectives: [{ x: 5, y: 4 }],
    escape: null,
  },
  imjin_gapyeong: {
    cols: 12, rows: 8,
    terrain: [
      "pppppppppppp",
      "ppmmmmffffff",
      "ppmbbbffffff",
      "rrrrrrffffff",
      "ppppppffffff",
      "ppppppffffff",
      "pppppppppppp",
      "pppppppppppp",
    ],
    objectives: [{ x: 6, y: 2 }],
    escape: null,
  },
  bloody_ridge: {
    cols: 10, rows: 10,
    terrain: [
      "mmmmmmmmmm",
      "mmmbbbmmmm",
      "mmmbbbmmmm",
      "mmffffmmmm",
      "mmffffmmmm",
      "ppffffpppp",
      "ppffffpppp",
      "pppppppppp",
      "pppppppppp",
      "pppppppppp",
    ],
    objectives: [{ x: 5, y: 2 }],
    escape: null,
  },
  heartbreak_ridge: {
    cols: 10, rows: 10,
    terrain: [
      "mmmmmmmmmm",
      "mmmbbbmmmm",
      "mmbbbbmmmm",
      "mmffffmmmm",
      "mmffffmmmm",
      "ppffffpppp",
      "ppbbbbpppp",
      "ppbbbbpppp",
      "pppppppppp",
      "pppppppppp",
    ],
    objectives: [{ x: 4, y: 2 }],
    escape: null,
  },
  white_horse: {
    cols: 10, rows: 10,
    terrain: [
      "mmmmmmmmmm",
      "mmmsssmmmm",
      "mmssssmmmm",
      "mmssbbmmmm",
      "mmssbbmmmm",
      "ppssbbpppp",
      "ppsssspppp",
      "pppppppppp",
      "pppppppppp",
      "pppppppppp",
    ],
    objectives: [{ x: 5, y: 3 }],
    escape: null,
  },
  sniper_ridge: {
    cols: 10, rows: 10,
    terrain: [
      "mmmmmmmmmm",
      "mmmbbbmmmm",
      "mmbbbbmmmm",
      "mmffffmmmm",
      "mmffffmmmm",
      "ppbbbbpppp",
      "ppbbbbpppp",
      "pppppppppp",
      "pppppppppp",
      "pppppppppp",
    ],
    objectives: [{ x: 5, y: 2 }],
    escape: null,
  },
  punchbowl_final: {
    cols: 10, rows: 10,
    terrain: [
      "pppppppppp",
      "ppmmmmpppp",
      "ppmbbbpppp",
      "ppmbbbpppp",
      "ppmmmmpppp",
      "ppffffpppp",
      "ppffffpppp",
      "ppbbbbpppp",
      "ppbbbbpppp",
      "pppppppppp",
    ],
    objectives: [{ x: 5, y: 3 }],
    escape: null,
  },
};

const TERRAIN_CHAR = {
  p: "plain", f: "forest", c: "city", b: "bunker", r: "river", m: "mountain", s: "snow", h: "beach",
  B: "bridge", w: "ford",
  G: "palace", T: "capitol", K: "hanok", L: "colonial", D: "depot", F: "fort", V: "village",
  g: "gate", t: "city",
};

export function isTilePassable(map, x, y) {
  if (x < 0 || y < 0 || x >= map.cols || y >= map.rows) return false;
  return getTerrainStats(getTerrainAt(map, x, y)).movCost < 99;
}

/** Move objectives / escape off rivers & mountains */
export function snapPointToPassable(map, x, y) {
  if (isTilePassable(map, x, y)) return { x, y };
  for (let r = 1; r <= 12; r++) {
    for (let dy = -r; dy <= r; dy++) {
      for (let dx = -r; dx <= r; dx++) {
        if (Math.abs(dx) + Math.abs(dy) !== r) continue;
        const nx = x + dx;
        const ny = y + dy;
        if (isTilePassable(map, nx, ny)) return { x: nx, y: ny };
      }
    }
  }
  return { x: Math.max(0, Math.min(map.cols - 1, x)), y: Math.max(0, Math.min(map.rows - 1, y)) };
}

export function validateMapMissionSites(map) {
  if (!map?.terrain?.length) return map;

  if (map.objectives?.length) {
    map.objectives = map.objectives.map((o) => {
      const p = snapPointToPassable(map, o.x, o.y);
      return { ...o, x: p.x, y: p.y };
    });
  }

  if (map.escape) {
    const esc = map.escape;
    let hasPassable = false;
    for (let y = esc.y; y < esc.y + esc.h; y++) {
      for (let x = esc.x; x < esc.x + esc.w; x++) {
        if (isTilePassable(map, x, y)) hasPassable = true;
      }
    }
    if (!hasPassable) {
      const p = snapPointToPassable(map, esc.x, esc.y);
      esc.x = p.x;
      esc.y = p.y;
    }
  }

  return map;
}

function terrainFromGrid(tpl) {
  const terrain = [];
  for (let y = 0; y < tpl.rows; y++) {
    const row = tpl.terrain[y] || "";
    for (let x = 0; x < tpl.cols; x++) {
      const ch = row[x] || "p";
      const type = TERRAIN_CHAR[ch] || "plain";
      terrain.push({ x, y, type });
    }
  }
  return terrain;
}

/** Enlarge tactical maps for large unit counts */
const MAP_UPSCALE = 1.38;

function upscaleMapTemplate(tpl) {
  if (!tpl) return null;
  const baseCols = tpl.cols;
  const baseRows = tpl.rows;
  const cols = Math.max(baseCols + 2, Math.round(baseCols * MAP_UPSCALE));
  const rows = Math.max(baseRows + 2, Math.round(baseRows * MAP_UPSCALE));

  const terrainRows = [];
  for (let y = 0; y < rows; y++) {
    let row = "";
    for (let x = 0; x < cols; x++) {
      const sx = Math.min(baseCols - 1, Math.floor((x * baseCols) / cols));
      const sy = Math.min(baseRows - 1, Math.floor((y * baseRows) / rows));
      const ch = (tpl.terrain[sy] || "")[sx] || "p";
      row += ch;
    }
    terrainRows.push(row);
  }

  const scaleX = (v) => Math.round((v * (cols - 1)) / Math.max(1, baseCols - 1));
  const scaleY = (v) => Math.round((v * (rows - 1)) / Math.max(1, baseRows - 1));

  const objectives = (tpl.objectives || []).map((o) => ({ x: scaleX(o.x), y: scaleY(o.y) }));
  let escape = null;
  if (tpl.escape) {
    escape = {
      x: scaleX(tpl.escape.x),
      y: scaleY(tpl.escape.y),
      w: Math.max(2, Math.round(tpl.escape.w * (cols / baseCols))),
      h: Math.max(2, Math.round(tpl.escape.h * (rows / baseRows))),
    };
  }

  const labels = (tpl.labels || []).map((l) => ({
    x: scaleX(l.x),
    y: scaleY(l.y),
    ko: l.ko,
    en: l.en,
  }));

  return {
    cols,
    rows,
    terrain: terrainRows,
    objectives,
    escape,
    labels,
    baseCols,
    baseRows,
  };
}

/** Scale spawn coords when map was upscaled from template base size */
export function scaleSpawnToMap(spec, map) {
  const bc = map.baseCols ?? map.cols;
  const br = map.baseRows ?? map.rows;
  if (bc === map.cols && br === map.rows) return spec;
  const out = {
    ...spec,
    x: Math.round((spec.x * (map.cols - 1)) / Math.max(1, bc - 1)),
    y: Math.round((spec.y * (map.rows - 1)) / Math.max(1, br - 1)),
  };
  return out;
}

export function buildMapFromTemplate(templateId, lang = "ko") {
  const geoKey = MAP_TO_GEO[templateId];
  const geo = geoKey ? GEO_REGIONS[geoKey] : null;
  const raw = geo || MAP_TEMPLATES[templateId];
  if (!raw) return null;
  const tpl = upscaleMapTemplate(raw);
  const map = {
    cols: tpl.cols,
    rows: tpl.rows,
    terrain: terrainFromGrid(tpl),
    objectives: tpl.objectives ? tpl.objectives.map((o) => ({ ...o })) : [],
    escape: tpl.escape ? { ...tpl.escape } : null,
    labels: tpl.labels
      ? tpl.labels.map((l) => ({ x: l.x, y: l.y, text: lang === "en" ? l.en : l.ko }))
      : [],
    geoKey: geoKey || templateId,
    displayName: geo ? (lang === "en" ? geo.nameEn : geo.nameKo) : templateId,
    baseCols: tpl.baseCols,
    baseRows: tpl.baseRows,
  };
  return validateMapMissionSites(map);
}
