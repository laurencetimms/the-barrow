import { TagCategory } from "./tags";

export interface Fragment {
  id: string;
  text: string;
  tags: Partial<Record<TagCategory, string[]>>;
}

// --- Starter fragments: chalk ---
// These establish the voice. Short sentences. Concrete nouns. Trust the reader.

export const STARTER_FRAGMENTS: Fragment[] = [
  // Chalk + clear
  {
    id: "chalk-clear-01",
    text: "The chalk is white underfoot, dry and solid. The ridge opens ahead — sky on both sides.",
    tags: { geology: ["chalk"], weather: ["clear"], altitude: ["ridgeline"], sense: ["sight", "touch"] }
  },
  {
    id: "chalk-clear-02",
    text: "Short turf, springy. Skylarks somewhere above, invisible in the glare.",
    tags: { geology: ["chalk"], weather: ["clear"], sense: ["touch", "sound"], altitude: ["hilltop", "ridgeline"] }
  },
  {
    id: "chalk-clear-03",
    text: "Flint in the turned earth. Dark, sharp-edged, wet where the soil has split it open.",
    tags: { geology: ["chalk"], sense: ["sight"], feature: ["clearing"] }
  },

  // Chalk + rain
  {
    id: "chalk-rain-01",
    text: "Rain on chalk. The white ground turns grey. Water runs in the ruts and vanishes into the soil.",
    tags: { geology: ["chalk"], weather: ["rain"], sense: ["sight"] }
  },
  {
    id: "chalk-rain-02",
    text: "The downland darkens in the wet. Sheep tracks fill with water. The wind carries the rain sideways.",
    tags: { geology: ["chalk"], weather: ["rain", "wind"], sense: ["sight", "touch"] }
  },

  // Chalk + fog
  {
    id: "chalk-fog-01",
    text: "The ridge has disappeared. Nothing but white, close and damp. Sound carries strangely — a bird call from no direction.",
    tags: { geology: ["chalk"], weather: ["fog"], altitude: ["ridgeline"], sense: ["sight", "sound"] }
  },

  // Chalk + dawn
  {
    id: "chalk-dawn-01",
    text: "First light on the escarpment. The valley below is still dark. The chalk catches the sun before anything else.",
    tags: { geology: ["chalk"], time: ["dawn"], altitude: ["ridgeline", "hilltop"], sense: ["sight"] }
  },
  {
    id: "chalk-dawn-02",
    text: "Dew on the grass. The turf is cold and soaked. To the east, the sky is turning — pale gold above the mist.",
    tags: { geology: ["chalk"], time: ["dawn"], sense: ["sight", "touch"], season: ["spring", "summer", "autumn"] }
  },

  // Chalk + dusk
  {
    id: "chalk-dusk-01",
    text: "The ridge is dark against the last light. The barrows along the skyline look like sleeping animals.",
    tags: { geology: ["chalk"], time: ["dusk"], altitude: ["ridgeline"], sense: ["sight"], feature: ["barrow"] }
  },

  // Chalk + night
  {
    id: "chalk-night-01",
    text: "Stars. More than you can hold. The chalk path is a pale line in the dark, the only thing visible at your feet.",
    tags: { geology: ["chalk"], time: ["night"], weather: ["clear"], sense: ["sight"], feature: ["path"] }
  },

  // Chalk + spring
  {
    id: "chalk-spring-01",
    text: "The turf is thick with flowers — small, white, close to the ground. Bees in the thyme. The air smells of warm grass.",
    tags: { geology: ["chalk"], season: ["spring"], sense: ["sight", "sound", "smell"] }
  },

  // Chalk + winter
  {
    id: "chalk-winter-01",
    text: "Frost on the chalk. The ground is iron-hard. The grass crunches. Nothing moves on the ridge.",
    tags: { geology: ["chalk"], season: ["winter"], weather: ["frost"], sense: ["touch", "sound", "sight"] }
  },

  // Chalk + features
  {
    id: "chalk-spring-01b",
    text: "The spring comes up where the chalk meets the clay — clear water, very cold, pooling in a hollow worn smooth by feet.",
    tags: { geology: ["chalk"], feature: ["spring"], sense: ["sight", "touch"] }
  },
  {
    id: "chalk-standing-01",
    text: "A stone. Taller than you, leaning slightly. The chalk underneath it is worn in a ring where people have walked around it.",
    tags: { geology: ["chalk"], feature: ["standing-stone"], sense: ["sight"] }
  },
  {
    id: "chalk-barrow-01",
    text: "The barrow is a long hump on the ridge, grass-covered, the entrance a dark slot on the eastern end. Colder here.",
    tags: { geology: ["chalk"], feature: ["barrow"], sense: ["sight", "touch", "body-sense"] }
  },
  {
    id: "chalk-settlement-01",
    text: "Smoke above the trees in the combe. A dog barking. The path turns downhill toward the sound.",
    tags: { geology: ["chalk"], feature: ["settlement-approach"], sense: ["sight", "sound"], altitude: ["slope"] }
  },

  // Clay lowlands
  {
    id: "clay-forest-01",
    text: "The trees close in. Oaks, massive, older than anything built. The canopy shuts out the sky. Your feet sink in the leaf-mould.",
    tags: { geology: ["clay"], sense: ["sight", "touch"], altitude: ["valley-floor"] }
  },
  {
    id: "clay-forest-02",
    text: "Dark in here. Green dark. The only light comes slanting where a tree has fallen. Ferns fill the gap.",
    tags: { geology: ["clay"], sense: ["sight"], weather: ["clear"] }
  },
  {
    id: "clay-rain-01",
    text: "Rain doesn't reach you under the canopy — not at first. Then the drip starts. Heavy, irregular, cold on the back of your neck.",
    tags: { geology: ["clay"], weather: ["rain", "drizzle"], sense: ["touch"], altitude: ["valley-floor"] }
  },
  {
    id: "clay-river-01",
    text: "The river is brown with clay. Alders lean over it, roots exposed. Something moves in the water — a fish, or a shadow.",
    tags: { geology: ["clay"], feature: ["river"], sense: ["sight"] }
  },

  // Granite
  {
    id: "granite-moor-01",
    text: "Open ground. Tussock grass, sharp-edged, catching at your legs. The wind has nothing to stop it here.",
    tags: { geology: ["granite"], sense: ["touch", "sight"], altitude: ["hilltop", "ridgeline"], feature: ["moor"] }
  },
  {
    id: "granite-tor-01",
    text: "The tor stands above the moor like something placed there. Grey stone, split by frost, lichened yellow on the south face.",
    tags: { geology: ["granite"], sense: ["sight"], altitude: ["summit", "hilltop"] }
  },
  {
    id: "granite-wind-01",
    text: "Wind. Nothing else. Wind and the moor and the low sky pressing down.",
    tags: { geology: ["granite"], weather: ["wind"], sense: ["sound", "touch", "body-sense"] }
  },
  {
    id: "granite-valley-01",
    text: "Down in the valley, out of the wind. Stunted oaks, twisted, draped with moss and lichen. A different world from the moor above.",
    tags: { geology: ["granite"], altitude: ["valley-floor"], sense: ["sight"] }
  },

  // Limestone
  {
    id: "lime-dale-01",
    text: "The dale drops away steeply. Ash trees on the slopes, their bark pale against the grey rock. A stream at the bottom, fast and clear.",
    tags: { geology: ["limestone"], altitude: ["slope"], sense: ["sight", "sound"], feature: ["river"] }
  },
  {
    id: "lime-cave-01",
    text: "An opening in the rock face. Dark. The air coming from it is cool and smells of wet stone.",
    tags: { geology: ["limestone"], feature: ["cave-entrance"], sense: ["sight", "smell", "touch"] }
  },
  {
    id: "lime-pavement-01",
    text: "Bare rock, grey-white, cracked into blocks. Ferns grow in the cracks. Nothing else. The sky is very large here.",
    tags: { geology: ["limestone"], altitude: ["hilltop"], sense: ["sight"] }
  },

  // Cave interior
  {
    id: "cave-01",
    text: "The wall is wet under your hand. The passage narrows. You can feel the ceiling lowering.",
    tags: { geology: ["cave-interior"], altitude: ["underground"], sense: ["touch"] }
  },
  {
    id: "cave-02",
    text: "Dripping. Somewhere ahead. The echo is different here — the space is larger.",
    tags: { geology: ["cave-interior"], altitude: ["underground"], sense: ["sound"] }
  },
  {
    id: "cave-03",
    text: "Your torch catches the rock. Wet, rippled, the colour of old bone. Something has scratched the surface — claw marks, or something else.",
    tags: { geology: ["cave-interior"], altitude: ["underground"], sense: ["sight"] }
  },

  // Water-lands
  {
    id: "water-lands-01",
    text: "Reed, as far as you can see. Brown-gold, moving in the wind like something breathing. Channels of dark water between.",
    tags: { geology: ["water-lands"], sense: ["sight"], feature: ["reed-bed"] }
  },
  {
    id: "water-lands-02",
    text: "The ground gives under your feet. Water seeps up around your step and fills the print behind you.",
    tags: { geology: ["water-lands"], sense: ["touch"], altitude: ["valley-floor"] }
  },

  // Sandstone
  {
    id: "sand-heath-01",
    text: "Heather. Purple and brown, low and dense. The path is a sandy track between the bushes. Birch trees, silver-barked, standing alone.",
    tags: { geology: ["sandstone"], sense: ["sight"], feature: ["path", "heath"] }
  },

  // Slate
  {
    id: "slate-valley-01",
    text: "The valley is steep and dark. Oak and hazel crowd the slopes. Below, the river is loud — white water over grey stone.",
    tags: { geology: ["slate"], altitude: ["valley-floor"], sense: ["sight", "sound"], feature: ["river"] }
  },

  // Glacial
  {
    id: "glacial-01",
    text: "Raw ground. Gravel and sand, grey-brown, nothing growing but lichen on the larger stones. The ice is close — you can feel its breath on the wind.",
    tags: { geology: ["glacial"], sense: ["sight", "touch"], feature: ["ice-margin"] }
  },
];
