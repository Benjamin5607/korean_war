/** Per-scenario mission difficulty & victory conditions */

export function getBalancedTurnLimit(scenario) {
  const ch = scenario.chapter || 1;
  return scenario.turnLimit + 8 + ch * 2;
}

export function getBalancedHoldTurns(scenario) {
  if (!scenario.holdTurns) return 0;
  const ch = scenario.chapter || 1;
  return scenario.holdTurns + 4 + Math.floor(ch / 2);
}

export function getMissionRequirements(scenarioId, mission, chapter = 1) {
  const base = {
    captureHoldTurns: 3,
    captureMinOnObjective: 4,
    objectiveZoneRadius: 1,
    escapeMinRatio: 0.52,
    holdMinOnObjective: 2,
    holdResetIfEmpty: true,
    defeatMinKillRatio: 0.92,
    minAllyHpRate: 0.15,
    maxConsecutiveAssault: 2,
  };

  if (mission === "capture") {
    return {
      ...base,
      captureHoldTurns: 3 + Math.floor(chapter / 2),
      captureMinOnObjective: 4,
      objectiveZoneRadius: 1,
    };
  }
  if (mission === "escape") {
    return {
      ...base,
      escapeMinRatio: chapter <= 2 ? 0.48 : chapter <= 4 ? 0.55 : 0.62,
    };
  }
  if (mission === "hold") {
    return {
      ...base,
      holdMinOnObjective: chapter >= 5 ? 3 : 2,
      minAllyHpRate: 0.28,
    };
  }
  if (mission === "defeat") {
    return {
      ...base,
      defeatMinKillRatio: 1,
    };
  }
  if (mission === "escort") {
    return {
      ...base,
      escapeMinRatio: 0.5,
      holdMinOnObjective: 2,
    };
  }
  return base;
}
