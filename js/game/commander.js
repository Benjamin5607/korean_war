/**
 * Commander-mode: streaming situation reports + dynamic order choices + auto resolution
 */
import { getTerrainAt, getTerrainStats, getReachableTiles, manhattan, isPassable } from "./terrain.js";
import { pickSituationOrders, ORDER_CATALOG } from "../data/commandOrders.js";
import { getLang } from "../i18n.js";
import { checkMission, countAlliesInObjectiveZone } from "./battle.js";
import { clearCombatFx, recordHit, recordShell } from "./combatEffects.js";
import { getHistoricalForceBriefing, summarizeAllyComposition } from "../data/historicalForces.js";
import { getScenario } from "../data/scenarios.js";
import { getMissionRequirements } from "../data/missionBalance.js";
import { calcBattleDamage, applyCommanderMoraleBoost, getCommanderUnit } from "./combatMods.js";
import { getOfficer, officerName } from "../data/officers.js";

export function initCommanderState(state) {
  if (!state.missionReq && state.scenarioId) {
    const sc = getScenario(state.scenarioId);
    state.missionReq = getMissionRequirements(
      state.scenarioId,
      state.mission,
      sc?.chapter || 1
    );
  }
  if (state.captureCounter == null) state.captureCounter = 0;

  state.commander = {
    supplies: 78 + Math.floor(Math.random() * 15),
    morale: 65 + Math.floor(Math.random() * 20),
    comms: 82,
    intel: 60,
    choices: [],
    log: [],
    reportFeed: [],
    lastOrderId: null,
    recentMoves: [],
    combatFx: [],
    consecutiveAssault: 0,
    snapshot: null,
  };
  refreshCommanderTurn(state, true);
  return state;
}

function timeTag() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function appendReportLines(state, lines, urgent = false) {
  const feed = state.commander.reportFeed;
  for (const text of lines) {
    if (!text) continue;
    feed.push({ text, urgent, at: timeTag(), turn: state.turn, id: `${Date.now()}-${Math.random()}` });
  }
  while (feed.length > 48) feed.shift();
}

export function buildSituationContext(state) {
  const c = state.commander;
  const ally = allies(state);
  const foe = enemies(state);
  const objs = state.map.objectives || [];
  const esc = state.map.escape;

  let nearestEnemyDist = 99;
  if (foe.length && ally.length) {
    for (const e of foe) {
      for (const a of ally) {
        nearestEnemyDist = Math.min(nearestEnemyDist, manhattan(a.x, a.y, e.x, e.y));
      }
    }
  }

  const totalMax = ally.reduce((s, u) => s + u.maxHp, 0);
  const totalHp = ally.reduce((s, u) => s + u.hp, 0);
  const zoneRadius = state.missionReq?.objectiveZoneRadius ?? 1;
  const objectiveHeld = objs.length
    ? ally.some((u) => objs.some((o) => manhattan(u.x, u.y, o.x, o.y) <= zoneRadius))
    : false;

  let nearEscape = false;
  if (esc) {
    nearEscape = ally.some(
      (u) =>
        u.x >= esc.x &&
        u.x < esc.x + esc.w &&
        u.y >= esc.y &&
        u.y < esc.y + esc.h
    );
  }

  return {
    mission: state.mission,
    supplies: c.supplies,
    morale: c.morale,
    comms: c.comms,
    intel: c.intel,
    enemyCount: foe.length,
    nearestEnemyDist,
    allyCount: ally.length,
    allyHpRate: totalMax > 0 ? totalHp / totalMax : 0,
    objectiveHeld,
    hasEscape: !!esc,
    nearEscape,
    turn: state.turn,
    lastOrderId: c.lastOrderId,
  };
}

function refreshOrderChoices(state) {
  state.commander.choices = pickSituationOrders(buildSituationContext(state));
}

function generatePulseReports(state) {
  const lang = getLang();
  const ctx = buildSituationContext(state);
  const lines = [];
  const tag = `[${timeTag()}]`;

  if (lang === "ko") {
    if (ctx.comms < 60) lines.push(`${tag} △ 통신: 잡음 심함 — 일부 무전 교신 끊김.`);
    if (ctx.intel < 55) lines.push(`${tag} ◇ 정찰: 전방 상황 재확인 중…`);
    if (ctx.nearestEnemyDist <= 2) lines.push(`${tag} ★ 긴급: 적과 접전 거리 진입!`);
    else if (ctx.nearestEnemyDist <= 4) lines.push(`${tag} ▷ 전방: 적 동향 포착, 접근 중.`);
    if (ctx.supplies < 50) lines.push(`${tag} ▣ 보급: 탄약 소모 가속 — 보급 요청 권고.`);
    if (ctx.morale < 45) lines.push(`${tag} ▣ 사기: 병력 피로 누적 보고.`);
    const chatter = [
      `${tag} — 3소대: "지휘부, 전방 교전 중."`,
      `${tag} — 1소대: "탄약 양호, 전진 가능."`,
      `${tag} — 의무반: "부상자 발생, 후송 요망."`,
      `${tag} — 포병대: "사격 준비 완료."`,
    ];
    if (Math.random() > 0.35) lines.push(chatter[Math.floor(Math.random() * chatter.length)]);
  } else {
    if (ctx.comms < 60) lines.push(`${tag} △ Comms degraded — radio breakup.`);
    if (ctx.nearestEnemyDist <= 2) lines.push(`${tag} ★ URGENT: Enemy at close range!`);
    if (ctx.supplies < 50) lines.push(`${tag} ▣ Supply drain accelerating.`);
    lines.push(`${tag} — Field: "Contact, awaiting orders."`);
  }
  return lines.slice(0, 3);
}

function generateDeltaReports(state) {
  const lang = getLang();
  const snap = state.commander.snapshot;
  const ctx = buildSituationContext(state);
  const lines = [];
  if (!snap) return lines;

  if (lang === "ko") {
    if (ctx.enemyCount > snap.enemyCount) lines.push(`▣ [갱신] 적군 증원 징후 — 접촉 ${ctx.enemyCount}건.`);
    if (ctx.enemyCount < snap.enemyCount) lines.push(`▣ [갱신] 적군 일부 격퇴 또는 이탈.`);
    if (ctx.allyHpRate < snap.allyHpRate - 0.08) lines.push("▣ [갱신] 아군 손실 확대 — 지시 필요.");
    if (ctx.objectiveHeld && !snap.objectiveHeld) lines.push("▣ [갱신] 목표 거점 확보!");
    if (!ctx.objectiveHeld && snap.objectiveHeld) lines.push("▣ [갱신] 거점 상실 — 즉시 대응.");
    if (ctx.supplies < snap.supplies - 8) lines.push("▣ [갱신] 물자 급감.");
  } else {
    if (ctx.enemyCount > snap.enemyCount) lines.push("▣ [UPDATE] Enemy reinforcements spotted.");
    if (ctx.objectiveHeld && !snap.objectiveHeld) lines.push("▣ [UPDATE] Objective secured!");
  }
  return lines;
}

function takeSnapshot(state) {
  const ctx = buildSituationContext(state);
  state.commander.snapshot = {
    enemyCount: ctx.enemyCount,
    allyHpRate: ctx.allyHpRate,
    objectiveHeld: ctx.objectiveHeld,
    supplies: ctx.supplies,
  };
}

export function pushSituationUpdate(state, reason = "update") {
  const lang = getLang();
  const lines = [];

  if (reason === "initial") {
    lines.push(lang === "ko" ? `■ [${timeTag()}] 사령부 접속 — 전선 보고 수신 개시.` : `■ [${timeTag()}] HQ online — receiving field reports.`);
    lines.push(...buildSituationReport(state));
  } else if (reason === "after_order") {
    lines.push(lang === "ko" ? `■ [${timeTag()}] 지시 집행 후 전선 재보고.` : `■ [${timeTag()}] Post-order situation update.`);
    lines.push(...generateDeltaReports(state));
    lines.push(...buildSituationReport(state).slice(1, 4));
  } else {
    lines.push(...generatePulseReports(state));
    lines.push(...generateDeltaReports(state));
  }

  const urgent = reason === "after_order" || buildSituationContext(state).nearestEnemyDist <= 2;
  appendReportLines(state, lines, urgent);
  takeSnapshot(state);
  refreshOrderChoices(state);
  return state;
}

export function refreshCommanderTurn(state, isFirst = false) {
  pushSituationUpdate(state, isFirst ? "initial" : "update");
  return state;
}

/** Periodic field reports while awaiting orders */
export function tickFieldReports(state) {
  if (state.result) return state;
  appendReportLines(state, generatePulseReports(state), buildSituationContext(state).nearestEnemyDist <= 3);
  refreshOrderChoices(state);
  return state;
}

function pushLog(state, msg) {
  state.commander.log.unshift(msg);
  if (state.commander.log.length > 24) state.commander.log.length = 24;
}

function allies(state) {
  return state.units.filter((u) => u.side === "ally" && u.hp > 0 && !u.civ);
}

function enemies(state) {
  return state.units.filter((u) => u.side === "enemy" && u.hp > 0);
}

function clusterPlatoons(units) {
  const groups = [];
  const used = new Set();
  const names = ["A", "B", "C", "D", "E", "F"];
  let ni = 0;
  for (const u of units) {
    if (used.has(u.id)) continue;
    const group = [u];
    used.add(u.id);
    for (const v of units) {
      if (used.has(v.id)) continue;
      if (manhattan(u.x, u.y, v.x, v.y) <= 2) {
        group.push(v);
        used.add(v.id);
      }
    }
    const avgHp = group.reduce((s, x) => s + x.hp / x.maxHp, 0) / group.length;
    groups.push({ name: names[ni++] || String(ni), units: group, strength: avgHp });
  }
  return groups;
}

export function buildSituationReport(state) {
  const lang = getLang();
  const c = state.commander;
  const ally = allies(state);
  const foe = enemies(state);
  const objs = state.map.objectives || [];
  const platoons = clusterPlatoons(ally);

  const supplyPct = Math.round(c.supplies);
  const moralePct = Math.round(c.morale);
  const commsPct = Math.round(c.comms);
  const intelPct = Math.round(c.intel);

  const lines = [];
  if (lang === "ko") {
    lines.push(`【작전일지 ${state.turn}일차】 ${state.map.displayName || "전선"}`);
    if (state.officer) {
      const cmd = getCommanderUnit(state);
      lines.push(
        `▣ 지휘관: ${officerName(state.officer, lang)} — 오라 ${state.officer.auraRadius}칸${cmd ? ` · 위치 (${cmd.x},${cmd.y})` : ""}`
      );
    }
    lines.push(`▣ 물자: 탄약·보급 ${supplyPct}% | 사기 ${moralePct}% | 통신 품질 ${commsPct}% | 정찰 신뢰도 ${intelPct}%`);
    if (foe.length) {
      const nearest = foe.reduce((best, e) => {
        const d = Math.min(...ally.map((a) => manhattan(a.x, a.y, e.x, e.y)));
        return !best || d < best.d ? { e, d } : best;
      }, null);
      lines.push(`▣ 적군: 접촉 ${foe.length}개 부대. 최근접 약 ${nearest?.d ?? "?"}칸 (${nearest?.e.label || "불명"}).`);
    } else lines.push("▣ 적군: 접촉 보고 없음 — 정찰 재확인 필요.");
    platoons.forEach((p) => {
      const pct = Math.round(p.strength * 100);
      const pos = p.units[0];
      const terr = getTerrainAt(state.map, pos.x, pos.y);
      lines.push(`▣ ${p.name}소대 (${p.units.length}개 분대): 체력 ${pct}% · 위치 (${pos.x},${pos.y}) · 지형 ${terrainLabel(terr, lang)}`);
    });
    if (objs.length) {
      const o = objs[0];
      const inZone = countAlliesInObjectiveZone(state);
      const need =
        state.mission === "capture"
          ? state.missionReq?.captureMinOnObjective ?? 4
          : state.missionReq?.holdMinOnObjective ?? 2;
      const nearestD = ally.length
        ? Math.min(...ally.map((u) => manhattan(u.x, u.y, o.x, o.y)))
        : 99;
      const held = inZone >= need;
      if (state.mission === "capture" || state.mission === "hold") {
        const cap = state.mission === "capture" ? ` · 점령 ${state.captureCounter || 0}/${state.missionReq?.captureHoldTurns ?? 3}턴` : "";
        lines.push(
          held
            ? `▣ 붉은 깃발 (${o.x},${o.y}): 주변 아군 ${inZone}/${need} — 거점 유지${cap}.`
            : `▣ 붉은 깃발 (${o.x},${o.y}): 주변 아군 ${inZone}/${need} — 깃발 인근으로 ${need}개 이상 모을 것 (최근접 약 ${nearestD}칸).`
        );
      } else {
        lines.push(held ? "▣ 진지: 목표 거점 아군 점유 중." : "▣ 진지: 목표 거점 미확보.");
      }
    }
    if (state.map.escape) {
      const esc = state.map.escape;
      const inZone = ally.filter(
        (u) => u.x >= esc.x && u.x < esc.x + esc.w && u.y >= esc.y && u.y < esc.h
      ).length;
      const dists = ally.map((u) => {
        const cx = esc.x + Math.floor(esc.w / 2);
        const cy = esc.y + Math.floor(esc.h / 2);
        return manhattan(u.x, u.y, cx, cy);
      });
      const nearest = dists.length ? Math.min(...dists) : 99;
      lines.push(
        inZone > 0
          ? `▣ 탈출로: ${inZone}개 분대 구역 내 — 나머지는 전진 중 (최근접 약 ${nearest}칸).`
          : `▣ 탈출로: 미도달 — 전 부대 남쪽·서쪽 탈출 구역으로 전진 지시 유지 (최근접 약 ${nearest}칸).`
      );
    }
    if (objs.length && (state.mission === "capture" || state.mission === "hold")) {
      const nearestObj = ally.reduce((best, u) => {
        const o = nearestObjective(state, u);
        if (!o) return best;
        return !best || o.dist < best.d ? { d: o.dist, x: o.x, y: o.y } : best;
      }, null);
      if (nearestObj) {
        lines.push(
          nearestObj.d === 0
            ? `▣ 작전 목표: 거점 (${nearestObj.x},${nearestObj.y}) 점유 중.`
            : `▣ 작전 목표: 거점 (${nearestObj.x},${nearestObj.y})까지 최근접 약 ${nearestObj.d}칸 — 전진·점령 우선.`
        );
      }
    }
    lines.push(`▣ 임무: ${missionSummary(state, lang)}`);
    const hist = getHistoricalForceBriefing(state.scenarioId, lang);
    if (hist) lines.push(`▣ 역사: ${hist}`);
    const comp = summarizeAllyComposition(state.units, lang);
    if (comp) lines.push(`▣ 아군 구성: ${comp}`);
  } else {
    lines.push(`【OP LOG Day ${state.turn}】 ${state.map.displayName || "Front"}`);
    lines.push(`▣ Supply ${supplyPct}% | Morale ${moralePct}% | Comms ${commsPct}% | Intel ${intelPct}%`);
    lines.push(foe.length ? `▣ Enemy: ${foe.length} contacts engaged.` : "▣ Enemy: no contact — verify recon.");
    platoons.forEach((p) => {
      lines.push(`▣ Platoon ${p.name} (${p.units.length} squads): ${Math.round(p.strength * 100)}% at (${p.units[0].x},${p.units[0].y})`);
    });
    lines.push(`▣ Mission: ${missionSummary(state, lang)}`);
    const hist = getHistoricalForceBriefing(state.scenarioId, lang);
    if (hist) lines.push(`▣ History: ${hist}`);
    const comp = summarizeAllyComposition(state.units, lang);
    if (comp) lines.push(`▣ Allied composition: ${comp}`);
  }
  return lines;
}

function terrainLabel(terr, lang) {
  const ko = { plain: "평지", forest: "숲", river: "강", mountain: "산", city: "시가", bridge: "교량", palace: "궁궐", bunker: "참호", fort: "요새" };
  return lang === "ko" ? ko[terr] || terr : terr;
}

function missionSummary(state, lang) {
  switch (state.mission) {
    case "hold":
      return lang === "ko" ? `거점 ${state.holdCounter}/${state.holdTurns}턴 방어` : `Hold ${state.holdCounter}/${state.holdTurns} turns`;
    case "capture":
      return lang === "ko" ? "목표 거점 점령" : "Capture objective";
    case "escape":
      return lang === "ko" ? "탈출 지역 도달" : "Reach escape zone";
    case "defeat":
      return lang === "ko" ? "적군 섬멸" : "Destroy enemy forces";
    default:
      return lang === "ko" ? "작전 목표 달성" : "Complete objective";
  }
}

function getEscapePoints(state) {
  const esc = state.map.escape;
  if (!esc) return [];
  const pts = [];
  for (let y = esc.y; y < esc.y + esc.h; y++) {
    for (let x = esc.x; x < esc.x + esc.w; x++) pts.push({ x, y });
  }
  return pts;
}

function nearestObjective(state, u) {
  const objs = state.map.objectives || [];
  if (!objs.length) return null;
  let best = objs[0];
  let bestD = manhattan(u.x, u.y, best.x, best.y);
  for (const o of objs) {
    const d = manhattan(u.x, u.y, o.x, o.y);
    if (d < bestD) {
      bestD = d;
      best = o;
    }
  }
  return { ...best, dist: bestD };
}

/** Mission-critical waypoint per unit (escape tile, capture point, etc.) */
function getMissionObjectivePoint(state, u) {
  const mission = state.mission;
  const allyList = allies(state);

  if (mission === "escape" && state.map.escape) {
    const pts = getEscapePoints(state);
    if (!pts.length) return null;
    const idx = Math.max(0, allyList.findIndex((a) => a.id === u.id));
    return pts[idx % pts.length];
  }

  if (mission === "capture" || mission === "hold" || mission === "escort") {
    const obj = nearestObjective(state, u);
    if (obj) return { x: obj.x, y: obj.y };
  }

  if (mission === "defeat") return null;
  return null;
}

function goalForUnitTactical(state, u, order) {
  const foe = enemies(state);
  if (foe.length && (order.stance === "attack" || order.stance === "flank")) {
    let target = foe[0];
    let best = manhattan(u.x, u.y, target.x, target.y);
    for (const e of foe) {
      const d = manhattan(u.x, u.y, e.x, e.y);
      if (d < best) {
        best = d;
        target = e;
      }
    }
    if (order.stance === "flank") {
      return { x: target.x + (u.x > target.x ? 1 : -1), y: target.y };
    }
    return { x: target.x, y: target.y };
  }
  return null;
}

function goalForUnit(state, u, order) {
  const mission = state.mission;
  const missionPt = getMissionObjectivePoint(state, u);
  const tactical = goalForUnitTactical(state, u, order);

  if (!missionPt) return tactical || { x: u.x, y: u.y };

  const zoneR = state.missionReq?.objectiveZoneRadius ?? 1;
  const dm = manhattan(u.x, u.y, missionPt.x, missionPt.y);
  const onMission =
    dm <= zoneR ||
    (mission === "escape" &&
      state.map.escape &&
      u.x >= state.map.escape.x &&
      u.x < state.map.escape.x + state.map.escape.w &&
      u.y >= state.map.escape.y &&
      u.y < state.map.escape.y + state.map.escape.h);

  if (mission === "escape") {
    return missionPt;
  }

  if (mission === "capture") {
    if (!onMission) return missionPt;
    return tactical || missionPt;
  }

  if (mission === "hold") {
    if (onMission && (order.stance === "hold" || order.stance === "cautious")) {
      return { x: u.x, y: u.y };
    }
    if (!onMission) return missionPt;
    if (dm <= 2 && tactical) return tactical;
    return missionPt;
  }

  if (mission === "escort") {
    if (!onMission && dm > 1) return missionPt;
    return tactical || missionPt;
  }

  return tactical || missionPt;
}

function isOnMissionTile(state, u) {
  const mission = state.mission;
  const missionPt = getMissionObjectivePoint(state, u);
  if (!missionPt && mission !== "hold") return false;

  if (mission === "escape" && state.map.escape) {
    const esc = state.map.escape;
    return (
      u.x >= esc.x &&
      u.x < esc.x + esc.w &&
      u.y >= esc.y &&
      u.y < esc.h
    );
  }

  if (mission === "capture" || mission === "hold" || mission === "escort") {
    const objs = state.map.objectives || [];
    if (!objs.length) return false;
    const radius = state.missionReq?.objectiveZoneRadius ?? 1;
    return objs.some((o) => manhattan(u.x, u.y, o.x, o.y) <= radius);
  }

  return false;
}

function needsMissionAdvance(state, u) {
  const mission = state.mission;
  if (mission === "escape" || mission === "capture" || mission === "escort") {
    return !isOnMissionTile(state, u);
  }
  if (mission === "hold" && (state.map.objectives || []).length) {
    return !isOnMissionTile(state, u);
  }
  return false;
}

function maxMoveSteps(state, u, order) {
  let steps = 1 + (order.movBonus || 0);
  const missionPt = getMissionObjectivePoint(state, u);
  if (!missionPt) return steps;
  const dm = manhattan(u.x, u.y, missionPt.x, missionPt.y);
  if (state.mission === "escape" || state.mission === "capture") {
    if (dm > 2) steps += 1;
    if (dm > 5) steps += 1;
  } else if (state.mission === "hold" && dm > 3) {
    steps += 1;
  }
  return steps;
}

function pickMoveToward(state, u, goal, maxSteps) {
  const reachable = getReachableTiles(state.map, u, state.units);
  if (!reachable.length) return null;
  let best = null;
  let bestScore = Infinity;
  for (const t of reachable) {
    const steps = manhattan(u.x, u.y, t.x, t.y);
    if (steps > maxSteps) continue;
    const d = manhattan(t.x, t.y, goal.x, goal.y);
    const score = d + steps * 0.1;
    if (score < bestScore) {
      bestScore = score;
      best = t;
    }
  }
  return best;
}

const ASSAULT_ORDER_IDS = new Set(["full_assault", "commit_reserve", "flank_march"]);

function applyCommanderOrderPenalties(state, order) {
  const c = state.commander;
  const req = state.missionReq || {};
  const isAssault =
    ASSAULT_ORDER_IDS.has(order.id) && (order.stance === "attack" || order.stance === "flank");

  if (isAssault) {
    c.consecutiveAssault = (c.consecutiveAssault || 0) + 1;
  } else {
    c.consecutiveAssault = 0;
  }

  const limit = req.maxConsecutiveAssault ?? 2;
  if (c.consecutiveAssault > limit) {
    c.supplies = Math.max(8, c.supplies - 20);
    c.morale = Math.max(12, c.morale - 18);
    order._fatigued = true;
    order.atkBonus = Math.max(-2, (order.atkBonus || 0) - 2);
    order.movBonus = Math.max(0, (order.movBonus || 0) - 1);
    const lang = getLang();
    pushLog(
      state,
      lang === "ko"
        ? "▸ 경고: 연속 돌격으로 보급·사기 고갈 — 공격 효과 감소. 방어·포격·보급 지시 권고."
        : "▸ Warning: repeated assaults drained supply/morale — attack effectiveness reduced."
    );
  }

  if (state.mission === "hold" && isAssault && state.holdCounter > 0) {
    state.holdCounter = Math.max(0, state.holdCounter - 1);
  }
}


function runAllyCombat(state, u, order) {
  const foes = enemies(state);
  for (const e of foes) {
    const dist = manhattan(u.x, u.y, e.x, e.y);
    if (dist <= u.range) {
      const def = getTerrainStats(getTerrainAt(state.map, e.x, e.y)).def + (e._orderDef || 0);
      const dmg = calcBattleDamage(u, e, state, state.units, def);
      e.hp -= dmg;
      recordHit(state, u, e, dmg);
      if (e.hp > 0 && dist <= e.range) {
        const counterDef = getTerrainStats(getTerrainAt(state.map, u.x, u.y)).def + (u._orderDef || 0);
        const cdmg = Math.max(1, Math.floor(calcBattleDamage(e, u, state, state.units, counterDef) * 0.45));
        u.hp -= cdmg;
        recordHit(state, e, u, cdmg);
      }
      return true;
    }
  }
  return false;
}

function runAllyAutoPhase(state, order) {
  const moves = [];
  const allyUnits = allies(state);

  for (const u of allyUnits) {
    u._orderAtk = order.atkBonus || 0;
    u._orderAtkPenalty = order._fatigued ? 3 : 0;
    u._orderDef = order.defBonus || 0;
    const missionPush = needsMissionAdvance(state, u);
    const maxSteps = missionPush ? maxMoveSteps(state, u, order) + 1 : maxMoveSteps(state, u, order);
    const fought = runAllyCombat(state, u, order);
    const shouldMove = order.stance !== "hold" || missionPush;

    if (shouldMove && (!fought || missionPush)) {
      const goal = goalForUnit(state, u, order);
      const dest = pickMoveToward(state, u, goal, maxSteps);
      if (dest && (dest.x !== u.x || dest.y !== u.y)) {
        moves.push({ id: u.id, from: { x: u.x, y: u.y }, to: { x: dest.x, y: dest.y } });
        u.x = dest.x;
        u.y = dest.y;
        const heal = getTerrainStats(getTerrainAt(state.map, dest.x, dest.y)).heal;
        if (heal > 0) u.hp = Math.min(u.maxHp, u.hp + heal);
        if (!fought) runAllyCombat(state, u, order);
      }
    }
  }
  state.commander.recentMoves = moves;
  return moves;
}

export function runEnemyPhase(state) {
  const enemyUnits = state.units.filter((u) => u.side === "enemy" && u.hp > 0);
  const allyN = allies(state).length;
  let passes = 1;
  if (state.turn >= 6) passes += 1;
  if (state.turn >= 12) passes += 1;
  if ((state.commander?.consecutiveAssault || 0) >= 3) passes += 1;
  if (enemyUnits.length > allyN * 0.85) passes += 1;
  passes = Math.min(3, passes);

  for (let pass = 0; pass < passes; pass++) {
    for (const e of enemyUnits) {
      if (e.hp <= 0) continue;
    const allyUnits = allies(state);
    if (!allyUnits.length) break;
    let target = allyUnits[0];
    let bestDist = manhattan(e.x, e.y, target.x, target.y);
    for (const a of allyUnits) {
      const d = manhattan(e.x, e.y, a.x, a.y);
      if (d < bestDist) {
        bestDist = d;
        target = a;
      }
    }
    if (bestDist <= e.range) {
      const def = getTerrainStats(getTerrainAt(state.map, target.x, target.y)).def;
      const dmg = calcBattleDamage(e, target, state, state.units, def);
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
}

function applyOrderEffects(state, order) {
  const lang = getLang();
  if (order.shellEnemy || order.airStrike) {
    const dmg = order.shellEnemy || order.airStrike;
    const foes = enemies(state);
    if (foes.length) {
      const t = foes[Math.floor(Math.random() * foes.length)];
      t.hp -= dmg;
      recordShell(state, t.x, t.y, dmg, order.airStrike ? "air" : "shell");
      if (t.hp <= 0) recordShell(state, t.x, t.y, 0, "death");
      pushLog(state, lang === "ko" ? `▸ 포격/공습: ${t.label}에 ${dmg} 피해.` : `▸ Fire mission: ${dmg} dmg on ${t.label}.`);
    }
  }
  if (order.healAllies) {
    for (const u of allies(state)) u.hp = Math.min(u.maxHp, u.hp + order.healAllies);
    pushLog(state, lang === "ko" ? "▸ 보급부대가 전선에 탄약·의무를 배치했습니다." : "▸ Supply teams resupplied the line.");
  }
  if (order.supplyBoost) state.commander.supplies = Math.min(100, state.commander.supplies + order.supplyBoost);
  if (order.moraleBoost) state.commander.morale = Math.min(100, state.commander.morale + order.moraleBoost);
  if (order.intelBoost) state.commander.intel = Math.min(100, state.commander.intel + order.intelBoost);
}

function updateCommanderMetrics(state) {
  const c = state.commander;
  const ally = allies(state);
  const totalMax = ally.reduce((s, u) => s + u.maxHp, 0);
  const totalHp = ally.reduce((s, u) => s + u.hp, 0);
  const rate = totalMax > 0 ? totalHp / totalMax : 0;
  c.morale = Math.max(15, Math.min(100, c.morale * 0.92 + rate * 25));
  c.supplies = Math.max(10, c.supplies - 3 - Math.floor(Math.random() * 4));
  c.comms = Math.max(40, c.comms - Math.floor(Math.random() * 6) + (rate > 0.5 ? 2 : -4));
  c.intel = Math.max(35, Math.min(100, c.intel + (state.turn % 3 === 0 ? 5 : -2)));
}

function describeAftermath(state, order, lang) {
  const ally = allies(state).length;
  const foe = enemies(state).length;
  if (lang === "ko") {
    return `▸ '${order.ko}' 실행 완료. 아군 ${ally}개 부대 전선 유지, 적 접촉 ${foe}건.`;
  }
  return `▸ Order '${order.en}' executed. ${ally} friendly elements; ${foe} enemy contacts.`;
}

export function issueCommandOrder(state, orderId) {
  if (state.result || state.phase !== "ally") return state;
  const base = ORDER_CATALOG[orderId];
  if (!base) return state;
  const order = { ...base };

  const lang = getLang();
  state.commander.lastOrderId = orderId;
  clearCombatFx(state);
  pushLog(state, lang === "ko" ? `▶ 사령관 지시: ${order.ko}` : `▶ Command: ${order.en}`);

  applyCommanderOrderPenalties(state, order);
  applyCommanderMoraleBoost(state);
  applyOrderEffects(state, order);
  runAllyAutoPhase(state, order);
  runEnemyPhase(state);

  for (const u of state.units) {
    delete u._orderAtk;
    delete u._orderAtkPenalty;
    delete u._orderDef;
  }

  updateCommanderMetrics(state);
  pushLog(state, describeAftermath(state, order, lang));

  state.turn += 1;
  checkMission(state);

  if (!state.result) {
    pushSituationUpdate(state, "after_order");
  }
  return state;
}

export function getOrderChoices(state) {
  return state.commander?.choices || [];
}

export function getReportFeed(state) {
  return state.commander?.reportFeed || [];
}

export function getBattleLog(state) {
  return state.commander?.log || [];
}
