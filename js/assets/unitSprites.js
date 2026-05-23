/** SVG military unit sprites: ROK, KPA, PLA, US/UN */

const FACTION_COLORS = {
  rok: { body: "#2a4a7a", helm: "#1a3050", trim: "#c9a227", badge: "태" },
  police: { body: "#3a3a48", helm: "#2a2a35", trim: "#888", badge: "警" },
  us: { body: "#4a5a3a", helm: "#3a4a2a", trim: "#c9a227", badge: "US" },
  un: { body: "#3d5a6a", helm: "#2d4a5a", trim: "#4a90c0", badge: "UN" },
  uk: { body: "#3a4a62", helm: "#2a3a52", trim: "#c8102e", badge: "UK" },
  can: { body: "#3d4a5a", helm: "#2d3a4a", trim: "#ff3333", badge: "CA" },
  aus: { body: "#4a5248", helm: "#3a4238", trim: "#d4af37", badge: "AU" },
  tur: { body: "#4a4038", helm: "#3a3028", trim: "#e03030", badge: "TR" },
  fra: { body: "#3a4a6a", helm: "#2a3a5a", trim: "#2255aa", badge: "FR" },
  phil: { body: "#4a4a58", helm: "#3a3a48", trim: "#0038a8", badge: "PH" },
  thai: { body: "#4a4838", helm: "#3a3828", trim: "#a51931", badge: "TH" },
  nld: { body: "#4a4a50", helm: "#3a3a40", trim: "#ff6600", badge: "NL" },
  col: { body: "#3a4a40", helm: "#2a3a30", trim: "#fcd116", badge: "CO" },
  eth: { body: "#3a3a30", helm: "#2a2a22", trim: "#078930", badge: "ET" },
  kpa: { body: "#5a4a38", helm: "#4a3a28", trim: "#b33a3a", badge: "★" },
  pla: { body: "#4a5a42", helm: "#3a4a32", trim: "#cc4444", badge: "八" },
  rebel: { body: "#5a4030", helm: "#4a3020", trim: "#aa6633", badge: "反" },
};

function svgInfantry(f) {
  const c = FACTION_COLORS[f] || FACTION_COLORS.rok;
  return `<svg viewBox="0 0 32 36" class="unit-svg infantry-svg" aria-hidden="true">
    <ellipse cx="16" cy="32" rx="10" ry="3" fill="rgba(0,0,0,0.35)"/>
    <rect x="10" y="14" width="12" height="14" rx="2" fill="${c.body}"/>
    <circle cx="16" cy="10" r="6" fill="${c.helm}"/>
    <rect x="12" y="18" width="8" height="2" fill="${c.trim}"/>
    <text x="16" y="12" text-anchor="middle" font-size="5" fill="#fff" font-weight="bold">${c.badge}</text>
    <line x1="22" y1="16" x2="28" y2="10" stroke="#444" stroke-width="2"/>
  </svg>`;
}

function svgTank(f) {
  const c = FACTION_COLORS[f] || FACTION_COLORS.rok;
  const isT34 = f === "kpa" || f === "pla";
  const hull = isT34 ? "#4a5040" : "#3a5a3a";
  return `<svg viewBox="0 0 36 28" class="unit-svg tank-svg" aria-hidden="true">
    <ellipse cx="18" cy="25" rx="14" ry="2.5" fill="rgba(0,0,0,0.35)"/>
    <rect x="4" y="12" width="28" height="10" rx="2" fill="${hull}"/>
    <rect x="14" y="6" width="12" height="8" fill="${c.helm}"/>
    <rect x="2" y="20" width="32" height="4" fill="#333"/>
    <circle cx="8" cy="22" r="3" fill="#222"/><circle cx="28" cy="22" r="3" fill="#222"/>
    <text x="18" y="11" text-anchor="middle" font-size="5" fill="${c.trim}" font-weight="bold">${isT34 ? "T34" : "M4"}</text>
    ${isT34 ? `<polygon points="32,14 36,10 32,6" fill="${c.trim}"/>` : ""}
  </svg>`;
}

function svgArtillery(f) {
  const c = FACTION_COLORS[f] || FACTION_COLORS.rok;
  return `<svg viewBox="0 0 34 30" class="unit-svg artillery-svg" aria-hidden="true">
    <ellipse cx="17" cy="27" rx="12" ry="2" fill="rgba(0,0,0,0.35)"/>
    <rect x="6" y="16" width="22" height="8" rx="1" fill="${c.body}"/>
    <rect x="20" y="8" width="12" height="4" transform="rotate(-15 20 10)" fill="#444"/>
    <circle cx="10" cy="22" r="4" fill="#222"/><circle cx="24" cy="22" r="4" fill="#222"/>
    <text x="17" y="14" text-anchor="middle" font-size="5" fill="${c.trim}">炮</text>
  </svg>`;
}

function svgCiv() {
  return `<svg viewBox="0 0 28 32" class="unit-svg civ-svg" aria-hidden="true">
    <circle cx="14" cy="8" r="5" fill="#8a7a6a"/>
    <path d="M6 28 Q14 18 22 28" fill="#6a5a4a"/>
    <text x="14" y="24" text-anchor="middle" font-size="6" fill="#fff">民</text>
  </svg>`;
}

function svgBazooka(f) {
  const c = FACTION_COLORS[f] || FACTION_COLORS.us;
  return `<svg viewBox="0 0 32 36" class="unit-svg" aria-hidden="true">
    <ellipse cx="16" cy="32" rx="10" ry="3" fill="rgba(0,0,0,0.35)"/>
    <rect x="10" y="14" width="12" height="14" rx="2" fill="${c.body}"/>
    <circle cx="16" cy="10" r="6" fill="${c.helm}"/>
    <rect x="20" y="12" width="10" height="3" fill="#333" transform="rotate(-25 20 12)"/>
    <text x="16" y="12" text-anchor="middle" font-size="4" fill="#fff">BZ</text>
  </svg>`;
}

function svgSniper(f) {
  const c = FACTION_COLORS[f] || FACTION_COLORS.rok;
  return `<svg viewBox="0 0 32 36" class="unit-svg" aria-hidden="true">
    <ellipse cx="16" cy="32" rx="10" ry="3" fill="rgba(0,0,0,0.35)"/>
    <rect x="10" y="16" width="12" height="12" rx="2" fill="${c.body}"/>
    <circle cx="16" cy="10" r="5" fill="${c.helm}"/>
    <line x1="4" y1="8" x2="28" y2="6" stroke="#444" stroke-width="2"/>
  </svg>`;
}

export function getUnitSpriteHTML(unit) {
  if (unit.civ) return svgCiv();
  const f = unit.faction || (unit.side === "ally" ? "rok" : "kpa");
  const v = unit.variant || "";
  if (v === "bazooka") return svgBazooka(f);
  if (v === "sniper") return svgSniper(f);
  if (unit.type === "tank") {
    const tf = v.includes("t34") || f === "kpa" || f === "pla" ? (f === "pla" ? "pla" : "kpa") : f;
    return svgTank(tf);
  }
  if (unit.type === "artillery") return svgArtillery(f);
  return svgInfantry(f);
}

/** Assign historical faction by scenario era (deterministic) */
export function factionForUnit(scenarioId, side, type, index) {
  if (side === "enemy") {
    if (scenarioId <= 2) return "rebel";
    if (scenarioId >= 18 && scenarioId <= 21) return "pla";
    if (scenarioId >= 22) return index % 2 === 0 ? "pla" : "kpa";
    return type === "tank" ? "kpa" : "kpa";
  }
  if (scenarioId <= 1) return "police";
  if (scenarioId >= 8 && scenarioId <= 10 && index === 0) return "us";
  if (scenarioId >= 13 && scenarioId <= 21 && type === "tank") return "us";
  if (scenarioId >= 22 && type === "infantry" && index % 3 === 0) return "un";
  return "rok";
}

const FACTION_FLAGS = {
  rok: "🇰🇷",
  police: "🇰🇷",
  us: "🇺🇸",
  un: "🇺🇳",
  uk: "🇬🇧",
  can: "🇨🇦",
  aus: "🇦🇺",
  tur: "🇹🇷",
  fra: "🇫🇷",
  phil: "🇵🇭",
  thai: "🇹🇭",
  nld: "🇳🇱",
  col: "🇨🇴",
  eth: "🇪🇹",
  kpa: "🇰🇵",
  pla: "🇨🇳",
  rebel: "⚔️",
};

export function getFactionFlag(faction) {
  return FACTION_FLAGS[faction] || "🏳️";
}

export function getFactionLabel(faction, lang) {
  const labels = {
    ko: {
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
    },
    en: {
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
    },
  };
  return labels[lang === "en" ? "en" : "ko"][faction] || faction;
}
