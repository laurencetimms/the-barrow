/**
 * Perceptual context tracking and description mode selection.
 * Implements spec section 3.1–3.3: what the player is experiencing
 * and how that should change the description mode.
 */

import { GeologyType } from "@the-barrow/terrain";
import type { WorldQuery } from "./world";

export interface PerceptualContext {
  geology: string;
  altitudeBand: string;    // "valley-floor" | "slope" | "hilltop" | "ridgeline" | "summit"
  vegetationCover: string; // "open" | "scrub" | "heath" | "moorland" | "light-forest" | "dense-forest" | "reed"
  weather: string;
  timeBand: string;        // "dawn" | "morning" | "midday" | "afternoon" | "dusk" | "night"
  nearWater: boolean;
  onPath: boolean;
  nearSettlement: boolean;
  nearSacredSite: boolean;
  inCave: boolean;
}

export type DescriptionMode = "full" | "movement" | "tarry" | "transition" | "reorientation" | "travel";

export interface ModeResult {
  mode: DescriptionMode;
  transitionWhat?: string; // only for "transition" mode
}

// Numeric indices for comparing altitude band changes
const ALTITUDE_INDEX: Record<string, number> = {
  "valley-floor": 0, slope: 1, hilltop: 2, ridgeline: 3, summit: 4, underground: 5,
};

// Numeric scale for measuring how dramatic a vegetation change is
const VEG_INDEX: Record<string, number> = {
  open: 0, reed: 1, scrub: 1, heath: 2, moorland: 2, "light-forest": 3, "dense-forest": 4,
};

function getAltitudeBand(altitude: number): string {
  if (altitude < 0.25) return "valley-floor";
  if (altitude < 0.35) return "slope";
  if (altitude < 0.45) return "hilltop";
  if (altitude < 0.55) return "ridgeline";
  return "summit";
}

function deriveVegetation(geology: string, altitude: number): string {
  switch (geology) {
    case GeologyType.Clay:      return "dense-forest";
    case GeologyType.Slate:     return "light-forest";
    case GeologyType.Sandstone: return altitude > 0.35 ? "heath" : "scrub";
    case GeologyType.Granite:   return altitude > 0.4  ? "moorland" : "heath";
    case GeologyType.Chalk:     return altitude > 0.4  ? "open" : "scrub";
    case GeologyType.Limestone: return altitude > 0.35 ? "open" : "scrub";
    case GeologyType.Glacial:   return "open";
    default:                    return "open";
  }
}

function getTimeBand(hour: number): string {
  if (hour >= 4  && hour < 6)  return "dawn";
  if (hour >= 6  && hour < 10) return "morning";
  if (hour >= 10 && hour < 14) return "midday";
  if (hour >= 14 && hour < 17) return "afternoon";
  if (hour >= 17 && hour < 20) return "dusk";
  return "night";
}

/** Build a PerceptualContext from the current world state. */
export function buildContext(world: WorldQuery, weather: string, hour: number): PerceptualContext {
  const geo = world.cell.geology;
  const alt = world.cell.altitude;
  return {
    geology: geo,
    altitudeBand: getAltitudeBand(alt),
    vegetationCover: deriveVegetation(geo, alt),
    weather,
    timeBand: getTimeBand(hour),
    nearWater: world.nearRiver || world.onCoast,
    onPath: world.onPath,
    nearSettlement: world.nearbyFeatures.some(f => f.type === "settlement" && f.distance <= 2),
    nearSacredSite: world.nearbyFeatures.some(
      f => (f.type === "standing-stone" || f.type === "barrow") && f.distance <= 2,
    ),
    inCave: false, // no cave geology type currently; reserved for future underground cells
  };
}

/**
 * Compare current context against previous to determine description mode.
 * Priority order: reorientation > full > tarry > transition > movement.
 */
export function selectMode(
  prev: PerceptualContext | null,
  curr: PerceptualContext,
  lastActionTime: number,
  isTarrying: boolean,
): ModeResult {
  // Priority 1: player absent > 2 minutes
  if (prev !== null && Date.now() - lastActionTime > 2 * 60 * 1000) {
    return { mode: "reorientation" };
  }

  // Priority 2: first turn or major context change
  if (prev === null) return { mode: "full" };

  if (curr.geology !== prev.geology) return { mode: "full" };

  const altDiff = Math.abs(
    (ALTITUDE_INDEX[curr.altitudeBand] ?? 0) - (ALTITUDE_INDEX[prev.altitudeBand] ?? 0),
  );
  if (altDiff >= 2) return { mode: "full" };

  const vegDiff = Math.abs(
    (VEG_INDEX[curr.vegetationCover] ?? 0) - (VEG_INDEX[prev.vegetationCover] ?? 0),
  );
  if (vegDiff >= 3) return { mode: "full" }; // dense-forest ↔ open

  if (curr.inCave !== prev.inCave) return { mode: "full" };
  if (curr.nearSettlement && !prev.nearSettlement) return { mode: "full" };
  if (curr.nearSacredSite && !prev.nearSacredSite) return { mode: "full" };

  // Priority 3: tarrying
  if (isTarrying) return { mode: "tarry" };

  // Priority 4: environmental transition
  if (curr.weather !== prev.weather) {
    return {
      mode: "transition",
      transitionWhat: `the weather has changed to ${curr.weather}`,
    };
  }
  if (curr.timeBand !== prev.timeBand) {
    const BAND_LABELS: Record<string, string> = {
      dawn: "dawn has broken", morning: "the morning has come",
      midday: "midday has come", afternoon: "the afternoon has come",
      dusk: "dusk is falling", night: "night has come",
    };
    return {
      mode: "transition",
      transitionWhat: BAND_LABELS[curr.timeBand] ?? `it is now ${curr.timeBand}`,
    };
  }

  // Priority 5: movement through similar terrain
  return { mode: "movement" };
}

/** Returns the LLM instruction string for a given mode. */
export function getModeInstruction(
  mode: DescriptionMode,
  tarryCount: number,
  transitionWhat?: string,
): string {
  switch (mode) {
    case "full":
      return "Weave these fragments into a 3–6 sentence description of the place.";
    case "movement":
      return "The player is continuing through similar terrain. " +
        "Write 1–2 sentences noting one new sensory detail or small change. " +
        "Do not re-describe the scene.";
    case "tarry":
      if (tarryCount === 1)
        return "The player has stopped moving. Write 1 sentence about a sound they notice now they've stopped.";
      if (tarryCount === 2)
        return "Write 1 sentence about a visual detail noticed on closer inspection.";
      if (tarryCount === 3)
        return "Write 1 sentence about a subtler observation — body sense, a change in the air, an animal sign.";
      return "Write 1 sentence about something at the edge of perception, " +
        "or acknowledge that the place has revealed what it has to reveal.";
    case "transition":
      return `One thing has changed: ${transitionWhat ?? "something in the landscape"}. ` +
        "Write 1–2 sentences registering the change without re-describing the whole scene.";
    case "reorientation":
      return "The player has been away. Write a 1-sentence compressed reminder of where they are " +
        "(geology, rough altitude, any landmark), then 2–3 sentences of scene description.";
    case "travel":
      return "Weave these fragments into a 3-4 sentence compressed travel narrative. " +
        "Forward momentum. Ground passing underfoot. The landscape moving past. " +
        "Do not describe an arrival. No invented incidents. Just walking.";
  }
}
