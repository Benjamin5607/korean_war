import { SCENARIO_DEBATES } from "./dialogueScript.js";
import { EXTENDED_DEBATES } from "./dialogueExpanded.js";
import { enrichScenarioScript } from "./debateEnrich.js";

function normalizeLine(entry) {
  if (entry.type) return entry;
  return { type: "line", ...entry };
}

export function getDialogues(scenarioId) {
  const base = EXTENDED_DEBATES[scenarioId] || SCENARIO_DEBATES[scenarioId];
  const script = base?.length ? enrichScenarioScript(scenarioId, base) : null;
  if (script?.length) return script.map((e) => normalizeLine(e));
  return [
    normalizeLine({ id: "cmd", nameKo: "지휘관", nameEn: "Commander", faction: "rok", ko: "이번 작전은 역사에 남을 것이다. 그러나 성급한 총격은 피해를 키운다—먼저 정찰하라.", en: "This operation will be remembered. But hasty fire grows casualties—recon first." }),
    normalizeLine({ id: "staff", nameKo: "참모", nameEn: "Staff", faction: "rok", ko: "병사들이 긴장하고 있습니다. 명령을 분명히, 그러나 이유도 들려주십시오.", en: "Men are tense. Orders clear—but tell them why." }),
    normalizeLine({ id: "enemy", nameKo: "적 지휘관", nameEn: "Enemy Commander", faction: "kpa", ko: "오지 않으면 우리가 간다. 그러나 오늘 밤은 아직 아니다—포위부터 완성하라.", en: "If you won't come, we will. But not tonight—complete the encirclement first." }),
    normalizeLine({ id: "cmd", nameKo: "지휘관", nameEn: "Commander", faction: "rok", ko: "…알겠다. 회의는 여기까지. 전군, 출격 준비.", en: "…Very well. Meeting adjourned. All units, prepare to move." }),
  ];
}
