/**
 * The world query interface — asks "what's at this position?"
 * and returns structured data the voice system can use.
 */

import type { TerrainMap, TerrainCell } from "@the-barrow/terrain";
import { GeologyType, GEOLOGY_INFO } from "@the-barrow/terrain";

export interface WorldQuery {
  /** The terrain cell at the player's position */
  cell: TerrainCell;
  /** Geology info for the cell */
  geoInfo: { label: string; description: string };
  /** Altitude in approximate metres */
  altitudeMetres: number;
  /** Is the player near a river? (within 2 cells) */
  nearRiver: boolean;
  /** Is the player on the coast? */
  onCoast: boolean;
  /** Is the player on a path? */
  onPath: boolean;
  /** Nearby features (settlements, sacred sites within visibility range) */
  nearbyFeatures: NearbyFeature[];
  /** What's visible from here (distant features, based on altitude advantage) */
  visibleFeatures: VisibleFeature[];
  /** Adjacent movement options */
  adjacentTerrain: AdjacentCell[];
}

export interface NearbyFeature {
  type: "settlement" | "sacred-site" | "barrow" | "standing-stone" | "cave-entrance" | "ford";
  direction: string;
  distance: number; // cells
  name?: string;
}

export interface VisibleFeature {
  type: "smoke" | "hill" | "ridge" | "river-valley" | "coast" | "forest-edge" | "ice";
  direction: string;
  description: string;
}

export interface AdjacentCell {
  direction: string;
  dx: number;
  dy: number;
  cell: TerrainCell;
  geoLabel: string;
  altChange: number; // positive = uphill
  hasRiver: boolean;
  hasPath: boolean;
  movementCost: number; // 1.0 = easy, higher = harder
}

const DIRECTIONS: { dx: number; dy: number; name: string }[] = [
  { dx: 0, dy: -1, name: "north" },
  { dx: 1, dy: -1, name: "northeast" },
  { dx: 1, dy: 0, name: "east" },
  { dx: 1, dy: 1, name: "southeast" },
  { dx: 0, dy: 1, name: "south" },
  { dx: -1, dy: 1, name: "southwest" },
  { dx: -1, dy: 0, name: "west" },
  { dx: -1, dy: -1, name: "northwest" },
];

export function queryWorld(
  terrain: TerrainMap,
  x: number,
  y: number,
): WorldQuery {
  const cell = terrain.cells[y][x];
  const geoInfo = GEOLOGY_INFO[cell.geology];

  // Check for rivers within 2 cells
  let nearRiver = false;
  for (let dy = -2; dy <= 2; dy++) {
    for (let dx = -2; dx <= 2; dx++) {
      const nx = x + dx, ny2 = y + dy;
      if (nx >= 0 && nx < terrain.width && ny2 >= 0 && ny2 < terrain.height) {
        if (terrain.cells[ny2][nx].riverFlow > 0) nearRiver = true;
      }
    }
  }

  // Adjacent cells for movement
  const adjacentTerrain: AdjacentCell[] = [];
  for (const dir of DIRECTIONS) {
    const nx = x + dir.dx;
    const ny2 = y + dir.dy;
    if (nx < 0 || nx >= terrain.width || ny2 < 0 || ny2 >= terrain.height) continue;

    const adjCell = terrain.cells[ny2][nx];

    // Skip water (impassable without a boat)
    if (adjCell.geology === GeologyType.Water) continue;
    // Skip ice (impassable)
    if (adjCell.geology === GeologyType.Ice) continue;

    const altChange = adjCell.altitude - cell.altitude;

    // Movement cost based on terrain
    let cost = 1.0;
    // Slope penalty
    cost += Math.abs(altChange) * 12;
    // Vegetation / geology penalty
    if (adjCell.geology === GeologyType.Clay) cost *= 1.6; // dense forest
    if (adjCell.geology === GeologyType.Slate) cost *= 1.4; // steep wooded valleys
    if (adjCell.geology === GeologyType.Granite && adjCell.altitude > 0.45) cost *= 1.3; // exposed moorland

    adjacentTerrain.push({
      direction: dir.name,
      dx: dir.dx,
      dy: dir.dy,
      cell: adjCell,
      geoLabel: GEOLOGY_INFO[adjCell.geology]?.label ?? "unknown",
      altChange,
      hasRiver: adjCell.riverFlow > 0,
      hasPath: false, // TODO: integrate path data
      movementCost: cost,
    });
  }

  // Simple visibility — from hilltops, note distant features
  const visibleFeatures: VisibleFeature[] = [];
  if (cell.altitude > 0.35) {
    // Scan in cardinal directions for notable features
    for (const dir of [DIRECTIONS[0], DIRECTIONS[2], DIRECTIONS[4], DIRECTIONS[6]]) {
      for (let dist = 3; dist < 20; dist++) {
        const nx = x + dir.dx * dist;
        const ny2 = y + dir.dy * dist;
        if (nx < 0 || nx >= terrain.width || ny2 < 0 || ny2 >= terrain.height) break;
        const farCell = terrain.cells[ny2][nx];

        if (farCell.geology === GeologyType.Water && dist > 5) {
          visibleFeatures.push({
            type: "coast",
            direction: dir.name,
            description: "Water glinting in the distance",
          });
          break;
        }
        if (farCell.geology === GeologyType.Ice) {
          visibleFeatures.push({
            type: "ice",
            direction: dir.name,
            description: "The white edge of the ice",
          });
          break;
        }
      }
    }
  }

  return {
    cell,
    geoInfo: { label: geoInfo?.label ?? "unknown", description: geoInfo?.description ?? "" },
    altitudeMetres: Math.round(cell.altitude * 1200),
    nearRiver,
    onCoast: cell.isCoast,
    onPath: false, // TODO: integrate path data
    nearbyFeatures: [], // TODO: integrate habitation data
    visibleFeatures,
    adjacentTerrain,
  };
}
