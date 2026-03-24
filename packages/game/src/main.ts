import {
  createSeededNoise,
  generateTerrain,
  GeologyType,
} from "@the-barrow/terrain";
import type { TerrainMap } from "@the-barrow/terrain";
import {
  loadFragments,
  loadApiKey,
  matchFragments,
  generateVoice,
} from "@the-barrow/voice";
import type { Fragment } from "@the-barrow/voice";
import { createInitialState, advanceTime, getTimeTag, getSeasonTag, GameState } from "./state";
import { queryWorld, WorldQuery } from "./world";
import { buildSituation } from "./situation";
import { generateChoices, Choice } from "./choices";
import { buildContext, selectMode, getModeInstruction, DescriptionMode } from "./context";

// ─── Config ─────────────────────────────────────────────────────
const MAP_WIDTH = 300;
const MAP_HEIGHT = 500;
const DEFAULT_SEED = "barrow";
const CHOICES_DELAY_MS = 2000;

// Fragment counts by mode — shorter modes need fewer fragments for the LLM
const FRAGMENT_COUNTS: Record<DescriptionMode, number> = {
  full: 4, reorientation: 3, movement: 2, transition: 2, tarry: 1,
};

// ─── State ──────────────────────────────────────────────────────
let terrain: TerrainMap | null = null;
let gameState: GameState | null = null;
let fragments: Fragment[] = [];
let isGenerating = false;

// Real-time timestamp of when current choices were shown (for absence detection)
let lastActionTime = Date.now();

// ─── DOM ────────────────────────────────────────────────────────
const startScreen  = document.getElementById("start-screen")  as HTMLElement;
const gameLayout   = document.getElementById("game-layout")   as HTMLElement;
const statusBar    = document.getElementById("status")        as HTMLElement;
const textPanel    = document.getElementById("text-panel")    as HTMLElement;
const choicesPanel = document.getElementById("choices")       as HTMLElement;
const seedInput    = document.getElementById("seed")          as HTMLInputElement;
const startBtn     = document.getElementById("start-btn")     as HTMLButtonElement;

fragments = loadFragments();

// ─── Page utilities ──────────────────────────────────────────────

function wait(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function clearPage(): Promise<void> {
  const paras = Array.from(textPanel.querySelectorAll("p")) as HTMLElement[];
  if (paras.length === 0) return;
  for (const p of paras) {
    p.style.transition = "opacity 0.6s";
    p.style.opacity = "0";
  }
  await wait(650);
  for (const p of paras) p.remove();
}

function appendText(
  text: string,
  className?: string,
  marginTopPx?: number,
): HTMLParagraphElement {
  const p = document.createElement("p");
  if (className) p.className = className;
  if (marginTopPx !== undefined) p.style.marginTop = `${marginTopPx}px`;
  p.textContent = text;
  p.style.opacity = "0";
  textPanel.appendChild(p);
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      p.style.transition = "opacity 0.5s";
      p.style.opacity = "1";
    });
  });
  setTimeout(() => p.scrollIntoView({ behavior: "smooth", block: "nearest" }), 50);
  return p;
}

function hideChoices(): void {
  choicesPanel.style.transition = "";
  choicesPanel.style.opacity = "0";
  choicesPanel.innerHTML = "";
}

function showChoices(choices: Choice[]): void {
  lastActionTime = Date.now();
  choicesPanel.innerHTML = "";
  for (const choice of choices) {
    const btn = document.createElement("button");
    btn.textContent = choice.text;
    btn.addEventListener("click", () => makeChoice(choice));
    choicesPanel.appendChild(btn);
  }
  setTimeout(() => {
    choicesPanel.style.transition = "opacity 0.5s";
    choicesPanel.style.opacity = "1";
  }, CHOICES_DELAY_MS);
}

// ─── Status bar ──────────────────────────────────────────────────

function updateStatus(world: WorldQuery, state: GameState): void {
  const phase = state.time.day < 10 ? "Early " : state.time.day < 20 ? "" : "Late ";
  const season = getSeasonTag(state.time.season);
  const seasonLabel = phase + season.charAt(0).toUpperCase() + season.slice(1);

  const time = getTimeTag(state.time.hour);
  const timeLabel = time.charAt(0).toUpperCase() + time.slice(1);

  const weatherLabels: Record<string, string> = {
    clear: "Clear", rain: "Rain", drizzle: "Drizzle",
    fog: "Fog", wind: "Wind", storm: "Storm",
    snow: "Snow", frost: "Frost", haze: "Haze",
  };
  const weatherLabel = weatherLabels[state.weather.type] ?? state.weather.type;

  statusBar.textContent =
    `${world.geoInfo.label} · ${world.altitudeMetres}m · ${seasonLabel} · ${timeLabel} · ${weatherLabel}`;
}

// ─── Start game ──────────────────────────────────────────────────

startBtn.addEventListener("click", () => {
  const seed = seedInput.value.trim() || DEFAULT_SEED;
  startScreen.style.display = "none";
  gameLayout.style.display = "flex";
  startGame(seed);
});

function startGame(seed: string): void {
  const noise = createSeededNoise(seed);
  terrain = generateTerrain(noise, MAP_WIDTH, MAP_HEIGHT, seed);

  let startX = Math.floor(MAP_WIDTH * 0.45);
  let startY = Math.floor(MAP_HEIGHT * 0.8);
  outer: for (let r = 0; r < 20; r++) {
    for (let dx = -r; dx <= r; dx++) {
      for (let dy = -r; dy <= r; dy++) {
        const nx = startX + dx, ny = startY + dy;
        if (nx < 0 || nx >= MAP_WIDTH || ny < 0 || ny >= MAP_HEIGHT) continue;
        const cell = terrain.cells[ny][nx];
        if (cell.geology !== GeologyType.Water && cell.geology !== GeologyType.Ice) {
          startX = nx; startY = ny;
          break outer;
        }
      }
    }
  }

  gameState = createInitialState(seed, startX, startY);
  lastActionTime = Date.now();
  renderTurn();
}

// ─── Turn rendering ──────────────────────────────────────────────

async function renderTurn(): Promise<void> {
  if (!terrain || !gameState) return;

  const world = queryWorld(terrain, gameState.position.x, gameState.position.y);
  updateStatus(world, gameState);

  // Build current perceptual context and select description mode
  const currContext = buildContext(world, gameState.weather.type, gameState.time.hour);
  const isTarrying = gameState.tarryCount > 0;
  const { mode, transitionWhat } = selectMode(
    gameState.prevContext, currContext, lastActionTime, isTarrying,
  );

  // Determine whether to clear or append, and the gap to use
  const shouldClear = mode === "full" || mode === "reorientation";
  const appendMargin = mode === "movement" ? 12 : 20; // px gap for tarry/transition

  if (shouldClear) {
    hideChoices();
    await clearPage();
  } else {
    hideChoices();
  }

  // Build voice situation and select fragments
  const situation = buildSituation(world, gameState);
  const fragCount = FRAGMENT_COUNTS[mode];
  const matched = matchFragments(fragments, situation, fragCount);
  const apiKey = loadApiKey();
  const instruction = getModeInstruction(mode, gameState.tarryCount, transitionWhat);

  let description = "";

  if (matched.length > 0) {
    if (apiKey) {
      const loadingP = appendText("The land speaks\u2026", "generating",
        shouldClear ? undefined : appendMargin);
      try {
        description = await generateVoice(apiKey, situation, matched, {
          instruction,
          recentDescriptions: gameState.recentDescriptions,
        });
      } catch {
        description = fallbackText(matched, mode);
      }
      loadingP.remove();
    } else {
      description = fallbackText(matched, mode);
    }
  } else {
    description = fallbackText([], mode);
  }

  appendText(description, undefined, shouldClear ? undefined : appendMargin);

  // Update state after description is generated
  gameState.prevContext = currContext;
  gameState.recentDescriptions = [
    description,
    ...gameState.recentDescriptions,
  ].slice(0, 3);

  const choices = generateChoices(world);
  showChoices(choices);
}

/** Fallback text when there are no fragments or no API key. */
function fallbackText(
  matched: { fragment: { text: string }; score: number }[],
  mode: DescriptionMode,
): string {
  if (matched.length === 0) {
    return mode === "movement" ? "The path continues." :
           mode === "tarry"    ? "Stillness." :
           mode === "transition" ? "Something has changed." :
           "You stand in the landscape. The wind moves.";
  }
  // For full/reorientation, join multiple fragments
  if (mode === "full" || mode === "reorientation") {
    return matched.map(m => m.fragment.text).join(" ");
  }
  // For shorter modes, just take the best-matching fragment
  return matched[0].fragment.text;
}

// ─── Make a choice ───────────────────────────────────────────────

function makeChoice(choice: Choice): void {
  if (!gameState || isGenerating) return;
  isGenerating = true;

  // Track tarrying vs movement
  if (choice.dx === 0 && choice.dy === 0) {
    gameState.tarryCount++;
  } else {
    gameState.tarryCount = 0;
  }

  gameState.position.x = Math.max(0, Math.min(MAP_WIDTH - 1, gameState.position.x + choice.dx));
  gameState.position.y = Math.max(0, Math.min(MAP_HEIGHT - 1, gameState.position.y + choice.dy));

  for (let i = 0; i < choice.timeCost; i++) {
    advanceTime(gameState);
  }

  // Placeholder weather drift
  if (Math.random() < 0.15) {
    const weathers: GameState["weather"]["type"][] = [
      "clear", "clear", "clear", "rain", "drizzle", "fog", "wind", "haze",
    ];
    gameState.weather.type = weathers[Math.floor(Math.random() * weathers.length)];
  }

  renderTurn().then(() => { isGenerating = false; });
}

// ─── Keyboard shortcuts ──────────────────────────────────────────

document.addEventListener("keydown", (e: KeyboardEvent) => {
  const num = parseInt(e.key);
  if (num >= 1 && num <= 9) {
    const btns = choicesPanel.querySelectorAll("button");
    (btns[num - 1] as HTMLButtonElement | undefined)?.click();
  }
});
