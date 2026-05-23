/** Combat VFX events for commander-mode battle render */

export function clearCombatFx(state) {
  if (state.commander) state.commander.combatFx = [];
}

export function pushCombatFx(state, event) {
  if (!state.commander) return;
  if (!state.commander.combatFx) state.commander.combatFx = [];
  state.commander.combatFx.push({ ...event, id: `${Date.now()}-${Math.random()}` });
  if (state.commander.combatFx.length > 64) state.commander.combatFx.shift();
}

export function recordHit(state, attacker, target, dmg) {
  pushCombatFx(state, {
    kind: "hit",
    fx: attacker.x,
    fy: attacker.y,
    tx: target.x,
    ty: target.y,
    dmg,
    side: attacker.side,
  });
  if (target.hp <= 0) {
    pushCombatFx(state, { kind: "death", tx: target.x, ty: target.y });
  }
}

export function recordShell(state, x, y, dmg, label = "shell") {
  pushCombatFx(state, { kind: label, tx: x, ty: y, dmg });
}
