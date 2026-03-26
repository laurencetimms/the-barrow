# The Barrow — Agent Briefing

## What This Is

A text-based exploration game set in warped ancient Britain (~2400 BCE). The player emerges from a barrow (their own grave) into a procedurally generated landscape. No combat. The fundamental verb is "choose where to put your body." Core experience: quiet anticipation, incremental discovery, short sessions.

## Monorepo Structure

```
the-barrow/
  packages/
    terrain/          — Core generation: noise, geology, terrain, habitation
    terrain-viewer/   — Map visualisation (dev tool)
    voice/            — Voice system: fragments, matcher, LLM pipeline
    voice-tester/     — Voice calibration (dev tool)
    game/             — The actual game (the walker)
  docs/               — Design documents (read before significant changes)
```

npm workspaces link the packages. `@barrow/terrain` and `@barrow/voice` are library packages. Never duplicate code between packages.

## Tech Stack

TypeScript, Vite, simplex-noise, Claude API (Sonnet) for voice, vanilla DOM (no frameworks), browser target.

## Design Documents

Read the relevant doc in `docs/` before changing any system. Key files:

- `the-barrow-complete.md` — Full game vision
- `the-barrow-landscape-model.md` — Terrain generation (layer stack, geology, rivers, ice)
- `the-barrow-habitation-layer.md` — Settlements, sacred sites, paths, spacing rules
- `the-barrow-interface-spec.md` — Interface design, attention state system, timing
- `the-barrow-upper-layers.md` — Relationship, player state, voice architecture
- `the-barrow-running-notes.md` — Design decisions and open questions

## The Voice — Critical Constraints

This applies to every LLM prompt and every hand-authored fragment. Non-negotiable.

- Short sentences. Average under 15 words.
- Concrete nouns. Specific verbs. Physical, observable detail only.
- Sensory priority: sight, sound, smell, touch. Lead with what can be perceived.
- Trust the reader. Do not explain, interpret, or instruct feeling.
- Second person present tense: "The chalk is white underfoot."

**Forbidden in all voice output:**
- Abstract nouns: mystery, beauty, tranquillity, majesty, serenity, wonder, awe
- Emotional instruction: "you feel", "you sense", "you can't help but"
- Purple modifiers: ancient, timeless, ethereal, haunting, mystical, primal
- Interpretation: "as if", "suggesting", "seemingly", "perhaps meaning"

Always include these constraints in LLM system prompts. The model will drift toward purple prose without them.

## Code Conventions

- All generation is deterministic from the seed. Same seed = same world.
- Terrain functions are pure — no side effects, no randomness outside seeded RNG.
- Voice fragments are hand-authored in `packages/voice/src/fragments.json`. Never generate them programmatically.
- LLM calls go through `packages/voice/src/llm.ts`.
- Game state is a single object in `packages/game/src/state.ts`.
- World queries go through `packages/game/src/world.ts` — the game never reads terrain cells directly.

## What Not To Do

- No combat, hit points, mana, or visible numerical stats
- No quest log, minimap with fog-of-war, or conventional game HUD
- Do not let the LLM invent plot, world content, or new sites/NPCs
- Do not generate voice fragments programmatically
- No rectangular or axis-aligned geological boundaries
- Do not show the player information they haven't discovered through gameplay
- Do not move the player only one cell per turn when they've chosen directional travel — compress uniform terrain into multi-cell travel sequences
- Do not let the player set a distant destination and auto-travel there without interrupts — the landscape must control when travel stops
- Do not narrate dramatic incidents or invented encounters during travel sequences — just the experience of walking through the landscape

## The Attention State System
The game tracks perceptual context (geology, altitude, weather, time, vegetation, nearby features) and compares turn-to-turn to determine description mode:

Full description (3-6 sentences): major context change, page clears
Travel narrative (3-4 sentences): multi-cell directional travel through stable terrain, appends to page
Movement update (1-2 sentences): single-cell move, minimal context change, appends to page
Tarrying observation (1 sentence): player waited, deepening detail, appends or clears based on timing
Transition moment (1-2 sentences): environmental variable changed (weather, time), appends
Reorientation (brief): player absent >2min, page clears with reminder

Directional choices ("continue north along the ridge") initiate travel sequences — the game moves the player cell by cell, checking for interrupt conditions (geology change, river crossing, feature sighting, weather shift). If interrupted, travel stops and the appropriate description mode fires. If not interrupted, the player covers 2-5 cells and gets a compressed travel narrative.

## The Player Graph

The player graph nodes (Body and Land tiers) are float values in the game state, tracked in `packages/game/src/player-graph.ts`. Each node has: a current value, increment rules (what actions cause it to grow), threshold effects (what the voice layer reveals at different levels), and choice gates (what options appear at different levels). Node values are NEVER displayed to the player. They are visible only in the debug panel. The voice layer reads node values to determine which observation fragments are eligible for the current description — fragments are tagged with minimum node thresholds, and the matcher filters by these thresholds before scoring.

**Body tier nodes:** Shelter, Food, Body Sense. Active from turn one. Affect survival and physical relationship with the landscape.

**Land tier nodes:** Paths, Foraging, Weather, Animal Signs, Practice (per-activity: shelter-building, fire-making, flint-knapping, woodworking, herb-gathering). Develop through exploration and attention.

Key rules:
- Growth is 0.005–0.02 per qualifying action. Never instant.
- Tarrying gives a 1.5x multiplier to all node increments from the current situation.
- In winter, Shelter and Food effective values are reduced by 0.1–0.2 (thresholds shift upward — the actual stored value does not decrease).
- The voice layer applies a description budget: one node-gated observation per turn, selected by relevance and novelty. Fragments tagged with node thresholds are filtered by the matcher before scoring.
- Connected nodes reinforce each other when both exceed a threshold (cross-node bonus increments).