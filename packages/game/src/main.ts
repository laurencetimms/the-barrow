import {
  createSeededNoise,
  generateTerrain,
  GEOLOGY_INFO,
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
