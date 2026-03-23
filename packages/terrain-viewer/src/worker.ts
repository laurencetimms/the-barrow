import { createSeededNoise } from "@the-barrow/terrain";
import { generateTerrain, generateHighResPatch, TerrainMap } from "@the-barrow/terrain";
import { bakeVegetationNoise, renderTerrainToBuffer } from "./renderer";

type WorkerRequest =
  | { type: "prepare"; seed: string }
  | { type: "patch"; x0: number; y0: number; w: number; h: number;
      resScale: number; showVegetation: boolean; requestId: number };

let terrain: TerrainMap | null = null;
let currentSeed: string | null = null;
let ready = false;

self.onmessage = (e: MessageEvent<WorkerRequest>) => {
  const msg = e.data;

  if (msg.type === "prepare") {
    ready = false;
    const { seed } = msg;
    if (seed !== currentSeed) {
      const noise = createSeededNoise(seed);
      terrain = generateTerrain(noise, 300, 500, seed);
      bakeVegetationNoise(terrain);
      currentSeed = seed;
    }
    ready = true;
    self.postMessage({ type: "ready" });

  } else if (msg.type === "patch") {
    const { x0, y0, w, h, resScale, showVegetation, requestId } = msg;

    if (!ready || !terrain || !currentSeed) {
      self.postMessage({ type: "notReady", requestId });
      return;
    }

    const noise = createSeededNoise(currentSeed);
    const patch = generateHighResPatch(terrain, noise, x0, y0, w, h, resScale);
    bakeVegetationNoise(patch);

    const imageData = renderTerrainToBuffer(patch, showVegetation);
    const tier: 2 | 3 = resScale <= 8 ? 2 : 3;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (self as any).postMessage(
      { type: "patch", rawBuffer: imageData.data.buffer,
        width: imageData.width, height: imageData.height,
        x0, y0, x1: x0 + w, y1: y0 + h,
        resScale, tier, requestId },
      [imageData.data.buffer],
    );
  }
};
