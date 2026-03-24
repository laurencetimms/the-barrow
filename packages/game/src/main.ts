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
const MAP_WIDTH  = 300;
const MAP_HEIGHT = 500;
const DEFAULT_SEED = "barrow";
const PAGE_WORD_LIMIT = 350;

// Fragment counts by mode
const FRAGMENT_COUNTS: Record<DescriptionMode, number> = {
  full: 4, reorientation: 3, movement: 2, transition: 2, tarry: 1,
};

// ─── Page behaviour by mode × decision timing ────────────────────
interface PageBehavior {
  shouldClear: boolean;
  appendMarginPx: number; // 0 = use CSS default when shouldClear
  choicesDelayMs: number;
}

function getPageBehavior(mode: DescriptionMode, decisionMs: number): PageBehavior {
  switch (mode) {
    case "full":
      return { shouldClear: true,  appendMarginPx: 0,  choicesDelayMs: 3000 };
    case "reorientation":
      return { shouldClear: true,  appendMarginPx: 0,  choicesDelayMs: 2500 };
    case "transition":
      return { shouldClear: false, appendMarginPx: 20, choicesDelayMs: 1500 };
    case "movement":
      if (decisionMs < 5_000)  return { shouldClear: false, appendMarginPx: 10, choicesDelayMs:  800 };
      if (decisionMs < 30_000) return { shouldClear: false, appendMarginPx: 16, choicesDelayMs: 1500 };
      return                         { shouldClear: false, appendMarginPx: 28, choicesDelayMs: 2000 };
    case "tarry":
      // Rapid accumulation: keep appending. Slower: clear to signal mode shift.
      if (decisionMs < 10_000) return { shouldClear: false, appendMarginPx: 16, choicesDelayMs: 1000 };
      return                         { shouldClear: true,  appendMarginPx: 0,  choicesDelayMs: 1500 };
  }
}

// ─── State ──────────────────────────────────────────────────────
let terrain:     TerrainMap | null = null;
let gameState:   GameState  | null = null;
let fragments:   Fragment[]        = [];
let isGenerating                   = false;

// When choices were last shown — used to compute decisionTime and detect absence
let choicesShownAt = Date.now();

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

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(w => w.length > 0).length;
}

function pageWordCount(): number {
  const paras = Array.from(textPanel.querySelectorAll("p:not(.generating)")) as HTMLElement[];
  return paras.reduce((n, p) => n + countWords(p.textContent ?? ""), 0);
}

/** Fade out and remove oldest paragraphs until adding newText would fit within the limit. */
async function enforcePageCapacity(newText: string): Promise<void> {
  const incoming = countWords(newText);
  while (pageWordCount() + incoming > PAGE_WORD_LIMIT) {
    const paras = textPanel.querySelectorAll("p:not(.generating)");
    if (paras.length <= 1) break; // never empty the page entirely
    const oldest = paras[0] as HTMLElement;
    oldest.style.transition = "opacity 0.4s";
    oldest.style.opacity = "0";
    await wait(420);
    oldest.remove();
  }
}

function appendText(
  text: string,
  className?: string,
  marginTopPx?: number,
): HTMLParagraphElement {
  const p = document.createElement("p");
  if (className)            p.className    = className;
  if (marginTopPx !== undefined) p.style.marginTop = `${marginTopPx}px`;
  p.textContent  = text;
  p.style.opacity = "0";
  textPanel.appendChild(p);
  // Trigger fade-in on the next paint cycle
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      p.style.transition = "opacity 0.5s";
      p.style.opacity    = "1";
    });
  });
  setTimeout(() => p.scrollIntoView({ behavior: "smooth", block: "nearest" }), 50);
  return p;
}

function hideChoices(): void {
  choicesPanel.style.transition = "";
  choicesPanel.style.opacity    = "0";
  choicesPanel.innerHTML        = "";
}

function showChoices(choices: Choice[], delayMs: number): void {
  choicesShownAt = Date.now();
  choicesPanel.innerHTML = "";
  for (const choice of choices) {
    const btn = document.createElement("button");
    btn.textContent = choice.text;
    btn.addEventListener("click", () => makeChoice(choice));
    choicesPanel.appendChild(btn);
  }
  setTimeout(() => {
    choicesPanel.style.transition = "opacity 0.5s";
    choicesPanel.style.opacity    = "1";
  }, delayMs);
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

  statusBar.textContent =
    `${world.geoInfo.label} · ${world.altitudeMetres}m · ${seasonLabel} · ${timeLabel} · ${weatherLabels[state.weather.type] ?? state.weather.type}`;
}

// ─── Start game ──────────────────────────────────────────────────

startBtn.addEventListener("click", () => {
  const seed = seedInput.value.trim() || DEFAULT_SEED;
  startScreen.style.display = "none";
  gameLayout.style.display  = "flex";
  startGame(seed);
});

function startGame(seed: string): void {
  const noise = createSeededNoise(seed);
  terrain = generateTerrain(noise, MAP_WIDTH, MAP_HEIGHT, seed);

  let startX = Math.floor(MAP_WIDTH  * 0.45);
  let startY = Math.floor(MAP_HEIGHT * 0.80);
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
  choicesShownAt = Date.now();
  renderTurn(0);   // first turn — no prior decision time
}

// ─── Turn rendering ──────────────────────────────────────────────

async function renderTurn(decisionMs: number): Promise<void> {
  if (!terrain || !gameState) return;

  const world = queryWorld(terrain, gameState.position.x, gameState.position.y);
  updateStatus(world, gameState);

  // Context and mode selection
  const currContext = buildContext(world, gameState.weather.type, gameState.time.hour);
  const isTarrying  = gameState.tarryCount > 0;
  const { mode, transitionWhat } = selectMode(
    gameState.prevContext, currContext, choicesShownAt, isTarrying,
  );

  const behavior  = getPageBehavior(mode, decisionMs);
  const fragCount = FRAGMENT_COUNTS[mode];

  // Prepare page
  hideChoices();
  if (behavior.shouldClear) {
    await clearPage();
  }

  // Fragment matching and voice generation
  const situation   = buildSituation(world, gameState);
  const matched     = matchFragments(fragments, situation, fragCount);
  const apiKey      = loadApiKey();
  const instruction = getModeInstruction(mode, gameState.tarryCount, transitionWhat);

  // Show loading indicator (append mode only — clear mode has no prior text context to lose)
  let loadingP: HTMLParagraphElement | null = null;
  if (apiKey && matched.length > 0) {
    loadingP = appendText(
      "The land speaks\u2026",
      "generating",
      behavior.shouldClear ? undefined : behavior.appendMarginPx,
    );
  }

  let description = "";
  if (matched.length > 0) {
    if (apiKey) {
      try {
        description = await generateVoice(apiKey, situation, matched, {
          instruction,
          recentDescriptions: gameState.recentDescriptions,
        });
      } catch {
        description = fallbackText(matched, mode);
      }
    } else {
      description = fallbackText(matched, mode);
    }
  } else {
    description = fallbackText([], mode);
  }

  // Remove loading indicator, then enforce page capacity before appending
  loadingP?.remove();
  if (!behavior.shouldClear) {
    await enforcePageCapacity(description);
  }

  appendText(description, undefined, behavior.shouldClear ? undefined : behavior.appendMarginPx);

  // Persist context updates
  gameState.prevContext = currContext;
  gameState.recentDescriptions = [description, ...gameState.recentDescriptions].slice(0, 3);

  const choices = generateChoices(world);
  showChoices(choices, behavior.choicesDelayMs);
}

// ─── Fallback text (no API key or no fragments) ───────────────────

function fallbackText(
  matched: { fragment: { text: string }; score: number }[],
  mode: DescriptionMode,
): string {
  if (matched.length === 0) {
    if (mode === "movement")   return "The path continues.";
    if (mode === "tarry")      return "Stillness.";
    if (mode === "transition") return "Something has changed.";
    return "You stand in the landscape. The wind moves.";
  }
  if (mode === "full" || mode === "reorientation") {
    return matched.map(m => m.fragment.text).join(" ");
  }
  return matched[0].fragment.text;
}

// ─── Make a choice ───────────────────────────────────────────────

function makeChoice(choice: Choice): void {
  if (!gameState || isGenerating) return;
  isGenerating = true;

  const decisionMs = Date.now() - choicesShownAt;

  // Maintain tarry counter
  if (choice.dx === 0 && choice.dy === 0) {
    gameState.tarryCount++;
  } else {
    gameState.tarryCount = 0;
  }

  gameState.position.x = Math.max(0, Math.min(MAP_WIDTH  - 1, gameState.position.x + choice.dx));
  gameState.position.y = Math.max(0, Math.min(MAP_HEIGHT - 1, gameState.position.y + choice.dy));

  for (let i = 0; i < choice.timeCost; i++) advanceTime(gameState);

  // Placeholder weather drift
  if (Math.random() < 0.15) {
    const pool: GameState["weather"]["type"][] = [
      "clear", "clear", "clear", "rain", "drizzle", "fog", "wind", "haze",
    ];
    gameState.weather.type = pool[Math.floor(Math.random() * pool.length)];
  }

  renderTurn(decisionMs).then(() => { isGenerating = false; });
}

// ─── Keyboard shortcuts ──────────────────────────────────────────

document.addEventListener("keydown", (e: KeyboardEvent) => {
  const num = parseInt(e.key);
  if (num >= 1 && num <= 9) {
    const btns = choicesPanel.querySelectorAll("button");
    (btns[num - 1] as HTMLButtonElement | undefined)?.click();
  }
});
