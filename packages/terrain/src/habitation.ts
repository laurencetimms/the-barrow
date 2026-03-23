import { TerrainMap, TerrainCell } from "./terrain";
import { GeologyType } from "./geology";

// ─── PRNG ─────────────────────────────────────────────────────────────────────

function hashStr(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  }
  return h;
}

function mulberry32(seed: number): () => number {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function makeRng(seed: string, offset = 0): () => number {
  return mulberry32(hashStr(seed) + offset);
}

// ─── TYPES ────────────────────────────────────────────────────────────────────

export interface FoodCell {
  deer: number;
  fish: number;
  wildfowl: number;
  wolfRisk: number;
  bearRisk: number;
}

export interface WolfTerritory { x: number; y: number; radius: number; packSize: number; }
export interface BearRange     { x: number; y: number; radius: number; }

export interface FoodResourceMap {
  grid: FoodCell[];
  wolfTerritories: WolfTerritory[];
  bearRanges: BearRange[];
}

export interface WightSite { x: number; y: number; occupied: boolean; }
export interface WightData {
  caveWights: WightSite[];
  smallFolk: WightSite[];
}

export interface CarryingCapacity {
  habitability: number[]; // flat [y * W + x], 0..1
}

export type SettlementSize = "homestead" | "hamlet" | "village" | "town";
export interface ActiveSettlement {
  x: number; y: number;
  population: number;
  size: SettlementSize;
  isWalledTown: boolean;
  isWaterLands: boolean;
}
export interface AbandonedSettlement {
  x: number; y: number;
  historicalSize: SettlementSize;
  reason: "waterRose" | "iceAdvanced" | "landMarginal";
}
export interface Ford { x: number; y: number; }
export interface SettlementData {
  settlements: ActiveSettlement[];
  fords: Ford[];
  abandoned: AbandonedSettlement[];
}

export interface PathSegment { cells: [number, number][]; traffic: number; }
export interface PathNetwork  { paths: PathSegment[]; }

export type MajorSiteType       = "greatComplex" | "henge" | "stoneCircle";
export type SignificantSiteType = "barrow" | "standingStone" | "smallStoneCircle" | "cairn";
export type SmallSiteType       = "sacredSpring" | "offeringPool" | "caveEntrance" | "sacredTree" | "carvedRockFace" | "markedStone";
export interface MajorSite       { x: number; y: number; type: MajorSiteType; }
export interface SignificantSite { x: number; y: number; type: SignificantSiteType; }
export interface SmallSite       { x: number; y: number; type: SmallSiteType; minZoom: number; }
export interface SacredData {
  major: MajorSite[];
  significant: SignificantSite[];
  small: SmallSite[];
}

export type SeasonalCampType = "grazingCamp" | "fishingCamp" | "gatheringCamp" | "flintMiningCamp" | "tradingSite";
export interface SeasonalCamp { x: number; y: number; type: SeasonalCampType; }
export interface SeasonalData { camps: SeasonalCamp[]; }

export interface HuntingWaypoint { x: number; y: number; }
export interface HuntingCircuit  { groupSize: number; pathCells: [number, number][]; waypoints: HuntingWaypoint[]; }
export interface HuntingData     { circuits: HuntingCircuit[]; }

export interface ValidationReport { summary: string[]; }

// Legacy interface kept for backwards compat (game package uses it)
export interface Settlement { x: number; y: number; population: number; size: SettlementSize; name?: string; abandoned?: boolean; }
export interface SacredSite  { x: number; y: number; type: string; tier: "major" | "significant" | "small"; }
export interface Path        { cells: [number, number][]; traffic: number; }
export interface HabitationData { settlements: Settlement[]; sacredSites: SacredSite[]; paths: Path[]; }

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function cell(terrain: TerrainMap, x: number, y: number): TerrainCell {
  return terrain.cells[y][x];
}

function inBounds(terrain: TerrainMap, x: number, y: number): boolean {
  return x >= 0 && x < terrain.width && y >= 0 && y < terrain.height;
}

function idx(W: number, x: number, y: number): number { return y * W + x; }

/** Clamp a value to [0, 1]. */
function clamp01(v: number): number { return v < 0 ? 0 : v > 1 ? 1 : v; }

/** Noise-like deterministic perturbation based on coordinates. */
function cellNoise(seed: number, x: number, y: number): number {
  let h = seed ^ (x * 374761393 + y * 668265263);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

/** Whether a cell is habitable land (not water, ice, or glacial). */
function isLand(c: TerrainCell): boolean {
  return c.geology !== GeologyType.Water &&
         c.geology !== GeologyType.Ice &&
         c.geology !== GeologyType.Glacial;
}

/** Whether a cell is a water-lands raised-island or carr (marginally habitable). */
function isHabitableWaterLands(c: TerrainCell): boolean {
  return c.geology === GeologyType.Water &&
    (c.waterLandsType === "raisedIsland" || c.waterLandsType === "carrWoodland");
}

// ─── 1. FOOD RESOURCES ────────────────────────────────────────────────────────

export function computeFoodResources(terrain: TerrainMap, seed: string): FoodResourceMap {
  const W = terrain.width, H = terrain.height;
  const rng = makeRng(seed, 1000);
  const grid: FoodCell[] = new Array(W * H);

  // Base values by geology
  const DEER_BASE: Partial<Record<GeologyType, number>> = {
    [GeologyType.Clay]:      0.75,
    [GeologyType.Slate]:     0.65,
    [GeologyType.Limestone]: 0.60,
    [GeologyType.Sandstone]: 0.55,
    [GeologyType.Chalk]:     0.45,
    [GeologyType.Granite]:   0.25,
    [GeologyType.Glacial]:   0.08,
    [GeologyType.Ice]:       0.00,
    [GeologyType.Water]:     0.00,
  };
  const WOLF_BASE: Partial<Record<GeologyType, number>> = {
    [GeologyType.Clay]:      0.50,
    [GeologyType.Slate]:     0.40,
    [GeologyType.Granite]:   0.35,
    [GeologyType.Limestone]: 0.25,
    [GeologyType.Sandstone]: 0.28,
    [GeologyType.Chalk]:     0.12,
    [GeologyType.Glacial]:   0.05,
    [GeologyType.Ice]:       0.00,
    [GeologyType.Water]:     0.00,
  };
  const BEAR_BASE: Partial<Record<GeologyType, number>> = {
    [GeologyType.Granite]:   0.50,
    [GeologyType.Slate]:     0.35,
    [GeologyType.Clay]:      0.28,
    [GeologyType.Limestone]: 0.20,
    [GeologyType.Sandstone]: 0.22,
    [GeologyType.Chalk]:     0.08,
    [GeologyType.Glacial]:   0.05,
    [GeologyType.Ice]:       0.00,
    [GeologyType.Water]:     0.00,
  };

  const seedNum = hashStr(seed);

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const c = terrain.cells[y][x];
      const g = c.geology;
      const n = cellNoise(seedNum, x, y) * 0.25 - 0.125; // ±0.125 noise

      let deer     = clamp01((DEER_BASE[g] ?? 0.1) + n + c.altitude * -0.15);
      let fish     = 0;
      let wildfowl = 0;
      let wolfRisk = clamp01((WOLF_BASE[g] ?? 0.05) + n * 0.5);
      let bearRisk = clamp01((BEAR_BASE[g] ?? 0.03) + c.altitude * 0.25 + n * 0.3);

      // Fish: rivers
      if (c.riverFlow > 5)  fish  = clamp01(0.3 + Math.min(c.riverFlow, 150) / 200);
      if (c.isCoast)        fish  = Math.max(fish, 0.4);

      // Water-lands fish/wildfowl
      if (g === GeologyType.Water) {
        switch (c.waterLandsType) {
          case "reedBed":      fish = 0.5; wildfowl = 0.85; break;
          case "mudFlat":      fish = 0.4; wildfowl = 0.70; break;
          case "openWater":    fish = 0.6; wildfowl = 0.55; break;
          case "tidalChannel": fish = 0.7; wildfowl = 0.60; break;
          case "raisedIsland": fish = 0.3; wildfowl = 0.45; break;
          case "carrWoodland": fish = 0.2; wildfowl = 0.50; break;
          default:             fish = 0.3; wildfowl = 0.40; break;
        }
        deer = 0; wolfRisk = 0.05; bearRisk = 0.02;
      }

      // Coastal wildfowl
      if (c.isCoast) wildfowl = Math.max(wildfowl, 0.5);
      if (c.riverFlow > 5) wildfowl = Math.max(wildfowl, 0.3);

      grid[idx(W, x, y)] = { deer, fish, wildfowl, wolfRisk, bearRisk };
    }
  }

  // Build wolf territories: seed pack centres in high-wolf-risk cells
  const wolfTerritories: WolfTerritory[] = [];
  const NUM_WOLF_PACKS = 18;
  const usedW = new Set<number>();
  const wolfCandidates: [number, number, number][] = []; // [wolfRisk, x, y]
  for (let y = 4; y < H - 4; y += 4) {
    for (let x = 4; x < W - 4; x += 4) {
      const c = terrain.cells[y][x];
      if (!isLand(c)) continue;
      const wr = grid[idx(W, x, y)].wolfRisk;
      if (wr > 0.25) wolfCandidates.push([wr, x, y]);
    }
  }
  wolfCandidates.sort((a, b) => b[0] - a[0]);
  for (const [, wx, wy] of wolfCandidates) {
    if (wolfTerritories.length >= NUM_WOLF_PACKS) break;
    let tooClose = false;
    for (const t of wolfTerritories) {
      if (Math.hypot(wx - t.x, wy - t.y) < 25) { tooClose = true; break; }
    }
    if (tooClose) continue;
    usedW.add(idx(W, wx, wy));
    wolfTerritories.push({ x: wx, y: wy, radius: 10 + Math.floor(rng() * 10), packSize: 4 + Math.floor(rng() * 6) });
  }

  // Bear ranges: high-altitude granite/slate
  const bearRanges: BearRange[] = [];
  const NUM_BEAR_RANGES = 10;
  const bearCandidates: [number, number, number][] = [];
  for (let y = 4; y < H - 4; y += 5) {
    for (let x = 4; x < W - 4; x += 5) {
      const c = terrain.cells[y][x];
      if (!isLand(c)) continue;
      const br = grid[idx(W, x, y)].bearRisk;
      if (br > 0.3) bearCandidates.push([br, x, y]);
    }
  }
  bearCandidates.sort((a, b) => b[0] - a[0]);
  for (const [, bx, by] of bearCandidates) {
    if (bearRanges.length >= NUM_BEAR_RANGES) break;
    let tooClose = false;
    for (const r of bearRanges) {
      if (Math.hypot(bx - r.x, by - r.y) < 30) { tooClose = true; break; }
    }
    if (tooClose) continue;
    bearRanges.push({ x: bx, y: by, radius: 15 + Math.floor(rng() * 15) });
  }

  return { grid, wolfTerritories, bearRanges };
}

// ─── 2. WIGHT TERRITORIES ─────────────────────────────────────────────────────

export function generateWightTerritories(terrain: TerrainMap, seed: string): WightData {
  const W = terrain.width, H = terrain.height;
  const rng = makeRng(seed, 2000);
  const caveWights: WightSite[] = [];
  const smallFolk: WightSite[] = [];

  // Cave wights: limestone/sandstone, moderate altitude, caves implied
  for (let y = 3; y < H - 3; y += 7) {
    for (let x = 3; x < W - 3; x += 7) {
      const c = terrain.cells[y][x];
      if (c.geology !== GeologyType.Limestone && c.geology !== GeologyType.Sandstone) continue;
      if (c.altitude < 0.2 || c.altitude > 0.7) continue;
      if (rng() > 0.25) continue;
      // Small jitter
      const jx = x + Math.floor((rng() - 0.5) * 4);
      const jy = y + Math.floor((rng() - 0.5) * 4);
      if (!inBounds(terrain, jx, jy)) continue;
      caveWights.push({ x: jx, y: jy, occupied: rng() < 0.55 });
    }
  }

  // Small folk: ancient forest (clay/limestone lowlands), hidden clearings
  for (let y = 5; y < H - 5; y += 9) {
    for (let x = 5; x < W - 5; x += 9) {
      const c = terrain.cells[y][x];
      if (c.geology !== GeologyType.Clay && c.geology !== GeologyType.Limestone) continue;
      if (c.altitude > 0.35) continue;
      if (rng() > 0.20) continue;
      const jx = x + Math.floor((rng() - 0.5) * 6);
      const jy = y + Math.floor((rng() - 0.5) * 6);
      if (!inBounds(terrain, jx, jy)) continue;
      smallFolk.push({ x: jx, y: jy, occupied: rng() < 0.45 });
    }
  }

  return { caveWights, smallFolk };
}

// ─── 3. CARRYING CAPACITY ─────────────────────────────────────────────────────

export function computeCarryingCapacity(
  terrain: TerrainMap,
  food: FoodResourceMap,
  wights: WightData,
): CarryingCapacity {
  const W = terrain.width, H = terrain.height;

  // Base habitability by geology
  const GEO_HAB: Partial<Record<GeologyType, number>> = {
    [GeologyType.Chalk]:     0.72,
    [GeologyType.Limestone]: 0.65,
    [GeologyType.Clay]:      0.58,
    [GeologyType.Sandstone]: 0.50,
    [GeologyType.Slate]:     0.38,
    [GeologyType.Granite]:   0.18,
    [GeologyType.Glacial]:   0.08,
    [GeologyType.Ice]:       0.00,
    [GeologyType.Water]:     0.00,
  };

  // Build a quick flood map: distance to nearest river (capped)
  const riverProx = new Float32Array(W * H).fill(99);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      if (terrain.cells[y][x].riverFlow > 5) riverProx[idx(W, x, y)] = 0;
    }
  }
  // Simple BFS spread (1 pass approximation is good enough)
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = idx(W, x, y);
      if (riverProx[i] === 0) continue;
      let best = riverProx[i];
      if (x > 0) best = Math.min(best, riverProx[i-1] + 1);
      if (y > 0) best = Math.min(best, riverProx[i-W] + 1);
      riverProx[i] = best;
    }
  }
  for (let y = H-1; y >= 0; y--) {
    for (let x = W-1; x >= 0; x--) {
      const i = idx(W, x, y);
      let best = riverProx[i];
      if (x < W-1) best = Math.min(best, riverProx[i+1] + 1);
      if (y < H-1) best = Math.min(best, riverProx[i+W] + 1);
      riverProx[i] = best;
    }
  }

  // Wight penalty zones
  const wightPenalty = new Float32Array(W * H);
  for (const w of wights.caveWights) {
    if (w.occupied) {
      for (let dy = -6; dy <= 6; dy++) {
        for (let dx = -6; dx <= 6; dx++) {
          const nx = w.x + dx, ny = w.y + dy;
          if (!inBounds(terrain, nx, ny)) continue;
          const d = Math.hypot(dx, dy);
          if (d <= 6) wightPenalty[idx(W, nx, ny)] += 0.15 * (1 - d / 7);
        }
      }
    }
  }
  for (const w of wights.smallFolk) {
    if (w.occupied) {
      for (let dy = -4; dy <= 4; dy++) {
        for (let dx = -4; dx <= 4; dx++) {
          const nx = w.x + dx, ny = w.y + dy;
          if (!inBounds(terrain, nx, ny)) continue;
          const d = Math.hypot(dx, dy);
          if (d <= 4) wightPenalty[idx(W, nx, ny)] += 0.10 * (1 - d / 5);
        }
      }
    }
  }

  const habitability = new Array<number>(W * H);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const c = terrain.cells[y][x];
      const i = idx(W, x, y);

      let h = GEO_HAB[c.geology] ?? 0;
      if (h === 0 && !isHabitableWaterLands(c)) {
        habitability[i] = 0;
        continue;
      }
      if (isHabitableWaterLands(c)) h = 0.30;

      // Altitude penalty (above 0.35 it gets hard to farm)
      if (c.altitude > 0.35) h *= Math.max(0, 1 - (c.altitude - 0.35) * 2.0);

      // Very low land (near sea level) is waterlogged
      if (c.altitude < 0.05 && !c.isCoast) h *= 0.5;

      // River proximity bonus (up to +0.18 within 3 cells)
      const rp = riverProx[i];
      if (rp <= 3) h += 0.18 * (1 - rp / 4);

      // Coast bonus (fishing/transport)
      if (c.isCoast) h += 0.08;

      // Food richness bonus (deer + fish + wildfowl)
      const f = food.grid[i];
      h += (f.deer * 0.04 + f.fish * 0.06 + f.wildfowl * 0.04);

      // Predator risk penalty
      h -= (f.wolfRisk * 0.08 + f.bearRisk * 0.05);

      // Wight penalty
      h -= wightPenalty[i];

      habitability[i] = clamp01(h);
    }
  }

  return { habitability };
}

// ─── 4. SETTLEMENTS ───────────────────────────────────────────────────────────

export function computeSettlements(
  terrain: TerrainMap,
  food: FoodResourceMap,
  carrying: CarryingCapacity,
  wights: WightData,
): SettlementData {
  const W = terrain.width, H = terrain.height;
  const rng = makeRng("settlements" + terrain.seed, 3000);
  const { habitability } = carrying;

  // Minimum separation radii by size (in cells)
  const SEP: Record<SettlementSize, number> = { homestead: 3, hamlet: 6, village: 12, town: 20 };
  // Habitability thresholds for each size
  const THRESH: Record<SettlementSize, number> = { town: 0.62, village: 0.48, hamlet: 0.30, homestead: 0.16 };
  // Population ranges [min, max]
  const POP: Record<SettlementSize, [number, number]> = {
    town: [280, 600], village: [100, 280], hamlet: [30, 100], homestead: [8, 30]
  };

  const claimed = new Uint8Array(W * H); // 1 = too close to an existing settlement

  const claimArea = (cx: number, cy: number, radius: number) => {
    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        const nx = cx + dx, ny = cy + dy;
        if (!inBounds(terrain, nx, ny)) continue;
        if (Math.hypot(dx, dy) <= radius) claimed[idx(W, nx, ny)] = 1;
      }
    }
  };

  // Build candidate list sorted by habitability (descending)
  const candidates: [number, number, number][] = [];
  for (let y = 1; y < H-1; y++) {
    for (let x = 1; x < W-1; x++) {
      const h = habitability[idx(W, x, y)];
      if (h > 0.14) candidates.push([h, x, y]);
    }
  }
  candidates.sort((a, b) => b[0] - a[0]);

  const settlements: ActiveSettlement[] = [];
  const usedForTown = { placed: false };

  for (const [h, x, y] of candidates) {
    if (claimed[idx(W, x, y)]) continue;
    const c = terrain.cells[y][x];
    const isWL = isHabitableWaterLands(c);

    let size: SettlementSize;
    if (!usedForTown.placed && h >= THRESH.town) {
      size = "town";
      usedForTown.placed = true;
    } else if (h >= THRESH.village && !isWL) {
      size = "village";
    } else if (h >= THRESH.hamlet) {
      size = "hamlet";
    } else {
      size = "homestead";
    }

    // Limit counts
    const counts = {
      town: settlements.filter(s => s.size === "town").length,
      village: settlements.filter(s => s.size === "village").length,
      hamlet: settlements.filter(s => s.size === "hamlet").length,
      homestead: settlements.filter(s => s.size === "homestead").length,
    };
    if (size === "town"      && counts.town      >= 3)  size = "village";
    if (size === "village"   && counts.village   >= 18) size = "hamlet";
    if (size === "hamlet"    && counts.hamlet    >= 80) size = "homestead";
    if (size === "homestead" && counts.homestead >= 280) continue;

    const [popMin, popMax] = POP[size];
    const population = Math.floor(popMin + rng() * (popMax - popMin));
    const sep = SEP[size];

    // Walled town: largest settlement if in lowland chalk/limestone
    const isWalledTown = size === "town" &&
      (c.geology === GeologyType.Chalk || c.geology === GeologyType.Limestone) &&
      c.altitude < 0.3 &&
      settlements.filter(s => s.isWalledTown).length === 0;

    settlements.push({ x, y, population, size, isWalledTown, isWaterLands: isWL });
    claimArea(x, y, sep);
  }

  // Fords: river cells between land masses, navigable crossing points
  const fords: Ford[] = [];
  const fordClaimed = new Set<number>();
  for (let y = 2; y < H-2; y++) {
    for (let x = 2; x < W-2; x++) {
      const c = terrain.cells[y][x];
      // A ford is a low-flow river cell adjacent to land on both sides (N/S or E/W)
      if (c.riverFlow < 5 || c.riverFlow > 80) continue;
      const nLand = isLand(terrain.cells[y-1][x]);
      const sLand = isLand(terrain.cells[y+1][x]);
      const wLand = isLand(terrain.cells[y][x-1]);
      const eLand = isLand(terrain.cells[y][x+1]);
      if ((!nLand || !sLand) && (!wLand || !eLand)) continue;
      // Ensure not too close to another ford
      let ok = true;
      for (let dy = -4; dy <= 4; dy++) {
        for (let dx = -4; dx <= 4; dx++) {
          if (fordClaimed.has(idx(W, x+dx, y+dy))) { ok = false; break; }
        }
        if (!ok) break;
      }
      if (!ok) continue;
      fords.push({ x, y });
      fordClaimed.add(idx(W, x, y));
    }
  }

  // Abandoned settlements: margins and flood-risk zones
  const abandoned: AbandonedSettlement[] = [];
  const NUM_ABANDONED = 25 + Math.floor(rng() * 20);
  const abandClaim = new Set<number>();
  let attempts = 0;
  while (abandoned.length < NUM_ABANDONED && attempts < 5000) {
    attempts++;
    const ax = 2 + Math.floor(rng() * (W-4));
    const ay = 2 + Math.floor(rng() * (H-4));
    const ac = terrain.cells[ay][ax];
    if (abandClaim.has(idx(W, ax, ay))) continue;

    let reason: "waterRose" | "iceAdvanced" | "landMarginal" | null = null;
    // Near water-lands edge → waterRose
    if (ac.altitude < 0.08 && ac.geology !== GeologyType.Water) reason = "waterRose";
    // Near glacial → iceAdvanced
    else if (ac.geology === GeologyType.Glacial) reason = "iceAdvanced";
    // High altitude marginal land
    else if (ac.altitude > 0.55 && isLand(ac)) reason = "landMarginal";

    if (!reason) continue;

    const hSize = Math.random() < 0.6 ? "homestead"
      : Math.random() < 0.7 ? "hamlet" : "village";

    abandoned.push({ x: ax, y: ay, historicalSize: hSize as SettlementSize, reason });
    for (let dy = -3; dy <= 3; dy++)
      for (let dx = -3; dx <= 3; dx++)
        abandClaim.add(idx(W, ax+dx, ay+dy));
  }

  return { settlements, fords, abandoned };
}

// ─── 5. PATH NETWORK ──────────────────────────────────────────────────────────

/** Greedy path routing — moves toward target using terrain costs. */
function routePath(
  terrain: TerrainMap,
  x0: number, y0: number,
  x1: number, y1: number,
  fordSet: Set<number>,
): [number, number][] {
  const W = terrain.width, H = terrain.height;

  function moveCost(c: TerrainCell, fx: number, fy: number): number {
    if (c.geology === GeologyType.Ice) return 999;
    if (c.geology === GeologyType.Water) {
      return fordSet.has(idx(W, fx, fy)) ? 2 : 40;
    }
    if (c.geology === GeologyType.Glacial) return 8;
    return 1 + c.altitude * 4 + (c.riverFlow > 30 ? 3 : 0);
  }

  const maxSteps = Math.ceil(Math.hypot(x1-x0, y1-y0) * 4) + 50;
  const pathCells: [number, number][] = [[x0, y0]];
  const visited = new Set<number>();
  visited.add(idx(W, x0, y0));

  let cx = x0, cy = y0;

  for (let step = 0; step < maxSteps; step++) {
    if (cx === x1 && cy === y1) break;

    let bestX = -1, bestY = -1, bestScore = Infinity;

    for (const [dx, dy] of [[-1,0],[1,0],[0,-1],[0,1],[-1,-1],[-1,1],[1,-1],[1,1]]) {
      const nx = cx + dx, ny = cy + dy;
      if (!inBounds(terrain, nx, ny)) continue;
      const c = terrain.cells[ny][nx];
      const stepLen = (dx !== 0 && dy !== 0) ? 1.414 : 1;
      const cost = moveCost(c, nx, ny) * stepLen;
      const distToGoal = Math.hypot(nx - x1, ny - y1);
      const revisitPenalty = visited.has(idx(W, nx, ny)) ? 25 : 0;
      const score = distToGoal * 1.5 + cost + revisitPenalty;

      if (score < bestScore) { bestScore = score; bestX = nx; bestY = ny; }
    }

    if (bestX < 0) break;
    cx = bestX; cy = bestY;
    visited.add(idx(W, cx, cy));
    pathCells.push([cx, cy]);

    // Early exit if close enough
    if (Math.hypot(cx - x1, cy - y1) < 1.5) {
      pathCells.push([x1, y1]);
      break;
    }
  }

  return pathCells;
}

export function computePathNetwork(terrain: TerrainMap, sd: SettlementData): PathNetwork {
  const W = terrain.width;
  const { settlements, fords } = sd;

  const fordSet = new Set<number>(fords.map(f => idx(W, f.x, f.y)));

  if (settlements.length < 2) return { paths: [] };

  // Build connection list: each settlement connects to its nearest k neighbours
  // Traffic = rough product of populations (with distance decay)
  const paths: PathSegment[] = [];
  const connected = new Set<string>();

  const N = settlements.length;

  for (let i = 0; i < N; i++) {
    const si = settlements[i];
    // How many connections to make depends on size
    const maxConn = si.size === "town" ? 6 : si.size === "village" ? 4 : si.size === "hamlet" ? 3 : 2;
    const maxDist = si.size === "town" ? 120 : si.size === "village" ? 80 : 50;

    // Find nearest settlements
    type Neighbour = { j: number; dist: number };
    const neighbours: Neighbour[] = [];
    for (let j = 0; j < N; j++) {
      if (j === i) continue;
      const dist = Math.hypot(si.x - settlements[j].x, si.y - settlements[j].y);
      if (dist <= maxDist) neighbours.push({ j, dist });
    }
    neighbours.sort((a, b) => a.dist - b.dist);

    let connCount = 0;
    for (const { j } of neighbours) {
      if (connCount >= maxConn) break;
      const key = i < j ? `${i}-${j}` : `${j}-${i}`;
      if (connected.has(key)) { connCount++; continue; }

      const sj = settlements[j];
      const dist = Math.hypot(si.x - sj.x, si.y - sj.y);
      // Traffic: rough function of both populations and inverse distance
      const traffic = Math.round((si.population + sj.population) * 0.5 * (1 / (1 + dist * 0.02)));

      const cells = routePath(terrain, si.x, si.y, sj.x, sj.y, fordSet);
      paths.push({ cells, traffic });
      connected.add(key);
      connCount++;
    }
  }

  return { paths };
}

// ─── 6. SACRED SITES ──────────────────────────────────────────────────────────

export function computeSacredSites(
  terrain: TerrainMap,
  food: FoodResourceMap,
  sd: SettlementData,
  pn: PathNetwork,
  wights: WightData,
  seed: string,
): SacredData {
  const W = terrain.width, H = terrain.height;
  const rng = makeRng(seed, 6000);
  const { settlements } = sd;

  const major: MajorSite[] = [];
  const significant: SignificantSite[] = [];
  const small: SmallSite[] = [];

  const majorClaimed = new Set<number>();
  const sigClaimed   = new Set<number>();
  const smallClaimed = new Set<number>();

  // ── Major sites: 2–6 henges/great complexes near large populations ──────────
  // Sort settlements by population descending
  const bigSettlements = settlements
    .filter(s => s.size === "town" || s.size === "village")
    .sort((a, b) => b.population - a.population);

  const MAJOR_TYPES: MajorSiteType[] = ["greatComplex", "henge", "stoneCircle", "henge", "stoneCircle", "henge"];
  const targetMajor = 2 + Math.floor(rng() * 4);

  for (let attempt = 0; attempt < bigSettlements.length * 3 && major.length < targetMajor; attempt++) {
    const base = bigSettlements[attempt % bigSettlements.length];
    // Place on prominent ground nearby (slightly elevated, good viewshed)
    const spread = 15 + Math.floor(rng() * 20);
    const mx = Math.max(1, Math.min(W-2, base.x + Math.floor((rng()-0.5)*2*spread)));
    const my = Math.max(1, Math.min(H-2, base.y + Math.floor((rng()-0.5)*2*spread)));
    const mc = terrain.cells[my][mx];
    if (!isLand(mc) || mc.altitude < 0.15) continue;
    if (majorClaimed.has(idx(W, mx, my))) continue;
    // Ensure some distance from other major sites
    let ok = true;
    for (const m of major) {
      if (Math.hypot(m.x - mx, m.y - my) < 30) { ok = false; break; }
    }
    if (!ok) continue;

    major.push({ x: mx, y: my, type: MAJOR_TYPES[major.length % MAJOR_TYPES.length] });
    for (let dy = -10; dy <= 10; dy++)
      for (let dx = -10; dx <= 10; dx++)
        majorClaimed.add(idx(W, mx+dx, my+dy));
  }

  // ── Significant sites: barrows on hillsides, standing stones on ridgelines ──
  const SIG_TYPES: SignificantSiteType[] = ["barrow","standingStone","barrow","cairn","smallStoneCircle","barrow","standingStone","cairn"];
  const targetSig = 60 + Math.floor(rng() * 80);

  for (let attempt = 0; attempt < targetSig * 6 && significant.length < targetSig; attempt++) {
    const sx = 2 + Math.floor(rng() * (W-4));
    const sy = 2 + Math.floor(rng() * (H-4));
    const sc = terrain.cells[sy][sx];
    if (!isLand(sc)) continue;
    if (sigClaimed.has(idx(W, sx, sy))) continue;

    const type = SIG_TYPES[Math.floor(rng() * SIG_TYPES.length)];
    // Barrows: hillsides (0.2..0.55 altitude), near settlements
    // Standing stones: any land, slightly elevated
    // Cairns: high ground
    if (type === "barrow" && (sc.altitude < 0.15 || sc.altitude > 0.60)) continue;
    if (type === "cairn"  && sc.altitude < 0.40) continue;
    if (type === "smallStoneCircle" && sc.altitude < 0.25) continue;

    // Prefer proximity to a settlement (within 25 cells)
    if (type === "barrow" || type === "standingStone") {
      let nearSett = false;
      for (const s of settlements) {
        if (Math.hypot(s.x - sx, s.y - sy) < 25) { nearSett = true; break; }
      }
      if (!nearSett && rng() > 0.3) continue;
    }

    significant.push({ x: sx, y: sy, type });
    for (let dy = -4; dy <= 4; dy++)
      for (let dx = -4; dx <= 4; dx++)
        sigClaimed.add(idx(W, sx+dx, sy+dy));
  }

  // ── Small features ───────────────────────────────────────────────────────────
  const targetSmall = 150 + Math.floor(rng() * 100);

  // Sacred springs: chalk/limestone spring lines (where riverFlow begins)
  for (let y = 1; y < H-1 && small.length < targetSmall * 0.25; y += 3) {
    for (let x = 1; x < W-1; x += 3) {
      const c = terrain.cells[y][x];
      if (c.geology !== GeologyType.Chalk && c.geology !== GeologyType.Limestone) continue;
      if (c.riverFlow < 1 || c.riverFlow > 15) continue;
      if (rng() > 0.15) continue;
      if (smallClaimed.has(idx(W, x, y))) continue;
      small.push({ x, y, type: "sacredSpring", minZoom: 4 });
      for (let dy = -3; dy <= 3; dy++)
        for (let dx = -3; dx <= 3; dx++)
          smallClaimed.add(idx(W, x+dx, y+dy));
    }
  }

  // Offering pools: water-lands edges
  for (let y = 1; y < H-1 && small.length < targetSmall * 0.4; y += 4) {
    for (let x = 1; x < W-1; x += 4) {
      const c = terrain.cells[y][x];
      if (!c.isCoast && c.geology !== GeologyType.Water) continue;
      if (c.waterLandsType !== "mudFlat" && c.waterLandsType !== "openWater" && !c.isCoast) continue;
      if (rng() > 0.12) continue;
      if (smallClaimed.has(idx(W, x, y))) continue;
      small.push({ x, y, type: "offeringPool", minZoom: 5 });
      for (let dy = -3; dy <= 3; dy++)
        for (let dx = -3; dx <= 3; dx++)
          smallClaimed.add(idx(W, x+dx, y+dy));
    }
  }

  // Cave entrances: limestone/sandstone overhangs
  for (let y = 2; y < H-2 && small.length < targetSmall * 0.55; y += 5) {
    for (let x = 2; x < W-2; x += 5) {
      const c = terrain.cells[y][x];
      if (c.geology !== GeologyType.Limestone && c.geology !== GeologyType.Sandstone) continue;
      if (c.altitude < 0.25 || c.altitude > 0.75) continue;
      if (rng() > 0.10) continue;
      if (smallClaimed.has(idx(W, x, y))) continue;
      small.push({ x, y, type: "caveEntrance", minZoom: 5 });
      for (let dy = -3; dy <= 3; dy++)
        for (let dx = -3; dx <= 3; dx++)
          smallClaimed.add(idx(W, x+dx, y+dy));
    }
  }

  // Sacred trees: ancient forest (clay/limestone lowlands)
  for (let y = 2; y < H-2 && small.length < targetSmall * 0.72; y += 6) {
    for (let x = 2; x < W-2; x += 6) {
      const c = terrain.cells[y][x];
      if (c.geology !== GeologyType.Clay && c.geology !== GeologyType.Limestone) continue;
      if (c.altitude > 0.30) continue;
      if (rng() > 0.12) continue;
      if (smallClaimed.has(idx(W, x, y))) continue;
      small.push({ x, y, type: "sacredTree", minZoom: 6 });
      for (let dy = -3; dy <= 3; dy++)
        for (let dx = -3; dx <= 3; dx++)
          smallClaimed.add(idx(W, x+dx, y+dy));
    }
  }

  // Carved rock faces: granite/sandstone outcrops
  for (let y = 2; y < H-2 && small.length < targetSmall * 0.85; y += 6) {
    for (let x = 2; x < W-2; x += 5) {
      const c = terrain.cells[y][x];
      if (c.geology !== GeologyType.Granite && c.geology !== GeologyType.Sandstone) continue;
      if (c.altitude < 0.3) continue;
      if (rng() > 0.08) continue;
      if (smallClaimed.has(idx(W, x, y))) continue;
      small.push({ x, y, type: "carvedRockFace", minZoom: 6 });
      for (let dy = -3; dy <= 3; dy++)
        for (let dx = -3; dx <= 3; dx++)
          smallClaimed.add(idx(W, x+dx, y+dy));
    }
  }

  // Marked stones: granite/slate — scattered widely
  for (let y = 3; y < H-3 && small.length < targetSmall; y += 7) {
    for (let x = 3; x < W-3; x += 7) {
      const c = terrain.cells[y][x];
      if (c.geology !== GeologyType.Granite && c.geology !== GeologyType.Slate) continue;
      if (rng() > 0.18) continue;
      if (smallClaimed.has(idx(W, x, y))) continue;
      small.push({ x, y, type: "markedStone", minZoom: 7 });
      for (let dy = -3; dy <= 3; dy++)
        for (let dx = -3; dx <= 3; dx++)
          smallClaimed.add(idx(W, x+dx, y+dy));
    }
  }

  return { major, significant, small };
}

// ─── 7. SEASONAL CAMPS ────────────────────────────────────────────────────────

export function computeSeasonalCamps(
  terrain: TerrainMap,
  food: FoodResourceMap,
  sd: SettlementData,
  pn: PathNetwork,
  sacred: SacredData,
  seed: string,
): SeasonalData {
  const W = terrain.width, H = terrain.height;
  const rng = makeRng(seed, 7000);
  const camps: SeasonalCamp[] = [];
  const campClaimed = new Set<number>();

  const claim = (x: number, y: number, r = 5) => {
    for (let dy = -r; dy <= r; dy++)
      for (let dx = -r; dx <= r; dx++)
        if (inBounds(terrain, x+dx, y+dy) && Math.hypot(dx,dy) <= r)
          campClaimed.add(idx(W, x+dx, y+dy));
  };

  // Upland grazing camps: chalk/limestone above 0.3 altitude
  for (let y = 3; y < H-3; y += 8) {
    for (let x = 3; x < W-3; x += 8) {
      const c = terrain.cells[y][x];
      if (c.geology !== GeologyType.Chalk && c.geology !== GeologyType.Limestone) continue;
      if (c.altitude < 0.30 || c.altitude > 0.65) continue;
      if (rng() > 0.25) continue;
      if (campClaimed.has(idx(W, x, y))) continue;
      camps.push({ x, y, type: "grazingCamp" });
      claim(x, y);
    }
  }

  // Fishing camps: river banks with good flow, or coast
  for (let y = 3; y < H-3; y += 7) {
    for (let x = 3; x < W-3; x += 7) {
      const c = terrain.cells[y][x];
      if (c.riverFlow < 20 && !c.isCoast) continue;
      if (!isLand(c)) continue;
      if (rng() > 0.20) continue;
      if (campClaimed.has(idx(W, x, y))) continue;
      camps.push({ x, y, type: "fishingCamp" });
      claim(x, y);
    }
  }

  // Gathering camps: forest clearings (clay/limestone, moderate altitude)
  for (let y = 3; y < H-3; y += 9) {
    for (let x = 3; x < W-3; x += 9) {
      const c = terrain.cells[y][x];
      if (c.geology !== GeologyType.Clay && c.geology !== GeologyType.Limestone) continue;
      if (c.altitude > 0.35) continue;
      if (food.grid[idx(W, x, y)].deer < 0.35) continue;
      if (rng() > 0.18) continue;
      if (campClaimed.has(idx(W, x, y))) continue;
      camps.push({ x, y, type: "gatheringCamp" });
      claim(x, y);
    }
  }

  // Flint mining camps: chalk (surface flint)
  for (let y = 4; y < H-4; y += 10) {
    for (let x = 4; x < W-4; x += 10) {
      const c = terrain.cells[y][x];
      if (c.geology !== GeologyType.Chalk) continue;
      if (c.altitude < 0.15 || c.altitude > 0.5) continue;
      if (rng() > 0.20) continue;
      if (campClaimed.has(idx(W, x, y))) continue;
      camps.push({ x, y, type: "flintMiningCamp" });
      claim(x, y);
    }
  }

  // Trading sites: path network crossroads
  // Find cells that appear in multiple paths
  const pathCount = new Map<number, number>();
  for (const p of pn.paths) {
    if (p.traffic < 40) continue;
    for (const [px, py] of p.cells) {
      const k = idx(W, px, py);
      pathCount.set(k, (pathCount.get(k) ?? 0) + 1);
    }
  }
  for (const [k, count] of pathCount) {
    if (count < 2) continue;
    const x = k % W, y = (k / W) | 0;
    const c = terrain.cells[y][x];
    if (!isLand(c)) continue;
    if (campClaimed.has(k)) continue;
    if (rng() > 0.4) continue;
    camps.push({ x, y, type: "tradingSite" });
    claim(x, y, 6);
  }

  return { camps };
}

// ─── 8. HUNTING CIRCUITS ──────────────────────────────────────────────────────

export function computeHuntingCircuits(
  terrain: TerrainMap,
  food: FoodResourceMap,
  sd: SettlementData,
  seed: string,
): HuntingData {
  const W = terrain.width, H = terrain.height;
  const rng = makeRng(seed, 8000);
  const circuits: HuntingCircuit[] = [];

  // Only homesteads and hamlets generate hunting circuits
  const huntingSettlements = sd.settlements.filter(s => s.size === "homestead" || s.size === "hamlet");

  for (const base of huntingSettlements) {
    if (rng() > 0.55) continue; // not every settlement has an active circuit
    if (circuits.length > 120) break;

    const radius = 8 + Math.floor(rng() * 12);
    const numWaypoints = 3 + Math.floor(rng() * 4);
    const waypoints: HuntingWaypoint[] = [];
    const pathCells: [number, number][] = [];

    // Build waypoints in deer-rich land around the settlement
    for (let w = 0; w < numWaypoints * 4 && waypoints.length < numWaypoints; w++) {
      const angle = (waypoints.length / numWaypoints) * Math.PI * 2 + rng() * 0.8;
      const dist  = radius * 0.4 + rng() * radius * 0.6;
      const wx = Math.round(base.x + Math.cos(angle) * dist);
      const wy = Math.round(base.y + Math.sin(angle) * dist);
      if (!inBounds(terrain, wx, wy)) continue;
      const c = terrain.cells[wy][wx];
      if (!isLand(c)) continue;
      const f = food.grid[idx(W, wx, wy)];
      if (f.deer < 0.25) continue;
      waypoints.push({ x: wx, y: wy });
    }

    if (waypoints.length < 2) continue;

    // Build path cells: straight-line approximation between waypoints
    const allPoints = [{ x: base.x, y: base.y }, ...waypoints, { x: base.x, y: base.y }];
    for (let i = 0; i < allPoints.length - 1; i++) {
      const a = allPoints[i], b = allPoints[i+1];
      const steps = Math.ceil(Math.hypot(b.x-a.x, b.y-a.y));
      for (let s = 0; s <= steps; s++) {
        const fx = Math.round(a.x + (b.x-a.x) * s / steps);
        const fy = Math.round(a.y + (b.y-a.y) * s / steps);
        if (inBounds(terrain, fx, fy)) pathCells.push([fx, fy]);
      }
    }

    const groupSize = 3 + Math.floor(rng() * 10);
    circuits.push({ groupSize, pathCells, waypoints });
  }

  return { circuits };
}

// ─── 9. VALIDATION ────────────────────────────────────────────────────────────

export function validateHabitation(
  terrain: TerrainMap,
  sd: SettlementData,
  pn: PathNetwork,
  sacred: SacredData,
): ValidationReport {
  const { settlements, fords, abandoned } = sd;
  const summary: string[] = [];

  const totalPop = settlements.reduce((n, s) => n + s.population, 0);
  const bySz = (sz: SettlementSize) => settlements.filter(s => s.size === sz).length;
  const walled = settlements.filter(s => s.isWalledTown);
  const waterLands = settlements.filter(s => s.isWaterLands);

  summary.push(`Total population: ~${totalPop.toLocaleString()}`);
  summary.push(`Settlements: ${settlements.length} total — ${bySz("town")} towns, ${bySz("village")} villages, ${bySz("hamlet")} hamlets, ${bySz("homestead")} homesteads`);
  if (walled.length > 0) {
    summary.push(`Walled town at (${walled[0].x}, ${walled[0].y}) pop ${walled[0].population}`);
  }
  if (waterLands.length > 0) summary.push(`Water-lands communities: ${waterLands.length}`);
  summary.push(`Abandoned sites: ${abandoned.length} (${abandoned.filter(a => a.reason === "waterRose").length} flooded, ${abandoned.filter(a => a.reason === "iceAdvanced").length} iced, ${abandoned.filter(a => a.reason === "landMarginal").length} marginal)`);
  summary.push(`Fords: ${fords.length}`);
  summary.push(`Path network: ${pn.paths.length} segments`);
  const maxTraffic = pn.paths.reduce((m, p) => Math.max(m, p.traffic), 0);
  summary.push(`Peak path traffic: ${maxTraffic}`);
  summary.push(`Sacred: ${sacred.major.length} major, ${sacred.significant.length} significant, ${sacred.small.length} small sites`);

  // Checks
  if (totalPop < 5000)  summary.push("⚠ Population seems low");
  if (totalPop > 200000) summary.push("⚠ Population seems high");
  if (settlements.filter(s => s.size === "town").length === 0) summary.push("⚠ No towns generated");
  if (sacred.major.length === 0) summary.push("⚠ No major sacred sites");

  return { summary };
}

// ─── LEGACY FUNCTION (kept for game package compatibility) ────────────────────

export function generateHabitation(terrain: TerrainMap, noise: unknown): HabitationData {
  const seed = (terrain as TerrainMap & { seed?: string }).seed ?? "default";
  const food     = computeFoodResources(terrain, seed);
  const wights   = generateWightTerritories(terrain, seed);
  const carrying = computeCarryingCapacity(terrain, food, wights);
  const sd       = computeSettlements(terrain, food, carrying, wights);
  const pn       = computePathNetwork(terrain, sd);

  const settlements: Settlement[] = sd.settlements.map(s => ({
    x: s.x, y: s.y, population: s.population, size: s.size,
  }));
  const sacredData = computeSacredSites(terrain, food, sd, pn, wights, seed);
  const sacredSites: SacredSite[] = [
    ...sacredData.major.map(s => ({ x: s.x, y: s.y, type: s.type, tier: "major" as const })),
    ...sacredData.significant.map(s => ({ x: s.x, y: s.y, type: s.type, tier: "significant" as const })),
    ...sacredData.small.map(s => ({ x: s.x, y: s.y, type: s.type, tier: "small" as const })),
  ];
  const paths: Path[] = pn.paths;

  return { settlements, sacredSites, paths };
}
