# The Barrow — Interface Specification

## The player's window into the world: text, map, choices, and the rhythm that binds them.

---

## 1. Design Philosophy

The interface is a reading experience, not a game UI. The text is not a log that scrolls. It is a page that builds and sometimes clears, and the rhythm of building and clearing is driven by what the player is doing and how they are doing it. The prose is the primary experience. Everything else — the map, the choices, the status information — serves the prose invisibly.

The interface teaches the player how to read it through its behaviour. Fast action produces quick, accumulating text. Stillness produces deepening observation. Long absence produces reorientation. The interface reads the player's behaviour and responds with appropriate pacing, creating a conversation between the player's attention and the game's voice.

No scroll bars. No chat log. No message bubbles. No heads-up display. No inventory screen. No quest tracker. Text appearing on a dark background, building downward, clearing when the moment demands it. The choices are visually quieter than the prose. The map is peripheral. The prose is the star.

---

## 2. Layout

### 2.1 Desktop

Two regions. The **text panel** occupies the majority of the screen — roughly two thirds to three quarters of the width, centred or slightly left of centre. The **memory map** occupies a smaller region — top-right corner, compact, expandable on hover or click.

The text panel contains: the prose (the voice layer's output), the choices (appearing below the prose after a timed pause), and a minimal status line (geology, altitude, season, time of day, weather — small, unobtrusive, at the top or bottom of the panel).

The map is secondary. It is a reference tool, not the experience. It should never dominate the screen. When not actively being consulted, it should be present but visually quiet — slightly transparent, small, undemanding.

### 2.2 Mobile

The text panel fills the screen. The map is accessible via a small icon in the corner — tapping it overlays the map, tapping again dismisses it. On mobile, the game is entirely text-driven with the map as an occasional reference. This is the correct experience for a phone — reading, choosing, occasionally checking the map.

### 2.3 Visual Design

Background: dark, warm — not pure black but a deep brown-black (`#1c1a17` or similar). This is a night-fire colour, not a screen colour.

Text: warm off-white (`#d4caba`). High readability against the dark background. No pure white — that's too harsh.

Font: a good serif. EB Garamond or similar — legible, literary, with the quality of a well-set book page. Body text at 18-20px. Line height generous — 1.7 to 1.8. Max width constrained to roughly 520-580px to maintain a comfortable reading measure.

Choices: visually quieter than prose. Slightly smaller text, lower contrast (`#b0a890`), appearing below the prose with a visual gap. No buttons in the conventional sense — just text that is clickable, with subtle hover state (slight brightening, perhaps a faint underline or colour shift to `#d4c4a0`). Each choice on its own line. Left-aligned, like the prose.

Status line: very small (`12px`), very low contrast (`#5a5248`), positioned at the top of the text panel. Shows current geology, altitude, season, time of day, weather. Updates each turn. Never demands attention — it's there when you glance at it, invisible when you're reading.

---

## 3. Attention State

The attention state system determines what kind of text the voice layer produces and how the interface presents it. It is driven by the comparison between the current turn's context and the previous turn's context, combined with timing data about how quickly the player is making decisions.

### 3.1 Context Tracking

The game maintains a **perceptual context** record that captures what the player is currently experiencing:

- Current geology type
- Current altitude band (valley floor, slope, hilltop, ridgeline, summit, underground)
- Current vegetation cover (open, scrub, light forest, dense forest, moorland, heath, reed)
- Current weather
- Current time of day band (dawn, morning, midday, afternoon, dusk, night)
- Whether the player is near water (river, coast, lake)
- Whether the player is on a path
- Whether the player is near a settlement (within 2 cells)
- Whether the player is near a sacred site (within 2 cells)
- Whether the player is inside a cave

Each turn, the new context is compared against the stored context to determine what has changed.

### 3.2 Description Modes

**Full description.** Triggered when the perceptual context changes significantly:

- Geology type changed (walked from chalk into limestone)
- Altitude band changed by more than one step (hilltop to valley floor)
- Vegetation cover changed dramatically (dense forest to open ground, or vice versa)
- Player entered or exited a cave
- Player entered or exited a settlement
- Player arrived at a sacred site for the first time
- Game start (emerging from the barrow)
- Player has been absent for more than two minutes and is reorienting

Full descriptions are 3-6 sentences. They describe the scene — what the player sees, hears, smells, feels. They establish the new context completely. The page clears before a full description appears.

**Movement update.** Triggered when the player moves but the context hasn't changed significantly — continuing along the same ridge, walking through the same forest, following the same river. The geology is the same, the altitude shift is small, the vegetation hasn't changed.

Movement updates are 1-2 sentences. They note what's different: a shift in footing, something new coming into view, a sound appearing or fading, a single sensory detail. They do not re-describe the scene.

Movement updates append to the existing page, below the current text.

**Tarrying observation.** Triggered when the player chooses to wait. These are the reward for stillness — details that emerge from paying attention. They deepen with successive waits.

First tarry: a sound observation. Something the player hears now that they've stopped moving. "Water, somewhere below. A stream you couldn't hear while walking."

Second tarry: a visual detail. Something the player notices now that they're looking closely. "A mark on the stone. Shallow, weathered. Might be deliberate."

Third tarry: a subtler observation. Body sense, a change in the air, an animal sign, something at the edge of perception. "The wind has shifted. Colder now, from the north. The grass bends differently."

Fourth and subsequent tarries: increasingly subtle or unexpected observations. These draw from the knowledge layer when it exists — noticing a symbol, recognising a plant, reading an animal sign. Eventually the observations may become sparse — the place has revealed what it has to reveal, at the player's current knowledge level. "Nothing new. The ridge, the wind, the sky. You know this place now."

Tarrying observations are 1 sentence each, occasionally 2. They append to the page if the player is tarrying in quick succession (building a portrait of the place). They appear on a cleared page if the player has been slow (signalling a shift in mode).

**Transition moment.** Triggered when a specific environmental variable changes while the player's position hasn't changed or has changed only slightly:

- Weather changes (rain starts, fog lifts, wind picks up)
- Time of day crosses a threshold (dawn breaks, dusk falls, night comes)
- A distant feature becomes visible (smoke from a settlement, the glint of water, the edge of the ice)
- A sound changes (river becomes audible, settlement sounds appear, birdsong shifts)

Transition moments are 1-2 sentences. They register the change without re-describing the whole scene. "Rain. From the southwest, steady." or "The light is going. The valley fills with shadow."

Transition moments append to the existing page.

**Reorientation.** Triggered when the player returns after a long absence (more than two minutes since their last action). The page clears. A brief reorienting sentence appears — a compressed reminder of where they are — followed by a fresh description that's slightly shorter than a full description. "The ridge. Chalk underfoot. The wind hasn't changed." Then a 2-3 sentence scene description. Then choices.

### 3.3 Description Mode Selection

Each turn, the game evaluates:

1. Has the player been absent for more than two minutes? → **Reorientation**
2. Has any major context variable changed (geology, altitude band by 2+, vegetation cover, cave/settlement/sacred site entry)? → **Full description** (clear page)
3. Did the player choose to tarry? → **Tarrying observation** (append or clear based on timing — see section 4)
4. Did an environmental variable change (weather, time threshold, new feature visible)? → **Transition moment** (append)
5. Did the player move but context is largely the same? → **Movement update** (append)

Priority order: 1 > 2 > 3 > 4 > 5. If multiple apply (player moved into new geology AND weather changed), the higher-priority mode wins and the lower-priority change is folded into the description.

### 3.4 Travel Sequences
A travel sequence is initiated when the player chooses a directional movement option rather than an immediate action. Instead of moving one cell and producing a description, the game moves the player cell by cell along the chosen bearing, checking each cell for interrupt conditions. If no interrupt fires, it continues until a maximum distance is reached. Then it produces a compressed travel narrative from the traversed cells and offers new choices.
Distance per travel sequence. The maximum distance covered in a single travel turn varies with terrain:

Open ground (chalk ridge, moorland, heath): up to 5 cells
Light forest, scrub, moderate terrain: up to 3 cells
Dense forest (clay lowlands), steep terrain (slate valleys): up to 2 cells
Difficult terrain (bog, glacial debris, thick undergrowth): 1-2 cells

These maximums represent roughly thirty minutes to an hour of walking. Time advances proportionally to distance covered.
Interrupt conditions. The travel sequence stops early — before reaching maximum distance — when the player's route encounters something worth noticing:

Geology type changes
Altitude band changes by two or more steps (e.g., slope to ridgeline)
A river crosses the path
A path junction appears
A settlement becomes visible (smoke, sounds, clearing)
A sacred site comes within sight range
The coast is reached
The ice edge is reached
Weather changes during travel
A time-of-day threshold is crossed (dawn breaks, dusk falls)
The terrain becomes impassable (water, ice, cliff)

When an interrupt fires, the travel stops at the interrupting cell and triggers the appropriate description mode — full description for a geology change, transition moment for a weather change, and so on. The travel narrative covers the distance up to the interrupt point, and the interrupt event is described separately.
Travel narrative. The compressed description of a multi-cell journey is assembled from:

One travel fragment appropriate to the terrain traversed (describing the experience of covering ground, not of arriving somewhere)
One or two sensory observations drawn from the cells traversed (not just the destination)
Brief notes on anything notable passed during the journey — a stream crossed, a path junction, a change in vegetation, an animal sign
Total length: 3-4 sentences for a journey of 3-5 cells

The travel narrative has a different quality from place descriptions. Place descriptions are still — they describe where you are. Travel narratives have forward momentum — they describe ground passing under your feet, the landscape changing gradually, observations that come and go. "The ridge runs on. Chalk underfoot, wind on your left, the valley dropping away to the east. You cross a shallow combe where hazel grows in the shelter. The ridge resumes beyond."
Relationship to attention state. A travel sequence is a distinct mode that sits between full description and movement update:

Full description: triggered when the player arrives somewhere new (after an interrupt or at the start of a session)
Travel narrative: triggered when the player is covering ground through terrain they're already oriented in
Movement update: may still be used for very short moves (1 cell) where the context barely changes

The travel narrative replaces what would otherwise be several consecutive movement updates. Instead of five turns of "the ridge continues" with the player clicking "continue north" each time, one travel turn covers the same ground in a single compressed narrative. The result is the same distance covered, the same time elapsed, but a better reading experience.
Page behaviour during travel. A travel narrative appends to the existing page with a moderate gap (20px), the same as a movement update. If the travel ends with an interrupt that triggers a full description, the page clears as usual. The travel narrative and the subsequent full description feel like a continuous sequence — the journey, then the arrival.

### 3.5 Description Mode Selection (Updated)
Each turn, the game evaluates:

Has the player been absent for more than two minutes? → Reorientation (clear page)
Did a travel sequence just end with an interrupt that constitutes a major context change (geology, altitude band by 2+, cave/settlement/sacred site entry)? → Full description (clear page)
Did the player choose a directional travel option and the context is largely stable? → Travel narrative (append)
Did the player choose to tarry? → Tarrying observation (append or clear based on timing)
Did an environmental variable change (weather, time threshold, new feature visible)? → Transition moment (append)
Did the player make an immediate one-cell move with minimal context change? → Movement update (append)

Priority: 1 > 2 > 3 > 4 > 5 > 6. If a travel sequence triggers an interrupt, both the travel narrative (for the distance covered) and the interrupt description (full or transition) are produced in sequence — the travel narrative first, then the interrupt description below it.

---

## 4. Timing and Pace

The interface reads the player's decision speed to determine presentation behaviour. This is not about punishing slow players or rewarding fast ones — it's about matching the interface rhythm to the player's reading rhythm.

### 4.1 Timing Thresholds

**Rapid (under 5 seconds).** The player is moving briskly, covering ground. They've read the text and made a quick decision. Interface behaviour:

- Next description appends immediately below the current text
- Choices appear immediately after the description
- Page builds quickly — the accumulation of text creates a sense of movement
- Best suited for movement updates

**Normal (5-30 seconds).** The player is reading at a natural pace. They've absorbed the description and are considering their options. Interface behaviour:

- Next description appends below with a small visual gap
- Choices appear after a 1-2 second pause — a breath of text-only reading before the next decision
- The page builds at a comfortable reading pace

**Contemplative (30 seconds to 2 minutes).** The player is thinking carefully, or savouring the text. Interface behaviour:

- If moving: description appends with a wider visual gap (a paragraph break)
- If tarrying: observation appears on the same page with a wider gap, signalling deepening attention
- Choices appear after a 2-3 second pause

**Absent (over 2 minutes).** The player has been away, or is deeply absorbed in something outside the game. Interface behaviour:

- Page clears when the player acts
- A brief reorienting description appears
- Choices appear after the reorientation text

### 4.2 Choice Appearance Timing

Choices do not appear simultaneously with the description. There is always a pause between the description appearing and the choices appearing. This forces the player to read before acting — or at least, creates a moment where reading is the only option.

The pause duration scales with description length:

- Full description (3-6 sentences): 3-4 second pause
- Movement update (1-2 sentences): 1 second pause
- Tarrying observation (1 sentence): 1-2 second pause
- Transition moment (1-2 sentences): 1-2 second pause
- Reorientation: 2-3 second pause

The choices fade in rather than appearing abruptly — a 0.5 second opacity transition from 0 to full. This softens the moment of transition from reading to deciding.

### 4.3 The First Turns

The opening sequence uses a special pacing mode. The player has just started the game. They don't yet know how to read this interface. The first few descriptions appear with slower pacing to teach the rhythm.

**Turn 0 — emergence.** The opening description appears sentence by sentence, with 2-3 second pauses between sentences. Not animated typing — timed reveals. Each sentence appears fully formed, holds for a moment, then the next appears below it. This teaches the player: this is a game you read. This is a game that breathes.

After the full opening description has appeared (perhaps 5 sentences, taking 15-20 seconds), a longer pause (4-5 seconds), then the first choices fade in.

**Turns 1-3.** Descriptions appear with slightly longer pauses before choices (4-5 seconds instead of the normal 2-3). By turn 4-5, the pacing has normalised to the timing-responsive system described above.

---

## 5. Page Management

### 5.1 Building

The page builds downward. New text appears below existing text, separated by appropriate spacing. The page scrolls automatically to keep the newest text visible — but the scroll is smooth and gentle, not a snap.

### 5.2 Clearing

The page clears with a fade — not an instant wipe. The existing text fades out over 0.5-1 second, then the new text fades in. This creates a gentle transition between scenes rather than a jarring reset.

The page clears when:
- A full description is triggered (new context)
- A reorientation is triggered (long absence)
- A tarrying observation follows a long pause (mode shift from movement to stillness)
- The page has reached capacity

### 5.3 Capacity

The page holds roughly the equivalent of a book page — approximately 300-400 words, or 15-20 sentences. When a new addition would exceed this capacity, the oldest text on the page fades out to make room. This happens gradually — the top paragraph fades while the new text appears at the bottom. The player never needs to scroll up. The current experience is always at the bottom of the visible text.

### 5.4 Visual Spacing

Different description modes have different spacing from the previous text:

- Movement update after movement update: small gap (8-12px)
- Movement update after full description: moderate gap (16-20px)
- Tarrying observation appending: moderate gap (16-20px)
- Transition moment: moderate gap (16-20px)
- After a paragraph-break pause (contemplative timing): large gap (24-32px)

Choices are separated from the prose by a larger gap (32-40px) and possibly a subtle visual divider — not a line, but a shift in the visual field that signals "the prose has paused, now it's your turn."

---

## 6. The Memory Map

### 6.1 What the Map Shows

The map represents the player character's spatial memory of the landscape. It is not an objective survey. It shows what the player has seen, fading over time, with memorable features persisting.

**The immediate surroundings.** A visibility radius around the player's current position, showing terrain in full detail — geology colour, rivers, paths, features. The radius varies:

- Summit or hilltop in clear weather: 8-12 cells (you can see for miles)
- Open ground (chalk, moorland) in clear weather: 5-8 cells
- Light forest or scrub: 3-5 cells
- Dense forest (clay lowlands): 2-3 cells
- Fog: 1-2 cells regardless of terrain
- Night with moonlight: 2-3 cells
- Night without moon: 1 cell (just the ground beneath you)
- Underground: 0 cells (no map visible)

**Recently visited terrain.** Areas the player walked through in the current session are shown in full detail. Areas visited in recent sessions are shown with slight fading. The recency is measured in game-time, not real-time.

**Older memories.** Areas visited more than a few game-days ago begin to fade. The geological colours mute. The terrain detail blurs. After a season, only major features remain visible. After a year, the area is nearly dark again — just landmarks.

**Memory anchors.** Certain features resist the fade permanently:

- Sacred sites the player has visited (standing stones, barrows, stone circles, sacred springs, cave entrances). These remain as markers on the map regardless of how long ago the visit was.
- Settlements the player has visited. Marked with their settlement-type symbol.
- Locations of significant events. The game flags moments of narrative importance — first encounter with a cave-wight sign, first word-telling heard, first significant gift given, first ritual witnessed. These locations are marked on the map and persist.
- Paths the player has walked more than once. A path walked once fades with its surrounding terrain. A path walked three or more times becomes permanent.
- Rivers the player has followed or crossed. Major rivers persist once encountered; minor streams fade.

### 6.2 Sightline Reveals

When the player reaches a high point with a view, the map reveals distant terrain in the directions they can see. This revealed terrain is vague — a suggestion of what's there, not a detailed survey. The player can see that there's a river valley to the east, or a dark mass of forest to the south, or smoke rising from a settlement beyond the ridge. But the detail is sketch-like: general geology colour, major features, approximate terrain shape.

Sightline reveals are one of the map's most rewarding moments. Climbing a hill isn't just rewarded by the voice description — it's rewarded by the map opening up, showing distant possibilities, inviting the player to choose a direction based on what they can see from up here.

Sightline-revealed terrain fades faster than walked terrain (you saw it from a distance, you didn't experience it), but the major features it revealed (a distant settlement's smoke, a standing stone on a far ridge) persist as vague markers.

### 6.3 What the Map Does Not Show

**Compass rose.** No cardinal directions marked on the map. North is at the top (conventional), but the player is not told this explicitly. They orient by the sun (which the voice layer describes), by terrain features, by known landmarks.

**Coordinates.** No grid, no numbers, no position readout.

**Complete terrain.** Unexplored areas are dark — warm dark, not empty. The darkness has presence. It is the unknown.

**Other people's locations.** No NPC markers, no "quest givers," no icons showing where people are. You find people by going to their settlements, by encountering them on paths, by following the voice layer's descriptions.

**The player's exact position marker.** This is debatable. A subtle marker showing where the player is on the map may be necessary for practical navigation. If included, it should be minimal — a small dot or ring, not a glowing arrow. It should feel like "you are here" on a hand-drawn map, not a GPS pin.

### 6.4 Map Interaction

**Desktop.** The map sits in the corner, compact. Hovering over it slightly enlarges it (a subtle scale increase). Clicking it expands it to a larger overlay — perhaps half the screen — where the player can examine their known landscape in more detail. Clicking again or pressing Escape returns it to compact view. No dragging or zooming — the map is centred on the player and shows what it shows. The map cannot be scrolled to show unexplored areas (there's nothing to show).

Later, when the game has more depth, the expanded map might allow the player to tap on memory anchors to recall information about them — the name of the settlement, the type of sacred site, what happened there. But for now, it's purely visual.

**Mobile.** The map is accessible via a small icon. Tapping it shows the map as a full-screen overlay. Tapping again dismisses it. Simple and clean.

### 6.5 Map Visual Style

The map should not look like a satellite photograph or a game minimap. It should look like a **remembered landscape** — slightly impressionistic, with soft edges, warm colours, and the quality of something drawn from memory rather than surveyed from above.

Full-detail terrain (current surroundings, recently visited): rendered with the terrain viewer's geological colours and hillshading, but slightly softened — maybe a light blur or reduced contrast compared to the terrain viewer's crisp rendering.

Fading terrain: the colours desaturate and darken progressively. Recently faded: muted colours, less contrast. Old memories: near-monochrome, very low contrast, blending into the surrounding darkness.

Memory anchors: rendered as small, simple symbols — a dot for settlements, a diamond or circle for sacred sites, a small mark for event locations. The symbols should be warm-coloured (gold or amber) against the terrain, visible but not garish. Sacred sites might have a slightly different symbol colour (pale gold) from settlements (warm amber) and event markers (soft white).

The player's position (if shown): a small, warm-coloured ring. Not pulsing, not glowing, not animated. Just present.

The boundary between known and unknown terrain should be soft — a gradient from visible to dark over several cells, not a hard line. Memory doesn't have sharp edges.

---

## 7. Choices

### 7.1 Presentation

Choices appear below the prose after a timed pause (see section 4.2). They are visually quieter than the prose — slightly smaller font (15-16px versus 18-20px for prose), lower contrast, left-aligned beneath the text.

Each choice is on its own line. No numbering. No bullet points. Just the text of the choice, clickable. Hover state: slight brightening and a subtle colour shift.

Maximum 5-6 choices visible at once. If more are available, the interface selects the most contextually interesting ones (see the choice generator design in the upper layers document).

### 7.2 Choice Types and Intent Levels
Choices operate at three levels of intent, reflecting how the player engages with movement:
Immediate actions (one cell, one turn). These are available when the player is at or near something interesting. They represent close engagement with the environment.

"Examine the stone."
"Cross the ford."
"Enter the settlement."
"Approach the cave entrance."
"Climb the tor."

Immediate actions produce full descriptions or feature-specific descriptions. They are the choices of arrival and investigation.
Directional travel (multi-cell, variable turns). These are the core movement choices during normal exploration. The player picks a direction and a mode of travel. The game narrates the journey until something interrupts.

"Continue north along the ridge."
"Follow the river downstream."
"Descend east into the valley."
"Head toward the smoke."
"Push deeper into the trees."
"Cross the open ground to the south."

Directional choices initiate travel sequences (see section 3.4). The player covers several cells in a single turn, with a compressed travel narrative. The game decides when to stop based on interrupt conditions — the player doesn't need to choose when to stop, because the landscape tells them.
The phrasing of directional choices should convey the mode of travel, not just the direction. "Follow the river downstream" implies bankside walking. "Push deeper into the trees" implies difficult progress. "Continue along the ridge" implies easy, open walking. The phrasing sets expectations about speed and difficulty.
Distant intent (goal-directed, future implementation). These become available as the player accumulates knowledge of the landscape — learning about landmarks from word-tellings, seeing features from hilltops, remembering routes from previous visits.

"Head for the stone circle at Brendur."
"Find the spring the wise woman described."
"Return to Breca's settlement."

Distant-intent choices initiate pathfinding across multiple districts, narrated as a sequence of travel turns with interrupts. The game finds a plausible route and walks the player along it, stopping at each interesting point. This is a late-game capability that requires the knowledge layer, the path system, and accumulated player experience. It is not implemented in the initial walker.
The wait choice. Always available, always last. "Stay here. Watch. Listen." This initiates tarrying, not travel.

### 7.3 Keyboard Interaction

Choices can be selected by pressing number keys (1-6) corresponding to their position in the list. This allows fast play without mouse interaction. The numbers are not displayed — they are a convenience for players who discover them, not a visible UI element.

The Enter key selects the last-used choice type (movement continues in the same direction, tarrying continues tarrying). This allows a player who is walking steadily in one direction to just press Enter repeatedly, building up the page with movement updates, without looking at the choices at all.

### 7.4 Choice Phrasing

Choices are phrased as impulses — what the player might think to do — not as commands. They emerge from the situation. They read as natural thoughts following the description.

After a description of a chalk ridge at dawn: "Continue south along the ridge." "Descend east into the combe." "Examine the stone." "Stay here. Watch the light change."

After a description of dense forest: "Push deeper into the trees." "Follow the sound of water." "Turn back toward the ridge." "Wait. Listen."

The phrasing changes with context, with the player's knowledge (choices they couldn't conceive of before learning something don't appear), and with the description mode (a movement update might offer fewer, simpler choices than a full description).

---

## 8. Status Information

### 8.1 What's Shown

A minimal status line providing orientation without demanding attention:

- Current geology name (e.g., "Chalk downland")
- Approximate altitude (e.g., "280m")
- Season (e.g., "Late summer")
- Time of day (e.g., "Afternoon" or more poetically "The light is long")
- Weather (e.g., "Clear" or "Rain from the west")

### 8.2 Presentation

The status line is very small (11-12px), very low contrast, positioned at the top of the text panel. It updates each turn but does not draw attention to itself. It is reference information — the player glances at it when they want to know the time or check what geology they're on. It is not part of the reading experience.

An alternative approach: no persistent status line. Instead, the player can access this information through a tarrying action or through a specific "look around" choice. This is more immersive but less practical. The persistent status line is the pragmatic compromise.

### 8.3 What's Not Shown

- Health bars, hunger meters, or any numerical state representation
- Experience points, skill levels, or progression indicators
- Quest objectives or task lists
- NPC relationship meters
- Knowledge progress or discovery counts
- Turn counter or distance walked

These things exist in the game state but they are never displayed numerically. The player reads their state through the voice layer — they know they're hungry because the text mentions it, they know they're cold because the descriptions mention it, they know they've learned something because new choices appear and new details are noticed. The interface never abstracts the experience into numbers.

---

## 9. Sound

### 9.1 Current Scope

The initial implementation may be text-only with no sound. However, the interface is designed to accommodate sound when it's added.

### 9.2 Future Sound Design

Ambient sound, if added, should follow the same philosophy as the visual interface — understated, environmental, responding to context rather than demanding attention.

Wind on the ridge. Rain. Birdsong that changes with habitat. The sound of water — river, coast, rain. Fire crackling at a settlement. Silence underground.

No music in the conventional sense. The soundscape is the landscape. Music, if present at all, would be diegetic — someone singing at a settlement, a ritual chant heard from a distance.

Sound should never duplicate what the text says. If the text describes birdsong, the sound layer doesn't need to play birdsong at that moment — or if it does, the text might omit the mention and let the sound carry it. The text and sound layers should complement, not echo.

---

## 10. Illustrations

### 10.1 When They Appear

Illustrations are rare. Most turns are text only. An illustration appears when the player encounters something visually significant:

- A standing stone, seen up close for the first time
- A symbol carved or scratched at a significant site
- A cave painting revealed by torchlight
- An impossible object at the moment of first encounter
- A landscape viewed from a summit when the shape of the world is revealed
- A specific artefact — a bronze amulet, a carved figure, a jet bead
- A barrow entrance at the moment of emergence or return

Illustrations do not appear for: generic travel, weather, settlement views at distance, people.

### 10.2 Presentation

When an illustration appears, it appears above or within the text, as part of the reading flow. Not in a popup, not in a separate panel. It is part of the page, like an illustration in a book. The text flows around or below it.

The illustration appears with the same timed-reveal pacing as text — it fades in, holds, then the descriptive text appears below it. The combination of image and text is the complete experience of the moment.

### 10.3 Style

Spare line art in a consistent hand. The reference style is F.L. Griggs — etching, precise, atmospheric, rooted in the English landscape. More suggested than rendered. The illustrations look like they were drawn by one person who has been to these places and drawn what they saw.

During development, AI-generated placeholders in the Griggs style. For the Steam release, commissioned illustrations from a human artist.

---

## 11. The Opening Sequence

The game begins with:

A dark screen. Nothing but the dark warm background.

After 2-3 seconds: "Dark."

After 3 seconds: "Stone above you, close. The smell of earth."

After 3 seconds: "Your hands find the wall. Rough. Cold."

After 3 seconds: "Ahead — not dark. Grey. A different dark."

After 3 seconds: "You move toward it."

After 4 seconds: "Light."

The screen brightens very slightly — not to full brightness, but enough to register the change.

After 3 seconds: the first full description of the landscape outside the barrow. This appears sentence by sentence with 2-3 second pauses, as described in section 4.3.

After the full description: a longer pause (5 seconds). Then the first choices fade in.

The opening sequence takes perhaps 60-90 seconds. It is the player's first lesson in how to read this game. It establishes the pace, the voice, the darkness, the emergence, the light. It is the game's thesis statement delivered as experience rather than explanation.

---

## 12. Summary

The interface is built on four principles:

**Text is primary.** The voice layer's prose is the player's primary experience of the world. Everything else — map, choices, status — serves the text.

**Rhythm is responsive.** The interface reads the player's behaviour (decision speed, movement patterns, tarrying choices) and adjusts its pacing to match. Fast play builds pages quickly. Slow play deepens observations. Absence triggers reorientation.

**The map is memory.** The map shows what the player has seen, fading over time, with memorable features persisting. It is not an objective survey but a spatial memory that rewards exploration and attention.

**Less is more.** No numbers, no meters, no progress bars, no quest logs. The player's state is communicated through the prose. The interface is as spare as the voice — trusting the player to read, to notice, to remember, to wonder.
