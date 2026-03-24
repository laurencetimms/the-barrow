#!/usr/bin/env node
/**
 * The Barrow — Test Fragment Library Generator
 *
 * Systematically generates fragments covering the full tag space
 * using Claude API calls. Outputs fragments.json for the voice system.
 *
 * Usage:
 *   ANTHROPIC_API_KEY=sk-ant-... node generate-fragments.mjs
 *
 * Or:
 *   ANTHROPIC_API_KEY=sk-ant-... node generate-fragments.mjs --dry-run
 *   (prints the coverage matrix without making API calls)
 *
 * The output is a TEST library — placeholder content to be replaced
 * with hand-authored fragments in the author's own voice.
 */

const API_KEY = process.env.ANTHROPIC_API_KEY;
const DRY_RUN = process.argv.includes("--dry-run");
const OUTPUT_FILE = "packages/voice/src/fragments.json";

if (!API_KEY && !DRY_RUN) {
  console.error("Set ANTHROPIC_API_KEY environment variable");
  process.exit(1);
}

// ─── Voice system prompt ────────────────────────────────────────

const VOICE_SYSTEM = `You generate prose fragments for a text-based game called The Barrow, set in ancient Britain around 2400 BCE. Each fragment is 1-3 sentences of spare, concrete, sensory description.

VOICE RULES — follow these absolutely:
- Short sentences. Average under 15 words.
- Concrete nouns. Specific verbs. Physical, observable detail only.
- Sensory priority: sight, sound, smell, touch.
- Trust the reader. Do not explain. Do not interpret.
- Second person present tense: "The chalk is white underfoot."
- No abstract nouns: mystery, beauty, tranquillity, majesty, serenity, wonder, awe.
- No emotional instruction: "you feel", "you sense", "you can't help but".
- No purple modifiers: ancient, timeless, ethereal, haunting, mystical, primal.
- No interpretation: "as if", "suggesting", "seemingly", "perhaps meaning".

You will be given a situation (geology, weather, etc.) and asked to generate multiple distinct fragments. Each fragment should be 1-3 sentences. Return ONLY a JSON array of strings, no markdown, no explanation.`;

// ─── Coverage matrix ────────────────────────────────────────────

const GEOLOGIES = [
  { tag: "chalk", desc: "chalk downland — rolling hills, white soil, short springy turf, skylarks, flint" },
  { tag: "limestone", desc: "limestone dale — grey pavements, green valleys, ash trees, fast clear streams, caves" },
  { tag: "sandstone", desc: "sandstone heath — purple heather, silver birch, warm-coloured rock, overhangs" },
  { tag: "granite", desc: "granite moorland — tussock grass, bog, tors, wind, lichen, stunted oak in valleys" },
  { tag: "slate", desc: "slate country — steep dark valleys, fast rivers, dense oak-hazel, ferns, moss" },
  { tag: "clay", desc: "clay lowlands — dense primeval forest, massive oaks, elms, lime, dark canopy, heavy soil" },
  { tag: "glacial", desc: "glacial debris — raw ground, gravel, scattered pioneer birch, lichen, meltwater, near the ice" },
  { tag: "water-lands", desc: "water-lands — reed beds, shallow channels, mud flats, wildfowl, raised islands, mist" },
  { tag: "ice-margin", desc: "ice margin — the edge of the great ice sheet, moraine ridges, meltwater, raw cold, erratics" },
  { tag: "cave-interior", desc: "underground cave — darkness, wet stone, dripping, echoes, narrowing passages, cold air" },
];

const WEATHERS = [
  { tag: "clear", desc: "clear sky, good visibility" },
  { tag: "rain", desc: "steady rain" },
  { tag: "drizzle", desc: "fine drizzle, damp" },
  { tag: "fog", desc: "thick fog, limited visibility" },
  { tag: "wind", desc: "strong wind" },
  { tag: "storm", desc: "heavy storm, thunder" },
  { tag: "snow", desc: "falling snow" },
  { tag: "frost", desc: "hard frost, frozen ground" },
  { tag: "haze", desc: "thin haze, soft light" },
];

const SEASONS = [
  { tag: "spring", desc: "spring — new growth, blossom, birdsong, lengthening days" },
  { tag: "summer", desc: "summer — full growth, heat, long days, insects, ripe fruit" },
  { tag: "autumn", desc: "autumn — turning leaves, mist, harvest, shortening days, fungi" },
  { tag: "winter", desc: "winter — bare branches, short days, cold, dormancy, frost" },
];

const TIMES = [
  { tag: "dawn", desc: "dawn — first light, low sun, long shadows, dew" },
  { tag: "morning", desc: "morning — risen sun, warming, activity" },
  { tag: "midday", desc: "midday — high sun, flat light, warmth" },
  { tag: "afternoon", desc: "afternoon — long light, descending sun" },
  { tag: "dusk", desc: "dusk — fading light, cooling, shadow filling valleys" },
  { tag: "night", desc: "night — darkness, stars or clouds, moon, sounds carry further" },
  { tag: "moonlight", desc: "moonlit night — silver light, sharp shadows, everything transformed" },
];

const ALTITUDES = [
  { tag: "valley-floor", desc: "low ground, valley floor, sheltered" },
  { tag: "slope", desc: "hillside, climbing or descending" },
  { tag: "hilltop", desc: "top of a hill, exposed, views" },
  { tag: "ridgeline", desc: "walking along a ridge, sky on both sides, wide views" },
  { tag: "summit", desc: "high summit, wind, panoramic view" },
  { tag: "underground", desc: "underground, enclosed, no sky" },
];

const FEATURES = [
  { tag: "river", desc: "near a river — sound of water, vegetation, crossing possibility" },
  { tag: "ford", desc: "a river crossing point — shallow water, worn stones" },
  { tag: "spring", desc: "a natural spring — clear water emerging from rock" },
  { tag: "coast", desc: "at the coast — sea, waves, salt air, horizon, birds" },
  { tag: "forest-edge", desc: "at the edge of forest — transition from shade to open" },
  { tag: "clearing", desc: "a clearing in the forest — light, open ground, contrast" },
  { tag: "path", desc: "on a path — worn ground, direction, sign of people" },
  { tag: "standing-stone", desc: "near a standing stone — tall, weathered, carved marks" },
  { tag: "barrow", desc: "near a barrow — a long mound, grass-covered, entrance" },
  { tag: "cave-entrance", desc: "at a cave entrance — dark opening, cool air, threshold" },
  { tag: "settlement-approach", desc: "approaching a settlement — smoke, dogs, sounds of activity" },
  { tag: "settlement-interior", desc: "inside a settlement — roundhouses, hearths, people, animals" },
  { tag: "sacred-pool", desc: "a still pool with sacred associations — reflection, offerings, quiet" },
  { tag: "moor", desc: "open moorland — heather, bog, wind, no shelter" },
  { tag: "heath", desc: "heathland — heather, gorse, sandy soil, birch" },
  { tag: "reed-bed", desc: "thick reed beds — tall reeds, channels, birds, rustling" },
];

const DESCRIPTION_MODES = [
  { tag: "movement", desc: "a brief 1-sentence observation while walking — footing, a new sight, a small change" },
  { tag: "tarry-1", desc: "first tarrying observation — a sound noticed after stopping" },
  { tag: "tarry-2", desc: "second tarrying observation — a visual detail noticed on closer inspection" },
  { tag: "tarry-3", desc: "third tarrying observation — something subtle: body sense, air change, animal sign" },
  { tag: "transition-weather", desc: "weather just changed — 1 sentence registering the shift" },
  { tag: "transition-time", desc: "time of day just shifted (dawn breaking, dusk falling, night coming) — 1 sentence" },
];

// ─── Generation batches ─────────────────────────────────────────

function buildBatches() {
  const batches = [];

  // Batch 1: Geology-only (broad fragments, 12 per geology)
  for (const geo of GEOLOGIES) {
    batches.push({
      id: `geo-${geo.tag}`,
      count: 12,
      prompt: `Geology: ${geo.desc}\n\nGenerate 12 distinct fragments describing this terrain. Vary the sensory focus — some sight, some sound, some touch, some smell. Vary the specificity — some broad scene-setting, some tight detail. Each fragment 1-3 sentences.`,
      baseTags: { geology: [geo.tag] },
    });
  }

  // Batch 2: Geology + weather (5 per pair, skip nonsensical combos)
  for (const geo of GEOLOGIES) {
    for (const weather of WEATHERS) {
      // Skip nonsensical: cave + most weather, ice-margin + haze
      if (geo.tag === "cave-interior" && !["clear"].includes(weather.tag)) continue;
      // Snow only in appropriate geologies
      if (weather.tag === "snow" && ["water-lands"].includes(geo.tag)) continue;

      batches.push({
        id: `geo-weather-${geo.tag}-${weather.tag}`,
        count: 5,
        prompt: `Geology: ${geo.desc}\nWeather: ${weather.desc}\n\nGenerate 5 distinct fragments describing this terrain in this weather. Focus on how the weather changes the experience of this specific landscape. Each fragment 1-3 sentences.`,
        baseTags: { geology: [geo.tag], weather: [weather.tag] },
      });
    }
  }

  // Batch 3: Geology + season (5 per pair)
  for (const geo of GEOLOGIES) {
    if (geo.tag === "cave-interior") continue; // no seasons underground
    for (const season of SEASONS) {
      batches.push({
        id: `geo-season-${geo.tag}-${season.tag}`,
        count: 5,
        prompt: `Geology: ${geo.desc}\nSeason: ${season.desc}\n\nGenerate 5 distinct fragments describing this terrain in this season. Focus on what's growing, what's changed, how the season shows on this specific landscape. Each fragment 1-3 sentences.`,
        baseTags: { geology: [geo.tag], season: [season.tag] },
      });
    }
  }

  // Batch 4: Geology + time of day (4 per pair)
  for (const geo of GEOLOGIES) {
    for (const time of TIMES) {
      if (geo.tag === "cave-interior" && !["night"].includes(time.tag)) continue;
      batches.push({
        id: `geo-time-${geo.tag}-${time.tag}`,
        count: 4,
        prompt: `Geology: ${geo.desc}\nTime: ${time.desc}\n\nGenerate 4 distinct fragments describing this terrain at this time of day. Focus on light, shadow, temperature, and how the time changes the landscape. Each fragment 1-3 sentences.`,
        baseTags: { geology: [geo.tag], time: [time.tag] },
      });
    }
  }

  // Batch 5: Geology + altitude (4 per pair, plausible combos only)
  for (const geo of GEOLOGIES) {
    for (const alt of ALTITUDES) {
      if (geo.tag === "cave-interior" && alt.tag !== "underground") continue;
      if (geo.tag !== "cave-interior" && alt.tag === "underground") continue;
      if (geo.tag === "water-lands" && ["summit", "ridgeline"].includes(alt.tag)) continue;
      if (geo.tag === "clay" && ["summit"].includes(alt.tag)) continue;

      batches.push({
        id: `geo-alt-${geo.tag}-${alt.tag}`,
        count: 4,
        prompt: `Geology: ${geo.desc}\nAltitude: ${alt.desc}\n\nGenerate 4 distinct fragments describing this terrain at this altitude. Focus on what you can see, how exposed you are, and the physical experience of being at this height in this geology. Each fragment 1-3 sentences.`,
        baseTags: { geology: [geo.tag], altitude: [alt.tag] },
      });
    }
  }

  // Batch 6: Feature fragments (5-8 per feature, across relevant geologies)
  for (const feature of FEATURES) {
    const relevantGeos = getRelevantGeologies(feature.tag);
    batches.push({
      id: `feature-${feature.tag}`,
      count: 8,
      prompt: `Feature: ${feature.desc}\nThis feature might be found in these landscapes: ${relevantGeos.join(", ")}\n\nGenerate 8 distinct fragments describing the experience of encountering this feature. Vary the geology context. Each fragment 1-3 sentences.`,
      baseTags: { feature: [feature.tag] },
      addGeoTags: true,
      relevantGeos,
    });
  }

  // Batch 7: Sensory detail fragments (15 per geology)
  for (const geo of GEOLOGIES) {
    batches.push({
      id: `sensory-${geo.tag}`,
      count: 15,
      prompt: `Geology: ${geo.desc}\n\nGenerate 15 short sensory detail fragments — each just 1 sentence. Mix senses: 4 sight, 3 sound, 3 smell, 3 touch, 2 body-sense. Each should be a single specific observation, the kind of thing you notice while walking. Very short — under 12 words each.`,
      baseTags: { geology: [geo.tag] },
      assignSenseTags: true,
    });
  }

  // Batch 8: Movement update fragments (8 per geology)
  for (const geo of GEOLOGIES) {
    batches.push({
      id: `movement-${geo.tag}`,
      count: 8,
      prompt: `Geology: ${geo.desc}\n\nGenerate 8 brief movement-update fragments. The player is continuing through this terrain — the scene hasn't changed significantly. Each fragment is 1 sentence noting a small change: footing, a new detail coming into view, a slight shift. Very brief, very specific.`,
      baseTags: { geology: [geo.tag], state: ["movement"] },
    });
  }

  // Batch 9: Tarrying fragments per depth (across geologies)
  for (const mode of DESCRIPTION_MODES.filter(m => m.tag.startsWith("tarry"))) {
    batches.push({
      id: `${mode.tag}`,
      count: 20,
      prompt: `Generate 20 tarrying observation fragments. Context: ${mode.desc}\n\nThese should work across different landscapes (chalk, limestone, granite, forest, moorland, coast). Each is exactly 1 sentence — a single specific observation. Vary the senses and the specificity.`,
      baseTags: { state: [mode.tag] },
    });
  }

  // Batch 10: Transition fragments
  for (const mode of DESCRIPTION_MODES.filter(m => m.tag.startsWith("transition"))) {
    batches.push({
      id: `${mode.tag}`,
      count: 15,
      prompt: `Generate 15 transition fragments. Context: ${mode.desc}\n\nEach is 1-2 sentences registering the change. These should work across different landscapes. Be specific about what changed — name the weather, describe the light shift. Very brief.`,
      baseTags: { state: [mode.tag] },
    });
  }

  return batches;
}

function getRelevantGeologies(featureTag) {
  const map = {
    "river": ["chalk", "limestone", "sandstone", "granite", "slate", "clay"],
    "ford": ["chalk", "limestone", "clay", "sandstone"],
    "spring": ["chalk", "limestone"],
    "coast": ["chalk", "granite", "slate", "clay", "glacial"],
    "forest-edge": ["clay", "limestone", "slate", "chalk"],
    "clearing": ["clay", "limestone", "slate"],
    "path": ["chalk", "limestone", "sandstone", "granite", "clay"],
    "standing-stone": ["chalk", "granite", "limestone", "sandstone"],
    "barrow": ["chalk", "limestone"],
    "cave-entrance": ["limestone", "sandstone"],
    "settlement-approach": ["chalk", "clay", "limestone", "sandstone", "water-lands"],
    "settlement-interior": ["chalk", "clay", "limestone", "water-lands"],
    "sacred-pool": ["limestone", "granite", "water-lands"],
    "moor": ["granite", "sandstone"],
    "heath": ["sandstone"],
    "reed-bed": ["water-lands", "clay"],
  };
  return map[featureTag] || ["chalk", "clay", "limestone"];
}

// ─── API calling ────────────────────────────────────────────────

async function callClaude(prompt, count) {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2000,
      system: VOICE_SYSTEM,
      messages: [{ role: "user", content: prompt + `\n\nReturn ONLY a JSON array of ${count} strings. No markdown fences, no explanation.` }],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`API error ${response.status}: ${err}`);
  }

  const data = await response.json();
  const text = data.content
    .filter(b => b.type === "text")
    .map(b => b.text)
    .join("")
    .trim();

  // Parse JSON array from response
  try {
    const cleaned = text.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
    const parsed = JSON.parse(cleaned);
    if (Array.isArray(parsed)) return parsed;
    throw new Error("Not an array");
  } catch (e) {
    console.error(`  Failed to parse response: ${e.message}`);
    console.error(`  Raw: ${text.substring(0, 200)}...`);
    return [];
  }
}

// ─── Fragment builder ───────────────────────────────────────────

function buildFragment(text, baseTags, batchId, index) {
  return {
    id: `${batchId}-${String(index).padStart(2, "0")}`,
    text: text.trim(),
    tags: { ...baseTags },
  };
}

// ─── Main ───────────────────────────────────────────────────────

async function main() {
  const batches = buildBatches();

  let totalFragments = 0;
  let totalCalls = 0;

  for (const batch of batches) {
    totalFragments += batch.count;
    totalCalls++;
  }

  console.log(`Coverage matrix: ${batches.length} batches, ~${totalFragments} fragments`);
  console.log(`Estimated API calls: ${totalCalls}`);
  console.log(`Estimated cost: ~$${(totalCalls * 0.008).toFixed(2)} USD`);
  console.log();

  if (DRY_RUN) {
    console.log("Batch breakdown:");
    const categories = {};
    for (const batch of batches) {
      const cat = batch.id.split("-").slice(0, 2).join("-");
      if (!categories[cat]) categories[cat] = { count: 0, fragments: 0 };
      categories[cat].count++;
      categories[cat].fragments += batch.count;
    }
    for (const [cat, info] of Object.entries(categories)) {
      console.log(`  ${cat}: ${info.count} batches, ${info.fragments} fragments`);
    }
    console.log(`\nTotal: ~${totalFragments} fragments`);
    return;
  }

  console.log("Generating fragments...\n");

  const allFragments = [];
  let completed = 0;

  for (const batch of batches) {
    completed++;
    process.stdout.write(`[${completed}/${batches.length}] ${batch.id} (${batch.count} fragments)... `);

    try {
      const texts = await callClaude(batch.prompt, batch.count);

      for (let i = 0; i < texts.length; i++) {
        const fragment = buildFragment(texts[i], batch.baseTags, batch.id, i);

        // For feature batches, try to assign geology tags based on content
        if (batch.addGeoTags && batch.relevantGeos) {
          // Assign the geology round-robin across relevant geologies
          const geoIdx = i % batch.relevantGeos.length;
          fragment.tags.geology = [batch.relevantGeos[geoIdx]];
        }

        // For sensory batches, assign sense tags round-robin
        if (batch.assignSenseTags) {
          const senses = ["sight", "sight", "sight", "sight",
                          "sound", "sound", "sound",
                          "smell", "smell", "smell",
                          "touch", "touch", "touch",
                          "body-sense", "body-sense"];
          fragment.tags.sense = [senses[i % senses.length]];
        }

        allFragments.push(fragment);
      }

      console.log(`✓ (${texts.length} generated)`);
    } catch (e) {
      console.log(`✗ ${e.message}`);
    }

    // Rate limiting — pause between calls
    await new Promise(r => setTimeout(r, 500));
  }

  // Write output
  const { writeFileSync } = await import("fs");
  writeFileSync(OUTPUT_FILE, JSON.stringify(allFragments, null, 2));
  console.log(`\nDone. ${allFragments.length} fragments written to ${OUTPUT_FILE}`);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
