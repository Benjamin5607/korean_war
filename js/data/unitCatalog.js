/** Historical unit variants with combat traits */
export const UNIT_VARIANTS = {
  police: { category: "infantry", atk: 10, hp: 36, mov: 3, range: 1, armor: 0, labelKo: "경찰대", labelEn: "Police" },
  militia: { category: "infantry", atk: 11, hp: 38, mov: 3, range: 1, armor: 0, labelKo: "민방대", labelEn: "Militia" },
  rok_inf: { category: "infantry", atk: 12, hp: 42, mov: 3, range: 1, armor: 1, labelKo: "국군 보병", labelEn: "ROK Infantry" },
  rok_marine: { category: "infantry", atk: 14, hp: 44, mov: 3, range: 1, armor: 2, labelKo: "해병대", labelEn: "ROK Marines" },
  us_inf: { category: "infantry", atk: 13, hp: 45, mov: 3, range: 1, armor: 2, labelKo: "미군 보병", labelEn: "US Infantry" },
  us_marine: { category: "infantry", atk: 15, hp: 47, mov: 3, range: 1, armor: 3, labelKo: "미 해병대", labelEn: "US Marines" },
  un_inf: { category: "infantry", atk: 12, hp: 43, mov: 3, range: 1, armor: 2, labelKo: "UN군", labelEn: "UN Infantry" },
  uk_inf: { category: "infantry", atk: 13, hp: 44, mov: 3, range: 1, armor: 2, labelKo: "영국군", labelEn: "British Army" },
  can_inf: { category: "infantry", atk: 13, hp: 44, mov: 3, range: 1, armor: 2, labelKo: "캐나다군", labelEn: "Canadian Army" },
  aus_inf: { category: "infantry", atk: 13, hp: 43, mov: 3, range: 1, armor: 2, labelKo: "호주군", labelEn: "Australian Army" },
  tur_inf: { category: "infantry", atk: 14, hp: 46, mov: 3, range: 1, armor: 2, labelKo: "튀르키예 여단", labelEn: "Turkish Brigade" },
  fra_inf: { category: "infantry", atk: 13, hp: 43, mov: 3, range: 1, armor: 2, labelKo: "프랑스 대대", labelEn: "French Battalion" },
  phil_inf: { category: "infantry", atk: 12, hp: 42, mov: 3, range: 1, armor: 1, labelKo: "필리핀 연대", labelEn: "Philippine Battalion" },
  thai_inf: { category: "infantry", atk: 12, hp: 42, mov: 3, range: 1, armor: 1, labelKo: "태국 연대", labelEn: "Thai Regiment" },
  nld_inf: { category: "infantry", atk: 12, hp: 42, mov: 3, range: 1, armor: 2, labelKo: "네덜란드 대대", labelEn: "Netherlands Battalion" },
  col_inf: { category: "infantry", atk: 12, hp: 43, mov: 3, range: 1, armor: 1, labelKo: "콜롬비아 대대", labelEn: "Colombian Battalion" },
  eth_inf: { category: "infantry", atk: 13, hp: 45, mov: 3, range: 1, armor: 2, labelKo: "에티오피아 카그뉴", labelEn: "Ethiopian Kagnew" },
  bazooka: { category: "infantry", atk: 11, hp: 34, mov: 2, range: 1, armor: 0, antiTank: 18, labelKo: "바주카포", labelEn: "Bazooka Team" },
  sniper: { category: "infantry", atk: 15, hp: 28, mov: 2, range: 2, armor: 0, labelKo: "저격수", labelEn: "Sniper" },
  rebel_inf: { category: "infantry", atk: 11, hp: 40, mov: 3, range: 1, armor: 0, labelKo: "반란군", labelEn: "Rebels" },
  kpa_inf: { category: "infantry", atk: 12, hp: 44, mov: 3, range: 1, armor: 1, labelKo: "인민군 보병", labelEn: "KPA Infantry" },
  pla_inf: { category: "infantry", atk: 13, hp: 46, mov: 3, range: 1, armor: 1, nightBonus: 3, labelKo: "중공군 보병", labelEn: "PLA Infantry" },
  t34: { category: "tank", atk: 24, hp: 62, mov: 4, range: 1, armor: 10, labelKo: "T-34 전차", labelEn: "T-34" },
  m4: { category: "tank", atk: 22, hp: 58, mov: 4, range: 1, armor: 9, labelKo: "M4 셔먼", labelEn: "M4 Sherman" },
  stuart: { category: "tank", atk: 18, hp: 48, mov: 5, range: 1, armor: 6, labelKo: "경전차", labelEn: "Light Tank" },
  mortar: { category: "artillery", atk: 14, hp: 26, mov: 2, range: 3, armor: 0, labelKo: "박격포", labelEn: "Mortar" },
  howitzer: { category: "artillery", atk: 20, hp: 30, mov: 2, range: 4, armor: 0, labelKo: "105mm 곡사포", labelEn: "105mm Howitzer" },
  kpa_gun: { category: "artillery", atk: 17, hp: 28, mov: 2, range: 3, armor: 0, labelKo: "인민포", labelEn: "KPA Artillery" },
  katyusha: { category: "artillery", atk: 22, hp: 24, mov: 2, range: 4, armor: 0, splash: 2, labelKo: "로켓포", labelEn: "Rocket Artillery" },
  ac130: { category: "artillery", atk: 18, hp: 32, mov: 1, range: 4, armor: 2, labelKo: "포병 지원", labelEn: "Artillery Support" },
};

export function getVariant(id) {
  return UNIT_VARIANTS[id] || UNIT_VARIANTS.rok_inf;
}

export function variantLabel(id, lang) {
  const v = getVariant(id);
  return lang === "en" ? v.labelEn : v.labelKo;
}
