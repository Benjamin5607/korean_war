/**
 * Historical force ratios & UN multinational composition per scenario.
 * Strength values are relative (not 1:1 real headcount); mixes are documented UN/ROK/KPA/PLA orders of battle.
 */
import { getTerrainAt, getTerrainStats } from "../game/terrain.js";

export const VARIANT_FACTION = {
  police: "police",
  militia: "rok",
  rok_inf: "rok",
  rok_marine: "rok",
  us_inf: "us",
  us_marine: "us",
  un_inf: "un",
  uk_inf: "uk",
  can_inf: "can",
  aus_inf: "aus",
  tur_inf: "tur",
  fra_inf: "fra",
  phil_inf: "phil",
  thai_inf: "thai",
  nld_inf: "nld",
  col_inf: "col",
  eth_inf: "eth",
  bazooka: "rok",
  sniper: "rok",
  rebel_inf: "rebel",
  kpa_inf: "kpa",
  pla_inf: "pla",
  t34: "kpa",
  m4: "us",
  stuart: "us",
  mortar: "rok",
  howitzer: "us",
  kpa_gun: "kpa",
  katyusha: "pla",
  ac130: "us",
};

/** @typedef {{ variant: string, weight: number, faction?: string }} MixEntry */
/** @typedef {{ allyStrength: number, enemyStrength: number, allyMix: MixEntry[], enemyMix: MixEntry[], briefingKo?: string, briefingEn?: string }} ForceProfile */

/** Scenario profiles — sources: 6·25 invasion strength, Pusan perimeter, Inchon, Chosin, Chipyongni/French, Imjin/Gloucestershire, 1952–53 UN order of battle */
export const SCENARIO_FORCE_PROFILES = {
  1: {
    allyStrength: 40,
    enemyStrength: 44,
    allyMix: [
      { variant: "police", weight: 35, faction: "police" },
      { variant: "militia", weight: 30, faction: "rok" },
      { variant: "rok_inf", weight: 35, faction: "rok" },
    ],
    enemyMix: [{ variant: "rebel_inf", weight: 85, faction: "rebel" }, { variant: "mortar", weight: 15, faction: "rebel" }],
    briefingKo: "해방 직후 — 경찰·민방위 중심, 좌우 무장 세력과 대치.",
    briefingEn: "Post-liberation: police and militia face armed factions.",
  },
  2: {
    allyStrength: 42,
    enemyStrength: 48,
    allyMix: [
      { variant: "police", weight: 30, faction: "police" },
      { variant: "rok_inf", weight: 50, faction: "rok" },
      { variant: "militia", weight: 20, faction: "rok" },
    ],
    enemyMix: [{ variant: "rebel_inf", weight: 90, faction: "rebel" }, { variant: "mortar", weight: 10, faction: "rebel" }],
    briefingKo: "대구·대전 폭동 — 국군·경찰 대 좌익 무장대.",
    briefingEn: "Daegu riots: ROK police and army vs armed leftists.",
  },
  3: {
    allyStrength: 45,
    enemyStrength: 50,
    allyMix: [
      { variant: "rok_inf", weight: 70, faction: "rok" },
      { variant: "police", weight: 20, faction: "police" },
      { variant: "mortar", weight: 10, faction: "rok" },
    ],
    enemyMix: [{ variant: "rebel_inf", weight: 100, faction: "rebel" }],
    briefingKo: "제주 4·3 — 국군·경찰 진압 부대 중심.",
    briefingEn: "Jeju 4.3: ROK security forces dominate.",
  },
  4: {
    allyStrength: 48,
    enemyStrength: 52,
    allyMix: [
      { variant: "rok_inf", weight: 75, faction: "rok" },
      { variant: "bazooka", weight: 15, faction: "rok" },
      { variant: "mortar", weight: 10, faction: "rok" },
    ],
    enemyMix: [{ variant: "rebel_inf", weight: 85, faction: "rebel" }, { variant: "mortar", weight: 15, faction: "rebel" }],
    briefingKo: "여수·순천 반란 — 국군 대 반란군.",
    briefingEn: "Yeosu–Suncheon mutiny: ROK Army vs mutineers.",
  },
  5: {
    allyStrength: 50,
    enemyStrength: 58,
    allyMix: [
      { variant: "rok_inf", weight: 80, faction: "rok" },
      { variant: "bazooka", weight: 12, faction: "rok" },
      { variant: "mortar", weight: 8, faction: "rok" },
    ],
    enemyMix: [
      { variant: "kpa_inf", weight: 75, faction: "kpa" },
      { variant: "kpa_gun", weight: 15, faction: "kpa" },
      { variant: "mortar", weight: 10, faction: "kpa" },
    ],
    briefingKo: "송악산 — 38선 국군 대 인민군 소규모 충돌.",
    briefingEn: "Songak: ROK border troops vs KPA skirmishers.",
  },
  6: {
    allyStrength: 95,
    enemyStrength: 135,
    allyMix: [
      { variant: "rok_inf", weight: 82, faction: "rok" },
      { variant: "rok_inf", weight: 8, faction: "rok" },
      { variant: "bazooka", weight: 6, faction: "rok" },
      { variant: "mortar", weight: 4, faction: "rok" },
    ],
    enemyMix: [
      { variant: "kpa_inf", weight: 55, faction: "kpa" },
      { variant: "t34", weight: 18, faction: "kpa" },
      { variant: "kpa_inf", weight: 17, faction: "kpa" },
      { variant: "kpa_gun", weight: 10, faction: "kpa" },
    ],
    briefingKo: "6·25 침공 — 국군 약 9.5만 대 인민군·전차 약 13.5만 규모(상대 비율). 미군은 아직 본격 투입 전.",
    briefingEn: "25 June invasion: ~95k ROK vs ~135k KPA (relative scale). US not yet fully engaged.",
  },
  7: {
    allyStrength: 70,
    enemyStrength: 110,
    allyMix: [
      { variant: "rok_inf", weight: 88, faction: "rok" },
      { variant: "bazooka", weight: 8, faction: "rok" },
      { variant: "mortar", weight: 4, faction: "rok" },
    ],
    enemyMix: [
      { variant: "kpa_inf", weight: 60, faction: "kpa" },
      { variant: "t34", weight: 22, faction: "kpa" },
      { variant: "kpa_gun", weight: 18, faction: "kpa" },
    ],
    briefingKo: "한강 방어·서울 함락 — 붕괴 직전 국군, 인민군·T-34 압도.",
    briefingEn: "Han River: collapsing ROK vs advancing KPA armor.",
  },
  8: {
    allyStrength: 12,
    enemyStrength: 85,
    allyMix: [
      { variant: "us_inf", weight: 55, faction: "us" },
      { variant: "rok_inf", weight: 35, faction: "rok" },
      { variant: "bazooka", weight: 10, faction: "us" },
    ],
    enemyMix: [
      { variant: "kpa_inf", weight: 65, faction: "kpa" },
      { variant: "t34", weight: 25, faction: "kpa" },
      { variant: "kpa_gun", weight: 10, faction: "kpa" },
    ],
    briefingKo: "오산·미원 — 스미스 특遣대(미 24사단 선봉) 소수 vs 인민군 대세.",
    briefingEn: "Osan: Task Force Smith (US 24th ID vanguard) vs KPA main body.",
  },
  9: {
    allyStrength: 55,
    enemyStrength: 95,
    allyMix: [
      { variant: "rok_inf", weight: 58, faction: "rok" },
      { variant: "us_inf", weight: 32, faction: "us" },
      { variant: "bazooka", weight: 10, faction: "us" },
    ],
    enemyMix: [
      { variant: "kpa_inf", weight: 70, faction: "kpa" },
      { variant: "t34", weight: 18, faction: "kpa" },
      { variant: "kpa_gun", weight: 12, faction: "kpa" },
    ],
    briefingKo: "대전 방어 — 국군 잔존 병력 + 초기 미군 증원 vs 남하 인민군.",
    briefingEn: "Daejeon: surviving ROK + early US reinforcements vs KPA drive south.",
  },
  10: {
    allyStrength: 80,
    enemyStrength: 105,
    allyMix: [
      { variant: "rok_inf", weight: 52, faction: "rok" },
      { variant: "us_inf", weight: 34, faction: "us" },
      { variant: "phil_inf", weight: 6, faction: "phil" },
      { variant: "m4", weight: 4, faction: "us" },
      { variant: "howitzer", weight: 4, faction: "us" },
    ],
    enemyMix: [
      { variant: "kpa_inf", weight: 72, faction: "kpa" },
      { variant: "t34", weight: 15, faction: "kpa" },
      { variant: "kpa_gun", weight: 13, faction: "kpa" },
    ],
    briefingKo: "낙동강 방어선 — 미 8군·국군 + 필리핀 연대(용동 등) vs 인민군 마지막 공세.",
    briefingEn: "Naktong: US Eighth Army, ROK, Philippine Battalion vs KPA offensive.",
  },
  11: {
    allyStrength: 78,
    enemyStrength: 100,
    allyMix: [
      { variant: "rok_inf", weight: 50, faction: "rok" },
      { variant: "us_inf", weight: 36, faction: "us" },
      { variant: "phil_inf", weight: 6, faction: "phil" },
      { variant: "m4", weight: 8, faction: "us" },
    ],
    enemyMix: [
      { variant: "kpa_inf", weight: 75, faction: "kpa" },
      { variant: "t34", weight: 12, faction: "kpa" },
      { variant: "kpa_gun", weight: 13, faction: "kpa" },
    ],
    briefingKo: "다부동 — 국군·미군 낙동강 방어 핵심 지점.",
    briefingEn: "Naktong Bulge: ROK–US hold the perimeter.",
  },
  12: {
    allyStrength: 75,
    enemyStrength: 95,
    allyMix: [
      { variant: "rok_marine", weight: 55, faction: "rok" },
      { variant: "rok_inf", weight: 35, faction: "rok" },
      { variant: "mortar", weight: 10, faction: "rok" },
    ],
    enemyMix: [
      { variant: "kpa_inf", weight: 80, faction: "kpa" },
      { variant: "kpa_gun", weight: 20, faction: "kpa" },
    ],
    briefingKo: "통영·독도 — 국군 해병대 중심 반격.",
    briefingEn: "Tongyeong: ROK Marines counterattack.",
  },
  13: {
    allyStrength: 90,
    enemyStrength: 75,
    allyMix: [
      { variant: "us_marine", weight: 42, faction: "us" },
      { variant: "us_inf", weight: 18, faction: "us" },
      { variant: "rok_marine", weight: 28, faction: "rok" },
      { variant: "rok_inf", weight: 12, faction: "rok" },
    ],
    enemyMix: [
      { variant: "kpa_inf", weight: 85, faction: "kpa" },
      { variant: "kpa_gun", weight: 15, faction: "kpa" },
    ],
    briefingKo: "인천 상륙 — 미 해병 1사단·국군 해병 연합 상륙작전.",
    briefingEn: "Inchon: US 1st Marine Division & ROK Marines amphibious assault.",
  },
  14: {
    allyStrength: 85,
    enemyStrength: 70,
    allyMix: [
      { variant: "rok_inf", weight: 55, faction: "rok" },
      { variant: "us_inf", weight: 30, faction: "us" },
      { variant: "m4", weight: 10, faction: "us" },
      { variant: "howitzer", weight: 5, faction: "us" },
    ],
    enemyMix: [{ variant: "kpa_inf", weight: 90, faction: "kpa" }, { variant: "kpa_gun", weight: 10, faction: "kpa" }],
    briefingKo: "서울 수복 — 국군 주도, 미군 기갑·포병 지원.",
    briefingEn: "Recapture Seoul: ROK-led with US armor and artillery.",
  },
  15: {
    allyStrength: 88,
    enemyStrength: 72,
    allyMix: [
      { variant: "rok_inf", weight: 58, faction: "rok" },
      { variant: "us_inf", weight: 28, faction: "us" },
      { variant: "m4", weight: 14, faction: "us" },
    ],
    enemyMix: [{ variant: "kpa_inf", weight: 100, faction: "kpa" }],
    briefingKo: "38도선 돌파 — 국군·미군 북진.",
    briefingEn: "Crossing the 38th: ROK and US advance north.",
  },
  16: {
    allyStrength: 92,
    enemyStrength: 68,
    allyMix: [
      { variant: "us_inf", weight: 38, faction: "us" },
      { variant: "rok_inf", weight: 48, faction: "rok" },
      { variant: "m4", weight: 14, faction: "us" },
    ],
    enemyMix: [{ variant: "kpa_inf", weight: 85, faction: "kpa" }, { variant: "kpa_gun", weight: 15, faction: "kpa" }],
    briefingKo: "평양 진격 — UN군(미·국) 주력 vs 붕괴 직전 인민군.",
    briefingEn: "Pyongyang: UN (US–ROK) main force vs collapsing KPA.",
  },
  17: {
    allyStrength: 90,
    enemyStrength: 65,
    allyMix: [
      { variant: "us_inf", weight: 42, faction: "us" },
      { variant: "rok_inf", weight: 45, faction: "rok" },
      { variant: "m4", weight: 13, faction: "us" },
    ],
    enemyMix: [{ variant: "kpa_inf", weight: 80, faction: "kpa" }, { variant: "pla_inf", weight: 20, faction: "pla" }],
    briefingKo: "압록강 접근 — 미·국군 북진 끝자락, 중공 개입 징후.",
    briefingEn: "Yalu approach: US–ROK near the border; signs of Chinese intervention.",
  },
  18: {
    allyStrength: 75,
    enemyStrength: 130,
    allyMix: [
      { variant: "us_inf", weight: 48, faction: "us" },
      { variant: "rok_inf", weight: 42, faction: "rok" },
      { variant: "m4", weight: 10, faction: "us" },
    ],
    enemyMix: [
      { variant: "pla_inf", weight: 78, faction: "pla" },
      { variant: "katyusha", weight: 12, faction: "pla" },
      { variant: "pla_inf", weight: 10, faction: "pla" },
    ],
    briefingKo: "중공군 1차 공세 — 미·국군 vs 중국인민지원군 야습(온정·운산).",
    briefingEn: "Chinese 1st offensive: US–ROK vs PLA night assault.",
  },
  19: {
    allyStrength: 70,
    enemyStrength: 145,
    allyMix: [
      { variant: "us_marine", weight: 38, faction: "us" },
      { variant: "us_inf", weight: 32, faction: "us" },
      { variant: "rok_inf", weight: 22, faction: "rok" },
      { variant: "m4", weight: 8, faction: "us" },
    ],
    enemyMix: [
      { variant: "pla_inf", weight: 80, faction: "pla" },
      { variant: "pla_inf", weight: 12, faction: "pla" },
      { variant: "katyusha", weight: 8, faction: "pla" },
    ],
    briefingKo: "장진호 — 미 1해병·7사단 등 X군 vs 중공 9병단 (최악의 혹한 포위).",
    briefingEn: "Chosin: US X Corps (Marines, 7th ID) vs PLA 9th Army in extreme cold.",
  },
  20: {
    allyStrength: 85,
    enemyStrength: 110,
    allyMix: [
      { variant: "us_marine", weight: 35, faction: "us" },
      { variant: "us_inf", weight: 30, faction: "us" },
      { variant: "rok_marine", weight: 20, faction: "rok" },
      { variant: "rok_inf", weight: 15, faction: "rok" },
    ],
    enemyMix: [
      { variant: "pla_inf", weight: 70, faction: "pla" },
      { variant: "kpa_inf", weight: 30, faction: "kpa" },
    ],
    briefingKo: "흥남 철수 — 미 해군·해병 주도 해상 철수, 국군 동반.",
    briefingEn: "Hungnam evacuation: US Navy/Marines withdraw with ROK elements.",
  },
  21: {
    allyStrength: 72,
    enemyStrength: 115,
    allyMix: [
      { variant: "rok_inf", weight: 52, faction: "rok" },
      { variant: "us_inf", weight: 38, faction: "us" },
      { variant: "m4", weight: 10, faction: "us" },
    ],
    enemyMix: [
      { variant: "pla_inf", weight: 55, faction: "pla" },
      { variant: "kpa_inf", weight: 45, faction: "kpa" },
    ],
    briefingKo: "서울 재함락(1951.1) — 중공·인민군 공세, UN·국군 후퇴.",
    briefingEn: "Seoul lost again: PLA/KPA push; UN–ROK withdrawal.",
  },
  22: {
    allyStrength: 82,
    enemyStrength: 118,
    allyMix: [
      { variant: "us_inf", weight: 38, faction: "us" },
      { variant: "rok_inf", weight: 36, faction: "rok" },
      { variant: "fra_inf", weight: 14, faction: "fra" },
      { variant: "phil_inf", weight: 6, faction: "phil" },
      { variant: "howitzer", weight: 6, faction: "us" },
    ],
    enemyMix: [
      { variant: "pla_inf", weight: 85, faction: "pla" },
      { variant: "katyusha", weight: 15, faction: "pla" },
    ],
    briefingKo: "최용니 — 미 23연대·프랑스 기갑대·국군 vs 중공군 (프랑스대 2,300명급).",
    briefingEn: "Chipyongni: US 23rd RCT, French Battalion, ROK vs PLA.",
  },
  23: {
    allyStrength: 80,
    enemyStrength: 112,
    allyMix: [
      { variant: "rok_inf", weight: 46, faction: "rok" },
      { variant: "us_inf", weight: 30, faction: "us" },
      { variant: "aus_inf", weight: 10, faction: "aus" },
      { variant: "can_inf", weight: 10, faction: "can" },
      { variant: "uk_inf", weight: 4, faction: "uk" },
    ],
    enemyMix: [
      { variant: "pla_inf", weight: 75, faction: "pla" },
      { variant: "kpa_inf", weight: 25, faction: "kpa" },
    ],
    briefingKo: "원주 방어 — 영연방(호주·캐나다)·미군·국군 다국적 전선.",
    briefingEn: "Wonju: Commonwealth (Australia, Canada), US, and ROK defend.",
  },
  24: {
    allyStrength: 88,
    enemyStrength: 108,
    allyMix: [
      { variant: "rok_inf", weight: 42, faction: "rok" },
      { variant: "us_inf", weight: 28, faction: "us" },
      { variant: "uk_inf", weight: 10, faction: "uk" },
      { variant: "tur_inf", weight: 8, faction: "tur" },
      { variant: "phil_inf", weight: 5, faction: "phil" },
      { variant: "aus_inf", weight: 4, faction: "aus" },
      { variant: "can_inf", weight: 3, faction: "can" },
    ],
    enemyMix: [
      { variant: "pla_inf", weight: 60, faction: "pla" },
      { variant: "kpa_inf", weight: 40, faction: "kpa" },
    ],
    briefingKo: "서울 재수복(1951) — UN 16개국 참전국 중 미·영·튀르키예·필리핀·호주·캐나다 등 혼성.",
    briefingEn: "Seoul 1951: UN coalition—US, UK, Turkey, Philippines, Australia, Canada, ROK.",
  },
  25: {
    allyStrength: 78,
    enemyStrength: 135,
    allyMix: [
      { variant: "uk_inf", weight: 24, faction: "uk" },
      { variant: "us_inf", weight: 26, faction: "us" },
      { variant: "rok_inf", weight: 32, faction: "rok" },
      { variant: "can_inf", weight: 6, faction: "can" },
      { variant: "aus_inf", weight: 5, faction: "aus" },
      { variant: "fra_inf", weight: 4, faction: "fra" },
      { variant: "nld_inf", weight: 3, faction: "nld" },
    ],
    enemyMix: [
      { variant: "pla_inf", weight: 88, faction: "pla" },
      { variant: "katyusha", weight: 12, faction: "pla" },
    ],
    briefingKo: "임진강·가평 — 영국군 글로스터셔 연대(1,000여 명) 등 vs 중공 대규모 공세.",
    briefingEn: "Imjin/Gapyeong: Gloucestershire Regiment (UK) and UN forces vs major PLA offensive.",
  },
  26: {
    allyStrength: 85,
    enemyStrength: 105,
    allyMix: [
      { variant: "rok_inf", weight: 38, faction: "rok" },
      { variant: "us_inf", weight: 26, faction: "us" },
      { variant: "tur_inf", weight: 14, faction: "tur" },
      { variant: "uk_inf", weight: 8, faction: "uk" },
      { variant: "fra_inf", weight: 5, faction: "fra" },
      { variant: "col_inf", weight: 5, faction: "col" },
      { variant: "phil_inf", weight: 4, faction: "phil" },
    ],
    enemyMix: [
      { variant: "kpa_inf", weight: 45, faction: "kpa" },
      { variant: "pla_inf", weight: 55, faction: "pla" },
    ],
    briefingKo: "피의 계마령 — 정상전, 튀르키예·콜롬비아·프랑스 등 UN군 참여.",
    briefingEn: "Bloody Ridge: attrition; Turkish, Colombian, French UN units engaged.",
  },
  27: {
    allyStrength: 84,
    enemyStrength: 108,
    allyMix: [
      { variant: "rok_inf", weight: 40, faction: "rok" },
      { variant: "us_inf", weight: 24, faction: "us" },
      { variant: "tur_inf", weight: 12, faction: "tur" },
      { variant: "uk_inf", weight: 8, faction: "uk" },
      { variant: "col_inf", weight: 6, faction: "col" },
      { variant: "thai_inf", weight: 5, faction: "thai" },
      { variant: "can_inf", weight: 5, faction: "can" },
    ],
    enemyMix: [
      { variant: "kpa_inf", weight: 50, faction: "kpa" },
      { variant: "pla_inf", weight: 50, faction: "pla" },
    ],
    briefingKo: "하트브레이크 릿지 — 태국·콜롬비아·튀르키예 등 UN군 포위전.",
    briefingEn: "Heartbreak Ridge: Thai, Colombian, Turkish UN forces in hill fighting.",
  },
  28: {
    allyStrength: 86,
    enemyStrength: 110,
    allyMix: [
      { variant: "rok_inf", weight: 44, faction: "rok" },
      { variant: "us_inf", weight: 22, faction: "us" },
      { variant: "tur_inf", weight: 16, faction: "tur" },
      { variant: "uk_inf", weight: 8, faction: "uk" },
      { variant: "col_inf", weight: 6, faction: "col" },
      { variant: "thai_inf", weight: 4, faction: "thai" },
    ],
    enemyMix: [
      { variant: "kpa_inf", weight: 55, faction: "kpa" },
      { variant: "pla_inf", weight: 45, faction: "pla" },
    ],
    briefingKo: "백마고지 — 국군 주력 + 튀르키예·태국·콜롬비아 등 UN군 고지 쟁탈.",
    briefingEn: "White Horse Hill: ROK-led with Turkish, Thai, Colombian UN troops.",
  },
  29: {
    allyStrength: 83,
    enemyStrength: 106,
    allyMix: [
      { variant: "rok_inf", weight: 42, faction: "rok" },
      { variant: "us_inf", weight: 24, faction: "us" },
      { variant: "tur_inf", weight: 12, faction: "tur" },
      { variant: "uk_inf", weight: 8, faction: "uk" },
      { variant: "aus_inf", weight: 6, faction: "aus" },
      { variant: "nld_inf", weight: 4, faction: "nld" },
      { variant: "eth_inf", weight: 4, faction: "eth" },
    ],
    enemyMix: [
      { variant: "kpa_inf", weight: 48, faction: "kpa" },
      { variant: "pla_inf", weight: 52, faction: "pla" },
    ],
    briefingKo: "스나이더 릿지 — 에티오피아 카그뉴 부대 등 UN 다국적 참전.",
    briefingEn: "Sniper Ridge: Ethiopian Kagnew Battalion and other UN contingents.",
  },
  30: {
    allyStrength: 88,
    enemyStrength: 102,
    allyMix: [
      { variant: "rok_inf", weight: 40, faction: "rok" },
      { variant: "us_inf", weight: 22, faction: "us" },
      { variant: "tur_inf", weight: 12, faction: "tur" },
      { variant: "uk_inf", weight: 8, faction: "uk" },
      { variant: "eth_inf", weight: 6, faction: "eth" },
      { variant: "col_inf", weight: 5, faction: "col" },
      { variant: "thai_inf", weight: 4, faction: "thai" },
      { variant: "can_inf", weight: 3, faction: "can" },
    ],
    enemyMix: [
      { variant: "kpa_inf", weight: 50, faction: "kpa" },
      { variant: "pla_inf", weight: 50, faction: "pla" },
    ],
    briefingKo: "정전 직전(1953) — 16개 UN 회원국 참전 반영: 미·영·캐나다·호주·튀르키예·태국·콜롬비아·에티오피아·네덜란드·프랑스·필리핀 등 + 국군.",
    briefingEn: "Pre-armistice 1953: reflects 16 UN members—US, UK, Canada, Australia, Turkey, Thailand, Colombia, Ethiopia, Netherlands, France, Philippines, and ROK.",
  },
};

const DEFAULT_PROFILE = SCENARIO_FORCE_PROFILES[5];

export function getForceProfile(scenarioId) {
  return SCENARIO_FORCE_PROFILES[scenarioId] || DEFAULT_PROFILE;
}

export function countPassableTiles(map) {
  let n = 0;
  for (let y = 0; y < map.rows; y++) {
    for (let x = 0; x < map.cols; x++) {
      if (getTerrainStats(getTerrainAt(map, x, y)).movCost < 99) n++;
    }
  }
  return n;
}

export function getHistoricalForceTargets(scenarioId, map) {
  const profile = getForceProfile(scenarioId);
  const passable = countPassableTiles(map);
  const cap = Math.max(14, Math.floor(passable * 0.44));
  const density = Math.min(cap, Math.max(22, Math.floor(Math.sqrt(passable) * 4.8)));

  const sum = profile.allyStrength + profile.enemyStrength;
  let allyCount = Math.round((density * 2 * profile.allyStrength) / sum);
  let enemyCount = Math.round((density * 2 * profile.enemyStrength) / sum);

  allyCount = Math.min(cap, Math.max(10, allyCount));
  enemyCount = Math.min(cap, Math.max(10, enemyCount));

  return {
    allyCount,
    enemyCount,
    allyMix: profile.allyMix,
    enemyMix: profile.enemyMix,
    profile,
  };
}

/** Deterministic pick from weighted mix */
export function pickFromMix(mix, index) {
  if (!mix?.length) return { variant: "rok_inf", faction: "rok" };
  const total = mix.reduce((s, m) => s + m.weight, 0);
  let r = (index * 31 + 7) % total;
  for (const entry of mix) {
    r -= entry.weight;
    if (r < 0) {
      return {
        variant: entry.variant,
        faction: entry.faction || VARIANT_FACTION[entry.variant] || "rok",
      };
    }
  }
  const last = mix[mix.length - 1];
  return {
    variant: last.variant,
    faction: last.faction || VARIANT_FACTION[last.variant] || "rok",
  };
}

export function applyMixToSpawnList(spawns, mix) {
  return spawns.map((s, i) => {
    const pick = pickFromMix(mix, i);
    return {
      ...s,
      variant: pick.variant,
      faction: pick.faction,
    };
  });
}

export function getHistoricalForceBriefing(scenarioId, lang) {
  const p = getForceProfile(scenarioId);
  return lang === "en" ? p.briefingEn || "" : p.briefingKo || "";
}

export function resolveUnitFaction(spec, scenarioId, side, index) {
  if (spec.faction) return spec.faction;
  if (spec.variant && VARIANT_FACTION[spec.variant]) {
    return VARIANT_FACTION[spec.variant];
  }
  if (side === "enemy") {
    if (scenarioId <= 4) return "rebel";
    if (scenarioId >= 18 && scenarioId <= 21) return "pla";
    if (scenarioId >= 22) return index % 3 === 0 ? "pla" : "kpa";
    return "kpa";
  }
  if (scenarioId <= 1) return spec.variant === "police" ? "police" : "rok";
  return "rok";
}

/** Ally composition summary for HUD (percentages) */
export function summarizeAllyComposition(units, lang) {
  const allies = units.filter((u) => u.side === "ally" && u.hp > 0 && !u.civ);
  if (!allies.length) return "";
  const counts = {};
  for (const u of allies) {
    const key = u.faction || "rok";
    counts[key] = (counts[key] || 0) + 1;
  }
  const labels = getFactionLabels(lang);
  const parts = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([f, n]) => `${labels[f] || f} ${Math.round((n / allies.length) * 100)}%`);
  return parts.join(" · ");
}

export function getFactionLabels(lang) {
  const ko = {
    rok: "국군",
    police: "경찰",
    us: "미군",
    un: "UN",
    uk: "영국",
    can: "캐나다",
    aus: "호주",
    tur: "튀르키예",
    fra: "프랑스",
    phil: "필리핀",
    thai: "태국",
    nld: "네덜란드",
    col: "콜롬비아",
    eth: "에티오피아",
    kpa: "인민군",
    pla: "중공군",
    rebel: "반란군",
  };
  const en = {
    rok: "ROK",
    police: "Police",
    us: "US",
    un: "UN",
    uk: "UK",
    can: "Canada",
    aus: "Australia",
    tur: "Turkey",
    fra: "France",
    phil: "Philippines",
    thai: "Thailand",
    nld: "Netherlands",
    col: "Colombia",
    eth: "Ethiopia",
    kpa: "KPA",
    pla: "PLA",
    rebel: "Rebels",
  };
  return lang === "en" ? en : ko;
}
