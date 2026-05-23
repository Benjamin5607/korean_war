import { getVariant, variantLabel } from "../data/unitCatalog.js";

export const UNIT_TYPES = {
  infantry: { icon: "步", iconEn: "IN", atk: 12, hp: 40, mov: 3, range: 1 },
  tank: { icon: "坦", iconEn: "TK", atk: 22, hp: 55, mov: 4, range: 1 },
  artillery: { icon: "炮", iconEn: "AR", atk: 18, hp: 30, mov: 2, range: 3 },
};

export function applyUpgrades(base, upgrades, category) {
  const u = upgrades[category] || { atk: 0, hp: 0, mov: 0 };
  return {
    atk: base.atk + u.atk * 2,
    hp: base.hp + u.hp * 5,
    mov: base.mov + Math.floor(u.mov / 2),
    range: base.range,
    armor: base.armor || 0,
    antiTank: base.antiTank || 0,
    nightBonus: base.nightBonus || 0,
  };
}

export function createUnit(spec, side, id, upgrades, lang, faction) {
  const variantId = spec.variant || "rok_inf";
  const base = getVariant(variantId);
  const category = base.category;
  const stats = applyUpgrades(base, upgrades, category);
  const typeIcon = UNIT_TYPES[category] || UNIT_TYPES.infantry;

  return {
    id,
    side,
    type: category,
    variant: variantId,
    faction: faction || (side === "ally" ? "rok" : "kpa"),
    x: spec.x,
    y: spec.y,
    hp: stats.hp,
    maxHp: stats.hp,
    atk: stats.atk,
    mov: stats.mov,
    range: stats.range,
    armor: stats.armor,
    antiTank: stats.antiTank,
    nightBonus: stats.nightBonus,
    moved: false,
    acted: false,
    civ: spec.civ || false,
    icon: lang === "en" ? typeIcon.iconEn : typeIcon.icon,
    label: variantLabel(variantId, lang),
  };
}

export function expandSpawnList(list) {
  const out = [];
  for (const item of list) {
    const n = item.count || 1;
    for (let i = 0; i < n; i++) {
      const copy = { ...item };
      delete copy.count;
      if (n > 1) {
        copy.x = item.x + (i % 2);
        copy.y = item.y + Math.floor(i / 2);
      }
      out.push(copy);
    }
  }
  return out;
}
