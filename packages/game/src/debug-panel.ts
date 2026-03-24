/**
 * Development debug panel — shows internal game state each turn.
 * Toggle with D key. Remove before release.
 */

import type { GameState } from "./state";
import type { WorldQuery } from "./world";
import type { PerceptualContext, DescriptionMode } from "./context";
import type { Choice } from "./choices";
import type { Situation } from "@the-barrow/voice";

export interface DebugVoiceInfo {
  situation: Situation;
  totalScored: number;
  matched: { fragment: { id: string }; score: number }[];
  recentFragmentIds: string[];
  instruction: string;
}

export interface DebugInfo {
  state: GameState;
  world: WorldQuery;
  currContext: PerceptualContext;
  prevContext: PerceptualContext | null;
  mode: DescriptionMode;
  transitionWhat?: string;
  decisionMs: number;
  voice: DebugVoiceInfo;
  choices: Choice[];
  pageWordCount: number;
  lastClearReason: string;
  weatherChangeTurn: number;
  mapWidth: number;
  mapHeight: number;
  lastTravel?: {
    bearingName:   string;
    startGeoLabel: string;
    cellsCovered:  number;
    stopReason:    string;
    notables:      string[];
    arrivalMode:   string | null;
  } | null;
}

// ─── Helpers ─────────────────────────────────────────────────────

function decisionLabel(ms: number): string {
  if (ms < 5_000)   return "rapid";
  if (ms < 30_000)  return "normal";
  if (ms < 120_000) return "contemplative";
  return "absent";
}

function yn(v: boolean): string { return v ? "yes" : "no"; }

function section(heading: string, content: string): string {
  return `<div class="dbg-section">`
    + `<div class="dbg-heading">${heading}</div>`
    + `<pre class="dbg-pre">${content}</pre>`
    + `</div>`;
}

// ─── Section builders ─────────────────────────────────────────

function positionSection(info: DebugInfo): string {
  const { state, world, mapWidth, mapHeight } = info;
  const nx = (state.position.x / mapWidth).toFixed(2);
  const ny = (state.position.y / mapHeight).toFixed(2);
  const riverStr = world.nearRiver
    ? `yes (flow: ${world.cell.riverFlow})`
    : "no";
  return section("Position & Terrain", [
    `Position:   (${state.position.x}, ${state.position.y})`,
    `Normalised: (${nx}, ${ny})`,
    `Geology:    ${world.geoInfo.label}`,
    `Altitude:   ${world.cell.altitude.toFixed(2)} (${world.altitudeMetres}m)`,
    `River:      ${riverStr}`,
    `Coast:      ${yn(world.onCoast)}`,
    `On path:    ${yn(world.onPath)}`,
  ].join("\n"));
}

function contextSection(ctx: PerceptualContext): string {
  return section("Context", [
    `geology:        ${ctx.geology}`,
    `altitude:       ${ctx.altitudeBand}`,
    `vegetation:     ${ctx.vegetationCover}`,
    `weather:        ${ctx.weather}`,
    `time:           ${ctx.timeBand}`,
    `nearWater:      ${yn(ctx.nearWater)}`,
    `nearSettlement: ${yn(ctx.nearSettlement)}`,
    `nearSacred:     ${yn(ctx.nearSacredSite)}`,
    `inCave:         ${yn(ctx.inCave)}`,
  ].join("\n"));
}

function contextDiffSection(
  prev: PerceptualContext | null,
  curr: PerceptualContext,
): string {
  if (!prev) return section("Context Δ", "(first turn)");

  type Key = keyof PerceptualContext;
  const fields: [string, Key][] = [
    ["geology",    "geology"],
    ["altitude",   "altitudeBand"],
    ["vegetation", "vegetationCover"],
    ["weather",    "weather"],
    ["time",       "timeBand"],
    ["water",      "nearWater"],
    ["settlement", "nearSettlement"],
    ["sacred",     "nearSacredSite"],
    ["cave",       "inCave"],
  ];

  const changed: string[] = [];
  const unchanged: string[] = [];

  for (const [label, key] of fields) {
    if (curr[key] !== prev[key]) {
      changed.push(`${label} (${prev[key]} → ${curr[key]})`);
    } else {
      unchanged.push(label);
    }
  }

  return section("Context Δ", [
    `Changed:   ${changed.length > 0 ? changed.join(", ") : "nothing"}`,
    `Unchanged: ${unchanged.join(", ")}`,
  ].join("\n"));
}

function attentionSection(info: DebugInfo): string {
  const { mode, transitionWhat, decisionMs, state, pageWordCount, lastClearReason } = info;
  const sec = (decisionMs / 1000).toFixed(1);
  const modeStr = transitionWhat ? `${mode} (${transitionWhat})` : mode;
  return section("Attention", [
    `Mode:       ${modeStr}`,
    `Decision:   ${sec}s (${decisionLabel(decisionMs)})`,
    `Tarry:      ${state.tarryCount}`,
    `Words:      ${pageWordCount} / 350`,
    `Last clear: ${lastClearReason}`,
  ].join("\n"));
}

function voiceSection(info: DebugInfo): string {
  const { voice } = info;
  const { situation, totalScored, matched, recentFragmentIds, instruction } = voice;

  const cats = ["geology","weather","season","time","altitude","feature","sense","state"] as const;
  const tagLines = cats.map(cat => {
    const tags = (situation as unknown as Record<string, string[]>)[cat] ?? [];
    return `  ${(cat + ":").padEnd(10)}[${tags.join(", ")}]`;
  });

  const fragmentLines = matched.map(m =>
    `  → ${m.fragment.id} (score: ${m.score.toFixed(1)})`,
  );

  const recencyDisplay = recentFragmentIds.slice(0, 6);
  const recencyStr = recencyDisplay.join(", ")
    + (recentFragmentIds.length > 6 ? ", …" : "");

  return section("Voice", [
    ...tagLines,
    "",
    `Scored:   ${totalScored} fragments`,
    `Selected: ${matched.length}`,
    ...fragmentLines,
    "",
    `Recency:  [${recencyStr}]`,
    `Instr:    ${instruction.slice(0, 60)}…`,
  ].join("\n"));
}

const DIR_LABELS: Record<string, string> = {
  north: "N ", northeast: "NE", east: "E ", southeast: "SE",
  south: "S ", southwest: "SW", west: "W ", northwest: "NW",
};

function adjacentSection(info: DebugInfo): string {
  const { world } = info;
  const dirOrder = ["north","northeast","east","southeast","south","southwest","west","northwest"];

  const lines = dirOrder.map(dirName => {
    const adj = world.adjacentTerrain.find(a => a.direction === dirName);
    const label = DIR_LABELS[dirName] ?? dirName;
    if (!adj) return `  ${label}: (edge/water)`;

    const geoSame = adj.geoLabel === world.geoInfo.label;
    const sign    = adj.altChange >= 0 ? "+" : "";
    const features: string[] = [];
    if (adj.hasRiver) features.push("river");
    if (adj.hasPath)  features.push("path");
    const featStr = features.length > 0 ? ` [${features.join(",")}]` : "";

    const geoStr = geoSame
      ? adj.geoLabel.padEnd(12)
      : `<span class="geo-change">${adj.geoLabel.padEnd(11)}←</span>`;

    return `  ${label}: ${geoStr} ${adj.cell.altitude.toFixed(2)} (${sign}${adj.altChange.toFixed(2)}) cost:${adj.movementCost.toFixed(1)}${featStr}`;
  });

  return section("Adjacent", lines.join("\n"));
}

function choicesSection(choices: Choice[]): string {
  const lines = choices.map((c, i) =>
    `  ${i + 1}. "${c.text}"\n     → (${c.dx},${c.dy}) cost:${c.timeCost}`,
  );
  return section(`Choices (${choices.length})`, lines.join("\n"));
}

function timeSection(info: DebugInfo): string {
  const { state, currContext, weatherChangeTurn } = info;
  const t = state.time;
  const seasons = ["Spring", "Summer", "Autumn", "Winter"];
  return section("Time", [
    `Year ${t.year}, ${seasons[t.season]}, Day ${t.day}, Hour ${t.hour} (${currContext.timeBand})`,
    `Turns:   ${state.turns}`,
    `Weather: ${state.weather.type} (last change: turn ${weatherChangeTurn})`,
  ].join("\n"));
}

function nearbySection(info: DebugInfo): string | null {
  const { world } = info;
  if (world.nearbyFeatures.length === 0) return null;
  const lines = world.nearbyFeatures.map(f =>
    `  ${f.type}${f.name ? ` "${f.name}"` : ""} — ${f.distance} cells ${f.direction}`,
  );
  return section("Nearby", lines.join("\n"));
}

function lastTravelSection(info: DebugInfo): string | null {
  const t = info.lastTravel;
  if (!t) return null;
  const lines = [
    `Bearing:    ${t.bearingName}`,
    `Distance:   ${t.cellsCovered} cell${t.cellsCovered === 1 ? "" : "s"}`,
    `Stop:       ${t.stopReason}`,
    `Notables:   ${t.notables.length > 0 ? t.notables.join(", ") : "none"}`,
    `Geo start:  ${t.startGeoLabel}`,
    `Arrival:    ${t.arrivalMode ?? "none (travel narrative only)"}`,
  ];
  return section("Last Travel", lines.join("\n"));
}

// ─── Main export ─────────────────────────────────────────────────

export function updateDebugPanel(el: HTMLElement, info: DebugInfo): void {
  const parts: string[] = [
    positionSection(info),
    contextSection(info.currContext),
    contextDiffSection(info.prevContext, info.currContext),
    attentionSection(info),
    voiceSection(info),
    adjacentSection(info),
    choicesSection(info.choices),
    timeSection(info),
  ];

  const nearby = nearbySection(info);
  if (nearby) parts.push(nearby);

  const travel = lastTravelSection(info);
  if (travel) parts.push(travel);

  el.innerHTML = parts.join("");
}
