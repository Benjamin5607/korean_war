import { getTerrainAt, getTerrainStats } from "../game/terrain.js";
import { scaleSpawnToMap, validateMapMissionSites } from "./maps.js";
import {
  getHistoricalForceTargets,
  pickFromMix,
  applyMixToSpawnList,
} from "./historicalForces.js";

/**
 * Balanced per-scenario forces & spawn positions.
 * Hold: allies start ON objective; enemies outnumber 1.3~1.8x
 * Rivers use bridges — not full blockade.
 */
export const SCENARIO_LOADOUTS = {
  1: {
    allies: [
      { variant: "police", x: 5, y: 6 }, { variant: "police", x: 6, y: 6 },
      { variant: "militia", x: 4, y: 7 }, { variant: "militia", x: 7, y: 7 },
    ],
    enemies: [
      { variant: "rebel_inf", x: 3, y: 2 }, { variant: "rebel_inf", x: 5, y: 1 },
      { variant: "rebel_inf", x: 7, y: 2 }, { variant: "rebel_inf", x: 8, y: 3 },
    ],
    objectives: [{ x: 5, y: 6 }],
  },
  2: {
    allies: [
      { variant: "police", x: 2, y: 10 }, { variant: "police", x: 3, y: 10 },
      { variant: "rok_inf", x: 4, y: 11 }, { variant: "militia", x: 5, y: 11 },
    ],
    enemies: [
      { variant: "rebel_inf", x: 8, y: 3 }, { variant: "rebel_inf", x: 9, y: 4 },
      { variant: "rebel_inf", x: 7, y: 5 }, { variant: "rebel_inf", x: 10, y: 3 },
      { variant: "rebel_inf", x: 6, y: 4 },
    ],
    objectives: [{ x: 8, y: 4 }, { x: 9, y: 5 }],
  },
  3: {
    allies: [
      { variant: "rok_inf", x: 6, y: 11 }, { variant: "rok_inf", x: 7, y: 11 },
      { variant: "mortar", x: 5, y: 12 }, { variant: "police", x: 8, y: 12 },
    ],
    enemies: [
      { variant: "rebel_inf", x: 5, y: 2 }, { variant: "rebel_inf", x: 6, y: 1 },
      { variant: "rebel_inf", x: 7, y: 2 }, { variant: "mortar", x: 4, y: 3 },
    ],
    objectives: [{ x: 6, y: 10 }],
  },
  4: {
    allies: [
      { variant: "rok_inf", x: 3, y: 11 }, { variant: "rok_inf", x: 6, y: 11 },
      { variant: "mortar", x: 4, y: 12 }, { variant: "bazooka", x: 7, y: 12 },
    ],
    enemies: [
      { variant: "rebel_inf", x: 5, y: 3 }, { variant: "rebel_inf", x: 6, y: 4 },
      { variant: "rebel_inf", x: 7, y: 3 }, { variant: "rebel_inf", x: 8, y: 5 },
      { variant: "rebel_inf", x: 4, y: 4 },
    ],
    objectives: [{ x: 6, y: 4 }],
  },
  5: {
    allies: [
      { variant: "rok_inf", x: 6, y: 12 }, { variant: "rok_inf", x: 7, y: 12 },
      { variant: "bazooka", x: 5, y: 13 }, { variant: "mortar", x: 8, y: 13 },
    ],
    enemies: [
      { variant: "kpa_inf", x: 5, y: 2 }, { variant: "kpa_inf", x: 6, y: 2 },
      { variant: "kpa_gun", x: 7, y: 1 }, { variant: "kpa_inf", x: 4, y: 3 },
    ],
    objectives: [{ x: 6, y: 3 }],
  },
  6: {
    allies: [
      { variant: "rok_inf", x: 6, y: 12 }, { variant: "rok_inf", x: 7, y: 12 },
      { variant: "rok_inf", x: 5, y: 13 }, { variant: "bazooka", x: 8, y: 13 },
    ],
    enemies: [
      { variant: "t34", x: 6, y: 1 }, { variant: "t34", x: 7, y: 0 },
      { variant: "kpa_inf", x: 4, y: 2 }, { variant: "kpa_inf", x: 8, y: 2 },
      { variant: "kpa_inf", x: 5, y: 3 },
    ],
    escape: { x: 1, y: 12, w: 3, h: 2 },
  },
  7: {
    allies: [
      { variant: "rok_inf", x: 5, y: 10 }, { variant: "rok_inf", x: 7, y: 10 },
      { variant: "bazooka", x: 6, y: 11 }, { variant: "rok_inf", x: 4, y: 11 },
    ],
    enemies: [
      { variant: "t34", x: 5, y: 2 }, { variant: "t34", x: 7, y: 3 },
      { variant: "kpa_inf", x: 6, y: 4 }, { variant: "kpa_inf", x: 8, y: 2 },
      { variant: "kpa_inf", x: 4, y: 3 },
    ],
    escape: { x: 5, y: 12, w: 4, h: 2 },
  },
  8: {
    allies: [
      { variant: "us_inf", x: 3, y: 11 }, { variant: "us_inf", x: 4, y: 11 },
      { variant: "bazooka", x: 5, y: 12 }, { variant: "bazooka", x: 2, y: 12 },
    ],
    enemies: [
      { variant: "t34", x: 6, y: 2 }, { variant: "t34", x: 7, y: 3 },
      { variant: "kpa_inf", x: 8, y: 4 }, { variant: "kpa_inf", x: 5, y: 4 },
      { variant: "kpa_inf", x: 9, y: 3 },
    ],
    objectives: [{ x: 4, y: 10 }],
  },
  9: {
    allies: [
      { variant: "us_inf", x: 4, y: 11 }, { variant: "rok_inf", x: 5, y: 11 },
      { variant: "bazooka", x: 3, y: 12 }, { variant: "m4", x: 6, y: 12 },
    ],
    enemies: [
      { variant: "t34", x: 6, y: 3 }, { variant: "t34", x: 7, y: 4 },
      { variant: "kpa_inf", x: 5, y: 5 }, { variant: "kpa_inf", x: 8, y: 3 },
      { variant: "kpa_gun", x: 4, y: 4 },
    ],
    objectives: [{ x: 5, y: 10 }],
  },
  10: {
    allies: [
      { variant: "rok_inf", x: 6, y: 7 }, { variant: "rok_inf", x: 8, y: 7 },
      { variant: "us_inf", x: 7, y: 8 }, { variant: "howitzer", x: 5, y: 8 },
      { variant: "bazooka", x: 9, y: 8 },
    ],
    enemies: [
      { variant: "kpa_inf", x: 4, y: 2 }, { variant: "kpa_inf", x: 6, y: 1 },
      { variant: "kpa_inf", x: 8, y: 2 }, { variant: "t34", x: 7, y: 0 },
      { variant: "kpa_inf", x: 10, y: 1 }, { variant: "kpa_gun", x: 5, y: 0 },
    ],
    objectives: [{ x: 6, y: 7 }, { x: 8, y: 7 }],
  },
  11: {
    allies: [
      { variant: "rok_inf", x: 6, y: 12 }, { variant: "rok_inf", x: 7, y: 12 },
      { variant: "rok_inf", x: 5, y: 13 }, { variant: "mortar", x: 8, y: 13 },
    ],
    enemies: [
      { variant: "kpa_inf", x: 5, y: 3 }, { variant: "kpa_inf", x: 6, y: 2 },
      { variant: "kpa_inf", x: 7, y: 3 }, { variant: "kpa_gun", x: 4, y: 4 },
      { variant: "kpa_inf", x: 8, y: 2 },
    ],
    objectives: [{ x: 6, y: 4 }],
  },
  12: {
    allies: [
      { variant: "rok_marine", x: 6, y: 11 }, { variant: "rok_marine", x: 7, y: 11 },
      { variant: "rok_inf", x: 5, y: 12 }, { variant: "mortar", x: 8, y: 12 },
    ],
    enemies: [
      { variant: "kpa_inf", x: 6, y: 4 }, { variant: "kpa_inf", x: 7, y: 5 },
      { variant: "kpa_inf", x: 5, y: 5 }, { variant: "kpa_gun", x: 8, y: 4 },
    ],
    objectives: [{ x: 6, y: 5 }],
  },
  13: {
    allies: [
      { variant: "rok_marine", x: 6, y: 11 }, { variant: "us_inf", x: 7, y: 11 },
      { variant: "m4", x: 5, y: 12 }, { variant: "howitzer", x: 8, y: 12 },
    ],
    enemies: [
      { variant: "kpa_inf", x: 6, y: 5 }, { variant: "kpa_inf", x: 7, y: 6 },
      { variant: "kpa_gun", x: 5, y: 6 }, { variant: "kpa_inf", x: 8, y: 5 },
    ],
    objectives: [{ x: 6, y: 7 }],
  },
  14: {
    allies: [
      { variant: "rok_marine", x: 5, y: 10 }, { variant: "rok_inf", x: 6, y: 10 },
      { variant: "m4", x: 7, y: 11 }, { variant: "us_inf", x: 4, y: 11 },
    ],
    enemies: [
      { variant: "kpa_inf", x: 5, y: 3 }, { variant: "kpa_inf", x: 6, y: 2 },
      { variant: "kpa_inf", x: 7, y: 3 }, { variant: "kpa_gun", x: 4, y: 3 },
      { variant: "kpa_inf", x: 8, y: 4 },
    ],
    objectives: [{ x: 5, y: 4 }],
  },
  15: {
    allies: [
      { variant: "rok_inf", x: 6, y: 11 }, { variant: "rok_inf", x: 7, y: 11 },
      { variant: "rok_inf", x: 5, y: 12 }, { variant: "m4", x: 8, y: 12 },
    ],
    enemies: [
      { variant: "kpa_inf", x: 5, y: 4 }, { variant: "kpa_inf", x: 6, y: 3 },
      { variant: "kpa_inf", x: 7, y: 4 }, { variant: "kpa_gun", x: 8, y: 3 },
    ],
    objectives: [{ x: 6, y: 4 }],
  },
  16: {
    allies: [
      { variant: "rok_inf", x: 5, y: 11 }, { variant: "m4", x: 6, y: 11 },
      { variant: "us_inf", x: 7, y: 11 }, { variant: "howitzer", x: 8, y: 12 },
    ],
    enemies: [
      { variant: "kpa_inf", x: 5, y: 5 }, { variant: "kpa_inf", x: 6, y: 4 },
      { variant: "t34", x: 7, y: 5 }, { variant: "kpa_gun", x: 4, y: 5 },
    ],
    objectives: [{ x: 6, y: 5 }],
  },
  17: {
    allies: [
      { variant: "rok_inf", x: 6, y: 11 }, { variant: "rok_inf", x: 7, y: 11 },
      { variant: "m4", x: 5, y: 12 },
    ],
    enemies: [
      { variant: "kpa_inf", x: 5, y: 3 }, { variant: "kpa_inf", x: 6, y: 2 },
      { variant: "kpa_gun", x: 7, y: 3 }, { variant: "kpa_inf", x: 8, y: 2 },
    ],
    objectives: [{ x: 6, y: 5 }],
  },
  18: {
    allies: [
      { variant: "us_inf", x: 3, y: 11 }, { variant: "rok_inf", x: 4, y: 11 },
      { variant: "m4", x: 5, y: 12 }, { variant: "bazooka", x: 2, y: 12 },
    ],
    enemies: [
      { variant: "pla_inf", x: 6, y: 2 }, { variant: "pla_inf", x: 7, y: 1 },
      { variant: "pla_inf", x: 8, y: 2 }, { variant: "pla_inf", x: 5, y: 3 },
      { variant: "pla_inf", x: 9, y: 3 },
    ],
    escape: { x: 9, y: 10, w: 2, h: 2 },
  },
  19: {
    allies: [
      { variant: "us_inf", x: 5, y: 13 }, { variant: "us_inf", x: 6, y: 13 },
      { variant: "m4", x: 4, y: 14 }, { variant: "howitzer", x: 7, y: 14 },
    ],
    enemies: [
      { variant: "pla_inf", x: 4, y: 2 }, { variant: "pla_inf", x: 5, y: 1 },
      { variant: "pla_inf", x: 6, y: 2 }, { variant: "pla_inf", x: 7, y: 1 },
      { variant: "pla_inf", x: 8, y: 3 }, { variant: "katyusha", x: 3, y: 2 },
    ],
    escape: { x: 0, y: 13, w: 3, h: 2 },
  },
  20: {
    allies: [
      { variant: "us_inf", x: 4, y: 11 }, { variant: "rok_inf", x: 5, y: 11, civ: true },
      { variant: "rok_inf", x: 6, y: 11, civ: true }, { variant: "howitzer", x: 3, y: 12 },
    ],
    enemies: [
      { variant: "pla_inf", x: 6, y: 3 }, { variant: "pla_inf", x: 7, y: 4 },
      { variant: "pla_inf", x: 5, y: 4 }, { variant: "pla_inf", x: 8, y: 3 },
    ],
    objectives: [{ x: 5, y: 10 }],
    escape: { x: 8, y: 11, w: 3, h: 2 },
  },
  21: {
    allies: [
      { variant: "rok_inf", x: 5, y: 9 }, { variant: "rok_inf", x: 6, y: 9 },
      { variant: "us_inf", x: 4, y: 10 }, { variant: "bazooka", x: 7, y: 10 },
    ],
    enemies: [
      { variant: "pla_inf", x: 5, y: 2 }, { variant: "pla_inf", x: 6, y: 3 },
      { variant: "t34", x: 7, y: 2 }, { variant: "pla_inf", x: 4, y: 3 },
      { variant: "pla_inf", x: 8, y: 2 },
    ],
    escape: { x: 2, y: 12, w: 4, h: 2 },
  },
  22: {
    allies: [
      { variant: "us_inf", x: 5, y: 9 }, { variant: "un_inf", x: 6, y: 9 },
      { variant: "us_inf", x: 7, y: 9 }, { variant: "howitzer", x: 6, y: 10 },
      { variant: "bazooka", x: 4, y: 10 },
    ],
    enemies: [
      { variant: "pla_inf", x: 3, y: 2 }, { variant: "pla_inf", x: 5, y: 1 },
      { variant: "pla_inf", x: 7, y: 2 }, { variant: "pla_inf", x: 4, y: 3 },
      { variant: "pla_inf", x: 6, y: 2 }, { variant: "pla_inf", x: 8, y: 1 },
      { variant: "katyusha", x: 9, y: 2 },
    ],
    objectives: [{ x: 6, y: 8 }],
  },
  23: {
    allies: [
      { variant: "rok_inf", x: 5, y: 11 }, { variant: "rok_inf", x: 6, y: 11 },
      { variant: "howitzer", x: 4, y: 12 }, { variant: "us_inf", x: 7, y: 12 },
    ],
    enemies: [
      { variant: "pla_inf", x: 5, y: 3 }, { variant: "pla_inf", x: 6, y: 2 },
      { variant: "t34", x: 7, y: 3 }, { variant: "pla_inf", x: 4, y: 4 },
    ],
    objectives: [{ x: 5, y: 10 }],
  },
  24: {
    allies: [
      { variant: "rok_inf", x: 5, y: 11 }, { variant: "m4", x: 6, y: 11 },
      { variant: "us_inf", x: 7, y: 11 }, { variant: "howitzer", x: 4, y: 12 },
    ],
    enemies: [
      { variant: "pla_inf", x: 5, y: 5 }, { variant: "pla_inf", x: 6, y: 4 },
      { variant: "pla_inf", x: 7, y: 5 }, { variant: "kpa_gun", x: 8, y: 4 },
      { variant: "pla_inf", x: 4, y: 5 },
    ],
    objectives: [{ x: 6, y: 5 }],
  },
  25: {
    allies: [
      { variant: "un_inf", x: 7, y: 8 }, { variant: "un_inf", x: 8, y: 8 },
      { variant: "howitzer", x: 6, y: 9 }, { variant: "bazooka", x: 9, y: 9 },
    ],
    enemies: [
      { variant: "pla_inf", x: 6, y: 2 }, { variant: "pla_inf", x: 7, y: 1 },
      { variant: "pla_inf", x: 8, y: 2 }, { variant: "t34", x: 9, y: 0 },
      { variant: "pla_inf", x: 5, y: 3 }, { variant: "pla_inf", x: 10, y: 2 },
    ],
    objectives: [{ x: 7, y: 7 }],
  },
  26: {
    allies: [
      { variant: "rok_inf", x: 6, y: 12 }, { variant: "rok_inf", x: 7, y: 12 },
      { variant: "rok_inf", x: 5, y: 13 }, { variant: "howitzer", x: 8, y: 13 },
      { variant: "sniper", x: 6, y: 13 },
    ],
    enemies: [
      { variant: "pla_inf", x: 5, y: 3 }, { variant: "pla_inf", x: 6, y: 2 },
      { variant: "pla_inf", x: 7, y: 3 }, { variant: "kpa_gun", x: 4, y: 4 },
      { variant: "pla_inf", x: 8, y: 2 },
    ],
    objectives: [{ x: 6, y: 4 }],
  },
  27: {
    allies: [
      { variant: "rok_inf", x: 6, y: 12 }, { variant: "us_inf", x: 7, y: 12 },
      { variant: "m4", x: 5, y: 13 }, { variant: "bazooka", x: 8, y: 13 },
    ],
    enemies: [
      { variant: "pla_inf", x: 5, y: 3 }, { variant: "pla_inf", x: 6, y: 2 },
      { variant: "kpa_gun", x: 7, y: 3 }, { variant: "pla_inf", x: 4, y: 4 },
      { variant: "pla_inf", x: 8, y: 3 },
    ],
    objectives: [{ x: 5, y: 3 }],
  },
  28: {
    allies: [
      { variant: "rok_inf", x: 6, y: 12 }, { variant: "rok_inf", x: 7, y: 12 },
      { variant: "rok_inf", x: 5, y: 13 }, { variant: "howitzer", x: 8, y: 13 },
      { variant: "sniper", x: 6, y: 11 },
    ],
    enemies: [
      { variant: "pla_inf", x: 5, y: 4 }, { variant: "pla_inf", x: 6, y: 3 },
      { variant: "pla_inf", x: 7, y: 4 }, { variant: "kpa_gun", x: 4, y: 3 },
      { variant: "pla_inf", x: 8, y: 4 }, { variant: "katyusha", x: 6, y: 2 },
    ],
    objectives: [{ x: 6, y: 10 }],
  },
  29: {
    allies: [
      { variant: "rok_inf", x: 6, y: 12 }, { variant: "rok_inf", x: 7, y: 12 },
      { variant: "sniper", x: 5, y: 11 }, { variant: "bazooka", x: 8, y: 12 },
    ],
    enemies: [
      { variant: "pla_inf", x: 5, y: 3 }, { variant: "sniper", x: 6, y: 2 },
      { variant: "pla_inf", x: 7, y: 3 }, { variant: "pla_inf", x: 8, y: 4 },
      { variant: "kpa_gun", x: 4, y: 3 },
    ],
    objectives: [{ x: 6, y: 3 }],
  },
  30: {
    allies: [
      { variant: "rok_inf", x: 5, y: 12 }, { variant: "rok_inf", x: 6, y: 12 },
      { variant: "m4", x: 7, y: 12 }, { variant: "howitzer", x: 8, y: 13 },
      { variant: "bazooka", x: 4, y: 13 },
    ],
    enemies: [
      { variant: "pla_inf", x: 5, y: 3 }, { variant: "pla_inf", x: 6, y: 2 },
      { variant: "t34", x: 7, y: 3 }, { variant: "pla_inf", x: 4, y: 4 },
      { variant: "pla_inf", x: 8, y: 3 }, { variant: "katyusha", x: 6, y: 1 },
      { variant: "pla_inf", x: 9, y: 4 },
    ],
    objectives: [{ x: 6, y: 10 }],
  },
};

function clampPos(x, y, cols, rows) {
  return {
    x: Math.max(0, Math.min(cols - 1, x)),
    y: Math.max(0, Math.min(rows - 1, y)),
  };
}

function terrainPassable(map, x, y) {
  if (x < 0 || y < 0 || x >= map.cols || y >= map.rows) return false;
  return getTerrainStats(getTerrainAt(map, x, y)).movCost < 99;
}

function countPassableTiles(map) {
  let n = 0;
  for (let y = 0; y < map.rows; y++) {
    for (let x = 0; x < map.cols; x++) {
      if (terrainPassable(map, x, y)) n++;
    }
  }
  return n;
}

function findPassableInHalf(map, x, y, used, preferBottom) {
  const key = (a, b) => `${a},${b}`;
  const tryList = [];
  for (let r = 0; r <= 14; r++) {
    for (let dy = -r; dy <= r; dy++) {
      for (let dx = -r; dx <= r; dx++) {
        if (Math.abs(dx) + Math.abs(dy) !== r) continue;
        const p = clampPos(x + dx, y + dy, map.cols, map.rows);
        if (!terrainPassable(map, p.x, p.y) || used.has(key(p.x, p.y))) continue;
        const score = preferBottom ? p.y : map.rows - 1 - p.y;
        tryList.push({ ...p, score });
      }
    }
  }
  tryList.sort((a, b) => b.score - a.score);
  return tryList[0] || findPassableSpawn(map, x, y, used);
}

function findPassableSpawn(map, x, y, used) {
  const key = (a, b) => `${a},${b}`;
  if (terrainPassable(map, x, y) && !used.has(key(x, y))) return { x, y };
  for (let r = 1; r <= 5; r++) {
    for (let dy = -r; dy <= r; dy++) {
      for (let dx = -r; dx <= r; dx++) {
        if (Math.abs(dx) + Math.abs(dy) !== r) continue;
        const p = clampPos(x + dx, y + dy, map.cols, map.rows);
        if (terrainPassable(map, p.x, p.y) && !used.has(key(p.x, p.y))) return p;
      }
    }
  }
  return clampPos(x, y, map.cols, map.rows);
}

function spreadSpawn(spec, index, cols, rows) {
  const ring = Math.floor(index / 4) + 1;
  const angle = (index % 4) * 1.57;
  const dx = Math.round(Math.cos(angle) * ring);
  const dy = Math.round(Math.sin(angle) * ring);
  return clampPos(spec.x + dx, spec.y + dy, cols, rows);
}

/** Scale battles using historical strength ratios & multinational mixes */
export function scaleLoadout(loadout, scenarioId, map) {
  if (!loadout || !map) return loadout;
  const { allyCount, enemyCount, allyMix, enemyMix } = getHistoricalForceTargets(scenarioId, map);

  let allies = applyMixToSpawnList(loadout.allies.map((s) => ({ ...s })), allyMix);
  let enemies = applyMixToSpawnList(loadout.enemies.map((s) => ({ ...s })), enemyMix);

  const allyBonus = Math.max(0, allyCount - allies.length);
  const enemyBonus = Math.max(0, enemyCount - enemies.length);

  const usedTiles = new Set();
  for (const s of [...allies, ...enemies]) usedTiles.add(`${s.x},${s.y}`);

  for (let i = 0; i < allyBonus; i++) {
    const ref = allies[i % allies.length];
    const pick = pickFromMix(allyMix, allies.length + i);
    const rough = spreadSpawn(ref, i + 1, map.cols, map.rows);
    const pos = findPassableInHalf(map, rough.x, rough.y, usedTiles, true);
    usedTiles.add(`${pos.x},${pos.y}`);
    allies.push({
      variant: pick.variant,
      faction: pick.faction,
      x: pos.x,
      y: pos.y,
      ...(ref.civ ? { civ: ref.civ } : {}),
    });
  }

  for (let i = 0; i < enemyBonus; i++) {
    const ref = enemies[i % enemies.length];
    const pick = pickFromMix(enemyMix, enemies.length + i);
    const rough = spreadSpawn(ref, i + 2, map.cols, map.rows);
    const pos = findPassableInHalf(map, rough.x, rough.y, usedTiles, false);
    usedTiles.add(`${pos.x},${pos.y}`);
    enemies.push({
      variant: pick.variant,
      faction: pick.faction,
      x: pos.x,
      y: pos.y,
    });
  }

  allies = applyMixToSpawnList(allies, allyMix);
  enemies = applyMixToSpawnList(enemies, enemyMix);

  return { ...loadout, allies, enemies };
}

function scaleLoadoutCoords(loadout, map) {
  const allies = loadout.allies.map((s) => scaleSpawnToMap(s, map));
  const enemies = loadout.enemies.map((s) => scaleSpawnToMap(s, map));
  const objectives = loadout.objectives?.map((o) => scaleSpawnToMap(o, map));
  const escape = loadout.escape
    ? {
        ...scaleSpawnToMap(loadout.escape, map),
        w: Math.max(2, Math.round(loadout.escape.w * (map.cols / (map.baseCols || map.cols)))),
        h: Math.max(2, Math.round(loadout.escape.h * (map.rows / (map.baseRows || map.rows)))),
      }
    : null;
  return { ...loadout, allies, enemies, objectives, escape };
}

export function getLoadout(scenarioId, map = null) {
  const raw = SCENARIO_LOADOUTS[scenarioId];
  if (!raw) return null;
  if (!map) return raw;
  const scaled = scaleLoadout(raw, scenarioId, map);
  const out = scaleLoadoutCoords(scaled, map);
  if (out.objectives?.length) {
    const scratch = { ...map, objectives: out.objectives.map((o) => ({ ...o })) };
    validateMapMissionSites(scratch);
    out.objectives = scratch.objectives;
  }
  return out;
}
