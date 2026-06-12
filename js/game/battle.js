import { buildMapFromTemplate, validateMapMissionSites } from "../data/maps.js";
import { getScenario } from "../data/scenarios.js";
import { createUnit } from "./units.js";
import { getTerrainAt, getTerrainStats, getReachableTiles, getAttackTargets, manhattan, isPassable } from "./terrain.js";
import { t, getLang } from "../i18n.js";
import { resolveUnitFaction } from "../data/historicalForces.js";
import { getLoadout } from "../data/scenarioLoadouts.js";
import { getVariant } from "../data/unitCatalog.js";
import { getMissionRequirements } from "../data/missionBalance.js";
import { getOfficer } from "../data/officers.js";
import { assignCommanderUnit, applyFormationToUnits, calcBattleDamage } from "./combatMods.js";
import { recordHit } from "./combatEffects.js";

let uid = 0;
function nextId() {
  return `u${++uid}`;
}

export function initBattle(scenarioId, profile, prep = {}) {
  uid = 0;
  const scenario = getScenario(scenarioId);
  const lang = getLang();
  const map = buildMapFromTemplate(scenario.map, lang);
  const loadout = getLoadout(scenarioId, map);
  const emptyUp = { infantry: { atk: 0, hp: 0, mov: 0 }, tank: { atk: 0, hp: 0, mov: 0 }, artillery: { atk: 0, hp: 0, mov: 0 } };

  if (loadout?.objectives) map.objectives = loadout.objectives.map((o) => ({ ...o }));
  if (loadout?.escape) map.escape = { ...loadout.escape };
  validateMapMissionSites(map);

  const allySpecs = loadout?.allies || [];
  const enemySpecs = loadout?.enemies || [];
  const allies = allySpecs.map((s, i) =>
    createUnit(s, "ally", nextId(), profile.upgrades, lang, resolveUnitFaction(s, scenarioId, "ally", i))
  );
  const enemies = enemySpecs.map((s, i) =>
    createUnit(s, "enemy", nextId(), emptyUp, lang, resolveUnitFaction(s, scenarioId, "enemy", i))
  );
  const initialAllies = allies.reduce((s, u) => s + u.maxHp, 0);

  const state = {
    scenarioId,
    map,
    mission: scenario.mission,
    holdTurns: scenario.holdTurns || 0,
    turnLimit: scenario.turnLimit || 20,
    turn: 1,
    phase: "ally",
    units: [...allies, ...enemies],
    selectedId: null,
    commandPoints: 3,
    maxCp: 5,
    holdCounter: 0,
    captureCounter: 0,
    missionReq: getMissionRequirements(scenarioId, scenario.mission, scenario.chapter),
    initialAlliesHp: initialAllies,
    escaped: false,
    civsSaved: 0,
    result: null,
    starsEarned: 0,
    mode: "tactical",
    delegateMode: false,
    officerId: prep.officerId || profile.lastOfficer || "yuh",
    formation: prep.formation || profile.lastFormation || "line",
    commanderUnitId: null,
  };
  state.officer = getOfficer(state.officerId);
  assignCommanderUnit(state);
  applyFormationToUnits(state);
  return state;
}

export function serializeBattle(state) {
  return JSON.parse(JSON.stringify(state));
}

export function deserializeBattle(data) {
  if (data && !data.missionReq && data.scenarioId) {
    const scenario = getScenario(data.scenarioId);
    if (scenario) {
      data.missionReq = getMissionRequirements(data.scenarioId, data.mission, scenario.chapter);
      data.turnLimit = scenario.turnLimit;
      if (scenario.holdTurns) data.holdTurns = scenario.holdTurns;
    }
  }
  if (data && data.captureCounter == null) data.captureCounter = 0;
  if (data?.officerId && !data.officer) data.officer = getOfficer(data.officerId);
  if (data && data.delegateMode == null) data.delegateMode = false;
  if (data?.scenarioId && data.mission) {
    const scenario = getScenario(data.scenarioId);
    if (scenario) {
      const fresh = getMissionRequirements(data.scenarioId, data.mission, scenario.chapter);
      data.missionReq = { ...fresh, ...data.missionReq };
      if (data.mission === "capture") {
        data.missionReq.captureMinOnObjective = fresh.captureMinOnObjective;
        data.missionReq.objectiveZoneRadius = fresh.objectiveZoneRadius;
      }
    }
  }
  return data;
}

function getUnit(state, id) {
  return state.units.find((u) => u.id === id);
}

export function selectUnit(state, id) {
  const u = getUnit(state, id);
  if (!u || u.side !== "ally" || u.hp <= 0 || state.phase !== "ally") return state;
  state.selectedId = id;
  return state;
}

export function moveUnit(state, x, y) {
  const u = getUnit(state, state.selectedId);
  if (!u || u.moved || state.phase !== "ally") return state;
  const reachable = getReachableTiles(state.map, u, state.units);
  if (!reachable.some((t) => t.x === x && t.y === y)) return state;
  u.x = x;
  u.y = y;
  u.moved = true;
  const terr = getTerrainAt(state.map, x, y);
  const heal = getTerrainStats(terr).heal;
  if (heal > 0) u.hp = Math.min(u.maxHp, u.hp + heal);
  return state;
}

export function attackUnit(state, targetId) {
  const u = getUnit(state, state.selectedId);
  const target = getUnit(state, targetId);
  if (!u || !target || u.acted || state.phase !== "ally") return state;
  const targets = getAttackTargets(u, state.units, state.map);
  if (!targets.find((t) => t.id === targetId)) return state;

  const defTerr = getTerrainStats(getTerrainAt(state.map, target.x, target.y));
  const dmg = calcBattleDamage(u, target, state, state.units, defTerr.def);
  target.hp -= dmg;
  recordHit(state, u, target, dmg);
  u.acted = true;

  if (target.hp > 0) {
    const counterDef = getTerrainStats(getTerrainAt(state.map, u.x, u.y)).def;
    const counter = calcBattleDamage(target, u, state, state.units, counterDef);
    u.hp -= Math.floor(counter * 0.45);
    recordHit(state, target, u, counter);
  }
  checkMission(state);
  return state;
}

function calcDamage(attacker, defender, defBonus) {
  let atk = attacker.atk;
  if (attacker.antiTank && defender.type === "tank") atk += attacker.antiTank;
  if (defender.armor) atk = Math.max(1, atk - defender.armor);
  const reduction = 1 - defBonus / 100;
  let dmg = Math.floor(atk * reduction * (0.88 + Math.random() * 0.24));
  if (attacker.nightBonus) dmg += attacker.nightBonus;
  return Math.max(1, dmg);
}

export function endPlayerTurn(state) {
  state.units.filter((u) => u.side === "ally").forEach((u) => {
    u.moved = false;
    u.acted = false;
  });
  state.phase = "enemy";
  state.selectedId = null;
  runEnemyTurn(state);
  state.turn += 1;
  state.phase = "ally";
  state.commandPoints = Math.min(state.maxCp, state.commandPoints + 1);
  state.units.filter((u) => u.side === "ally").forEach((u) => {
    u.moved = false;
    u.acted = false;
  });
  checkMission(state);
  return state;
}

function runEnemyTurn(state) {
  const enemies = state.units.filter((u) => u.side === "enemy" && u.hp > 0);
  for (const e of enemies) {
    const allies = state.units.filter((u) => u.side === "ally" && u.hp > 0);
    if (!allies.length) break;
    let target = allies[0];
    let bestDist = manhattan(e.x, e.y, target.x, target.y);
    for (const a of allies) {
      const d = manhattan(e.x, e.y, a.x, a.y);
      if (d < bestDist) {
        bestDist = d;
        target = a;
      }
    }
    if (bestDist <= e.range) {
      const def = getTerrainStats(getTerrainAt(state.map, target.x, target.y)).def;
      const dmg = state.officer
        ? calcBattleDamage(e, target, state, state.units, def)
        : calcDamage(e, target, def);
      target.hp -= dmg;
      recordHit(state, e, target, dmg);
    } else {
      const dx = Math.sign(target.x - e.x);
      const dy = Math.sign(target.y - e.y);
      const tryMove = (nx, ny) => {
        if (isPassable(state.map, nx, ny, state.units, e.id)) {
          e.x = nx;
          e.y = ny;
          return true;
        }
        return false;
      };
      if (dx && tryMove(e.x + dx, e.y)) continue;
      if (dy && tryMove(e.x, e.y + dy)) continue;
    }
  }
}

function alliesAlive(state) {
  return state.units.filter((u) => u.side === "ally" && u.hp > 0 && !u.civ);
}

function enemiesAlive(state) {
  return state.units.filter((u) => u.side === "enemy" && u.hp > 0);
}

function getObjectiveZoneRadius(state) {
  return state.missionReq?.objectiveZoneRadius ?? 1;
}

/** Allies within capture/hold zone around any objective (not only the exact flag tile). */
export function countAlliesInObjectiveZone(state) {
  const objs = state.map.objectives || [];
  if (!objs.length) return 0;
  const radius = getObjectiveZoneRadius(state);
  return alliesAlive(state).filter((u) =>
    objs.some((o) => manhattan(u.x, u.y, o.x, o.y) <= radius)
  ).length;
}

function alliesOnObjectives(state) {
  return countAlliesInObjectiveZone(state);
}

function allyOnObjective(state) {
  return alliesOnObjectives(state) > 0;
}

function allyEscapeRatio(state) {
  const esc = state.map.escape;
  const allies = alliesAlive(state);
  if (!esc || !allies.length) return 0;
  const inZone = allies.filter(
    (u) =>
      u.x >= esc.x &&
      u.x < esc.x + esc.w &&
      u.y >= esc.y &&
      u.y < esc.y + esc.h
  ).length;
  return inZone / allies.length;
}

function allyInEscape(state) {
  const req = state.missionReq || {};
  return allyEscapeRatio(state) >= (req.escapeMinRatio ?? 0.52);
}

function initialEnemyHp(state) {
  if (!state.initialEnemyHp) {
    state.initialEnemyHp = state.units
      .filter((u) => u.side === "enemy")
      .reduce((s, u) => s + u.maxHp, 0);
  }
  return state.initialEnemyHp;
}

function enemyKillRatio(state) {
  const maxHp = initialEnemyHp(state);
  if (maxHp <= 0) return 1;
  const cur = enemiesAlive(state).reduce((s, u) => s + u.hp, 0);
  return 1 - cur / maxHp;
}

export function checkMission(state) {
  if (state.result) return state;

  const allies = alliesAlive(state);
  const enemies = enemiesAlive(state);

  if (!allies.length) {
    state.result = "defeat";
    return state;
  }

  const scenario = getScenario(state.scenarioId);

  const req = state.missionReq || {};

  switch (state.mission) {
    case "hold": {
      const onObj = alliesOnObjectives(state);
      if (onObj >= (req.holdMinOnObjective ?? 2)) {
        state.holdCounter += 1;
      } else if (req.holdResetIfEmpty) {
        state.holdCounter = 0;
      }
      if (state.holdCounter >= state.holdTurns) state.result = "victory";
      break;
    }
    case "capture": {
      const inZone = alliesOnObjectives(state);
      const need = req.captureMinOnObjective ?? 4;
      if (inZone >= need) {
        state.captureCounter = (state.captureCounter || 0) + 1;
      } else {
        state.captureCounter = 0;
      }
      if (state.captureCounter >= (req.captureHoldTurns ?? 3)) state.result = "victory";
      break;
    }
    case "defeat":
      if (enemyKillRatio(state) >= (req.defeatMinKillRatio ?? 1) || !enemies.length) {
        state.result = "victory";
      }
      break;
    case "escape":
      if (allyInEscape(state)) {
        state.escaped = true;
        state.result = "victory";
      }
      break;
    case "escort": {
      const civs = state.units.filter((u) => u.civ && u.hp > 0);
      if (allyInEscape(state) && civs.every((c) => manhattan(c.x, c.y, state.map.escape.x + 1, state.map.escape.y + 1) <= 4)) {
        state.result = "victory";
      }
      if (alliesOnObjectives(state) >= (req.holdMinOnObjective ?? 2)) state.holdCounter += 1;
      if (state.holdCounter >= state.holdTurns && civs.length) state.result = "victory";
      break;
    }
    default:
      if (enemyKillRatio(state) >= 0.95 || !enemies.length) state.result = "victory";
  }

  const allyHpRate =
    state.initialAlliesHp > 0
      ? allies.reduce((s, u) => s + u.hp, 0) / state.initialAlliesHp
      : 0;
  if (allyHpRate < (req.minAllyHpRate ?? 0.2) && state.turn > 3) {
    state.result = "defeat";
  }

  if (state.turn > state.turnLimit && state.result !== "victory") {
    state.result = "defeat";
  }

  if (state.result === "victory") {
    state.starsEarned = calcStars(state);
  }
  return state;
}

function calcStars(state) {
  let stars = 1;
  if (state.turn <= state.turnLimit - 2) stars = 2;
  const currentHp = state.units.filter((u) => u.side === "ally" && !u.civ).reduce((s, u) => s + Math.max(0, u.hp), 0);
  const rate = state.initialAlliesHp > 0 ? currentHp / state.initialAlliesHp : 0;
  if (rate >= 0.5) stars = Math.max(stars, 3);
  else if (rate >= 0.35) stars = Math.max(stars, 2);
  return stars;
}

export function useSkill(state, skill) {
  if (state.commandPoints < 1 || state.phase !== "ally") return state;
  const allies = state.units.filter((u) => u.side === "ally" && u.hp > 0 && !u.civ);
  if (!allies.length) return state;

  state.commandPoints -= 1;
  switch (skill) {
    case "air": {
      const enemies = enemiesAlive(state);
      if (enemies.length) {
        const t = enemies[Math.floor(Math.random() * enemies.length)];
        t.hp -= 15;
      }
      break;
    }
    case "supply":
      for (const u of allies) u.hp = Math.min(u.maxHp, u.hp + 12);
      break;
    case "rush":
      for (const u of allies) {
        u.moved = false;
        u.mov = Math.min(u.mov + 2, u.mov + 4);
      }
      break;
  }
  checkMission(state);
  return state;
}

export function getMissionText(state) {
  const req = state.missionReq || {};
  const lang = getLang();
  switch (state.mission) {
    case "hold": {
      const needUnits = req.holdMinOnObjective ?? 2;
      const inZone = countAlliesInObjectiveZone(state);
      return (
        t("holdTurns", state.holdTurns) +
        ` (${state.holdCounter}/${state.holdTurns}) · ` +
        (lang === "ko"
          ? `깃발 주변 아군 ${needUnits}+ (${inZone}/${needUnits})`
          : `Flag zone ${needUnits}+ allies (${inZone}/${needUnits})`)
      );
    }
    case "capture": {
      const needTurns = req.captureHoldTurns ?? 3;
      const needUnits = req.captureMinOnObjective ?? 4;
      const inZone = countAlliesInObjectiveZone(state);
      return (
        (lang === "ko"
          ? `깃발 주변에 아군 ${needUnits}개 이상 · ${needTurns}턴 유지`
          : `${needUnits}+ allies in flag zone · hold ${needTurns} turns`) +
        ` (${state.captureCounter || 0}/${needTurns} · ${inZone}/${needUnits})`
      );
    }
    case "escape": {
      const pct = Math.round((req.escapeMinRatio ?? 0.52) * 100);
      const cur = Math.round(allyEscapeRatio(state) * 100);
      return (lang === "ko" ? `탈출 구역 아군 ${pct}%+` : `Escape zone ${pct}%+ allies`) + ` (${cur}%)`;
    }
    case "defeat":
      return t("defeatEnemies") + ` (${Math.round(enemyKillRatio(state) * 100)}%)`;
    case "escort":
      return t("holdTurns", state.holdTurns) + " / " + t("reachEscape");
    default:
      return t("defeatEnemies");
  }
}

export function getMoveTiles(state) {
  const u = getUnit(state, state.selectedId);
  if (!u || u.moved) return [];
  return getReachableTiles(state.map, u, state.units);
}

export function getAttackTiles(state) {
  const u = getUnit(state, state.selectedId);
  if (!u || u.acted) return [];
  return getAttackTargets(u, state.units, state.map);
}
