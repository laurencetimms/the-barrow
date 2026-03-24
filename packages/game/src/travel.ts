/**
 * Travel sequence engine.
 * Executes multi-cell directional travel, checking for interrupt conditions.
 * Spec: the-barrow-interface-spec.md section 3.4
 */

import type { TerrainMap, TerrainCell } from "@the-barrow/terrain";
import { GeologyType } from "@the-barrow/terrain";
import type { PerceptualContext } from "./context";
import type { GameState } from "./state";

export type TravelStopReason =
  | "max-distance"
  | "geology-change"
  | "altitude-change"
  | "river-crossing"
  | "path-junction"
  | "settlement-visible"
  | "sacred-site-visible"
  | "coast-reached"
  | "ice-reached"
  | "weather-change"
  | "time-threshold"
  | "impassable";

export interface TravelResult {
  /** Cells traversed in order (not including starting cell) */
  path: { x: number; y: number }[];
  /** Why travel stopped */
  stopReason: TravelStopReason;
  /** The cell where travel ended */
  destination: { x: number; y: number };
  /** Number of cells covered */
  cellsCovered: number;
  /** Terrain data for each traversed cell */
  traversedTerrain: TerrainCell[];
  /** Notable things observed during travel */
  notables: string[];
}

/** Altitude band index (0=valley-floor … 4=summit) — for interrupt detection */
function altBandIdx(altitude: number): number {
  if (altitude < 0.25) return 0;
  if (altitude < 0.35) return 1;
  if (altitude < 0.45) return 2;
  if (altitude < 0.55) return 3;
  return 4;
}

/**
 * Maximum cells per travel turn, based on starting cell geology/altitude.
 * Exported so choices.ts can use it for look-ahead scan depth.
 */
export function getMaxDistance(cell: TerrainCell): number {
  if (cell.altitude > 0.5) return 3;
  switch (cell.geology) {
    case GeologyType.Chalk:     return cell.altitude > 0.3 ? 5 : 4;
    case GeologyType.Limestone: return 4;
    case GeologyType.Sandstone: return 4;
    case GeologyType.Granite:   return cell.altitude > 0.4 ? 4 : 3;
    case GeologyType.Clay:      return 2;
    case GeologyType.Slate:     return 2;
    case GeologyType.Glacial:   return 2;
    default:                    return 2;
  }
}

/** Collect a notable observation when the terrain character changes */
function collectNotable(prev: TerrainCell, curr: TerrainCell, prevHadRiver: boolean): string | null {
  if (curr.riverFlow > 0 && !prevHadRiver)                               return "crossed a stream";
  if (curr.geology === GeologyType.Clay && prev.geology !== GeologyType.Clay) return "undergrowth thickened";
  if (curr.altitude < 0.25 && prev.altitude >= 0.25)                    return "ground levelled into a hollow";
  if (curr.geology === GeologyType.Granite && curr.altitude > 0.4 && prev.altitude <= curr.altitude)
                                                                          return "ground turned damp underfoot";
  return null;
}

/**
 * Execute a directional travel sequence from (startX, startY) along bearing (dx, dy).
 * Moves cell by cell, stopping when an interrupt condition fires or maxDistance is reached.
 * _startContext and _gameState are reserved for future interrupt checks (weather change, etc.)
 */
export function executeTravelSequence(
  terrain: TerrainMap,
  startX: number,
  startY: number,
  dx: number,
  dy: number,
  _startContext: PerceptualContext,
  _gameState: GameState,
): TravelResult {
  const startCell  = terrain.cells[startY][startX];
  const maxDist    = getMaxDistance(startCell);
  const startAlt   = altBandIdx(startCell.altitude);

  const path:              { x: number; y: number }[] = [];
  const traversedTerrain:  TerrainCell[]              = [];
  const notables:          string[]                   = [];

  let cx           = startX;
  let cy           = startY;
  let prevCell     = startCell;
  let prevHadRiver = startCell.riverFlow > 0;

  for (let step = 0; step < maxDist; step++) {
    const nx = cx + dx;
    const ny = cy + dy;

    if (nx < 0 || nx >= terrain.width || ny < 0 || ny >= terrain.height) break;

    const cell = terrain.cells[ny][nx];

    // Impassable — stop before entering
    if (cell.geology === GeologyType.Water || cell.geology === GeologyType.Ice) {
      if (path.length === 0) {
        return { path: [], stopReason: "impassable", destination: { x: startX, y: startY },
                 cellsCovered: 0, traversedTerrain: [], notables: [] };
      }
      break;
    }

    path.push({ x: nx, y: ny });
    traversedTerrain.push(cell);

    const notable = collectNotable(prevCell, cell, prevHadRiver);
    if (notable && !notables.includes(notable)) notables.push(notable);

    // River crossing → stop at this cell
    if (cell.riverFlow > 0 && !prevHadRiver) {
      return { path, stopReason: "river-crossing", destination: { x: nx, y: ny },
               cellsCovered: path.length, traversedTerrain, notables };
    }

    // Coast reached
    if (cell.isCoast && !startCell.isCoast) {
      return { path, stopReason: "coast-reached", destination: { x: nx, y: ny },
               cellsCovered: path.length, traversedTerrain, notables };
    }

    // Geology change
    if (cell.geology !== startCell.geology) {
      return { path, stopReason: "geology-change", destination: { x: nx, y: ny },
               cellsCovered: path.length, traversedTerrain, notables };
    }

    // Significant altitude change (2+ bands)
    if (Math.abs(altBandIdx(cell.altitude) - startAlt) >= 2) {
      return { path, stopReason: "altitude-change", destination: { x: nx, y: ny },
               cellsCovered: path.length, traversedTerrain, notables };
    }

    prevCell     = cell;
    prevHadRiver = cell.riverFlow > 0;
    cx = nx;
    cy = ny;
  }

  const dest = path.length > 0 ? path[path.length - 1] : { x: startX, y: startY };
  return {
    path,
    stopReason:      path.length === 0 ? "impassable" : "max-distance",
    destination:     dest,
    cellsCovered:    path.length,
    traversedTerrain,
    notables,
  };
}
