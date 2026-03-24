/**
 * Memory map rendering.
 * Five layers: visited terrain, walked paths, sightline reveals, anchors, player marker.
 */

import { GEOLOGY_INFO, GeologyType } from "@the-barrow/terrain";
import type { TerrainMap, TerrainCell } from "@the-barrow/terrain";

// ─── Public types ────────────────────────────────────────────────

export interface MemoryAnchor {
  x: number;
  y: number;
  type: "settlement" | "sacred-site" | "event";
  distant?: boolean;  // spotted from high ground, not visited up close
  label?: string;
}

// ─── Constants ───────────────────────────────────────────────────

const BG = [28, 26, 23] as const;      // #1c1a17
const RIVER_RGB = [45, 85, 130] as const;

// ─── Colour helpers ──────────────────────────────────────────────

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff];
}

function lerp(a: number, b: number, t: number): number { return a + (b - a) * t; }
function clamp(v: number, lo: number, hi: number): number { return v < lo ? lo : v > hi ? hi : v; }

// Pre-cache geology → RGB so we're not re-parsing hex every frame
const GEO_RGB = new Map<string, [number, number, number]>();
function getGeoRgb(geology: string): [number, number, number] {
  if (!GEO_RGB.has(geology)) {
    const info = GEOLOGY_INFO[geology as GeologyType];
    GEO_RGB.set(geology, info ? hexToRgb(info.color) : [80, 80, 80]);
  }
  return GEO_RGB.get(geology)!;
}

// ─── Visibility ──────────────────────────────────────────────────

/** Compute how many cells the player can see from their current cell. */
export function computeVisibilityRadius(cell: TerrainCell, weather: string, hour: number): number {
  if (weather === "fog")  return 1;

  const isNight = hour < 4 || hour >= 20;
  const isDusk  = hour >= 17 && hour < 20;
  const moonlit = isNight && (hour < 2 || hour >= 22);

  if (isNight)  return moonlit ? 2 : 1;
  if (isDusk)   return 3;

  const alt = cell.altitude;
  const geo = cell.geology;

  // High open ground — far sight
  if (alt > 0.55 && geo !== GeologyType.Clay && geo !== GeologyType.Slate) {
    return weather === "clear" ? 10 : 6;
  }
  if (alt > 0.4) {
    return weather === "clear" ? 6 : 4;
  }

  // Dense woodland — very limited
  if (geo === GeologyType.Clay)  return 2;
  if (geo === GeologyType.Slate) return 4;

  return weather === "clear" ? 5 : 3;
}

// ─── Grid update (call once per turn after player moves) ──────────

/**
 * Decay all visited cells by timeCostHours, then mark cells within
 * visRadius as freshly seen (255). Apply sightline reveals for high ground.
 * Increments walkCount at the player's current position.
 */
export function updateVisitedGrid(
  terrain: TerrainMap,
  visitedGrid: Uint8Array,
  walkCountGrid: Uint8Array,
  playerX: number,
  playerY: number,
  visRadius: number,
  timeCostHours: number,
): void {
  const W = terrain.width;
  const H = terrain.height;
  const total = W * H;

  // 1. Decay all previously-seen cells
  if (timeCostHours > 0) {
    for (let i = 0; i < total; i++) {
      if (visitedGrid[i] > 0) {
        visitedGrid[i] = Math.max(0, visitedGrid[i] - timeCostHours) as unknown as number;
        // Uint8Array assignment accepts number; the cast silences TS noise
      }
    }
  }

  // 2. Immediate visibility circle → full freshness
  const x0 = Math.max(0, playerX - visRadius);
  const x1 = Math.min(W - 1, playerX + visRadius);
  const y0 = Math.max(0, playerY - visRadius);
  const y1 = Math.min(H - 1, playerY + visRadius);
  const r2 = visRadius * visRadius;

  for (let cy = y0; cy <= y1; cy++) {
    const dy = cy - playerY;
    for (let cx = x0; cx <= x1; cx++) {
      const dx = cx - playerX;
      if (dx * dx + dy * dy <= r2) {
        visitedGrid[cy * W + cx] = 255;
      }
    }
  }

  // 3. Sightline reveals when high up (visRadius > 6)
  if (visRadius > 6) {
    const sightRadius = Math.min(visRadius * 2, 24);
    const sr2 = sightRadius * sightRadius;
    const sx0 = Math.max(0, playerX - sightRadius);
    const sx1 = Math.min(W - 1, playerX + sightRadius);
    const sy0 = Math.max(0, playerY - sightRadius);
    const sy1 = Math.min(H - 1, playerY + sightRadius);
    for (let cy = sy0; cy <= sy1; cy++) {
      const dy = cy - playerY;
      for (let cx = sx0; cx <= sx1; cx++) {
        const dx = cx - playerX;
        const d2 = dx * dx + dy * dy;
        if (d2 > r2 && d2 <= sr2) {
          const idx = cy * W + cx;
          if (visitedGrid[idx] < 80) visitedGrid[idx] = 80;
        }
      }
    }
  }

  // 4. Increment walk count at player position (cap at 255)
  const playerIdx = playerY * W + playerX;
  if (walkCountGrid[playerIdx] < 255) walkCountGrid[playerIdx]++;
}

// ─── Render ──────────────────────────────────────────────────────

/**
 * Render the memory map to a canvas.
 * Compact view (≤200px wide): 3px/cell, ~60 cells across.
 * Expanded view (>200px wide): 6px/cell, ~90 cells across.
 */
export function renderMemoryMap(
  canvas: HTMLCanvasElement,
  terrain: TerrainMap,
  visitedGrid: Uint8Array,
  walkCountGrid: Uint8Array,
  anchors: MemoryAnchor[],
  playerX: number,
  playerY: number,
  visRadius: number,
): void {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const cw = canvas.width;
  const ch = canvas.height;
  const cellSize  = cw <= 200 ? 3 : 6;
  const cellsH    = Math.floor(cw / cellSize);
  const cellsV    = Math.floor(ch / cellSize);
  const halfH     = Math.floor(cellsH / 2);
  const halfV     = Math.floor(cellsV / 2);
  const startX    = playerX - halfH;
  const startY    = playerY - halfV;

  // ── ImageData pass: background + terrain cells ─────────────────
  const imageData = ctx.createImageData(cw, ch);
  const data = imageData.data;

  // Fill background
  for (let i = 0; i < data.length; i += 4) {
    data[i] = BG[0]; data[i + 1] = BG[1]; data[i + 2] = BG[2]; data[i + 3] = 255;
  }

  for (let cy = startY; cy < startY + cellsV; cy++) {
    if (cy < 0 || cy >= terrain.height) continue;
    const canvasY = (cy - startY) * cellSize;
    if (canvasY + cellSize > ch) continue;

    for (let cx = startX; cx < startX + cellsH; cx++) {
      if (cx < 0 || cx >= terrain.width) continue;
      const canvasX = (cx - startX) * cellSize;
      if (canvasX + cellSize > cw) continue;

      const gridIdx = cy * terrain.width + cx;
      const freshness = visitedGrid[gridIdx];
      if (freshness === 0) continue;

      const cell = terrain.cells[cy][cx];
      const t = freshness / 255; // 1 = full colour, 0 = background

      // Base geology colour
      let [r, g, b] = getGeoRgb(cell.geology);

      // Simple hillshading: compare altitude with east neighbour
      const nx = Math.min(cx + 1, terrain.width - 1);
      const shade = clamp(0.5 + (terrain.cells[cy][nx].altitude - cell.altitude) * 5, 0.25, 1.05);
      r = clamp(Math.round(r * shade), 0, 255);
      g = clamp(Math.round(g * shade), 0, 255);
      b = clamp(Math.round(b * shade), 0, 255);

      // River tint
      if (cell.riverFlow > 0) {
        const rf = Math.min(cell.riverFlow / 25, 1) * 0.45;
        r = Math.round(lerp(r, RIVER_RGB[0], rf));
        g = Math.round(lerp(g, RIVER_RGB[1], rf));
        b = Math.round(lerp(b, RIVER_RGB[2], rf));
      }

      // Desaturate progressively as freshness falls below 0.8
      if (t < 0.8) {
        const gray = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
        const ds = clamp((0.8 - t) / 0.8, 0, 1);
        r = Math.round(lerp(r, gray, ds));
        g = Math.round(lerp(g, gray, ds));
        b = Math.round(lerp(b, gray, ds));
      }

      // Blend toward dark background based on freshness
      r = Math.round(lerp(BG[0], r, t));
      g = Math.round(lerp(BG[1], g, t));
      b = Math.round(lerp(BG[2], b, t));

      // Write cell pixels
      for (let py = 0; py < cellSize; py++) {
        for (let px = 0; px < cellSize; px++) {
          const pi = ((canvasY + py) * cw + (canvasX + px)) * 4;
          data[pi] = r; data[pi + 1] = g; data[pi + 2] = b; data[pi + 3] = 255;
        }
      }
    }
  }

  ctx.putImageData(imageData, 0, 0);

  // ── Vector pass: walk-path overlay, anchors, player marker ─────

  // Walk-path overlay: cells walked ≥3 times get a faint lighter sheen
  ctx.globalAlpha = 0.22;
  ctx.fillStyle = "#c8b888";
  for (let cy = startY; cy < startY + cellsV; cy++) {
    if (cy < 0 || cy >= terrain.height) continue;
    for (let cx = startX; cx < startX + cellsH; cx++) {
      if (cx < 0 || cx >= terrain.width) continue;
      if (walkCountGrid[cy * terrain.width + cx] >= 3) {
        ctx.fillRect((cx - startX) * cellSize, (cy - startY) * cellSize, cellSize, cellSize);
      }
    }
  }
  ctx.globalAlpha = 1;

  // Memory anchors
  for (const anchor of anchors) {
    const ax = (anchor.x - startX) * cellSize + cellSize * 0.5;
    const ay = (anchor.y - startY) * cellSize + cellSize * 0.5;
    if (ax < 0 || ax > cw || ay < 0 || ay > ch) continue;

    ctx.beginPath();
    if (anchor.type === "sacred-site") {
      const s = (anchor.distant ? 2 : 3) * (cellSize / 3);
      ctx.moveTo(ax,     ay - s);
      ctx.lineTo(ax + s, ay);
      ctx.lineTo(ax,     ay + s);
      ctx.lineTo(ax - s, ay);
      ctx.closePath();
      ctx.fillStyle = anchor.distant ? "#907040" : "#c8b070";
    } else if (anchor.type === "settlement") {
      const r = (anchor.distant ? 1.5 : 2) * (cellSize / 3);
      ctx.arc(ax, ay, r, 0, Math.PI * 2);
      ctx.fillStyle = anchor.distant ? "#705028" : "#b08850";
    } else {
      ctx.arc(ax, ay, 2 * (cellSize / 3), 0, Math.PI * 2);
      ctx.fillStyle = "#909090";
    }
    ctx.fill();
  }

  // Player marker: small warm ring at map centre
  const pcx = halfH * cellSize + cellSize * 0.5;
  const pcy = halfV * cellSize + cellSize * 0.5;
  ctx.beginPath();
  ctx.arc(pcx, pcy, 3 * (cellSize / 3), 0, Math.PI * 2);
  ctx.strokeStyle = "#e8d8b8";
  ctx.lineWidth = Math.max(1, cellSize / 3);
  ctx.stroke();
}
