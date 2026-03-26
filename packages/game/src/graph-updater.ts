/**
 * Graph updater — examines what happened each turn and increments player graph nodes.
 * Called once per turn from the main loop after position and time have been updated.
 */

import type { PlayerGraph, BodyLandNode } from "./player-graph";
import { incrementNode } from "./player-graph";
import type { PerceptualContext } from "./context";
import type { WorldQuery } from "./world";
import type { GameState } from "./state";

export interface NodeIncrement {
  node:   string;
  amount: number;
  reason: string;
}

export interface GraphUpdateResult {
  increments:       NodeIncrement[];
  seasonalPressure: { shelter: number; food: number };
  isTarryTurn:      boolean;
}

export interface TurnInfo {
  isTarry:           boolean;
  isMovement:        boolean;
  cellsCovered:      number;  // >1 for travel sequences
  geoChanged:        boolean;
  prevGeo:           string;
  reachedHighGround: boolean; // hilltop/summit reached that wasn't before
}

// Approximate animal density from geology until habitation data is connected
function estimateAnimalDensity(geology: string): number {
  switch (geology) {
    case "clay":      return 0.7;  // dense forest — boar, deer
    case "limestone": return 0.6;  // mixed woodland
    case "slate":     return 0.5;  // wooded valleys
    case "chalk":     return 0.5;  // open downs — hares, deer
    case "sandstone": return 0.45;
    case "granite":   return 0.4;  // moorland
    case "glacial":   return 0.1;
    default:          return 0.3;
  }
}

function isSevereWeather(w: string): boolean {
  return w === "storm" || w === "snow";
}

export function updateGraph(
  graph:       PlayerGraph,
  turn:        TurnInfo,
  prevContext: PerceptualContext | null,
  currContext: PerceptualContext,
  world:       WorldQuery,
  gameState:   GameState,
): GraphUpdateResult {
  const increments: NodeIncrement[] = [];
  const t          = gameState.turns;
  const tarryMult  = turn.isTarry ? 1.5 : 1.0;

  function add(node: BodyLandNode, base: number, reason: string): void {
    const actual = incrementNode(graph, node, base * tarryMult, t);
    if (actual > 0.00001) {
      increments.push({ node, amount: parseFloat(actual.toFixed(4)), reason });
    }
  }

  // ── Body Sense ────────────────────────────────────────────────────
  if (turn.isTarry) {
    add("bodySense", 0.005, "tarry");
  }
  if (currContext.nearSacredSite) {
    add("bodySense", 0.01, "near sacred site");
  }

  // ── Paths ─────────────────────────────────────────────────────────
  if (turn.isMovement || turn.cellsCovered > 0) {
    const cells   = Math.max(1, turn.cellsCovered);
    const perCell = world.onPath ? 0.005 : 0.003;
    for (let i = 0; i < cells; i++) {
      add("paths", perCell, world.onPath ? "walked on path" : "walked");
    }
  }
  if (turn.geoChanged) {
    add("paths", 0.01, `crossed geology boundary from ${turn.prevGeo}`);
    graph.geologiesTraversed.add(currContext.geology);
  }
  if (turn.reachedHighGround) {
    add("paths", 0.01, "reached high ground with view");
  }

  // ── Weather ───────────────────────────────────────────────────────
  if (gameState.weather.type !== "clear") {
    add("weather", 0.003, `exposed to ${gameState.weather.type}`);
  }
  if (prevContext && prevContext.weather !== currContext.weather) {
    add("weather", 0.01, "weather changed while exposed");
  }
  if (isSevereWeather(gameState.weather.type)) {
    // Extra increment for surviving severe weather (stacks with the passive one above)
    add("weather", 0.02, "severe weather survived");
  }

  // ── Animal Signs ─────────────────────────────────────────────────
  const density = estimateAnimalDensity(currContext.geology);
  if (density > 0.3) {
    add("animalSigns", 0.005, `animal-rich terrain (${currContext.geology})`);
  }
  if (turn.isTarry && density > 0.5) {
    add("animalSigns", 0.003, "tarried in animal-rich terrain");
  }

  // ── Seasonal pressure ─────────────────────────────────────────────
  const s = gameState.time.season;
  const seasonalPressure = s === 3 ? { shelter: 0.15, food: 0.15 }
    : s === 2                      ? { shelter: 0.0,  food: 0.05  }
    :                                { shelter: 0.0,  food: 0.0   };

  return { increments, seasonalPressure, isTarryTurn: turn.isTarry };
}

/**
 * Build a TurnInfo descriptor from the choice made and before/after context.
 * Called in main.ts before updateGraph.
 */
export function buildTurnInfo(
  dx:           number,
  dy:           number,
  cellsCovered: number,
  prevContext:  PerceptualContext | null,
  currContext:  PerceptualContext,
): TurnInfo {
  const isTarry     = dx === 0 && dy === 0;
  const isMovement  = !isTarry;
  const geoChanged  = prevContext !== null && prevContext.geology !== currContext.geology;
  const prevGeo     = prevContext?.geology ?? "";

  const HIGH = new Set(["hilltop", "ridgeline", "summit"]);
  const reachedHighGround =
    HIGH.has(currContext.altitudeBand) &&
    !HIGH.has(prevContext?.altitudeBand ?? "");

  return { isTarry, isMovement, cellsCovered, geoChanged, prevGeo, reachedHighGround };
}
