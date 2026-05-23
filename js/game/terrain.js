const TERRAIN_DEF = {
  plain: { def: 0, movCost: 1, heal: 0 },
  forest: { def: 10, movCost: 2, heal: 0 },
  city: { def: 18, movCost: 1, heal: 2 },
  bunker: { def: 25, movCost: 2, heal: 3 },
  river: { def: 0, movCost: 99, heal: 0 },
  bridge: { def: 0, movCost: 1, heal: 0 },
  ford: { def: 0, movCost: 3, heal: 0 },
  mountain: { def: 15, movCost: 3, heal: 0 },
  snow: { def: 5, movCost: 2, heal: 0 },
  beach: { def: 0, movCost: 1, heal: 0 },
  palace: { def: 22, movCost: 1, heal: 2, era: 1945 },
  capitol: { def: 24, movCost: 1, heal: 3, era: 1950 },
  hanok: { def: 16, movCost: 1, heal: 1, era: 1945 },
  colonial: { def: 18, movCost: 1, heal: 2, era: 1945 },
  depot: { def: 14, movCost: 1, heal: 1, era: 1950 },
  fort: { def: 28, movCost: 2, heal: 3, era: 1950 },
  village: { def: 12, movCost: 1, heal: 1, era: 1945 },
  gate: { def: 8, movCost: 1, heal: 0 },
};

export function getTerrainAt(map, x, y) {
  const t = map.terrain.find((c) => c.x === x && c.y === y);
  return t?.type || "plain";
}

export function getTerrainStats(type) {
  return TERRAIN_DEF[type] || TERRAIN_DEF.plain;
}

export function isPassable(map, x, y, units, ignoreId) {
  if (x < 0 || y < 0 || x >= map.cols || y >= map.rows) return false;
  const stats = getTerrainStats(getTerrainAt(map, x, y));
  if (stats.movCost >= 99) return false;
  const occ = units.find((u) => u.hp > 0 && u.x === x && u.y === y && u.id !== ignoreId);
  return !occ;
}

export function manhattan(x1, y1, x2, y2) {
  return Math.abs(x1 - x2) + Math.abs(y1 - y2);
}

export function getReachableTiles(map, unit, units) {
  const start = { x: unit.x, y: unit.y, cost: 0 };
  const visited = new Map();
  const key = (x, y) => `${x},${y}`;
  const queue = [start];
  visited.set(key(unit.x, unit.y), 0);
  const reachable = [];

  while (queue.length) {
    const cur = queue.shift();
    const dirs = [
      [0, 1], [0, -1], [1, 0], [-1, 0],
    ];
    for (const [dx, dy] of dirs) {
      const nx = cur.x + dx;
      const ny = cur.y + dy;
      const k = key(nx, ny);
      if (!isPassable(map, nx, ny, units, unit.id)) continue;
      const cost = cur.cost + getTerrainStats(getTerrainAt(map, nx, ny)).movCost;
      if (cost > unit.mov) continue;
      if (visited.has(k) && visited.get(k) <= cost) continue;
      const blocked = units.some((u) => u.hp > 0 && u.x === nx && u.y === ny && u.id !== unit.id);
      if (!blocked) {
        visited.set(k, cost);
        if (!(nx === unit.x && ny === unit.y)) reachable.push({ x: nx, y: ny, cost });
        queue.push({ x: nx, y: ny, cost });
      }
    }
  }
  return reachable;
}

export function getAttackTargets(unit, units) {
  const targets = [];
  for (const u of units) {
    if (u.hp <= 0 || u.side === unit.side) continue;
    const dist = manhattan(unit.x, unit.y, u.x, u.y);
    if (dist <= unit.range) targets.push(u);
  }
  return targets;
}
