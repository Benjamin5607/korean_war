/** Shared tactical map tile size — keeps grid and background art in sync */
export function computeMapTilePx(cols, rows, unitCount = 0) {
  const vw = typeof window !== "undefined" ? window.innerWidth : 400;
  const vh = typeof window !== "undefined" ? window.innerHeight : 700;
  const maxW = Math.min(vw * 0.98, 640);
  const maxH = Math.min(vh * 0.68, 720);
  const fromW = Math.floor((maxW - 8) / cols);
  const fromH = Math.floor((maxH - 8) / rows);
  const maxPx = unitCount > 36 ? 52 : unitCount > 24 ? 58 : 72;
  const minPx = unitCount > 36 ? 36 : unitCount > 24 ? 40 : 42;
  return Math.min(maxPx, Math.max(minPx, Math.min(fromW, fromH)));
}
