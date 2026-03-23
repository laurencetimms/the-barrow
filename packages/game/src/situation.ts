/**
 * Builds a voice Situation from the world query and game state.
 * This is the bridge between the game world and the voice system.
 */

import type { Situation } from "@the-barrow/voice";
import type { WorldQuery } from "./world";
import type { GameState } from "./state";
import { getTimeTag, getSeasonTag } from "./state";
import { GeologyType } from "@the-barrow/terrain";

const GEOLOGY_TO_TAG: Partial<Record<string, string>> = {
  [GeologyType.Chalk]: "chalk",
  [GeologyType.Limestone]: "limestone",
  [GeologyType.Sandstone]: "sandstone",
  [GeologyType.Granite]: "granite",
  [GeologyType.Slate]: "slate",
  [GeologyType.Clay]: "clay",
  [GeologyType.Glacial]: "glacial",
  [GeologyType.Ice]: "ice-margin",
};

export function buildSituation(world: WorldQuery, state: GameState): Situation {
  const situation: Situation = {
    geology: [],
    weather: [],
    season: [],
    time: [],
    altitude: [],
    feature: [],
    sense: ["sight"], // always seeing
    state: [],
  };

  // Geology
  const geoTag = GEOLOGY_TO_TAG[world.cell.geology];
  if (geoTag) situation.geology.push(geoTag);

  // Weather
  situation.weather.push(state.weather.type);

  // Season
  situation.season.push(getSeasonTag(state.time.season));

  // Time
  situation.time.push(getTimeTag(state.time.hour));

  // Altitude
  if (world.cell.altitude < 0.25) situation.altitude.push("valley-floor");
  else if (world.cell.altitude < 0.35) situation.altitude.push("slope");
  else if (world.cell.altitude < 0.45) situation.altitude.push("hilltop");
  else if (world.cell.altitude < 0.55) situation.altitude.push("ridgeline");
  else situation.altitude.push("summit");

  // Features
  if (world.nearRiver) {
    situation.feature.push("river");
    situation.sense.push("sound"); // rivers are audible
  }
  if (world.onCoast) {
    situation.feature.push("coast");
    situation.sense.push("sound", "smell"); // waves, salt
  }
  if (world.onPath) {
    situation.feature.push("path");
  }

  // Nearby features become feature tags
  for (const f of world.nearbyFeatures) {
    if (f.distance <= 1) {
      if (f.type === "settlement") situation.feature.push("settlement-approach");
      if (f.type === "standing-stone") situation.feature.push("standing-stone");
      if (f.type === "barrow") situation.feature.push("barrow");
      if (f.type === "cave-entrance") situation.feature.push("cave-entrance");
      if (f.type === "ford") situation.feature.push("ford");
    }
  }

  return situation as Situation;
}
