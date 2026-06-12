/** Historical commanders — Langrisser-style auras + GK4-style roster */
import { getScenario } from "./scenarios.js";
import { buildMapFromTemplate } from "./maps.js";
import { getLoadout } from "./scenarioLoadouts.js";
import { getLang } from "../i18n.js";
import { UNIT_TYPES } from "../game/units.js";
import { getVariant } from "./unitCatalog.js";

export const FORMATIONS = {
  line: {
    id: "line",
    ko: "방어 진형",
    en: "Defensive Line",
    descKo: "보병 중심 방어선 — 방어↑ 공격↓",
    descEn: "Infantry line — higher defense, lower attack",
    atk: -2,
    def: 10,
    mov: 0,
  },
  wedge: {
    id: "wedge",
    ko: "쐐기 돌격",
    en: "Wedge Assault",
    descKo: "선두 돌파 — 공격↑ 방어↓",
    descEn: "Breakthrough wedge — higher attack",
    atk: 5,
    def: -6,
    mov: 1,
  },
  column: {
    id: "column",
    ko: "종대 행군",
    en: "Column March",
    descKo: "기동 우선 — 이동↑",
    descEn: "Mobility first — faster advance",
    atk: 0,
    def: -3,
    mov: 1,
  },
  fire: {
    id: "fire",
    ko: "포화 지원",
    en: "Fire Support",
    descKo: "포병 중심 — 포병 사거리·화력↑",
    descEn: "Artillery focus — range and firepower",
    atk: 2,
    def: 4,
    mov: -1,
    artilleryBonus: 4,
  },
};

export const OFFICERS = {
  yuh: {
    id: "yuh",
    unlockAt: 1,
    nameKo: "여운형",
    nameEn: "Yuh Woon-hyung",
    titleKo: "건국준비위원회",
    titleEn: "Committee for Preparation",
    auraRadius: 2,
    atkAura: 0,
    defAura: 6,
    moraleAura: 8,
    portrait: "yuh",
  },
  cho: {
    id: "cho",
    unlockAt: 2,
    nameKo: "조병옥",
    nameEn: "Cho Byung-ok",
    titleKo: "치안총감",
    titleEn: "Police Chief",
    auraRadius: 2,
    atkAura: 2,
    defAura: 8,
    moraleAura: 4,
    portrait: "cho",
  },
  paik: {
    id: "paik",
    unlockAt: 11,
    nameKo: "백선엽",
    nameEn: "Paik Sun-yup",
    titleKo: "국군 1사단장",
    titleEn: "ROK 1st Division",
    auraRadius: 3,
    atkAura: 3,
    defAura: 12,
    moraleAura: 6,
    portrait: "paik",
  },
  walker: {
    id: "walker",
    unlockAt: 10,
    nameKo: "월턴 워커",
    nameEn: "Walton Walker",
    titleKo: "제8군 사령관",
    titleEn: "8th Army Commander",
    auraRadius: 3,
    atkAura: 2,
    defAura: 10,
    movAura: 1,
    moraleAura: 5,
    portrait: "walker",
  },
  mac: {
    id: "mac",
    unlockAt: 13,
    nameKo: "맥아더",
    nameEn: "Douglas MacArthur",
    titleKo: "UN군 총사령관",
    titleEn: "UN Supreme Commander",
    auraRadius: 4,
    atkAura: 5,
    defAura: 4,
    movAura: 1,
    moraleAura: 10,
    portrait: "mac",
  },
  osmith: {
    id: "osmith",
    unlockAt: 19,
    nameKo: "올리버 스미스",
    nameEn: "Oliver P. Smith",
    titleKo: "해병 1사단",
    titleEn: "1st Marine Division",
    auraRadius: 3,
    atkAura: 2,
    defAura: 14,
    moraleAura: 8,
    portrait: "osmith",
  },
  ridgway: {
    id: "ridgway",
    unlockAt: 21,
    nameKo: "매슈 리지웨이",
    nameEn: "Matthew Ridgway",
    titleKo: "제8군 (재편)",
    titleEn: "8th Army (reformed)",
    auraRadius: 3,
    atkAura: 3,
    defAura: 10,
    moraleAura: 12,
    portrait: "ridgway",
  },
  monclar: {
    id: "monclar",
    unlockAt: 22,
    nameKo: "랄프 몽클라르",
    nameEn: "Ralph Monclar",
    titleKo: "프랑스 기갑대",
    titleEn: "French Battalion",
    auraRadius: 2,
    atkAura: 4,
    defAura: 10,
    moraleAura: 6,
    portrait: "monclar",
  },
};

const SCENARIO_OFFICER = {
  1: "yuh",
  2: "cho",
  3: "yuh",
  8: "walker",
  10: "walker",
  11: "paik",
  13: "mac",
  19: "osmith",
  21: "ridgway",
  22: "monclar",
};

export function getOfficer(id) {
  return OFFICERS[id] || OFFICERS.yuh;
}

export function officerName(officer, lang) {
  return lang === "en" ? officer.nameEn : officer.nameKo;
}

export function getUnlockedOfficerIds(profile) {
  const unlocked = new Set(profile.officersUnlocked || ["yuh"]);
  const maxScenario = profile.unlockedScenario || 1;
  for (const [id, o] of Object.entries(OFFICERS)) {
    if (o.unlockAt <= maxScenario) unlocked.add(id);
  }
  return [...unlocked].sort((a, b) => (OFFICERS[a].unlockAt || 0) - (OFFICERS[b].unlockAt || 0));
}

export function suggestOfficerForScenario(scenarioId, profile) {
  const unlocked = getUnlockedOfficerIds(profile);
  const pick = SCENARIO_OFFICER[scenarioId];
  if (pick && unlocked.includes(pick)) return pick;
  return unlocked[unlocked.length - 1] || "yuh";
}

export function unlockOfficersAfterVictory(profile, scenarioId) {
  const set = new Set(profile.officersUnlocked || ["yuh"]);
  for (const o of Object.values(OFFICERS)) {
    if (o.unlockAt <= scenarioId) set.add(o.id);
  }
  const suggested = SCENARIO_OFFICER[scenarioId];
  if (suggested) set.add(suggested);
  profile.officersUnlocked = [...set];
}

function unitPower(spec, upgrades) {
  const v = getVariant(spec.variant || "rok_inf");
  const cat = v.category || "infantry";
  const base = UNIT_TYPES[cat] || UNIT_TYPES.infantry;
  const u = upgrades?.[cat] || { atk: 0, hp: 0, mov: 0 };
  const atk = base.atk + u.atk * 2;
  const hp = base.hp + u.hp * 5;
  return atk + hp * 0.45;
}

export function estimateScenarioPower(scenarioId, profile, prep = {}) {
  const scenario = getScenario(scenarioId);
  if (!scenario) return { ally: 0, enemy: 0, ratio: 1 };
  const lang = getLang();
  const map = buildMapFromTemplate(scenario.map, lang);
  const loadout = getLoadout(scenarioId, map);
  if (!loadout) return { ally: 0, enemy: 0, ratio: 1 };

  let ally = (loadout.allies || []).reduce((s, spec) => s + unitPower(spec, profile.upgrades), 0);
  let enemy = (loadout.enemies || []).reduce((s, spec) => s + unitPower(spec, {}), 0);

  const officer = getOfficer(prep.officerId || suggestOfficerForScenario(scenarioId, profile));
  const form = FORMATIONS[prep.formation || "line"] || FORMATIONS.line;
  ally *= 1 + (officer.atkAura || 0) * 0.008 + (officer.defAura || 0) * 0.006 + (officer.moraleAura || 0) * 0.004;
  ally *= 1 + (form.atk || 0) * 0.01 + (form.def || 0) * 0.008;

  const ratio = enemy > 0 ? ally / enemy : 2;
  return { ally: Math.round(ally), enemy: Math.round(enemy), ratio };
}

export function powerVerdict(ratio, lang) {
  if (ratio >= 1.15) return lang === "ko" ? "아군 우세 — 공세 가능" : "Allied advantage — offensive viable";
  if (ratio >= 0.92) return lang === "ko" ? "대등 — 신중한 지휘 필요" : "Even match — careful command needed";
  if (ratio >= 0.75) return lang === "ko" ? "적 우세 — 방어·기동 권장" : "Enemy edge — defense and maneuver";
  return lang === "ko" ? "열세 — 보급·측면 공격 필수" : "Outmatched — supply and flanks essential";
}
