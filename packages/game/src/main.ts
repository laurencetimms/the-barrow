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

// ─── Config ─────────────────────────────────────────────────────
const MAP_WIDTH = 300;
const MAP_HEIGHT = 500;
const DEFAULT_SEED = "barrow";
const CHOICES_DELAY_MS = 2000;

// ─── State ──────────────────────────────────────────────────────
let terrain: TerrainMap | null = null;
let gameState: GameState | null = null;
let fragments: Fragment[] = [];
let isGenerating = false;

// ─── DOM ────────────────────────────────────────────────────────
const startScreen  = document.getElementById("start-screen")  as HTMLElement;
const gameLayout   = document.getElementById("game-layout")   as HTMLElement;
const statusBar    = document.getElementById("status")        as HTMLElement;
const textPanel    = document.getElementById("text-panel")    as HTMLElement;
const choicesPanel = document.getElementById("choices")       as HTMLElement;
const seedInput    = document.getElementById("seed")          as HTMLInputElement;
const startBtn     = document.getElementById("start-btn")     as HTMLButtonElement;

// ─── Load fragments ─────────────────────────────────────────────
fragments = loadFragments();

// ─── Utilities ──────────────────────────────────────────────────

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

function appendText(text: string, className?: string): HTMLParagraphElement {
  const p = document.createElement("p");
  if (className) p.className = className;
  p.textContent = text;
  p.style.opacity = "0";
  textPanel.appendChild(p);
  // Trigger fade-in on next paint
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      p.style.transition = "opacity 0.5s";
      p.style.opacity = "1";
    });
  });
  // Scroll newest text into view
  setTimeout(() => p.scrollIntoView({ behavior: "smooth", block: "nearest" }), 50);
  return p;
}

function hideChoices(): void {
  choicesPanel.style.transition = "";
  choicesPanel.style.opacity = "0";
  choicesPanel.innerHTML = "";
}

function showChoices(choices: Choice[]): void {
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

// ─── Status bar ─────────────────────────────────────────────────

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

// ─── Start game ─────────────────────────────────────────────────

startBtn.addEventListener("click", () => {
  const seed = seedInput.value.trim() || DEFAULT_SEED;
  startScreen.style.display = "none";
  gameLayout.style.display = "flex";
  startGame(seed);
});

function startGame(seed: string): void {
  const noise = createSeededNoise(seed);
  terrain = generateTerrain(noise, MAP_WIDTH, MAP_HEIGHT, seed);

  // Find a valid starting position (not water or ice)
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
  renderTurn();
}

// ─── Turn rendering ─────────────────────────────────────────────

async function renderTurn(): Promise<void> {
  if (!terrain || !gameState) return;

  hideChoices();
  await clearPage();

  const world = queryWorld(terrain, gameState.position.x, gameState.position.y);
  updateStatus(world, gameState);

  const situation = buildSituation(world, gameState);
  const matched = matchFragments(fragments, situation, 4);
  const apiKey = loadApiKey();

  let description = "";

  if (matched.length > 0) {
    if (apiKey) {
      const loadingP = appendText("The land speaks\u2026", "generating");
      try {
        description = await generateVoice(apiKey, situation, matched);
      } catch {
        description = matched.map(m => m.fragment.text).join(" ");
      }
      loadingP.remove();
    } else {
      description = matched.map(m => m.fragment.text).join(" ");
    }
  } else {
    description = "You stand in the landscape. The wind moves.";
  }

  appendText(description);

  const choices = generateChoices(world);
  showChoices(choices);
}

// ─── Make a choice ───────────────────────────────────────────────

function makeChoice(choice: Choice): void {
  if (!gameState || isGenerating) return;
  isGenerating = true;

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
    const btn = btns[num - 1] as HTMLButtonElement | undefined;
    btn?.click();
  }
});
