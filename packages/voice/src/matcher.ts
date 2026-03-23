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
    const sitTags = situation[cat];
    const fragTags = fragment.tags[cat];

    if (!sitTags || sitTags.length === 0) continue;
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
      // Fragment specifies this category but none match — mild penalty
      // (except for sense/state which are additive, not exclusive)
      if (cat !== "sense" && cat !== "state") {
        score -= 0.5;
      }
    }
  }

  // Must match at least one category to be considered
  if (!hasMatchedCategory) return 0;

  return score;
}

/**
 * Select the best-matching fragments for a situation.
 * Returns 2-4 fragments, scored and sorted.
 */
export function matchFragments(
  fragments: Fragment[],
  situation: Situation,
  count: number = 4
): { fragment: Fragment; score: number }[] {
  const scored = fragments
    .map(f => ({ fragment: f, score: scoreFragment(f, situation) }))
    .filter(f => f.score > 0)
    .sort((a, b) => b.score - a.score);

  // Take top matches, but add some variety — don't always take the top N
  // Instead, take the top 1-2 and randomly sample from the next tier
  if (scored.length <= count) return scored;

  const result = scored.slice(0, Math.min(2, count));
  const remaining = scored.slice(2);

  while (result.length < count && remaining.length > 0) {
    // Weight toward higher scores but allow some randomness
    const idx = Math.floor(Math.random() * Math.min(remaining.length, 6));
    result.push(remaining.splice(idx, 1)[0]);
  }

  return result;
}
