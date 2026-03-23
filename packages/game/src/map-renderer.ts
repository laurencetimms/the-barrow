/**
 * Simplified map renderer for the game view.
 * Imports terrain types but renders locally — the game doesn't need
 * all the terrain-viewer's features (zoom tiers, high-res patches).
 */

import type { TerrainMap } from "@the-barrow/terrain";
import { GEOLOGY_INFO, GeologyType } from "@the-barrow/terrain";

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
