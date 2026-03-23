/**
 * Generates movement choices from the world query.
 * Choices are phrased as natural impulses, not game commands.
 */

import type { WorldQuery, AdjacentCell } from "./world";

export interface Choice {
  id: string;
  text: string;
  /** The terrain cell movement this choice represents */
  dx: number;
  dy: number;
  /** How long this movement takes (affects time advancement) */
  timeCost: number;
}

/** Direction descriptions that feel like thoughts, not compass points */
const DIRECTION_PROSE: Record<string, string[]> = {
  north: ["Continue north", "Head north"],
  south: ["Turn south", "Head south"],
  east: ["Turn east", "Head east"],
  west: ["Turn west", "Head west"],
  northeast: ["Bear northeast", "Head northeast"],
  northwest: ["Bear northwest", "Head northwest"],
  southeast: ["Bear southeast", "Head southeast"],
  southwest: ["Bear southwest", "Head southwest"],
};

export function generateChoices(world: WorldQuery): Choice[] {
  const choices: Choice[] = [];

  // Sort adjacent terrain by movement cost — easiest first
  const sorted = [...world.adjacentTerrain].sort((a, b) => a.movementCost - b.movementCost);

  // Generate contextual movement choices
  for (const adj of sorted) {
    const phrases = DIRECTION_PROSE[adj.direction] ?? [`Go ${adj.direction}`];
    let text = phrases[0];

    // Add terrain context
    if (adj.altChange > 0.03) {
      text = `Climb ${adj.direction} toward higher ground`;
    } else if (adj.altChange < -0.03) {
      text = `Descend ${adj.direction} into the lower ground`;
    }

    if (adj.hasRiver) {
      text = `Head ${adj.direction} toward the river`;
    }

    if (adj.hasPath) {
      text = `Follow the path ${adj.direction}`;
    }

    // Geology transitions
    if (adj.geoLabel !== world.geoInfo.label) {
      const geoLower = adj.geoLabel.toLowerCase();
      if (adj.altChange > 0.02) {
        text = `Climb ${adj.direction} into the ${geoLower}`;
      } else if (adj.altChange < -0.02) {
        text = `Descend ${adj.direction} into the ${geoLower}`;
      } else {
        text = `Continue ${adj.direction} into the ${geoLower}`;
      }
    }

    choices.push({
      id: `move-${adj.direction}`,
      text,
      dx: adj.dx,
      dy: adj.dy,
      timeCost: Math.round(adj.movementCost),
    });
  }

  // Always offer "wait" — the tarrying mechanic
  choices.push({
    id: "wait",
    text: "Stay here. Watch. Listen.",
    dx: 0,
    dy: 0,
    timeCost: 1,
  });

  // Limit to 5-6 choices max — pick the most interesting
  if (choices.length > 6) {
    // Keep wait, keep the most contextual (river, path, geology transition),
    // then fill with directional variety
    const wait = choices.find(c => c.id === "wait")!;
    const special = choices.filter(c =>
      c.id !== "wait" && (
        c.text.includes("river") ||
        c.text.includes("path") ||
        c.text.includes("into the")
      )
    ).slice(0, 3);

    const remaining = choices.filter(c =>
      c.id !== "wait" && !special.includes(c)
    ).slice(0, 2);

    return [...special, ...remaining, wait];
  }

  return choices;
}
