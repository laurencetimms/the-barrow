/**
 * Player graph — Body and Land tiers.
 * Float values (0.0–1.0) that grow through qualifying actions.
 * Never shown to the player — only visible in the debug panel.
 */

export interface NodeState {
  value: number;
  lastIncrementTurn: number;
}

export interface PracticeState {
  shelterBuilding: number;
  fireMaking:      number;
  flintKnapping:   number;
  woodworking:     number;
  herbGathering:   number;
}

export interface PlayerGraph {
  // Body tier
  shelter:     NodeState;
  food:        NodeState;
  bodySense:   NodeState;
  // Land tier
  paths:       NodeState;
  foraging:    NodeState;
  weather:     NodeState;
  animalSigns: NodeState;
  // Practice (separate per craft)
  practice: PracticeState;
  // Tracking sets for variety bonuses
  conditionsExperienced: Set<string>; // weather conditions sheltered in
  foodsEaten:            Set<string>; // food types discovered
  geologiesForaged:      Set<string>; // geologies foraged in
  seasonsForaged:        Set<string>; // "spring-chalk" etc
  animalsEncountered:    Set<string>; // animal types whose signs were seen
  geologiesTraversed:    Set<string>; // geologies walked through
}

export type BodyLandNode = 'shelter' | 'food' | 'bodySense' | 'paths' | 'foraging' | 'weather' | 'animalSigns';
export type PracticeKey  = keyof PracticeState;

export function createPlayerGraph(): PlayerGraph {
  return {
    shelter:     { value: 0.1,  lastIncrementTurn: -1 },
    food:        { value: 0.1,  lastIncrementTurn: -1 },
    bodySense:   { value: 0.05, lastIncrementTurn: -1 },
    paths:       { value: 0.15, lastIncrementTurn: -1 },
    foraging:    { value: 0.05, lastIncrementTurn: -1 },
    weather:     { value: 0.1,  lastIncrementTurn: -1 },
    animalSigns: { value: 0.0,  lastIncrementTurn: -1 },
    practice: {
      shelterBuilding: 0,
      fireMaking:      0,
      flintKnapping:   0,
      woodworking:     0,
      herbGathering:   0,
    },
    conditionsExperienced: new Set(),
    foodsEaten:            new Set(),
    geologiesForaged:      new Set(),
    seasonsForaged:        new Set(),
    animalsEncountered:    new Set(),
    geologiesTraversed:    new Set(),
  };
}

/** Increment a body/land node. Returns the actual amount applied (may be less if capped at 1.0). */
export function incrementNode(
  graph:       PlayerGraph,
  node:        BodyLandNode,
  amount:      number,
  currentTurn: number,
): number {
  const n    = graph[node];
  const prev = n.value;
  n.value = Math.min(1.0, Math.max(0.0, n.value + amount));
  n.lastIncrementTurn = currentTurn;
  return n.value - prev;
}

/** Increment a practice sub-node with diminishing returns. Returns actual amount applied. */
export function incrementPractice(
  graph:      PlayerGraph,
  key:        PracticeKey,
  baseAmount: number,
): number {
  const current   = graph.practice[key];
  const effective = baseAmount * (1.0 - current * 0.7);
  const prev      = current;
  graph.practice[key] = Math.min(1.0, Math.max(0.0, current + effective));
  return graph.practice[key] - prev;
}

/** Get a flat Record of all node values (used for minNodes filtering in the voice layer). */
export function getNodeValues(graph: PlayerGraph): Record<string, number> {
  return {
    shelter:     graph.shelter.value,
    food:        graph.food.value,
    bodySense:   graph.bodySense.value,
    paths:       graph.paths.value,
    foraging:    graph.foraging.value,
    weather:     graph.weather.value,
    animalSigns: graph.animalSigns.value,
  };
}

/**
 * Compute seasonal pressure — how much the effective threshold shifts upward
 * for shelter and food in harsh seasons.
 * The actual node value doesn't change; the threshold for voice-layer effects shifts.
 */
export function getSeasonalPressure(season: number): { shelter: number; food: number } {
  if (season === 3) return { shelter: 0.15, food: 0.15 }; // winter
  if (season === 2) return { shelter: 0.0,  food: 0.05  }; // autumn
  return                   { shelter: 0.0,  food: 0.0   }; // spring / summer
}

/** Serialise for JSON storage (Sets → arrays). */
export function serialiseGraph(graph: PlayerGraph): Record<string, unknown> {
  return {
    shelter:     graph.shelter,
    food:        graph.food,
    bodySense:   graph.bodySense,
    paths:       graph.paths,
    foraging:    graph.foraging,
    weather:     graph.weather,
    animalSigns: graph.animalSigns,
    practice:    graph.practice,
    conditionsExperienced: Array.from(graph.conditionsExperienced),
    foodsEaten:            Array.from(graph.foodsEaten),
    geologiesForaged:      Array.from(graph.geologiesForaged),
    seasonsForaged:        Array.from(graph.seasonsForaged),
    animalsEncountered:    Array.from(graph.animalsEncountered),
    geologiesTraversed:    Array.from(graph.geologiesTraversed),
  };
}
