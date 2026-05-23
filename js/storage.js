const SAVE_KEY = "kw_saves";
const PROFILE_KEY = "kw_profile";

export function loadProfile() {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (_) {}
  return defaultProfile();
}

export function saveProfile(profile) {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

export function defaultProfile() {
  return {
    gold: 100,
    upgrades: { infantry: { atk: 0, hp: 0, mov: 0 }, tank: { atk: 0, hp: 0, mov: 0 }, artillery: { atk: 0, hp: 0, mov: 0 } },
    stars: {},
    unlockedScenario: 1,
    currentScenario: null,
    lang: "ko",
  };
}

export function listSaves() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (_) {}
  return [];
}

export function writeSave(slot) {
  const saves = listSaves();
  const idx = saves.findIndex((s) => s.id === slot.id);
  if (idx >= 0) saves[idx] = slot;
  else saves.unshift(slot);
  localStorage.setItem(SAVE_KEY, JSON.stringify(saves.slice(0, 20)));
}

export function deleteSave(id) {
  const saves = listSaves().filter((s) => s.id !== id);
  localStorage.setItem(SAVE_KEY, JSON.stringify(saves));
}

export function getSave(id) {
  return listSaves().find((s) => s.id === id);
}

export function createSavePayload(profile, battleState, memo) {
  return {
    id: `save_${Date.now()}`,
    memo: memo || "",
    timestamp: Date.now(),
    profile: JSON.parse(JSON.stringify(profile)),
    battle: battleState ? JSON.parse(JSON.stringify(battleState)) : null,
  };
}
