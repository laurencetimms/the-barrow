#!/bin/bash
# The Barrow — Monorepo Setup
# 
# Creates the full monorepo structure with npm workspaces.
# After running this, you'll need to copy your existing code
# from barrow-terrain and barrow-voice into the right packages.
#
# Run this in the root of a fresh 'the-barrow' repo in Codespace.

set -e

echo "=== Setting up The Barrow monorepo ==="

# ─── Root config ───────────────────────────────────────────────

cat > package.json << 'PKG'
{
  "name": "the-barrow",
  "private": true,
  "workspaces": [
    "packages/*"
  ],
  "scripts": {
    "dev:terrain-viewer": "npm run dev -w @barrow/terrain-viewer",
    "dev:voice-tester": "npm run dev -w @barrow/voice-tester",
    "dev:game": "npm run dev -w @barrow/game",
    "build": "npm run build -w @barrow/terrain-viewer && npm run build -w @barrow/voice-tester && npm run build -w @barrow/game",
    "build:game": "npm run build -w @barrow/game",
    "build:terrain-viewer": "npm run build -w @barrow/terrain-viewer",
    "build:voice-tester": "npm run build -w @barrow/voice-tester"
  },
  "devDependencies": {
    "typescript": "^5.4.0",
    "vite": "^5.4.0"
  }
}
PKG

cat > tsconfig.base.json << 'TSBASE'
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  }
}
TSBASE

cat > tsconfig.json << 'TSROOT'
{
  "files": [],
  "references": [
    { "path": "packages/terrain" },
    { "path": "packages/terrain-viewer" },
    { "path": "packages/voice" },
    { "path": "packages/voice-tester" },
    { "path": "packages/game" }
  ]
}
TSROOT

cat > .gitignore << 'GIT'
node_modules
dist
*.local
.DS_Store
GIT

# ─── Package: @barrow/terrain ───────────────────────────────────
# Core terrain generation — no UI, just the generation logic

mkdir -p packages/terrain/src

cat > packages/terrain/package.json << 'PKG'
{
  "name": "@barrow/terrain",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "main": "src/index.ts",
  "dependencies": {
    "simplex-noise": "^4.0.1"
  }
}
PKG

cat > packages/terrain/tsconfig.json << 'TS'
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "composite": true,
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src"]
}
TS

# Index file that re-exports everything
cat > packages/terrain/src/index.ts << 'INDEX'
export { createSeededNoise, layeredNoise } from "./noise";
export type { NoiseGenerator } from "./noise";

export { GeologyType, GEOLOGY_INFO } from "./geology";
export type { GeologyInfo } from "./geology";

export { generateTerrain, generateHighResPatch } from "./terrain";
export type { TerrainCell, TerrainMap } from "./terrain";

export { generateHabitation } from "./habitation";
export type { HabitationData, Settlement, SacredSite, Path } from "./habitation";
INDEX

# Placeholder files — you'll copy your actual code in
cat > packages/terrain/src/noise.ts << 'PLACEHOLDER'
// Copy from barrow-terrain/src/noise.ts
export interface NoiseGenerator {
  noise2D: (x: number, y: number) => number;
  random: () => number;
}
export function createSeededNoise(seed: string): NoiseGenerator {
  throw new Error("Copy noise.ts from barrow-terrain");
}
export function layeredNoise(
  noise2D: (x: number, y: number) => number,
  x: number, y: number,
  octaves?: number, persistence?: number, lacunarity?: number, scale?: number
): number {
  throw new Error("Copy noise.ts from barrow-terrain");
}
PLACEHOLDER

cat > packages/terrain/src/geology.ts << 'PLACEHOLDER'
// Copy from barrow-terrain/src/geology.ts
export enum GeologyType {
  Chalk = "chalk", Limestone = "limestone", Sandstone = "sandstone",
  Granite = "granite", Slate = "slate", Clay = "clay",
  Glacial = "glacial", Ice = "ice", Water = "water",
}
export interface GeologyInfo { type: GeologyType; label: string; color: string; description: string; }
export const GEOLOGY_INFO: Record<GeologyType, GeologyInfo> = {} as any;
PLACEHOLDER

cat > packages/terrain/src/terrain.ts << 'PLACEHOLDER'
// Copy from barrow-terrain/src/terrain.ts
import { NoiseGenerator } from "./noise";

export interface TerrainCell {
  altitude: number;
  geology: any;
  riverFlow: number;
  isCoast: boolean;
  nx: number;
  ny: number;
}

export interface TerrainMap {
  width: number;
  height: number;
  cells: TerrainCell[][];
  seed: string;
}

export function generateTerrain(noise: NoiseGenerator, width: number, height: number, seed: string): TerrainMap {
  throw new Error("Copy terrain.ts from barrow-terrain");
}

export function generateHighResPatch(
  coarseMap: TerrainMap, noise: NoiseGenerator,
  coarseX0: number, coarseY0: number,
  patchCoarseW: number, patchCoarseH: number, resScale: number
): TerrainMap {
  throw new Error("Copy terrain.ts from barrow-terrain");
}
PLACEHOLDER

cat > packages/terrain/src/habitation.ts << 'PLACEHOLDER'
// Copy from barrow-terrain/src/habitation.ts (or wherever Claude Code put it)
// This exports the habitation generation — settlements, sacred sites, paths

export interface Settlement {
  x: number; y: number;
  population: number;
  size: "homestead" | "hamlet" | "village" | "town";
  name?: string;
  abandoned?: boolean;
}

export interface SacredSite {
  x: number; y: number;
  type: string;
  tier: "major" | "significant" | "small";
}

export interface Path {
  cells: [number, number][];
  traffic: number;
}

export interface HabitationData {
  settlements: Settlement[];
  sacredSites: SacredSite[];
  paths: Path[];
}

export function generateHabitation(terrain: any, noise: any): HabitationData {
  throw new Error("Copy habitation code from barrow-terrain");
}
PLACEHOLDER


# ─── Package: @barrow/terrain-viewer ────────────────────────────
# The map viewer UI — imports from @barrow/terrain

mkdir -p packages/terrain-viewer/src

cat > packages/terrain-viewer/package.json << 'PKG'
{
  "name": "@barrow/terrain-viewer",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build"
  },
  "dependencies": {
    "@barrow/terrain": "*"
  }
}
PKG

cat > packages/terrain-viewer/tsconfig.json << 'TS'
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "composite": true,
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src"],
  "references": [
    { "path": "../terrain" }
  ]
}
TS

cat > packages/terrain-viewer/vite.config.ts << 'VITE'
import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  base: "/the-barrow/terrain/",
  build: { outDir: "dist" },
  resolve: {
    alias: {
      "@barrow/terrain": path.resolve(__dirname, "../terrain/src"),
    },
  },
});
VITE

cat > packages/terrain-viewer/src/placeholder.ts << 'PH'
// Copy renderer.ts and main.ts from barrow-terrain/src/
// Update imports: change "./noise" etc to "@barrow/terrain"
export {};
PH

echo '<!-- Copy index.html from barrow-terrain, update script src -->' > packages/terrain-viewer/index.html


# ─── Package: @barrow/voice ─────────────────────────────────────
# Core voice system — fragments, matcher, LLM pipeline

mkdir -p packages/voice/src

cat > packages/voice/package.json << 'PKG'
{
  "name": "@barrow/voice",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "main": "src/index.ts"
}
PKG

cat > packages/voice/tsconfig.json << 'TS'
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "composite": true,
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src"]
}
TS

cat > packages/voice/src/index.ts << 'INDEX'
export { TAGS, emptySituation } from "./tags";
export type { TagCategory, TagValue, Situation } from "./tags";

export { STARTER_FRAGMENTS } from "./fragments";
export type { Fragment } from "./fragments";

export { matchFragments } from "./matcher";

export { generateVoice, getSystemPrompt } from "./llm";

export {
  loadFragments, saveFragments, loadApiKey, saveApiKey,
  exportFragmentsJSON, importFragmentsJSON
} from "./store";
INDEX

cat > packages/voice/src/tags.ts << 'PH'
// Copy from barrow-voice/src/tags.ts
export const TAGS = {} as any;
export type TagCategory = string;
export type TagValue = string;
export interface Situation { [key: string]: string[]; }
export function emptySituation(): Situation { return {}; }
PH

cat > packages/voice/src/fragments.ts << 'PH'
// Copy from barrow-voice/src/fragments.ts
export interface Fragment { id: string; text: string; tags: any; }
export const STARTER_FRAGMENTS: Fragment[] = [];
PH

cat > packages/voice/src/matcher.ts << 'PH'
// Copy from barrow-voice/src/matcher.ts
import { Fragment } from "./fragments";
export function matchFragments(fragments: Fragment[], situation: any, count?: number): { fragment: Fragment; score: number }[] { return []; }
PH

cat > packages/voice/src/llm.ts << 'PH'
// Copy from barrow-voice/src/llm.ts
export async function generateVoice(apiKey: string, situation: any, fragments: any[]): Promise<string> { return ""; }
export function getSystemPrompt(): string { return ""; }
PH

cat > packages/voice/src/store.ts << 'PH'
// Copy from barrow-voice/src/store.ts
import { Fragment } from "./fragments";
export function loadFragments(): Fragment[] { return []; }
export function saveFragments(f: Fragment[]): void {}
export function loadApiKey(): string { return ""; }
export function saveApiKey(k: string): void {}
export function exportFragmentsJSON(f: Fragment[]): string { return "[]"; }
export function importFragmentsJSON(j: string): Fragment[] | null { return null; }
PH

# Fragment data file — the voice tester exports here, the game loads from here
cat > packages/voice/src/fragments.json << 'JSON'
[]
JSON


# ─── Package: @barrow/voice-tester ──────────────────────────────
# The voice tester UI — imports from @barrow/voice

mkdir -p packages/voice-tester/src

cat > packages/voice-tester/package.json << 'PKG'
{
  "name": "@barrow/voice-tester",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build"
  },
  "dependencies": {
    "@barrow/voice": "*"
  }
}
PKG

cat > packages/voice-tester/tsconfig.json << 'TS'
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "composite": true,
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src"],
  "references": [
    { "path": "../voice" }
  ]
}
TS

cat > packages/voice-tester/vite.config.ts << 'VITE'
import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  base: "/the-barrow/voice/",
  build: { outDir: "dist" },
  resolve: {
    alias: {
      "@barrow/voice": path.resolve(__dirname, "../voice/src"),
    },
  },
});
VITE

cat > packages/voice-tester/src/placeholder.ts << 'PH'
// Copy main.ts from barrow-voice/src/
// Update imports: change "./tags" etc to "@barrow/voice"
export {};
PH

echo '<!-- Copy index.html from barrow-voice, update script src -->' > packages/voice-tester/index.html


# ─── Package: @barrow/game ──────────────────────────────────────
# The actual game — the walker

mkdir -p packages/game/src

cat > packages/game/package.json << 'PKG'
{
  "name": "@barrow/game",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build"
  },
  "dependencies": {
    "@barrow/terrain": "*",
    "@barrow/voice": "*"
  }
}
PKG

cat > packages/game/tsconfig.json << 'TS'
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "composite": true,
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src"],
  "references": [
    { "path": "../terrain" },
    { "path": "../voice" }
  ]
}
TS

cat > packages/game/vite.config.ts << 'VITE'
import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  base: "/the-barrow/",
  build: { outDir: "dist" },
  resolve: {
    alias: {
      "@barrow/terrain": path.resolve(__dirname, "../terrain/src"),
      "@barrow/voice": path.resolve(__dirname, "../voice/src"),
    },
  },
});
VITE

# ─── Game: state model ──────────────────────────────────────────

cat > packages/game/src/state.ts << 'STATE'
/**
 * The game state — the single source of truth about the player's experience.
 * Persists between sessions. Grows as more systems are added.
 */

export interface Position {
  /** Coarse grid x (0 = west edge, MAP_WIDTH = east edge) */
  x: number;
  /** Coarse grid y (0 = top/north, MAP_HEIGHT = bottom/south) */
  y: number;
}

export interface TimeState {
  /** Hour of day: 0-23 */
  hour: number;
  /** Day within season: 0-29 (roughly) */
  day: number;
  /** Season: 0=spring, 1=summer, 2=autumn, 3=winter */
  season: number;
  /** Year since emergence */
  year: number;
}

export interface Weather {
  type: "clear" | "rain" | "drizzle" | "fog" | "wind" | "storm" | "snow" | "frost" | "haze";
}

export interface GameState {
  /** The world seed */
  seed: string;
  /** Player's position on the coarse terrain grid */
  position: Position;
  /** Current time */
  time: TimeState;
  /** Current weather */
  weather: Weather;
  /** Turns elapsed */
  turns: number;
}

export function createInitialState(seed: string, startX: number, startY: number): GameState {
  return {
    seed,
    position: { x: startX, y: startY },
    time: { hour: 6, day: 0, season: 1, year: 0 }, // dawn, early summer
    weather: { type: "clear" },
    turns: 0,
  };
}

/** Advance time by roughly one turn (~30 minutes of walking) */
export function advanceTime(state: GameState): void {
  state.turns++;
  state.time.hour++;
  if (state.time.hour >= 24) {
    state.time.hour = 0;
    state.time.day++;
    if (state.time.day >= 30) {
      state.time.day = 0;
      state.time.season = (state.time.season + 1) % 4;
      if (state.time.season === 0) state.time.year++;
    }
  }
}

/** Get the time-of-day tag for the voice system */
export function getTimeTag(hour: number): string {
  if (hour >= 4 && hour < 6) return "dawn";
  if (hour >= 6 && hour < 10) return "morning";
  if (hour >= 10 && hour < 14) return "midday";
  if (hour >= 14 && hour < 17) return "afternoon";
  if (hour >= 17 && hour < 20) return "dusk";
  return "night";
}

/** Get the season tag */
export function getSeasonTag(season: number): string {
  return ["spring", "summer", "autumn", "winter"][season];
}
STATE

# ─── Game: world query ──────────────────────────────────────────

cat > packages/game/src/world.ts << 'WORLD'
/**
 * The world query interface — asks "what's at this position?"
 * and returns structured data the voice system can use.
 */

import type { TerrainMap, TerrainCell } from "@barrow/terrain";
import { GeologyType, GEOLOGY_INFO } from "@barrow/terrain";

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
WORLD

# ─── Game: situation builder ─────────────────────────────────────

cat > packages/game/src/situation.ts << 'SITUATION'
/**
 * Builds a voice Situation from the world query and game state.
 * This is the bridge between the game world and the voice system.
 */

import type { Situation } from "@barrow/voice";
import type { WorldQuery } from "./world";
import type { GameState } from "./state";
import { getTimeTag, getSeasonTag } from "./state";
import { GeologyType } from "@barrow/terrain";

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
SITUATION

# ─── Game: choice generator ──────────────────────────────────────

cat > packages/game/src/choices.ts << 'CHOICES'
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
CHOICES

# ─── Game: main entry point ──────────────────────────────────────

cat > packages/game/src/main.ts << 'GAMEMAIN'
import {
  createSeededNoise,
  generateTerrain,
  GEOLOGY_INFO,
  GeologyType,
} from "@barrow/terrain";
import type { TerrainMap } from "@barrow/terrain";
import {
  loadFragments,
  loadApiKey,
  matchFragments,
  generateVoice,
} from "@barrow/voice";
import type { Fragment } from "@barrow/voice";
import { renderTerrainToBuffer, renderViewport, Viewport, canvasToTerrain } from "./map-renderer";
import { createInitialState, advanceTime, GameState } from "./state";
import { queryWorld } from "./world";
import { buildSituation } from "./situation";
import { generateChoices, Choice } from "./choices";

// ─── Config ─────────────────────────────────────────────────────
const MAP_WIDTH = 300;
const MAP_HEIGHT = 500;
const DEFAULT_SEED = "barrow";

// ─── State ──────────────────────────────────────────────────────
let terrain: TerrainMap | null = null;
let terrainBuffer: ImageData | null = null;
let gameState: GameState | null = null;
let fragments: Fragment[] = [];
let viewport: Viewport = { cx: 150, cy: 250, zoom: 4 };
let isGenerating = false;

// ─── DOM ────────────────────────────────────────────────────────
const canvas = document.getElementById("map") as HTMLCanvasElement;
const textPanel = document.getElementById("text-panel") as HTMLElement;
const choicesPanel = document.getElementById("choices") as HTMLElement;
const statusBar = document.getElementById("status") as HTMLElement;
const seedInput = document.getElementById("seed") as HTMLInputElement;
const startBtn = document.getElementById("start-btn") as HTMLButtonElement;

canvas.width = 400;
canvas.height = 500;

// ─── Load fragments ─────────────────────────────────────────────
fragments = loadFragments();

// ─── Start / Generate ───────────────────────────────────────────
startBtn.addEventListener("click", () => {
  const seed = seedInput.value.trim() || DEFAULT_SEED;
  startGame(seed);
});

function startGame(seed: string) {
  const noise = createSeededNoise(seed);
  terrain = generateTerrain(noise, MAP_WIDTH, MAP_HEIGHT, seed);
  terrainBuffer = renderTerrainToBuffer(terrain);

  // Find a starting position — a habitable cell in the chalk south
  // near the centre of the map, not water or ice
  let startX = Math.floor(MAP_WIDTH * 0.45);
  let startY = Math.floor(MAP_HEIGHT * 0.8); // southern portion
  // Search for a valid cell nearby
  for (let r = 0; r < 20; r++) {
    for (let dx = -r; dx <= r; dx++) {
      for (let dy = -r; dy <= r; dy++) {
        const nx = startX + dx, ny = startY + dy;
        if (nx < 0 || nx >= MAP_WIDTH || ny < 0 || ny >= MAP_HEIGHT) continue;
        const cell = terrain.cells[ny][nx];
        if (cell.geology !== GeologyType.Water && cell.geology !== GeologyType.Ice) {
          startX = nx;
          startY = ny;
          r = 999; dx = 999; dy = 999; // break all loops
        }
      }
    }
  }

  gameState = createInitialState(seed, startX, startY);

  // Centre viewport on player
  viewport.cx = startX;
  viewport.cy = startY;
  viewport.zoom = 5;

  renderTurn();
}

// ─── Turn rendering ─────────────────────────────────────────────
async function renderTurn() {
  if (!terrain || !terrainBuffer || !gameState) return;

  // Centre map on player
  viewport.cx = gameState.position.x;
  viewport.cy = gameState.position.y;

  // Render map with player marker
  renderViewport(canvas, terrainBuffer, terrain, viewport);
  drawPlayerMarker();

  // Query world at player position
  const world = queryWorld(terrain, gameState.position.x, gameState.position.y);

  // Build situation for voice
  const situation = buildSituation(world, gameState);

  // Match fragments
  const matched = matchFragments(fragments, situation, 4);

  // Generate description
  let description = "";
  const apiKey = loadApiKey();

  if (matched.length > 0) {
    if (apiKey) {
      textPanel.innerHTML = '<p class="generating">The land speaks...</p>';
      try {
        description = await generateVoice(apiKey, situation, matched);
      } catch {
        description = matched.map(m => m.fragment.text).join(" ");
      }
    } else {
      description = matched.map(m => m.fragment.text).join(" ");
    }
  } else {
    description = "You stand in the landscape. The wind moves.";
  }

  // Display description
  textPanel.innerHTML = `<p>${description}</p>`;

  // Generate and display choices
  const choices = generateChoices(world);
  renderChoices(choices);

  // Update status
  const timeNames = ["dawn", "morning", "midday", "afternoon", "dusk", "night"];
  const seasonNames = ["Spring", "Summer", "Autumn", "Winter"];
  const timeOfDay = timeNames[Math.min(5, Math.floor(gameState.time.hour / 4))];
  statusBar.textContent =
    `${world.geoInfo.label} · ${world.altitudeMetres}m · ${seasonNames[gameState.time.season]} · ${timeOfDay} · ${gameState.weather.type}`;
}

function renderChoices(choices: Choice[]) {
  choicesPanel.innerHTML = "";
  for (const choice of choices) {
    const btn = document.createElement("button");
    btn.className = "choice-btn";
    btn.textContent = choice.text;
    btn.addEventListener("click", () => makeChoice(choice));
    choicesPanel.appendChild(btn);
  }
}

function makeChoice(choice: Choice) {
  if (!gameState || isGenerating) return;
  isGenerating = true;

  // Move player
  gameState.position.x += choice.dx;
  gameState.position.y += choice.dy;

  // Clamp to map bounds
  gameState.position.x = Math.max(0, Math.min(MAP_WIDTH - 1, gameState.position.x));
  gameState.position.y = Math.max(0, Math.min(MAP_HEIGHT - 1, gameState.position.y));

  // Advance time
  for (let i = 0; i < choice.timeCost; i++) {
    advanceTime(gameState);
  }

  // Simple weather changes (random, placeholder)
  if (Math.random() < 0.15) {
    const weathers: GameState["weather"]["type"][] = [
      "clear", "clear", "clear", "rain", "drizzle", "fog", "wind", "haze"
    ];
    gameState.weather.type = weathers[Math.floor(Math.random() * weathers.length)];
  }

  renderTurn().then(() => { isGenerating = false; });
}

function drawPlayerMarker() {
  const ctx = canvas.getContext("2d");
  if (!ctx || !terrain) return;

  const baseScale = Math.min(canvas.width / terrain.width, canvas.height / terrain.height);
  const scale = baseScale * viewport.zoom;
  const viewW = canvas.width / scale;
  const viewH = canvas.height / scale;
  let sx = viewport.cx - viewW / 2;
  let sy = viewport.cy - viewH / 2;
  sx = Math.max(0, Math.min(terrain.width - viewW, sx));
  sy = Math.max(0, Math.min(terrain.height - viewH, sy));

  if (!gameState) return;
  const px = (gameState.position.x - sx) * scale;
  const py = (gameState.position.y - sy) * scale;

  // Outer ring
  ctx.beginPath();
  ctx.arc(px, py, 6, 0, Math.PI * 2);
  ctx.strokeStyle = "#1c1a17";
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // Inner dot
  ctx.beginPath();
  ctx.arc(px, py, 4, 0, Math.PI * 2);
  ctx.fillStyle = "#e8d8b8";
  ctx.fill();
  ctx.strokeStyle = "#8a7a60";
  ctx.lineWidth = 1;
  ctx.stroke();
}

// ─── Map click to move ──────────────────────────────────────────
canvas.addEventListener("click", (e) => {
  if (!terrain || !gameState) return;
  const pos = canvasToTerrain(canvas, terrain, viewport, e.clientX, e.clientY);
  if (!pos) return;

  const cell = terrain.cells[pos.y][pos.x];
  if (cell.geology === GeologyType.Water || cell.geology === GeologyType.Ice) return;

  // Only allow clicking adjacent cells (within 2 cells)
  const dx = pos.x - gameState.position.x;
  const dy = pos.y - gameState.position.y;
  if (Math.abs(dx) <= 2 && Math.abs(dy) <= 2 && (dx !== 0 || dy !== 0)) {
    const choice: Choice = {
      id: "click-move",
      text: "Move",
      dx: Math.sign(dx),
      dy: Math.sign(dy),
      timeCost: 1,
    };
    makeChoice(choice);
  }
});
GAMEMAIN

# ─── Game: map renderer (extracted from terrain-viewer) ──────────

cat > packages/game/src/map-renderer.ts << 'MAPRENDER'
/**
 * Simplified map renderer for the game view.
 * Imports terrain types but renders locally — the game doesn't need
 * all the terrain-viewer's features (zoom tiers, high-res patches).
 */

import type { TerrainMap } from "@barrow/terrain";
import { GEOLOGY_INFO, GeologyType } from "@barrow/terrain";

export interface Viewport {
  cx: number;
  cy: number;
  zoom: number;
}

export function renderTerrainToBuffer(terrain: TerrainMap): ImageData {
  const { width, height, cells } = terrain;
  const imageData = new ImageData(width, height);
  const data = imageData.data;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const cell = cells[y][x];
      const idx = (y * width + x) * 4;
      const geoInfo = GEOLOGY_INFO[cell.geology];
      if (!geoInfo) { data[idx+3] = 255; continue; }
      const base = hexToRgb(geoInfo.color);

      const shade = cell.geology === GeologyType.Water ? 1.0
        : cell.geology === GeologyType.Ice ? 0.92 + cell.altitude * 0.10
        : 0.7 + cell.altitude * 0.6;

      let r = base.r * shade, g = base.g * shade, b = base.b * shade;

      if (cell.geology === GeologyType.Water) {
        const d = 0.6 + cell.altitude * 1.8;
        r = base.r * d; g = base.g * d; b = base.b * d;
      }

      // Simple hillshading
      if (cell.geology !== GeologyType.Water && y > 0 && y < height-1 && x > 0 && x < width-1) {
        const dzdx = (cells[y][x+1].altitude - cells[y][x-1].altitude) * 0.5;
        const dzdy = (cells[y-1][x].altitude - cells[y+1][x].altitude) * 0.5;
        const zf = 8.0;
        const snx2 = -dzdx * zf, sny2 = -dzdy * zf;
        const dot = snx2 * (-0.5) + sny2 * 0.5 + 0.707;
        const hs = Math.max(0, dot / Math.sqrt(snx2*snx2 + sny2*sny2 + 1));
        const sf = 0.7 + hs * 0.6;
        r *= sf; g *= sf; b *= sf;
      }

      if (cell.riverFlow > 0) {
        const ri = Math.min(1, cell.riverFlow / 500);
        const blend = 0.6 + ri * 0.3;
        r = r*(1-blend) + 50*blend;
        g = g*(1-blend) + (70+ri*20)*blend;
        b = b*(1-blend) + (100+ri*30)*blend;
      }

      data[idx] = clamp(r); data[idx+1] = clamp(g); data[idx+2] = clamp(b); data[idx+3] = 255;
    }
  }
  return imageData;
}

export function renderViewport(
  canvas: HTMLCanvasElement, buffer: ImageData,
  terrain: TerrainMap, viewport: Viewport
): void {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const cw = canvas.width, ch = canvas.height;
  ctx.fillStyle = "#1c1a17";
  ctx.fillRect(0, 0, cw, ch);

  const offscreen = new OffscreenCanvas(terrain.width, terrain.height);
  const offCtx = offscreen.getContext("2d");
  if (!offCtx) return;
  offCtx.putImageData(buffer, 0, 0);

  const baseScale = Math.min(cw / terrain.width, ch / terrain.height);
  const scale = baseScale * viewport.zoom;
  const viewW = cw / scale, viewH = ch / scale;
  let sx = Math.max(0, Math.min(terrain.width - viewW, viewport.cx - viewW/2));
  let sy = Math.max(0, Math.min(terrain.height - viewH, viewport.cy - viewH/2));

  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(offscreen, sx, sy, viewW, viewH, 0, 0, cw, ch);
}

export function canvasToTerrain(
  canvas: HTMLCanvasElement, terrain: TerrainMap,
  viewport: Viewport, clientX: number, clientY: number
): { x: number; y: number } | null {
  const rect = canvas.getBoundingClientRect();
  const cx2 = (clientX - rect.left) * (canvas.width / rect.width);
  const cy2 = (clientY - rect.top) * (canvas.height / rect.height);
  const cw = canvas.width, ch = canvas.height;
  const baseScale = Math.min(cw / terrain.width, ch / terrain.height);
  const scale = baseScale * viewport.zoom;
  const viewW = cw / scale, viewH = ch / scale;
  let sx = Math.max(0, Math.min(terrain.width - viewW, viewport.cx - viewW/2));
  let sy = Math.max(0, Math.min(terrain.height - viewH, viewport.cy - viewH/2));
  const tx = Math.floor(sx + cx2 / scale);
  const ty = Math.floor(sy + cy2 / scale);
  if (tx >= 0 && tx < terrain.width && ty >= 0 && ty < terrain.height) return { x: tx, y: ty };
  return null;
}

function hexToRgb(hex: string) {
  const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!r) return { r: 128, g: 128, b: 128 };
  return { r: parseInt(r[1],16), g: parseInt(r[2],16), b: parseInt(r[3],16) };
}

function clamp(v: number) { return Math.min(255, Math.max(0, Math.round(v))); }
MAPRENDER

# ─── Game: index.html ────────────────────────────────────────────

cat > packages/game/index.html << 'GAMEHTML'
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>The Barrow</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&display=swap');

    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      background: #1c1a17;
      color: #c4b9a8;
      font-family: 'EB Garamond', Georgia, serif;
      height: 100vh;
      overflow: hidden;
    }

    .start-screen {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100vh;
      gap: 20px;
    }

    .start-screen h1 {
      font-size: 28px;
      font-weight: 400;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      color: #8a8078;
    }

    .start-screen .tagline {
      font-size: 15px;
      color: #5a5248;
      font-style: italic;
      margin-bottom: 20px;
    }

    .start-controls {
      display: flex;
      gap: 10px;
      align-items: center;
    }

    .start-controls input {
      background: #2a2620;
      border: 1px solid #3a3630;
      color: #c4b9a8;
      padding: 8px 12px;
      font-family: inherit;
      font-size: 14px;
      width: 160px;
      border-radius: 4px;
    }

    .start-controls button {
      background: #2e2a22;
      border: 1px solid #5a5040;
      color: #b8a88a;
      padding: 8px 20px;
      font-family: inherit;
      font-size: 14px;
      cursor: pointer;
      border-radius: 4px;
    }

    .start-controls button:hover { background: #3e3a32; }

    /* ─── Game layout ─── */
    .game-layout {
      display: none;
      height: 100vh;
    }

    .game-layout.active {
      display: flex;
    }

    .map-panel {
      width: 400px;
      min-width: 300px;
      border-right: 1px solid #2a2620;
      display: flex;
      flex-direction: column;
    }

    .map-panel canvas {
      flex: 1;
      width: 100%;
    }

    .text-game-panel {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    #status {
      padding: 8px 24px;
      font-size: 12px;
      color: #5a5248;
      letter-spacing: 0.05em;
      border-bottom: 1px solid #2a2620;
    }

    #text-panel {
      flex: 1;
      padding: 32px 36px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }

    #text-panel p {
      font-size: 19px;
      line-height: 1.75;
      color: #d4caba;
      max-width: 520px;
    }

    #text-panel .generating {
      color: #5a5248;
      font-style: italic;
      font-size: 14px;
    }

    #choices {
      padding: 16px 36px 24px;
      border-top: 1px solid #2a2620;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .choice-btn {
      background: #222018;
      border: 1px solid #3a3630;
      color: #b0a890;
      padding: 10px 16px;
      font-family: inherit;
      font-size: 15px;
      cursor: pointer;
      border-radius: 4px;
      text-align: left;
      transition: all 0.15s;
    }

    .choice-btn:hover {
      background: #2e2a22;
      border-color: #5a5040;
      color: #d4c4a0;
    }

    @media (max-width: 768px) {
      .game-layout.active { flex-direction: column; }
      .map-panel { width: 100%; height: 200px; min-width: auto; border-right: none; border-bottom: 1px solid #2a2620; }
    }
  </style>
</head>
<body>
  <div class="start-screen" id="start-screen">
    <h1>The Barrow</h1>
    <p class="tagline">You emerge from the dark into daylight.</p>
    <div class="start-controls">
      <input type="text" id="seed" placeholder="World seed" value="barrow" />
      <button id="start-btn">Begin</button>
    </div>
  </div>

  <div class="game-layout" id="game-layout">
    <div class="map-panel">
      <canvas id="map"></canvas>
    </div>
    <div class="text-game-panel">
      <div id="status"></div>
      <div id="text-panel"></div>
      <div id="choices"></div>
    </div>
  </div>

  <script type="module" src="/src/main.ts"></script>
</body>
</html>
GAMEHTML

# Update main.ts to show/hide start screen
cat >> packages/game/src/main.ts << 'STARTSCREEN'

// ─── Start screen toggle ────────────────────────────────────────
const startScreen = document.getElementById("start-screen")!;
const gameLayout = document.getElementById("game-layout")!;

const originalStartGame = startGame;
// @ts-ignore — override to handle UI transition
function startGameWithUI(seed: string) {
  startScreen.style.display = "none";
  gameLayout.classList.add("active");

  // Resize canvas to fit panel
  const mapPanel = document.querySelector(".map-panel") as HTMLElement;
  canvas.width = mapPanel.clientWidth;
  canvas.height = mapPanel.clientHeight;

  originalStartGame(seed);
}

// Re-bind start button
startBtn.removeEventListener("click", () => {});
startBtn.addEventListener("click", () => {
  const seed = seedInput.value.trim() || DEFAULT_SEED;
  startGameWithUI(seed);
});
STARTSCREEN

# ─── GitHub Pages workflow (builds all three apps) ───────────────

mkdir -p .github/workflows

cat > .github/workflows/deploy.yml << 'DEPLOY'
name: Deploy to GitHub Pages

on:
  push:
    branches: ["main"]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: "npm"
      - name: Install dependencies
        run: npm ci
      - name: Build game
        run: npm run build:game
      - name: Build terrain viewer
        run: npm run build:terrain-viewer
      - name: Build voice tester
        run: npm run build:voice-tester
      - name: Combine builds
        run: |
          mkdir -p combined
          cp -r packages/game/dist/* combined/
          mkdir -p combined/terrain
          cp -r packages/terrain-viewer/dist/* combined/terrain/
          mkdir -p combined/voice
          cp -r packages/voice-tester/dist/* combined/voice/
      - name: Setup Pages
        uses: actions/configure-pages@v4
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: "combined"

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
DEPLOY

echo ""
echo "=== Monorepo structure created ==="
echo ""
echo "Directory structure:"
echo "  packages/terrain/         — core generation (noise, geology, terrain, habitation)"
echo "  packages/terrain-viewer/  — map viewer UI"
echo "  packages/voice/           — voice system (fragments, matcher, LLM)"
echo "  packages/voice-tester/    — voice tester UI"
echo "  packages/game/            — the walker (THE ACTUAL GAME)"
echo ""
echo "Next steps:"
echo ""
echo "1. Copy your terrain code:"
echo "   cp ../barrow-terrain/src/noise.ts packages/terrain/src/"
echo "   cp ../barrow-terrain/src/geology.ts packages/terrain/src/"
echo "   cp ../barrow-terrain/src/terrain.ts packages/terrain/src/"
echo "   cp ../barrow-terrain/src/habitation.ts packages/terrain/src/  (if it exists)"
echo "   cp ../barrow-terrain/src/renderer.ts packages/terrain-viewer/src/"
echo "   cp ../barrow-terrain/src/main.ts packages/terrain-viewer/src/"
echo "   cp ../barrow-terrain/index.html packages/terrain-viewer/"
echo ""
echo "2. Copy your voice code:"
echo "   cp ../barrow-voice/src/tags.ts packages/voice/src/"
echo "   cp ../barrow-voice/src/fragments.ts packages/voice/src/"
echo "   cp ../barrow-voice/src/matcher.ts packages/voice/src/"
echo "   cp ../barrow-voice/src/llm.ts packages/voice/src/"
echo "   cp ../barrow-voice/src/store.ts packages/voice/src/"
echo "   cp ../barrow-voice/src/main.ts packages/voice-tester/src/"
echo "   cp ../barrow-voice/index.html packages/voice-tester/"
echo ""
echo "3. Update imports in the copied files:"
echo "   In terrain-viewer: change './noise' to '@barrow/terrain'"
echo "   In voice-tester: change './tags' etc to '@barrow/voice'"
echo ""
echo "4. Install and test:"
echo "   npm install"
echo "   npm run dev:game"
echo ""
echo "Once deployed, the URLs will be:"
echo "   Game:           https://yourusername.github.io/the-barrow/"
echo "   Terrain viewer: https://yourusername.github.io/the-barrow/terrain/"
echo "   Voice tester:   https://yourusername.github.io/the-barrow/voice/"
echo ""