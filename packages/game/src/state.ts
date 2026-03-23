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
