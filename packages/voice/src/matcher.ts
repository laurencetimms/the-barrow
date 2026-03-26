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
      // Fragment specifies this category but none match.
      // weather/season/time: hard exclusion — a snowy fragment has no place on a clear day.
      // geology/altitude/feature: mild penalty — wrong-geology fragments are less relevant but not absurd.
      // sense/state: additive tags, never penalised.
      if (cat === "weather" || cat === "season" || cat === "time") return 0;
      if (cat !== "sense" && cat !== "state") score -= 0.5;
    }
  }

  // Must match at least one category to be considered
  if (!hasMatchedCategory) return 0;

  return score;
}

/**
 * Weighted random selection from a scored pool.
 * Probability is proportional to score², so better matches are more likely
 * but not guaranteed — prevents any single fragment dominating stable contexts.
 * Already-selected fragment ids are excluded from subsequent draws.
 */
function weightedSelect(
  pool: { fragment: Fragment; score: number }[],
  count: number,
  excludeIds: string[],
): { fragment: Fragment; score: number }[] {
  const available = pool.filter(f => !excludeIds.includes(f.fragment.id));
  const selected: { fragment: Fragment; score: number }[] = [];

  for (let i = 0; i < count && available.length > 0; i++) {
    const totalWeight = available.reduce((sum, f) => sum + f.score * f.score, 0);
    let roll = Math.random() * totalWeight;
    let pick = 0;
    for (let j = 0; j < available.length; j++) {
      roll -= available[j].score * available[j].score;
      if (roll <= 0) { pick = j; break; }
    }
    selected.push(available.splice(pick, 1)[0]);
  }

  return selected;
}

/** Count how many fragments score > 0 against a situation (for debug display). */
export function countScoredFragments(fragments: Fragment[], situation: Situation): number {
  return fragments.filter(f => scoreFragment(f, situation) > 0).length;
}

/**
 * Select the best-matching fragments for a situation.
 * @param excludeIds Fragment ids to exclude (recency filter — pass recent turn ids).
 */
export function matchFragments(
  fragments: Fragment[],
  situation: Situation,
  count: number = 4,
  excludeIds: string[] = [],
): { fragment: Fragment; score: number }[] {
  const scored = fragments
    .map(f => ({ fragment: f, score: scoreFragment(f, situation) }))
    .filter(f => f.score > 0)
    .sort((a, b) => b.score - a.score);

  return weightedSelect(scored, count, excludeIds);
}
