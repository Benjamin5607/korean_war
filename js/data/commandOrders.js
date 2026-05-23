/** Commander orders — choices are scored per battlefield situation (not fixed 5) */
export const ORDER_CATALOG = {
  full_assault: {
    id: "full_assault",
    ko: "전면 돌격을 실시하라",
    en: "Execute full assault",
    descKo: "모든 소대가 목표 방향으로 전진·교전한다.",
    descEn: "All platoons advance and engage toward the objective.",
    stance: "attack",
    movBonus: 1,
    atkBonus: 1,
  },
  hold_line: {
    id: "hold_line",
    ko: "방어선을 고수하라",
    en: "Hold the defensive line",
    descKo: "현 진지를 포기하지 말고 적의 공격을 막아내라.",
    descEn: "Do not abandon positions; repel enemy attacks.",
    stance: "hold",
    defBonus: 15,
  },
  artillery_prep: {
    id: "artillery_prep",
    ko: "포병 준비 사격 후 전진",
    en: "Artillery prep then advance",
    descKo: "포격으로 적 진지를 눌른 뒤 보병이 전진한다.",
    descEn: "Suppress enemy positions, then infantry advances.",
    stance: "attack",
    shellEnemy: 12,
    movBonus: 0,
  },
  recon_push: {
    id: "recon_push",
    ko: "정찰 병력을 전방에 투입하라",
    en: "Push reconnaissance forward",
    descKo: "적 위치를 파악한 뒤 본대는 신중히 따라간다.",
    descEn: "Locate enemy, main body follows cautiously.",
    stance: "cautious",
    intelBoost: 25,
    movBonus: 0,
  },
  flank_march: {
    id: "flank_march",
    ko: "측면 우회 기동을 실시하라",
    en: "Conduct flanking march",
    descKo: "측면으로 우회해 적 측후를 노린다.",
    descEn: "Flank to threaten enemy rear and flank.",
    stance: "flank",
    movBonus: 2,
  },
  supply_priority: {
    id: "supply_priority",
    ko: "보급·탄약을 최우선으로",
    en: "Prioritize supply and ammunition",
    descKo: "전선에 탄약과 의무를 긴급 투입한다.",
    descEn: "Rush ammo and medical supplies to the line.",
    stance: "hold",
    healAllies: 15,
    supplyBoost: 20,
  },
  air_request: {
    id: "air_request",
    ko: "공중 지원을 요청하라",
    en: "Request air support",
    descKo: "근접항공지원으로 적 집중 지역을 타격한다.",
    descEn: "Close air support on concentrated enemy.",
    airStrike: 18,
    stance: "hold",
  },
  tactical_withdraw: {
    id: "tactical_withdraw",
    ko: "전술적 후퇴를 승인한다",
    en: "Authorize tactical withdrawal",
    descKo: "손실을 줄이며 후방 진지로 재편한다.",
    descEn: "Reorganize rearward to reduce casualties.",
    stance: "retreat",
    movBonus: 2,
  },
  dig_in: {
    id: "dig_in",
    ko: "참호를 구축하라",
    en: "Dig in and fortify",
    descKo: "현 위치에 참호를 파고 방어력을 높인다.",
    descEn: "Entrench current positions for defense.",
    stance: "hold",
    defBonus: 25,
    healAllies: 5,
  },
  commit_reserve: {
    id: "commit_reserve",
    ko: "예비대를 투입하라",
    en: "Commit the reserve",
    descKo: "예비 소대를 전선에 투입해 공세를 강화한다.",
    descEn: "Commit reserves to strengthen the attack.",
    stance: "attack",
    atkBonus: 3,
    movBonus: 1,
    moraleBoost: 10,
  },
  smoke_screen: {
    id: "smoke_screen",
    ko: "연막으로 전진하라",
    en: "Advance under smoke",
    descKo: "연막 아래 보병이 목표로 밀착 전진한다.",
    descEn: "Infantry closes on objective under smoke.",
    stance: "attack",
    movBonus: 1,
    defBonus: 10,
  },
  rear_guard: {
    id: "rear_guard",
    ko: "후방 경계를 강화하라",
    en: "Strengthen rear guard",
    descKo: "후퇴로나 측면에 경계병을 배치한다.",
    descEn: "Screen withdrawal routes and flanks.",
    stance: "cautious",
    defBonus: 12,
    intelBoost: 15,
  },
};

/** Score each order against live frontline state */
export function scoreOrdersForSituation(ctx) {
  const {
    mission,
    supplies,
    morale,
    comms,
    intel,
    enemyCount,
    nearestEnemyDist,
    allyCount,
    allyHpRate,
    objectiveHeld,
    hasEscape,
    nearEscape,
    turn,
    lastOrderId,
  } = ctx;

  const s = {};
  const add = (id, pts) => {
    s[id] = (s[id] || 0) + pts;
  };

  if (mission === "hold" || mission === "escort") {
    add("hold_line", 40);
    add("dig_in", 35);
    add("artillery_prep", 20);
  }
  if (mission === "capture" || mission === "defeat") {
    add("full_assault", 35);
    add("flank_march", 28);
    add("commit_reserve", 22);
    add("smoke_screen", 18);
  }
  if (mission === "escape") {
    add("tactical_withdraw", 45);
    add("rear_guard", 35);
    add("smoke_screen", 25);
  }

  if (supplies < 45) {
    add("supply_priority", 50);
    add("dig_in", 10);
  }
  if (morale < 50) {
    add("dig_in", 25);
    add("hold_line", 20);
    add("supply_priority", 15);
  }
  if (comms < 55) {
    add("recon_push", 20);
    add("rear_guard", 15);
  }
  if (intel < 55) {
    add("recon_push", 40);
  }

  if (enemyCount > 0) {
    if (nearestEnemyDist <= 2) {
      add("hold_line", 30);
      add("dig_in", 28);
      add("artillery_prep", 25);
      add("air_request", 22);
    } else if (nearestEnemyDist <= 4) {
      add("artillery_prep", 30);
      add("full_assault", 20);
      add("recon_push", 18);
    } else {
      add("full_assault", 25);
      add("flank_march", 22);
      add("recon_push", 25);
    }
  } else {
    add("recon_push", 35);
    add("full_assault", 15);
  }

  if (!objectiveHeld && (mission === "capture" || mission === "hold")) {
    add("full_assault", 25);
    add("smoke_screen", 20);
    add("commit_reserve", 18);
  }
  if (objectiveHeld && mission === "hold") {
    add("hold_line", 35);
    add("dig_in", 30);
    add("supply_priority", 15);
  }

  if (hasEscape && !nearEscape && (mission === "escape" || allyHpRate < 0.45)) {
    add("tactical_withdraw", 40);
    add("rear_guard", 25);
  }
  if (nearEscape && mission === "escape") {
    add("tactical_withdraw", 35);
    add("rear_guard", 30);
  }

  if (allyHpRate < 0.4) {
    add("supply_priority", 35);
    add("tactical_withdraw", 20);
    add("dig_in", 15);
  }
  if (allyCount <= 2 && enemyCount >= 3) {
    add("tactical_withdraw", 30);
    add("air_request", 25);
  }

  if (turn > 6 && supplies < 60) add("supply_priority", 15);
  if (turn > 10) add("commit_reserve", 12);

  if (lastOrderId) s[lastOrderId] = Math.max(0, (s[lastOrderId] || 0) - 25);

  return s;
}

export function pickSituationOrders(ctx) {
  const scores = scoreOrdersForSituation(ctx);
  const ranked = Object.entries(scores)
    .filter(([, pts]) => pts > 8)
    .sort((a, b) => b[1] - a[1]);

  const picked = [];
  const used = new Set();
  for (const [id] of ranked) {
    if (used.has(id) || !ORDER_CATALOG[id]) continue;
    used.add(id);
    picked.push(ORDER_CATALOG[id]);
    if (picked.length >= 6) break;
  }

  if (picked.length < 3) {
    for (const id of Object.keys(ORDER_CATALOG)) {
      if (used.has(id)) continue;
      picked.push(ORDER_CATALOG[id]);
      if (picked.length >= 3) break;
    }
  }

  return picked;
}
