import { Fragment } from "./fragments";
import { Situation, TAGS, TagCategory } from "./tags";

const VOICE_SYSTEM_PROMPT = `You are the voice of a text-based game called The Barrow, set in ancient Britain around 2400 BCE. You produce short, precise descriptions of what the player sees, hears, and feels.

VOICE RULES — follow these absolutely:
- Short sentences. Average under 15 words. Vary rhythm but keep it spare.
- Concrete nouns. Specific verbs. Physical, observable detail only.
- Sensory priority: sight, sound, smell, touch. Lead with what can be perceived.
- Trust the reader. Do not explain. Do not interpret. Do not tell the player what to feel.
- No abstract nouns: mystery, beauty, tranquillity, majesty, serenity, wonder, awe.
- No emotional instruction: "you feel", "you sense", "you can't help but", "a feeling of".
- No purple modifiers: ancient, timeless, ethereal, haunting, mystical, primal.
- No interpretation: "as if", "suggesting", "seemingly", "perhaps meaning", "as though".
- No metaphysical commentary. No narrative voice intruding on the scene.
- Write in second person present tense: "The chalk is white underfoot."
- Total output: 3-6 sentences. No more.

You will be given a situation (place, weather, time, etc.) and 2-4 existing fragments that match the situation. Weave the fragments into a flowing, coherent description. You may adjust fragment wording slightly for flow. You may add 1-2 additional sensory details consistent with the situation. Do not add anything that violates the voice rules above.`;

function describeSituation(situation: Situation): string {
  const parts: string[] = [];
  const categories: TagCategory[] = [
    "geology", "weather", "season", "time",
    "altitude", "feature", "state"
  ];

  for (const cat of categories) {
    const vals = situation[cat];
    if (vals && vals.length > 0) {
      parts.push(`${cat}: ${vals.join(", ")}`);
    }
  }

  return parts.join(". ") + ".";
}

export async function generateVoice(
  apiKey: string,
  situation: Situation,
  fragments: { fragment: Fragment; score: number }[]
): Promise<string> {
  const sitDesc = describeSituation(situation);

  const fragTexts = fragments
    .map((f, i) => `Fragment ${i + 1}: "${f.fragment.text}"`)
    .join("\n");

  const userPrompt = `SITUATION: ${sitDesc}

MATCHING FRAGMENTS:
${fragTexts}

Weave these fragments into a short, flowing description. Follow the voice rules exactly. 3-6 sentences total.`;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 300,
      system: VOICE_SYSTEM_PROMPT,
      messages: [{ role: "user", content: userPrompt }],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`API error ${response.status}: ${err}`);
  }

  const data = await response.json();
  const text = data.content
    ?.map((block: { type: string; text?: string }) =>
      block.type === "text" ? block.text : ""
    )
    .join("")
    .trim();

  return text || "(No output from the model)";
}

export function getSystemPrompt(): string {
  return VOICE_SYSTEM_PROMPT;
}
