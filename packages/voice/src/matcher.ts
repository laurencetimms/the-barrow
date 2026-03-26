import { Fragment } from "./fragments";
import { Situation, TagCategory } from "./tags";

/**
 * Score how well a fragment matches the current situation.
 * Higher = better match. Returns 0 for fragments that contradict the situation.
 */
function scoreFragment(fragment: Fragment, situation: Situation): number {
  let score = 0;
  let hasMatchedCategory = false;

  const categories: TagCategory[] = [
    "geology", "weather", "season", "time",
    "altitude", "feature", "sense", "state"
  ];

  for (const cat of categories) {
    const sitTags  = situation[cat];
    const fragTags = fragment.tags[cat];

    if (!sitTags || sitTags.length === 0) {
      // Hard-exclusion categories: if fragment has tags but situation doesn't,
      // exclude the fragment — better to show nothing than a mismatched fragment.
      if (fragTags && fragTags.length > 0 &&
          (cat === "geology" || cat === "weather" || cat === "season" || cat === "time")) {
        return 0;
      }
      continue;
    }
    if (!fragTags || fragTags.length === 0) continue;

    // Check for overlap
    const overlap = fragTags.filter(t => sitTags.includes(t));
    if (overlap.length > 0) {
      // Weight by category importance
      const weight = (cat === "geology") ? 3.0
        : (cat === "weather" || cat === "season" || cat === "time") ? 2.0
        : (cat === "altitude" || cat === "feature") ? 1.5
        : 1.0;
      score += overlap.length * weight;
      hasMatchedCategory = true;
    } else {
      // Fragment specifies this category but none match.
      // weather/season/time/geology: hard exclusion.
      // altitude/feature: mild penalty.
      // sense/state: additive, never penalised.
      if (cat === "geology" || cat === "weather" || cat === "season" || cat === "time") return 0;
      if (cat !== "sense" && cat !== "state") score -= 0.5;
    }
  }

  // Must match at least one category to be considered
  if (!hasMatchedCategory) return 0;

  return score;
}

/** Check whether a fragment's minNodes requirements are satisfied. */
function meetsNodeRequirements(
  fragment:   Fragment,
  nodeValues: Record<string, number>,
): boolean {
  if (!fragment.minNodes) return true;
  return Object.entries(fragment.minNodes).every(
    ([node, min]) => (nodeValues[node] ?? 0) >= min,
  );
}

/**
 * Weighted random selection from a scored pool.
 * Probability is proportional to score², so better matches are more likely
 * but not guaranteed — prevents any single fragment dominating stable contexts.
 * Already-selected fragment ids are excluded from subsequent draws.
 * At most `maxGated` fragments with minNodes may appear (description budget).
 */
function weightedSelect(
  pool:      { fragment: Fragment; score: number }[],
  count:     number,
  excludeIds:string[],
  maxGated:  number = 1,
): { fragment: Fragment; score: number }[] {
  const available = pool.filter(f => !excludeIds.includes(f.fragment.id));
  const selected: { fragment: Fragment; score: number }[] = [];
  let gatedCount = 0;

  for (let i = 0; i < count && available.length > 0; i++) {
    // When the gated budget is exhausted, draw only from non-gated fragments
    const candidates = gatedCount >= maxGated
      ? available.filter(f => !f.fragment.minNodes)
      : available;
    if (candidates.length === 0) break;

    const totalWeight = candidates.reduce((sum, f) => sum + f.score * f.score, 0);
    let roll = Math.random() * totalWeight;
    let pick = 0;
    for (let j = 0; j < candidates.length; j++) {
      roll -= candidates[j].score * candidates[j].score;
      if (roll <= 0) { pick = j; break; }
    }
    const chosen = candidates[pick];
    if (chosen.fragment.minNodes) gatedCount++;
    const idx = available.indexOf(chosen);
    if (idx !== -1) available.splice(idx, 1);
    selected.push(chosen);
  }

  return selected;
}

/**
 * Count how many fragments score > 0 against a situation (for debug display).
 */
export function countScoredFragments(
  fragments:  Fragment[],
  situation:  Situation,
  nodeValues?: Record<string, number>,
): number {
  const eligible = nodeValues
    ? fragments.filter(f => meetsNodeRequirements(f, nodeValues))
    : fragments;
  return eligible.filter(f => scoreFragment(f, situation) > 0).length;
}

/**
 * Select the best-matching fragments for a situation.
 * @param excludeIds  Fragment ids to exclude (recency filter).
 * @param nodeValues  Player-graph node values for minNodes filtering.
 *                    If omitted, all fragments are eligible (backward compatible).
 */
export function matchFragments(
  fragments:  Fragment[],
  situation:  Situation,
  count:      number = 4,
  excludeIds: string[] = [],
  nodeValues?: Record<string, number>,
): { fragment: Fragment; score: number }[] {
  const eligible = nodeValues
    ? fragments.filter(f => meetsNodeRequirements(f, nodeValues))
    : fragments;

  const scored = eligible
    .map(f => ({ fragment: f, score: scoreFragment(f, situation) }))
    .filter(f => f.score > 0)
    .sort((a, b) => b.score - a.score);

  // Description budget: at most 1 node-gated fragment per selection
  return weightedSelect(scored, count, excludeIds, 1);
}
