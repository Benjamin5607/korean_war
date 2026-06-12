/** Shared tactical map tile size — keeps grid and background art in sync */
export function computeMapTilePx(cols, rows, unitCount = 0) {
  const vw = typeof window !== "undefined" ? window.innerWidth : 400;
  const vh = typeof window !== "undefined" ? window.innerHeight : 700;
  const maxW = Math.min(vw * 0.99, 820);
  const maxH = Math.min(vh * 0.82, 880);
  const fromW = Math.floor((maxW - 4) / cols);
  const fromH = Math.floor((maxH - 4) / rows);
  const maxPx = unitCount > 40 ? 62 : unitCount > 28 ? 72 : 88;
  const minPx = unitCount > 40 ? 44 : unitCount > 28 ? 50 : 54;
  return Math.min(maxPx, Math.max(minPx, Math.min(fromW, fromH)));
}
