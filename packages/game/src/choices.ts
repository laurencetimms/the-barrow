/**
 * Generates movement choices from the world query.
 * Directional choices initiate travel sequences (travel: true).
 * Immediate choices (nearby features, wait) are single-turn (travel: false).
 */

import type { TerrainMap, TerrainCell } from "@the-barrow/terrain";
import { GeologyType, GEOLOGY_INFO } from "@the-barrow/terrain";
import type { WorldQuery } from "./world";
import { getMaxDistance } from "./travel";
import type { PlayerGraph } from "./player-graph";

export interface Choice {
  id:       string;
  text:     string;
  dx:       number;
  dy:       number;
  timeCost: number;
  /** true = initiates a travel sequence; false = immediate single-cell action or wait */
  travel:   boolean;
}

// ─── Direction constants ──────────────────────────────────────────

const DIRS = [
  { dx:  0, dy: -1, name: "north"     },
  { dx:  1, dy: -1, name: "northeast" },
  { dx:  1, dy:  0, name: "east"      },
  { dx:  1, dy:  1, name: "southeast" },
  { dx:  0, dy:  1, name: "south"     },
  { dx: -1, dy:  1, name: "southwest" },
  { dx: -1, dy:  0, name: "west"      },
  { dx: -1, dy: -1, name: "northwest" },
] as const;

const DIR_INDEX: Record<string, number> = {};
DIRS.forEach((d, i) => { DIR_INDEX[d.name] = i; });

function angularDiff(a: string, b: string): number {
  const ai = DIR_INDEX[a] ?? 0;
  const bi = DIR_INDEX[b] ?? 0;
  const diff = Math.abs(ai - bi);
  return Math.min(diff, 8 - diff);
}

// ─── Look-ahead ──────────────────────────────────────────────────

interface LookAhead {
  direction:        string;
  dx:               number;
  dy:               number;
  blocked:          boolean; // first adjacent cell is impassable
  hasRiverAdjacent: boolean; // first cell has river (immediate feature)
  hasRiverAhead:    boolean;  // river within scan range (beyond first cell)
  hasCoastAhead:    boolean;
  geoChange:        boolean;
  newGeoLabel:      string;
  altTrend:         number;   // average altitude change per cell (signed)
  score:            number;
}

function scanDirection(
  terrain: TerrainMap,
  x: number, y: number,
  dx: number, dy: number,
  startCell: TerrainCell,
  _startGeoLabel: string,
): LookAhead {
  const scanDepth = getMaxDistance(startCell);
  let blocked          = false;
  let hasRiverAdjacent = false;
  let hasRiverAhead    = false;
  let hasCoastAhead    = false;
  let geoChange        = false;
  let newGeoLabel      = "";
  let altSum           = 0;
  let altCount         = 0;
  let prevHadRiver     = startCell.riverFlow > 0;
  const dirName = DIRS.find(d => d.dx === dx && d.dy === dy)?.name ?? "";

  for (let step = 1; step <= scanDepth; step++) {
    const nx = x + dx * step;
    const ny = y + dy * step;
    if (nx < 0 || nx >= terrain.width || ny < 0 || ny >= terrain.height) break;
    const cell = terrain.cells[ny][nx];

    if (cell.geology === GeologyType.Water || cell.geology === GeologyType.Ice) {
      if (step === 1) blocked = true;
      break;
    }

    if (step === 1 && cell.riverFlow > 0) hasRiverAdjacent = true;
    if (step > 1  && cell.riverFlow > 0 && !prevHadRiver) hasRiverAhead = true;
    if (cell.isCoast && !startCell.isCoast) hasCoastAhead = true;

    if (cell.geology !== startCell.geology && !geoChange) {
      geoChange = true;
      newGeoLabel = GEOLOGY_INFO[cell.geology]?.label ?? cell.geology;
    }

    altSum += cell.altitude - startCell.altitude;
    altCount++;
    prevHadRiver = cell.riverFlow > 0;
  }

  const altTrend = altCount > 0 ? altSum / altCount : 0;

  // Score: higher = more interesting direction
  let score = 0;
  if (hasRiverAdjacent) score += 3;
  if (hasRiverAhead)    score += 2;
  if (hasCoastAhead)    score += 2;
  if (geoChange)        score += 3;
  if (Math.abs(altTrend) > 0.05) score += 1;
  // Prefer cardinal directions slightly over diagonals for readability
  if (["north","east","south","west"].includes(dirName)) score += 0.5;

  return { direction: dirName, dx, dy, blocked, hasRiverAdjacent, hasRiverAhead,
           hasCoastAhead, geoChange, newGeoLabel, altTrend, score };
}

// ─── Choice text ─────────────────────────────────────────────────

function geoTravelSuffix(cell: TerrainCell): string {
  switch (cell.geology) {
    case GeologyType.Chalk:     return "across the downland";
    case GeologyType.Limestone: return "across the limestone";
    case GeologyType.Sandstone: return "across the heath";
    case GeologyType.Granite:   return "across the moor";
    case GeologyType.Glacial:   return "across the open ground";
    case GeologyType.Slate:     return "along the valley";
    default:                    return "";
  }
}

function travelChoiceText(startCell: TerrainCell, look: LookAhead): string {
  const dir = look.direction;

  if (look.hasCoastAhead)  return `Head ${dir} toward the coast`;

  if (look.geoChange) {
    const geo = look.newGeoLabel.toLowerCase();
    if (look.altTrend > 0.04)  return `Climb ${dir} into the ${geo}`;
    if (look.altTrend < -0.04) return `Descend ${dir} into the ${geo}`;
    return `Head ${dir} into the ${geo}`;
  }

  if (look.hasRiverAhead) return `Head ${dir} toward the river`;

  // Same geology, no special features — describe mode of travel
  if (startCell.geology === GeologyType.Clay)  return `Push ${dir} through the trees`;
  if (startCell.geology === GeologyType.Slate) return `Follow the valley ${dir}`;

  if (look.altTrend > 0.04)  return `Climb ${dir} toward higher ground`;
  if (look.altTrend < -0.04) return `Descend ${dir} toward the lower ground`;

  const suffix = geoTravelSuffix(startCell);
  return suffix ? `Continue ${dir} ${suffix}` : `Continue ${dir}`;
}

// ─── Main export ─────────────────────────────────────────────────

export function generateChoices(
  world:       WorldQuery,
  terrain:     TerrainMap,
  x:           number,
  y:           number,
  playerGraph?: PlayerGraph,
): Choice[] {
  const choices: Choice[] = [];
  const startCell = terrain.cells[y][x];
  const graph = playerGraph;

  // ── Immediate choices for adjacent rivers ─────────────────────
  // (settlements/sacred sites will be added when habitation layer is integrated)
  const riverAdj = world.adjacentTerrain.filter(a => a.hasRiver && a.cell.geology !== GeologyType.Water);
  for (const adj of riverAdj.slice(0, 1)) {
    choices.push({
      id:       `cross-river-${adj.direction}`,
      text:     `Cross to the river ${adj.direction}`,
      dx:       adj.dx,
      dy:       adj.dy,
      timeCost: 1,
      travel:   false,
    });
  }

  // ── Directional travel choices ─────────────────────────────────
  const looks: LookAhead[] = DIRS.map(d =>
    scanDirection(terrain, x, y, d.dx, d.dy, startCell, world.geoInfo.label)
  );

  // Filter out blocked and river-adjacent (already handled as immediate above)
  const travelCandidates = looks.filter(l => !l.blocked && !l.hasRiverAdjacent);

  // Sort by score descending
  travelCandidates.sort((a, b) => b.score - a.score);

  // Greedily select up to 4 with at least 90° (2 index steps) between them
  const selectedDirs: LookAhead[] = [];
  for (const look of travelCandidates) {
    if (selectedDirs.every(s => angularDiff(s.direction, look.direction) >= 2)) {
      selectedDirs.push(look);
      if (selectedDirs.length >= 4) break;
    }
  }

  // If we got fewer than 2 directional choices, relax the constraint and try again
  if (selectedDirs.length < 2) {
    for (const look of travelCandidates) {
      if (!selectedDirs.includes(look)) {
        selectedDirs.push(look);
        if (selectedDirs.length >= 3) break;
      }
    }
  }

  for (const look of selectedDirs) {
    choices.push({
      id:       `travel-${look.direction}`,
      text:     travelChoiceText(startCell, look),
      dx:       look.dx,
      dy:       look.dy,
      timeCost: 1, // placeholder — actual cost determined by travel sequence
      travel:   true,
    });
  }

  // ── Node-gated choices ────────────────────────────────────────
  // These only appear when the player's graph values exceed the threshold.
  if (graph) {
    const shelter    = graph.shelter.value;
    const foraging   = graph.foraging.value;
    const animalS    = graph.animalSigns.value;
    const weather    = graph.weather.value;
    const bodySense  = graph.bodySense.value;

    // Shelter awareness: notice rock overhangs or dense cover
    if (shelter >= 0.2) {
      const hasRockGeo  = ["chalk", "limestone", "slate", "granite"].includes(startCell.geology);
      const isHighEnough = startCell.altitude > 0.3;
      if (hasRockGeo && isHighEnough) {
        choices.push({
          id:       "shelter-overhang",
          text:     "Shelter under the overhang",
          dx:       0,
          dy:       0,
          timeCost: 1,
          travel:   false,
        });
      }
    }

    // Foraging awareness: gather herbs/plants
    if (foraging >= 0.2) {
      const foragingGeo = ["chalk", "limestone", "clay", "slate", "sandstone"];
      if (foragingGeo.includes(startCell.geology)) {
        choices.push({
          id:       "forage-herbs",
          text:     "Gather the herbs",
          dx:       0,
          dy:       0,
          timeCost: 1,
          travel:   false,
        });
      }
    }

    // Animal signs: follow tracks in animal-dense terrain
    if (animalS >= 0.3) {
      const denseGeo = ["clay", "limestone", "slate", "chalk"];
      if (denseGeo.includes(startCell.geology)) {
        choices.push({
          id:       "follow-animal-trail",
          text:     "Follow the animal trail",
          dx:       0,
          dy:       0,
          timeCost: 1,
          travel:   false,
        });
      }
    }

    // Weather reading: anticipate incoming weather
    if (weather >= 0.4 && world.adjacentTerrain.length > 0) {
      choices.push({
        id:       "seek-shelter-weather",
        text:     "The weather is turning — seek shelter before it arrives",
        dx:       0,
        dy:       0,
        timeCost: 1,
        travel:   false,
      });
    }

    // Body sense: pay attention at liminal locations
    if (bodySense >= 0.2 && world.nearbyFeatures.some(
      f => (f.type === "standing-stone" || f.type === "barrow") && f.distance <= 3,
    )) {
      choices.push({
        id:       "attend-body-sense",
        text:     "Something feels different here. Stay and pay attention.",
        dx:       0,
        dy:       0,
        timeCost: 1,
        travel:   false,
      });
    }
  }

  // ── Wait — always last ─────────────────────────────────────────
  choices.push({
    id:       "wait",
    text:     "Stay here. Watch. Listen.",
    dx:       0,
    dy:       0,
    timeCost: 1,
    travel:   false,
  });

  return choices;
}
