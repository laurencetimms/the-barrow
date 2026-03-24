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
  countScoredFragments,
  generateVoice,
} from "@the-barrow/voice";
import type { Fragment } from "@the-barrow/voice";
import { updateDebugPanel } from "./debug-panel";
import { createInitialState, advanceTime, getTimeTag, getSeasonTag, GameState } from "./state";
import { queryWorld, WorldQuery } from "./world";
import { buildSituation } from "./situation";
import { generateChoices, Choice } from "./choices";
import { buildContext, selectMode, getModeInstruction, DescriptionMode } from "./context";
import { computeVisibilityRadius, updateVisitedGrid, renderMemoryMap } from "./memory-map";

// ─── Config ──────────────────────────────────────────────────────
const MAP_WIDTH  = 300;
const MAP_HEIGHT = 500;
const DEFAULT_SEED   = "barrow";
const PAGE_WORD_LIMIT = 350;

const FRAGMENT_COUNTS: Record<DescriptionMode, number> = {
  full: 4, reorientation: 3, movement: 2, transition: 2, tarry: 1,
};

// ─── Opening sequence text ───────────────────────────────────────
const BARROW_LINES = [
  "Dark.",
  "Stone above you, close. The smell of earth.",
  "Your hands find the wall. Rough. Cold.",
  "Ahead — not dark. Grey. A different dark.",
  "You move toward it.",
] as const;

// ─── Page behaviour by mode × decision timing ────────────────────
interface PageBehavior {
  shouldClear:    boolean;
  appendMarginPx: number;
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
      if (decisionMs < 10_000) return { shouldClear: false, appendMarginPx: 16, choicesDelayMs: 1000 };
      return                         { shouldClear: true,  appendMarginPx: 0,  choicesDelayMs: 1500 };
  }
}

// ─── Module state ────────────────────────────────────────────────
let terrain:          TerrainMap | null = null;
let gameState:        GameState  | null = null;
let fragments:        Fragment[]        = [];
let isGenerating                        = false;
let choicesShownAt                      = 0;
let turnNumber                          = 0; // player choices made post-opening
let mapExpanded                         = false;
let lastClearReason                     = "—";
let weatherChangeTurn                   = 0;

// ─── DOM ─────────────────────────────────────────────────────────
const startScreen    = document.getElementById("start-screen")     as HTMLElement;
const gameLayout     = document.getElementById("game-layout")      as HTMLElement;
const debugPanel     = document.getElementById("debug-panel")      as HTMLElement;
const statusBar      = document.getElementById("status")           as HTMLElement;
const textPanel      = document.getElementById("text-panel")       as HTMLElement;
const choicesPanel   = document.getElementById("choices")          as HTMLElement;
const mapCanvas      = document.getElementById("memory-map")       as HTMLCanvasElement;
const mapOverlay     = document.getElementById("map-overlay")      as HTMLElement;
const mapLargeCanvas = document.getElementById("memory-map-large") as HTMLCanvasElement;
const mapToggle      = document.getElementById("map-toggle")       as HTMLButtonElement;
const seedInput      = document.getElementById("seed")             as HTMLInputElement;
const startBtn       = document.getElementById("start-btn")        as HTMLButtonElement;

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
    p.style.opacity    = "0";
  }
  await wait(650);
  for (const p of paras) p.remove();
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(w => w.length > 0).length;
}

function pageWordCount(): number {
  return Array.from(textPanel.querySelectorAll("p:not(.generating)") as NodeListOf<HTMLElement>)
    .reduce((n, p) => n + countWords(p.textContent ?? ""), 0);
}

async function enforcePageCapacity(newText: string): Promise<void> {
  const incoming = countWords(newText);
  while (pageWordCount() + incoming > PAGE_WORD_LIMIT) {
    const all = textPanel.querySelectorAll("p:not(.generating)");
    if (all.length <= 1) break;
    const oldest = all[0] as HTMLElement;
    oldest.style.transition = "opacity 0.4s";
    oldest.style.opacity    = "0";
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
  if (className)             p.className    = className;
  if (marginTopPx !== undefined) p.style.marginTop = `${marginTopPx}px`;
  p.textContent  = text;
  p.style.opacity = "0";
  textPanel.appendChild(p);
  requestAnimationFrame(() => requestAnimationFrame(() => {
    p.style.transition = "opacity 0.5s";
    p.style.opacity    = "1";
  }));
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
  // Turns 0-3 (opening + first 3 player choices): enforce a 4s floor
  const effectiveDelay = turnNumber < 4 ? Math.max(delayMs, 4000) : delayMs;

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
  }, effectiveDelay);
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
    `${world.geoInfo.label} · ${world.altitudeMetres}m · ${seasonLabel} · ${timeLabel} · ${weatherLabels[state.weather.type] ?? state.weather.type} · ${state.position.x},${state.position.y}`;
}

// ─── Memory map ──────────────────────────────────────────────────

/**
 * Update the visited/walkCount grids then re-render both map canvases.
 * timeCostHours = 0 for the opening reveal (no movement yet).
 */
function drawMap(timeCostHours: number): void {
  if (!terrain || !gameState) return;
  const { x, y } = gameState.position;
  const cell      = terrain.cells[y][x];
  const visRadius = computeVisibilityRadius(cell, gameState.weather.type, gameState.time.hour);

  updateVisitedGrid(
    terrain, gameState.visitedGrid, gameState.walkCountGrid,
    x, y, visRadius, timeCostHours,
  );
  renderMemoryMap(
    mapCanvas, terrain,
    gameState.visitedGrid, gameState.walkCountGrid,
    gameState.memoryAnchors, x, y, visRadius,
  );
  if (mapExpanded) {
    renderMemoryMap(
      mapLargeCanvas, terrain,
      gameState.visitedGrid, gameState.walkCountGrid,
      gameState.memoryAnchors, x, y, visRadius,
    );
  }
}

function openMapOverlay(): void {
  if (!terrain || !gameState) return;
  mapExpanded = true;
  mapOverlay.classList.add("open");
  const { x, y } = gameState.position;
  const cell      = terrain.cells[y][x];
  const visRadius = computeVisibilityRadius(cell, gameState.weather.type, gameState.time.hour);
  renderMemoryMap(
    mapLargeCanvas, terrain,
    gameState.visitedGrid, gameState.walkCountGrid,
    gameState.memoryAnchors, x, y, visRadius,
  );
}

function closeMapOverlay(): void {
  mapExpanded = false;
  mapOverlay.classList.remove("open");
}

mapCanvas.addEventListener("click", () => openMapOverlay());
mapToggle.addEventListener("click", () => {
  if (mapExpanded) closeMapOverlay(); else openMapOverlay();
});
mapOverlay.addEventListener("click", (e) => {
  // Close when clicking the backdrop; ignore clicks on the canvas itself
  if (e.target === mapOverlay) closeMapOverlay();
});

// ─── Opening sequence ─────────────────────────────────────────────

/** Split prose into individual sentences for timed reveal. */
function splitSentences(text: string): string[] {
  return (text.match(/[^.!?]*[.!?]+/g) ?? [text])
    .map(s => s.trim())
    .filter(s => s.length > 0);
}

/** Append an opening-sequence line with its own colour and a 0.3s fade. */
function appendOpeningLine(text: string, color: string): void {
  const p = document.createElement("p");
  p.textContent   = text;
  p.style.color   = color;
  p.style.opacity = "0";
  textPanel.appendChild(p);
  requestAnimationFrame(() => requestAnimationFrame(() => {
    p.style.transition = "opacity 0.3s";
    p.style.opacity    = "1";
  }));
}

/** Generate the opening landscape description via the normal voice pipeline. */
async function generateOpeningDescription(): Promise<{ text: string; fragmentIds: string[] }> {
  if (!terrain || !gameState) {
    return { text: "The chalk is white underfoot. Sky above. Wind from the west.", fragmentIds: [] };
  }

  const world     = queryWorld(terrain, gameState.position.x, gameState.position.y);
  const situation = buildSituation(world, gameState);
  const matched   = matchFragments(fragments, situation, 4, gameState.recentFragmentIds);
  const apiKey    = loadApiKey();
  const ids       = matched.map(m => m.fragment.id);

  if (matched.length === 0) {
    return { text: "The chalk is white underfoot. Sky above, wide and pale. Wind moves across the ridge.", fragmentIds: [] };
  }
  if (apiKey) {
    try {
      const text = await generateVoice(apiKey, situation, matched, {
        instruction:
          "Weave these fragments into a 3–6 sentence description of the landscape outside the barrow. " +
          "This is the first moment of the game — the player has just emerged into daylight. " +
          "Lead with the ground, then sky, then one sound. End on stillness or distance.",
        recentDescriptions: [],
      });
      return { text, fragmentIds: ids };
    } catch {
      return { text: matched.map(m => m.fragment.text).join(" "), fragmentIds: ids };
    }
  }
  return { text: matched.map(m => m.fragment.text).join(" "), fragmentIds: ids };
}

async function playOpeningSequence(): Promise<void> {
  if (!terrain || !gameState) return;

  // ── Barrow interior ──────────────────────────────────────────
  await wait(2500);

  for (let i = 0; i < BARROW_LINES.length; i++) {
    appendOpeningLine(BARROW_LINES[i], "#8a8078");
    await wait(i < BARROW_LINES.length - 1 ? 3000 : 4000);
  }

  // ── Light ────────────────────────────────────────────────────
  appendOpeningLine("Light.", "#d4caba");

  // Background brightens very slightly over 2s
  document.body.style.transition       = "background-color 2s";
  document.body.style.backgroundColor = "#1e1c19";

  // Begin generating the landscape description while the player holds on "Light."
  const descriptionPromise = generateOpeningDescription();
  await wait(3000);

  // ── Landscape description ─────────────────────────────────────
  await clearPage();

  const { text: description, fragmentIds } = await descriptionPromise;
  const sentences = splitSentences(description);

  for (const sentence of sentences) {
    appendText(sentence);
    await wait(2500);
  }

  // ── Update game state ─────────────────────────────────────────
  const world = queryWorld(terrain, gameState.position.x, gameState.position.y);
  const currContext = buildContext(world, gameState.weather.type, gameState.time.hour);
  gameState.prevContext          = currContext;
  gameState.recentDescriptions   = [description];
  gameState.recentFragmentIds    = fragmentIds.slice(0, 15);
  updateStatus(world, gameState);

  // Initial map render (no time has passed yet, so timeCost = 0)
  drawMap(0);

  // ── First choices — 5s pause (section 11) ────────────────────
  const choices = generateChoices(world);
  showChoices(choices, 5000); // Math.max(5000, 4000) = 5000 since turnNumber = 0 < 4

  // Reveal status bar and map as choices fade in
  setTimeout(() => {
    statusBar.style.transition = "opacity 1s";
    statusBar.style.opacity    = "1";
    mapCanvas.classList.add("revealed");
    mapToggle.classList.add("revealed");
  }, 5000);
}

// ─── Game initialisation ─────────────────────────────────────────

function initGame(seed: string): void {
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

  gameState = createInitialState(seed, startX, startY, MAP_WIDTH, MAP_HEIGHT);
}

startBtn.addEventListener("click", async () => {
  const seed = seedInput.value.trim() || DEFAULT_SEED;

  // Fade out the start screen
  startScreen.style.transition = "opacity 0.5s";
  startScreen.style.opacity    = "0";
  await wait(500);
  startScreen.style.display = "none";

  // Reveal the game layout (status bar and map canvas start invisible via CSS)
  statusBar.style.opacity = "0";
  gameLayout.style.display = "flex";

  initGame(seed);
  await playOpeningSequence();
  // Normal makeChoice → renderTurn loop takes over after this
});

// ─── Turn rendering ───────────────────────────────────────────────

async function renderTurn(decisionMs: number): Promise<void> {
  if (!terrain || !gameState) return;

  const world = queryWorld(terrain, gameState.position.x, gameState.position.y);
  updateStatus(world, gameState);

  const currContext          = buildContext(world, gameState.weather.type, gameState.time.hour);
  const isTarrying           = gameState.tarryCount > 0;
  const { mode, transitionWhat } = selectMode(
    gameState.prevContext, currContext, choicesShownAt, isTarrying,
  );

  const behavior  = getPageBehavior(mode, decisionMs);
  const fragCount = FRAGMENT_COUNTS[mode];

  hideChoices();
  if (behavior.shouldClear) {
    lastClearReason = `${mode} mode (turn ${gameState.turns})`;
    await clearPage();
  }

  const situation    = buildSituation(world, gameState);
  const totalScored  = countScoredFragments(fragments, situation);
  const matched      = matchFragments(fragments, situation, fragCount, gameState.recentFragmentIds);
  const apiKey      = loadApiKey();
  const instruction = getModeInstruction(mode, gameState.tarryCount, transitionWhat);

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

  loadingP?.remove();
  if (!behavior.shouldClear) await enforcePageCapacity(description);

  appendText(description, undefined, behavior.shouldClear ? undefined : behavior.appendMarginPx);

  gameState.prevContext        = currContext;
  gameState.recentDescriptions = [description, ...gameState.recentDescriptions].slice(0, 3);
  gameState.recentFragmentIds  = [
    ...matched.map(m => m.fragment.id),
    ...gameState.recentFragmentIds,
  ].slice(0, 15);

  const choices = generateChoices(world);
  showChoices(choices, behavior.choicesDelayMs);

  updateDebugPanel(debugPanel, {
    state: gameState,
    world,
    currContext,
    prevContext: gameState.prevContext,
    mode,
    transitionWhat,
    decisionMs,
    voice: {
      situation,
      totalScored,
      matched,
      recentFragmentIds: gameState.recentFragmentIds,
      instruction,
    },
    choices,
    pageWordCount: pageWordCount(),
    lastClearReason,
    weatherChangeTurn,
    mapWidth:  MAP_WIDTH,
    mapHeight: MAP_HEIGHT,
  });
}

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

// ─── Make a choice ────────────────────────────────────────────────

function makeChoice(choice: Choice): void {
  if (!gameState || isGenerating) return;
  isGenerating = true;
  turnNumber++;

  const decisionMs = Date.now() - choicesShownAt;

  if (choice.dx === 0 && choice.dy === 0) {
    gameState.tarryCount++;
  } else {
    gameState.tarryCount = 0;
  }

  gameState.position.x = Math.max(0, Math.min(MAP_WIDTH  - 1, gameState.position.x + choice.dx));
  gameState.position.y = Math.max(0, Math.min(MAP_HEIGHT - 1, gameState.position.y + choice.dy));

  for (let i = 0; i < choice.timeCost; i++) advanceTime(gameState);

  drawMap(choice.timeCost);

  if (Math.random() < 0.15) {
    const pool: GameState["weather"]["type"][] = [
      "clear", "clear", "clear", "rain", "drizzle", "fog", "wind", "haze",
    ];
    const newWeather = pool[Math.floor(Math.random() * pool.length)];
    if (newWeather !== gameState.weather.type) {
      gameState.weather.type = newWeather;
      weatherChangeTurn = gameState.turns;
    }
  }

  renderTurn(decisionMs).then(() => { isGenerating = false; });
}

// ─── Keyboard shortcuts ───────────────────────────────────────────

document.addEventListener("keydown", (e: KeyboardEvent) => {
  if (e.key === "Escape") { closeMapOverlay(); return; }
  if (e.key === "m" || e.key === "M") {
    if (mapExpanded) closeMapOverlay(); else openMapOverlay();
    return;
  }
  if (e.key === "d" || e.key === "D") {
    debugPanel.classList.toggle("hidden");
    return;
  }
  const num = parseInt(e.key);
  if (num >= 1 && num <= 9) {
    (choicesPanel.querySelectorAll("button")[num - 1] as HTMLButtonElement | undefined)?.click();
  }
});
