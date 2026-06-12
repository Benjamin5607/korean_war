import { manhattan, getTerrainAt, getTerrainStats } from "./terrain.js";
import { getOfficer, FORMATIONS } from "../data/officers.js";

/** Langrisser-style weapon triangle */
const BEATS = { infantry: "artillery", artillery: "tank", tank: "infantry" };

export function getWeaponTriangleMult(attacker, defender) {
  if (!attacker?.type || !defender?.type) return 1;
  if (BEATS[attacker.type] === defender.type) return 1.28;
  if (BEATS[defender.type] === attacker.type) return 0.82;
  return 1;
}

export function getWeaponTriangleLabel(attacker, defender, lang) {
  const m = getWeaponTriangleMult(attacker, defender);
  if (m > 1.1) return lang === "ko" ? "상성 유리" : "Type advantage";
  if (m < 0.9) return lang === "ko" ? "상성 불리" : "Type disadvantage";
  return "";
}

/** Flanking when 2+ allies adjacent to target */
export function getFlankMult(attacker, defender, units) {
  if (!defender || attacker.side === defender.side) return 1;
  const allies = units.filter(
    (u) =>
      u.side === attacker.side &&
      u.hp > 0 &&
      !u.civ &&
      u.id !== attacker.id &&
      manhattan(u.x, u.y, defender.x, defender.y) === 1
  );
  if (allies.length >= 2) return 1.22;
  if (allies.length >= 1) return 1.12;
  return 1;
}

export function getCommanderUnit(state) {
  if (!state.commanderUnitId) return null;
  return state.units.find((u) => u.id === state.commanderUnitId && u.hp > 0);
}

export function getAuraBonuses(unit, state) {
  const cmd = getCommanderUnit(state);
  const officer = state.officer || getOfficer(state.officerId);
  if (!cmd || !officer || unit.side !== "ally") return { atk: 0, def: 0, mov: 0 };

  const d = manhattan(unit.x, unit.y, cmd.x, cmd.y);
  if (d > (officer.auraRadius || 2)) return { atk: 0, def: 0, mov: 0 };

  const falloff = d === 0 ? 1 : d === 1 ? 0.85 : 0.65;
  return {
    atk: Math.floor((officer.atkAura || 0) * falloff),
    def: Math.floor((officer.defAura || 0) * falloff),
    mov: d <= 1 ? officer.movAura || 0 : 0,
  };
}

export function getFormationMods(state, unit) {
  const form = FORMATIONS[state.formation] || FORMATIONS.line;
  const mods = { atk: form.atk || 0, def: form.def || 0, mov: form.mov || 0 };
  if (unit.type === "artillery" && form.artilleryBonus) {
    mods.atk += form.artilleryBonus;
    mods.range = 1;
  }
  return mods;
}

export function applyCommanderMoraleBoost(state) {
  const officer = state.officer;
  const cmd = getCommanderUnit(state);
  if (!officer || !cmd || !state.commander) return;
  const allies = state.units.filter((u) => u.side === "ally" && u.hp > 0 && !u.civ);
  for (const u of allies) {
    const d = manhattan(u.x, u.y, cmd.x, cmd.y);
    if (d <= officer.auraRadius) {
      state.commander.morale = Math.min(100, state.commander.morale + (officer.moraleAura || 0) * 0.02);
      break;
    }
  }
}

export function calcBattleDamage(attacker, defender, state, units, defBonus = 0) {
  const aura = getAuraBonuses(attacker, state);
  const form = getFormationMods(state, attacker);
  const defAura = getAuraBonuses(defender, state);
  const defForm = getFormationMods(state, defender);

  let atk =
    attacker.atk +
    (attacker._orderAtk || 0) -
    (attacker._orderAtkPenalty || 0) +
    aura.atk +
    form.atk;

  if (attacker.antiTank && defender.type === "tank") atk += attacker.antiTank;
  if (defender.armor) atk = Math.max(1, atk - defender.armor);

  const totalDef = defBonus + (defender._orderDef || 0) + defAura.def + defForm.def;
  if (totalDef) atk = Math.max(1, atk - Math.floor(totalDef / 3));

  const reduction = 1 - Math.min(40, defBonus) / 100;
  let dmg = Math.floor(atk * reduction * (0.88 + Math.random() * 0.24));
  dmg = Math.floor(dmg * getWeaponTriangleMult(attacker, defender));
  dmg = Math.floor(dmg * getFlankMult(attacker, defender, units));

  if (attacker.nightBonus) dmg += attacker.nightBonus;
  return Math.max(1, dmg);
}

export function assignCommanderUnit(state) {
  const allies = state.units.filter((u) => u.side === "ally" && u.hp > 0 && !u.civ);
  if (!allies.length) return;

  const prefer = allies.find((u) => u.type === "infantry") || allies[0];
  let best = prefer;
  let bestScore = -1;
  for (const u of allies) {
    const score = u.maxHp + u.atk + (u.type === "infantry" ? 20 : 0);
    if (score > bestScore) {
      bestScore = score;
      best = u;
    }
  }
  best.isCommander = true;
  state.commanderUnitId = best.id;
}

export function applyFormationToUnits(state) {
  const form = FORMATIONS[state.formation] || FORMATIONS.line;
  for (const u of state.units) {
    if (u.side !== "ally" || u.civ) continue;
    if (form.mov) u.mov = Math.max(1, u.mov + form.mov);
    if (u.type === "artillery" && form.artilleryBonus) u.range = (u.range || 1) + 1;
  }
}
