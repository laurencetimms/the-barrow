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