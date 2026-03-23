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
