export const TAGS = {
  geology: [
    "chalk", "limestone", "sandstone", "granite", "slate",
    "clay", "glacial", "water-lands", "ice-margin", "cave-interior"
  ],
  weather: ["clear", "rain", "drizzle", "fog", "wind", "storm", "snow", "frost", "haze"],
  season: ["spring", "summer", "autumn", "winter"],
  time: ["dawn", "morning", "midday", "afternoon", "dusk", "night", "moonlight"],
  altitude: ["valley-floor", "slope", "hilltop", "ridgeline", "summit", "underground"],
  feature: [
    "river", "ford", "spring", "coast", "forest-edge", "clearing", "path",
    "standing-stone", "barrow", "cave-entrance", "settlement-approach",
    "settlement-interior", "sacred-pool", "moor", "heath", "reed-bed"
  ],
  sense: ["sight", "sound", "smell", "touch", "body-sense"],
  state: ["cold", "hungry", "tired", "rested", "frightened", "calm", "alert"],
} as const;

export type TagCategory = keyof typeof TAGS;
export type TagValue = (typeof TAGS)[TagCategory][number];

export interface Situation {
  geology: string[];
  weather: string[];
  season: string[];
  time: string[];
  altitude: string[];
  feature: string[];
  sense: string[];
  state: string[];
}

export function emptySituation(): Situation {
  return {
    geology: [], weather: [], season: [], time: [],
    altitude: [], feature: [], sense: [], state: [],
  };
}
