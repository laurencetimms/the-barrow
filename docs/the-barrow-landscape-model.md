# The Barrow — Landscape Model

## A design document describing the generation, structure, and behaviour of the game world.

---

## 1. The Four Scales

The world of The Barrow operates at four nested scales. Each scale has distinct generation requirements, content types, and relationships with the player's experience.

### 1.1 Regional Scale

The largest unit. A region spans tens or hundreds of miles and has a consistent geological and cultural identity. The chalk south. The granite west. The clay lowlands. The glacial north. Regions are defined by the fixed frame and the geological zones described in the game design document.

The player experiences regional change as a slow shift over days of travel. The soil changes colour. The trees change species. The rock in outcrops changes character. The people speak differently and build differently. Regional transitions are gradients, not borders — the chalk doesn't end and the limestone begin at a line. There's an interzone where both are present, and that interzone has its own character.

Regions determine the broad parameters for everything within them: what rock types are present, what soil forms, what trees grow, what animals are common, what food sources exist, what materials are available for craft, what kind of sacred places occur, what the travel experience feels like, what language family the people speak, and what the general density of human habitation is.

Regions are generated first, as the broadest strokes within the fixed frame. The generation needs to place geological zones in geographically plausible arrangements — chalk in the south, granite and slate in the western mountains, clay in the eastern lowlands, glacial debris in the north, limestone and sandstone in transitional areas. The boundaries between zones should be irregular, with intrusions, overlaps, and local anomalies, following the messiness of real geology.

### 1.2 District Scale

The basic unit of place. A district is roughly a day's travel across — approximately ten to fifteen miles in extent. It might be a river valley, a stretch of coast, a section of upland, a patch of forest, a portion of marshland. The district is where the landscape becomes specific.

A district has a terrain type derived from its region's geology, but with local variation. A limestone district might contain a gorge, a cave system, a sheltered valley with a settlement, and an exposed hilltop with a cairn. A chalk district might have a stretch of open downland, a combe with a spring, a barrow on the ridgeline, and a track leading to a ford. The district is where the generation algorithm places the specific features the player encounters.

Each district has a density of content related to its terrain and human habitation. A district with a settlement has more to discover than a district of empty moorland. But no district should be truly empty. Even the most sparse landscape has things: animal signs, weather patterns, a stone that might be natural or placed, a view that reveals something about the landscape beyond. The granite uplands are sparse because granite country is harsh. The chalk south is denser because it's been inhabited longer.

A district contains between five and twenty sites, depending on its density. The density gradient across the world should feel natural, emerging from geology and settlement patterns — more people live where the land supports more people, and more people means more sites, more knowledge, more connections.

One district should be enough for many sessions of play. A player who never leaves Breca's river valley should have a satisfying experience — relationships, knowledge, mysteries, seasonal rhythms, and enough depth to sustain dozens of short sessions. The game should not require travel to be interesting. Travel should be a choice driven by curiosity, not by content exhaustion.

Equally, a player who keeps moving should never feel the world thinning. Every new district should have something — not necessarily a settlement or a sacred place, but something that raises a question or rewards attention.

Districts must be aware of their neighbours. A river flowing through one district continues into the next. A path leading out of one district arrives somewhere in the adjacent one. A ridgeline visible from one district persists in the next. These connections must be consistent. The generation cannot place a river flowing east in one district and have it vanish at the border. District-scale generation must know, at minimum, the major features — rivers, ridgelines, paths, coastline — of neighbouring districts.

### 1.3 Site Scale

The smallest named unit. A site is a specific place within a district — a rock shelter, a ford, a standing stone, a clearing, a cave entrance, a settlement, a hilltop, a spring, a pool, a fallen tree across a stream, a stretch of exposed rock with marks, a place where two paths cross.

Sites are where the game's moment-to-moment play happens. When the text describes what the player sees, it's describing a site. When the player makes choices, they're choosing between sites or choosing what to do at a site.

Each site has a set of properties:

**Physical presence.** What's there. The standing stone, the pool, the roundhouses. This doesn't change between visits (with the exception of persistence changes — see Section 9).

**Knowledge-gated content.** Things that are present but only perceptible to a player with specific knowledge. A cave entrance hidden by undergrowth, visible only to someone who has learned to read limestone landscapes. Marks on a rock face, meaningful only to someone who has learned to read symbols. An herb growing at the base of a wall, recognisable only to someone with foraging knowledge. This content is always present in the site data — it doesn't appear when the player gains knowledge. Rather, the player gains the ability to perceive what was always there.

**Temporal content.** Things that happen or become visible at specific times. A shadow that falls on a rock face at a specific time of year. A spring that flows strongly after rain but barely trickles in drought. An animal that comes to drink at dusk. A gathering that happens at midsummer. Temporal content is gated by the game's solar and lunar calendars, by weather, and by time of day.

**Relational content.** Things that exist because of the player's relationships. The wise woman told you about this stone. Breca's symbol matches the mark on this cairn. The men from across the water camp here at midsummer. Relational content connects sites to people and to the knowledge graph.

**Resource content.** What the site offers practically. Shelter quality. Food sources. Water. Materials for craft. These are the survival-relevant properties that matter most in the early game and continue to matter cyclically as winter reasserts base-layer needs.

**Connection content.** How the site relates to other sites and to paths. Which paths lead here. What's visible from here. What sounds carry from adjacent sites. A site on a hilltop has long sightlines. A site in a valley floor is enclosed. A site at a cave entrance connects to the underground geography.

### 1.4 Moment Scale

The finest grain — what the player actually reads. Not generated as persistent content but produced on the fly by the voice layer, drawing on the current state of the site, the player's accumulated knowledge, the time of day, the weather, the season, the moon phase, and the fragment library.

The same site produces different text on different visits because the player has changed, the time has changed, and the voice layer varies its descriptions. The underlying site data is stable. The standing stone doesn't move. The spring doesn't dry up. What changes is what the player is able to notice and how the world is presenting itself right now.

The moment scale is where the fragment library does its most important work. The text must be specific, concrete, and varied. Not "you see a hill" but "the hill is bare above the treeline, the grass cropped short, sheep tracks in the mud." Not "it's raining" but "rain on the wind from the west, coming in sheets, the valley below disappearing into grey."

---

## 2. Paths

Paths are connectors between sites that have their own properties and content. They are not sites — the player moves through them rather than staying at them — but they are not abstract connections either. They have physical reality, take time to traverse, and can contain encounters and discoveries.

### 2.1 Path Properties

Each path has:

**Terrain type.** Derived from the district's geology and the specific ground the path crosses. A ridge path over chalk downland. A valley-floor path through oak forest on clay. A scramble over granite boulders. Terrain determines travel speed, difficulty, and what the player might notice along the way.

**Difficulty.** How hard the path is to traverse. Affected by terrain, weather, season, and the player's condition. A muddy clay path in rain is much harder than the same path in dry summer. A mountain pass in winter might be impassable. Difficulty affects how far the player can travel in a session.

**Travel time.** How long the path takes to traverse. Derived from distance, terrain, difficulty, and weather. A short path across open downland takes less time than a longer path through dense forest, even if the distances are similar, because forest travel is slower.

**Exposure.** How vulnerable the player is to weather while on the path. A ridge path is highly exposed — wind, rain, cold. A valley-floor path through forest is sheltered. Exposure matters because weather events during travel are some of the game's most consequential moments — a storm on an exposed ridge forces hard choices.

**Observations.** Things the player might notice while travelling. Animal signs on a ridge. Useful plants in a wood. A distant view from a high point. A sound that suggests water. These are generated from the path's terrain and the player's knowledge, and they're one of the primary mechanisms for discovering new sites. "You notice a dark opening in the rock face, half-hidden by hazel scrub, twenty paces off the track" — that's a cave entrance site, discovered via a path observation.

**Encounter possibility.** The chance of meeting someone on the path. Higher on well-travelled routes near settlements, lower on remote tracks. An encounter on a path is different from an encounter at a site — it's briefer, more contingent, shaped by where both parties are going. A trader heading to a ford. A hunter returning with a deer across their shoulders. The wise woman, unexpectedly, far from her valley.

**Visibility.** What the path itself looks like and how easy it is to find. Some paths are obvious — wide, worn, marked by generations of feet. These are the major trackways, the ridgeways, the trade routes. Some are faint — animal trails, seasonal routes, paths that are only paths because one person walks them regularly. Some are invisible unless you know they're there — a route described to you by someone who knows the land, a path that only makes sense if you know where it leads. Path visibility is both a property the player encounters (can I find this path?) and a knowledge-gated feature (I was told about a path through the marsh that avoids the deep water).

### 2.2 Path Types

**Trackways and ridgeways.** The major routes, following high ground where the going is easier and the views are long. These are the oldest paths in the landscape — some have been walked for thousands of years. They connect distant places and are the primary long-distance travel routes. The chalk escarpment ridgeway. The mountain spine track. These are always present and always findable.

**Valley paths.** Following rivers downstream, connecting settlements. The primary local routes in most regions. Often muddy, sometimes flooded, but connecting the places where people actually live. In slate country, valley paths are the only practical routes because the terrain is too steep for ridgewalking.

**Animal trails.** Made by deer, pigs, and other animals. Narrower, less predictable, but often leading to water, to clearings, to food sources. Recognising an animal trail requires the Animal Signs knowledge. Following one can lead to useful sites — a drinking pool, a fruiting grove, a salt lick — or it can lead nowhere useful.

**Seasonal paths.** Routes that exist only at certain times. A path across marshland that's dry in summer and submerged in winter. A mountain pass that's clear from late spring to early autumn and impassable under snow the rest of the year. A tidal path across the water-lands that exists only at low water. These paths are gated by the game's temporal systems and require knowledge of those systems to use reliably.

**Hidden paths.** Routes known only to specific people. The wise woman knows a way through the forest that avoids the bog. The water-people know a channel through the reed beds that's navigable at quarter-tide. These paths become available to the player through relationships and trust. They're often the most direct or safest routes to places that are otherwise hard to reach, which makes the relationship that grants them genuinely valuable.

**Paths described in word-tellings.** Ancient routes mentioned in oral tradition. "The men from across the water follow the ridge north because that's the route their forebears took, according to the word-telling." These paths might still be walkable or might be partly lost — a section submerged by the water-lands, a stretch through forest that's grown over. Finding and following a path from a word-telling is one of the game's deep pleasures, connecting the player to the legendary figures who walked it before them.

### 2.3 Paths and Discovery

Paths are one of the primary mechanisms by which the player discovers new sites. Travel is not a loading screen between meaningful locations — it's the connective tissue of the game, and it should feel like walking.

While on a path, the voice layer draws observations from the terrain, the player's knowledge, and random variation. Most observations are atmospheric — the quality of light, the sound of birds, the feel of the ground underfoot. But some observations are discovery prompts: "Off to the left, a break in the trees where the ground rises to an outcrop of pale rock." The player can choose to investigate — leaving the path, which takes time and might mean losing the path if it's faint — or continue on.

Discoveries made from paths tend to be the sites that aren't well known. The obvious sites — settlements, major landmarks, prominent features — are found by simply travelling through the landscape. The hidden sites — a tucked-away rock shelter, a spring in a combe, a carved stone half-buried in undergrowth — are found by leaving paths and investigating observations. This rewards the player who pays attention to the voice layer's descriptions and acts on curiosity.

---

## 3. Rivers and Water

Rivers are landscape features that generate both paths and barriers. They are not paths themselves, but they create paths along their banks and through their waters, and they create crossing points that function as both sites and conditional paths.

### 3.1 Rivers as Landscape Features

A river is a continuous feature that flows through one or more districts, following topography from its source to the sea, to a lake, or to the water-lands. Rivers must be consistent across district boundaries — a river that flows east in one district must continue east in the adjacent district, unless the topography provides a reason for it to turn.

Rivers have properties that vary along their length:

**Width and depth.** Narrow and shallow near the source, wider and deeper as tributaries join. Width and depth determine whether the river is a barrier (must be crossed at a ford), an obstacle (can be waded with difficulty), or negligible (can be stepped across).

**Speed.** Fast in steep country, slow in flat lowlands. Speed affects the danger of crossing and the viability of boat travel. A fast mountain river in slate country is dangerous to ford and impossible to boat upstream. A slow, broad river through clay lowlands is easy to boat in both directions.

**Character.** Clear over chalk, peaty brown in moorland, silty and opaque in clay lowlands. The character of the water tells the player about the geology upstream. A river running clear through a muddy landscape suggests a chalk or limestone source.

**Flood behaviour.** Rivers respond to rainfall and season. A river that's fordable in summer might be impassable after autumn rains. Spring snowmelt from the mountain spine causes the lowland rivers to flood. The water-lands expand in winter as water levels rise everywhere. Flood behaviour connects the hydrological system to the game's weather and seasonal systems.

### 3.2 Bankside Paths

Rivers generate paths along their banks. These bankside paths are the primary travel corridors in many regions, particularly in slate country where valleys are the only practical routes. Following a river downstream is one of the most reliable ways to find people and eventually reach the coast. Following it upstream leads to higher ground, thinner settlement, and eventually the source.

Bankside paths have river-specific properties: fishing spots, places where the bank is eroded and difficult to pass, places where tributaries join and must be crossed, places where the floodplain is wide and marshy and the path must detour to higher ground. The river is a constant companion on these paths — a source of water, food (fish, waterfowl), and information (the water level tells you about conditions upstream).

### 3.3 Water Paths

A river is a path for boats. Boat travel is fundamentally different from walking. It's faster. It's directional — downstream is easy, upstream is work. It gives the player a different perspective on the landscape — the banks seen from the water, features visible from the river that are hidden from the bank. Boat travel moves the player through districts more quickly, but with less opportunity to investigate things along the way.

Water paths require a boat. The player does not start with a boat. A boat is either built (requiring craft skill, knowledge of suitable wood, and significant time), traded for, or accessed through a relationship. In the water-lands, boats are essential — the water-people have them, and access to a boat through a relationship with the water-people is one of the key rewards of investing time in that region.

Water paths have their own properties: speed (affected by current and direction), hazards (rapids, shallows, snags, sudden narrowing), navigation difficulty (straightforward on an open river, complex in the braided channels of the water-lands), and connection to the tidal system in coastal areas and the water-lands.

Coastal water paths extend the system further. A player with a seaworthy boat and the knowledge to navigate by coast can travel along the west coast, reaching the far western peninsula and the islands offshore. Coastal navigation is more dangerous than river travel — tides, weather, currents — but it opens up parts of the world that are very difficult to reach on foot.

### 3.4 Fords and Crossings

A ford is where a river can be crossed on foot. Fords are among the most important features in the landscape, because they are both **sites** and **conditional paths** simultaneously.

As a site, a ford is a natural convergence point. Everyone who needs to cross the river comes here. Settlements form near fords. Trade happens at fords. Paths from multiple directions converge on a ford. The ford is a social space as much as a geographical feature — a place where the player is likely to encounter people, hear news, and participate in the exchange networks that move goods and information along the river system.

As a conditional path, a ford connects two banks. Its accessibility depends on water level, which depends on season, recent rainfall, and (near the coast or in the water-lands) tidal state. A ford that's ankle-deep in summer might be chest-deep in spring. Some fords are impassable during flood. Some tidal fords in the water-lands exist only at low water, disappearing entirely as the tide rises. The game must track water level at each crossing point and connect it to the weather and calendar systems.

In this world, there are no bridges across significant rivers. The engineering required — spanning a wide river with timber, anchoring it against flood — is beyond what these people can do, though they might manage a simple log across a narrow stream or stepping stones across a shallow brook. The absence of bridges makes fords genuinely important. Knowing where the fords are is valuable knowledge, and a ford on a major river is a landmark of regional significance.

Swimming is possible but dangerous and limited. The player can't swim carrying much. They can't swim in fast water or cold water for long. Swimming across a river is a desperation choice or a calculated risk. What the player leaves on the bank — tools, food, materials — is at stake. What they lose if the current takes them is potentially everything.

### 3.5 Lakes and Pools

Still water bodies are sites rather than path features. A lake is a site with properties: size, depth, what lives in it, what grows around it, whether there are crannogs or other human structures, whether it has sacred associations.

Smaller pools — particularly in limestone country where sinkholes fill with water — can be sites with high significance relative to their size. A still pool in a cave. A pool fed by a warm spring. A pool at the base of a waterfall. These are places where the tarrying mechanic is most potent — staying at a pool, watching, being present, is one of the ways the game rewards patience.

Isolated lochans high in the mountains — small, cold, surrounded by bare rock — are among the most atmospherically powerful sites in the game. Remote, difficult to reach, with no human trace. The player who finds one has walked a long way from anyone and anything.

---

## 4. Sightlines

What the player can see from where they are determines what they know about the world beyond their immediate location. In the absence of a map, sightlines are the primary navigational tool.

### 4.1 Factors Affecting Sightlines

**Altitude.** The single most important factor. From the valley floor, the player sees the valley. From the ridge, they see into adjacent valleys. From a mountaintop, they might see across several districts. The game needs a height model for each district — where the high ground is, how high it rises, and what lies beyond it.

Approximate visibility distances based on eye height (standing) at various altitudes above surrounding terrain:

Sea level (flat ground): approximately 3 miles.
Hilltop at 500 feet: approximately 27 miles.
Mountain at 1500 feet: approximately 47 miles.
High mountain at 3000 feet: approximately 67 miles.

These distances define the maximum possible radius of vision. In practice, intervening terrain, vegetation, weather, and light will usually reduce effective sightlines well below these maxima.

**Terrain obstruction.** Hills, ridges, and forest block sightlines. A player in a valley can't see over the ridge into the next valley. A player in dense forest can't see beyond the trees. This means that climbing out of a valley or out of the forest is a meaningful strategic action — the player gains information by gaining altitude. The contrast between enclosed and open — forest floor versus hilltop, valley versus ridge — is one of the fundamental rhythmic experiences of moving through the landscape.

**Weather.** The most dynamic factor. A clear day on a hilltop and you can see to the limits of altitude-based distance. Fog reduces visibility to tens of yards. Rain reduces it to a mile or two. Low cloud obscures hilltops, meaning the uplands that normally give long views become blind, disorienting places. Haze on hot days reduces long-distance clarity. Weather means that sightlines are unreliable — a player who climbs a hill specifically to look at the landscape is making a strategic choice, and weather determines whether it pays off.

**Light level.** The game needs to know the times of sunrise and sunset throughout the year at the player's approximate latitude (50 to 58 degrees north, equivalent to real Britain). This produces dramatic variation in day length: midsummer in the far north gives barely any true darkness; midwinter gives perhaps seven hours of useful daylight; in the south the swing is less extreme but still pronounced.

Light level affects sightlines in several ways. At night, you can't see the landscape — but you can see fires. A settlement's fire is visible for miles on a clear night. Your own fire is visible to others. Dawn and dusk light is low and raking — it reveals surface texture, casts long shadows that make features stand out. A standing stone on a ridge is most visible at dawn or dusk when its shadow stretches across the hillside. Midday light is flat and less revealing. Moonlight provides partial visibility on clear nights — enough to see the shapes of the landscape, not enough to see detail. Full moon gives significantly more visibility than new moon.

Day length also affects everything beyond sightlines. How far you can travel depends on hours of light. Winter travel is slower because of darkness. A player in the far north in summer can walk through an evening that barely dims. The same player in winter is making camp by mid-afternoon.

### 4.2 What Sightlines Reveal

The game's sightline descriptions should be specific and useful, not generic. From a high point, the description should name directions and identify features:

Terrain features visible at distance: the dark line of a forest, the pale stripe of a chalk escarpment, the shape of a distant hill, the glint of water (river, lake, sea), the white of snow on high ground, the grey mass of the mountain spine.

Signs of human presence: smoke from a settlement fire (visible from much further than the settlement itself, especially against a dark hillside or clear sky), cleared ground (a patch of lighter green suggesting a settlement clearing in otherwise dark forest), a trackway visible as a line across open ground.

Signs of the water-lands: the brightness of open water to the east, the indistinct line where land becomes marsh becomes water.

Signs of the ice: the pale, flat presence in the far north that is not cloud.

The first time the player climbs high enough to see the shape of the whole world — the chalk escarpment to the south, the glint of the water-lands to the east, the dark mass of the western mountains, the pale smear of ice in the far north — should be one of the game's great revelatory experiences. Not a map screen. Not a cutscene. Just a description of what's visible in every direction, and the sudden understanding of how large the world is and how little of it the player knows.

### 4.3 Smoke and Fire

Smoke and fire deserve special treatment as sightline features because they're the primary signs of human presence at distance and they're dynamic.

Smoke is visible during the day from further away than any other sign of habitation. Its visibility depends on weather (wind disperses it, rain suppresses it, still air lets it rise in a visible column), background (grey smoke against a dark hillside is visible; against a grey sky, much less so), and the size of the fire producing it.

Fire is visible at night from miles away on a clear night. Settlements glow. A lone campfire on a hilltop is a beacon. The player's own fire, if they light one, is visible to others — which is both a way of signalling (useful if you want to be found) and a risk (if you don't).

The decision to light a fire is therefore a meaningful game choice with sightline implications. Fire provides warmth, cooking, light, and protection from some dangers — but it also announces your presence to anyone within line of sight. In dangerous or unfamiliar territory, a cold camp might be the wiser choice.

---

## 5. Caves and the Underground

Caves use the site-and-path model but with fundamental modifications that reflect the radically different character of underground space.

### 5.1 Cave Chambers as Sites

A cave chamber is a site. The player arrives in it, observes, and makes choices. A large chamber might contain multiple points of interest — paintings on one wall, a pool in the corner, a passage continuing at the far end, a niche with something placed in it.

Cave chambers differ from surface sites in several important ways:

**No temporal variation from light, weather, or season.** A cave is the same temperature year-round. It's always dark. Weather doesn't penetrate beyond the entrance zone. What changes underground is the player, not the place. The chamber with paintings is exactly the same on the fifth visit as the first. But the player has changed — their growing knowledge of symbols means they see things in the paintings they didn't see before. Underground, the visibility-threshold system is purely knowledge-based rather than temporally gated.

**One exception: water.** Underground rivers and pools respond to surface rainfall and season. A passage that's dry in summer might have a stream after heavy rain. A chamber that's accessible in dry weather might be partially flooded in wet. A sump might be passable when the water table is low and impassable when it's high. The game must connect underground water levels to surface weather and season.

**Light as primary constraint.** All cave sites beyond the entrance zone require the player to bring light — torches made from reeds and animal fat. Torches burn for a finite duration. The player can only explore as deep as their light allows. Preparation (carrying enough torches, understanding burn duration) is itself a form of knowledge that the game rewards.

**Sound replaces sight as primary sense.** The text in cave chambers should emphasise sound and touch over visual description. Dripping water, echoes, the way breathing sounds when walls are close, the quality of silence in a deep chamber. In large chambers, the echo changes and the player can sense the space before their torch reveals it. Sound is how Body Sense works underground.

**Air as information and hazard.** Moving air tells the player there's another opening somewhere. Still, stale air is a warning. Bad air — low oxygen, pockets of gas — makes the player lightheaded. Air quality is a form of underground navigation information.

### 5.2 Cave Passages as Paths

A cave passage connects chambers. It has properties analogous to surface paths but with underground-specific character.

**Width and height.** Some passages are walking height. Some require stooping. Some require crawling. The narrower and lower the passage, the slower the travel, the greater the vulnerability, and the more intense the experience. A crawl through a tight passage with a torch held in front of you is one of the most viscerally tense experiences the game can produce.

**Water.** Some passages have streams running through them. Some are partially flooded. Some contain sumps — points where the passage dips below water level and there's no way through without going underwater (which, without diving equipment, is essentially impossible and represents a hard barrier).

**Air movement.** A passage with air moving through it tells the player there's an opening at the other end. A passage with still air might be a dead end. This is navigation information.

**Asymmetry.** Cave passages can be one-way or asymmetric in difficulty. A drop that's easy to descend is difficult or impossible to climb back up. A narrow squeeze that's passable going in might be harder going out. An underground river can be followed downstream but not easily back upstream. Direction of travel matters underground in a way it rarely does on the surface. The player must think about return routes.

**Branching.** Passages branch, and at each branch the player must choose without being able to see what either option offers. This is fundamentally different from surface navigation, where sightlines often give information about where a path leads. Underground, you choose and remember your choice, because finding your way back depends on it.

### 5.3 The Cave Spectrum

Caves exist on a spectrum from shallow to deep, familiar to impossible. Each point on the spectrum serves a different function.

**Rock shelters and overhangs.** Not really caves — just places where the rock provides a roof. Found in sandstone and limestone country. The most common underground spaces. Practical function: shelter. Some show signs of long use — soot-blackened ceilings, worn floors, old bones. Some have marks at the entrance. The gentlest introduction to the idea that the underground holds memory.

**Shallow caves.** Extend beyond the reach of daylight. Require fire to proceed. Might extend for a few hundred paces. Might branch once or twice. The air is cool and still. The first experience of total dependence on artificial light. Some are inhabited or were — a hermit, a person hiding. Meeting someone in a cave is a different encounter from meeting them in a settlement.

**Deep cave systems.** Occur in limestone. Networks carved by water over geological time. Passages that branch and reconnect. Chambers that open suddenly — vast, echoing. Underground rivers. Pools of still black water. Formations that in torchlight look deliberate.

A deep cave system is a multi-session exploration. The player can't map it in one visit. Over several visits they build a mental map, and the game never provides a drawn one. The cave exists in memory and attention, like the surface landscape.

In the deepest chambers: paintings on walls, marks older than anything on the surface, rare minerals (including the banded purple-and-gold mineral found in only one cave system), evidence of ancient use. And genuinely strange things: a formation that looks shaped, a chamber where acoustics produce sounds like voices, a space that feels too regular, too meant. The game never confirms whether these are natural or made.

**Sacred caves.** A category overlapping with the others. A cave becomes sacred through use — offerings in niches, skulls arranged deliberately, a threshold marked with ochre. Sacred caves are where the boundary between the surface world and whatever lies beneath is already thin. The word-tellings speak of caves as mouths — the earth speaks through them, breathes through them.

### 5.4 The Entrance Zone

The transition from surface to underground is a threshold space with properties of both worlds. Daylight still penetrates. The temperature is changing. The sound is changing. The entrance zone is a site in its own right. Many caves' most important content may be here — marks at the entrance, evidence of habitation, the quality of air coming from deeper in.

From outside, a cave entrance is a sightline feature — a dark opening in a cliff face, visible from a path or across a valley. The player sees it and wonders. That wondering is the vertical equivalent of "what's over the next hill."

### 5.5 Hidden Connections

Cave systems can connect places that are far apart on the surface. Two cave entrances in different districts, miles apart, might be linked by a deep passage. The player who discovers this has found a shortcut, a secret, a piece of knowledge that most people don't have.

The cave-wights know these connections. Humans mostly don't. A word-telling about someone who entered a cave in one valley and emerged in another might be literally true, describing a physical cave route that still exists.

Cave connections create a hidden geography overlaying the surface geography. The surface world has its logic — rivers, ridges, paths. The underground has a different logic — following water through limestone, connecting places the surface considers separate. A player who learns the underground connections has a fundamentally different understanding of the landscape.

### 5.6 Ritual Darkness

The game's most distinctive underground mechanic. Light starts as a constraint to manage but becomes something the player chooses to abandon.

Late in the game, the player may reach a point where a ritual passage must be made in total darkness. The torch is extinguished. The text changes completely — no visual description, only touch, sound, and memory. A player who has visited this cave multiple times with torchlight, who has built a mental map through repetition and attention, can navigate in darkness. A player who hasn't cannot.

The ritual lighting of the flame in the deepest chamber — after an unknowable duration in darkness — is one of the game's most powerful moments. Whatever is revealed in that first moment of firelight lands with extraordinary force because the player has been in darkness long enough to forget what seeing feels like.

This mechanic requires the cave system to be designed (or generated) so that a specific cave can be traversed in darkness by a player who has memorised it. The passage must be navigable by touch and memory — not trivially, but not impossibly. Distinctive features that the player learned during lit visits (a turn in the passage, a narrowing, a step down, a change in the wall's texture) serve as landmarks in the dark.

---

## 6. The Emergence Region

The area where the player begins requires special generation treatment. It's not the largest region but it must be the most carefully interwoven.

The emergence region is a single district or a small cluster of two or three districts, generated with higher density than the surrounding landscape. Almost anything the player does in the emergence region should reveal something that points at something else. A path leads to a settlement. The settlement contains a person who mentions a place. The place contains a mark that matches something seen elsewhere. A word-telling fragment connects to a landscape feature visible from the nearest hilltop.

The emergence region must contain enough variety to accommodate different player inclinations. A player drawn to people should find people quickly. A player drawn to landscape should find compelling landscape features. A player drawn to mystery should find fragments that provoke curiosity. All of these threads should be present within the first few sessions, because the emergence region's job is to scatter seeds — and the player's choices reveal which ones they water.

The emergence region should be geologically coherent and plausible within its regional context, but should ideally sit near a geological boundary — where chalk meets limestone, or clay meets sandstone — so that the player encounters the shift between zones early and begins to learn that the rock beneath determines everything above.

After the emergence period, the generated world can be sparser, because the player has direction. They're moving with purpose, and the landscape between points of interest isn't empty — it's the walk between hills, the quiet anticipation.

---

## 7. The Density Gradient

Content density varies across the world in ways that should feel natural rather than designed. The gradient emerges from geology, settlement patterns, and deep time.

**The south is densest.** The chalk and limestone south has been inhabited longest. It has the most settlements, the most sacred places, the most accumulated human meaning. The barrows along the chalk escarpment represent thousands of years of burial. The trackways have been walked for millennia. The word-tellings here are the longest and most layered. A player in the south is never far from people, from paths, from evidence of the past.

**The west is dense but different.** The western coast and mountains have long habitation but sparser settlement because the terrain is harsher. The density here is in sacred places and in the depth of tradition rather than in population. The far western peninsula might have fewer people than a single chalk valley but more concentrated ancient knowledge.

**The eastern lowlands are populated but obscured.** The clay lowlands support the most people because the soil is richest, but the dense forest makes everything less visible. Sites exist but are hidden by vegetation. Paths are narrow and easy to lose. The density is there but the player has to work harder to find it. The water-lands are sparser still — fewer people, spread across a vast and shifting landscape — but with their own deep knowledge of water, tide, and moon.

**The north thins toward emptiness.** As the player moves north, the landscape empties. Settlements become smaller and more scattered. Sacred places are fewer but possibly older — monuments left by people who lived here before the climate deteriorated. The glacial debris zone is essentially uninhabited, though the bravest people are pushing into the margins of the retreating ice. The generation should produce districts in the far north that are genuinely empty — vast, raw, geologically dramatic, but without human trace. This emptiness is itself content. The player who walks for days without seeing smoke or a path or a mark of any kind is experiencing something that the game's crowded south can't provide.

**The emergence region is an exception** — denser than its surroundings would normally warrant, because the early game needs richness regardless of where the player happens to emerge.

---

## 8. Generation and the Player's Knowledge

The generated landscape responds to the player's accumulated knowledge — not by changing what already exists, but by ensuring that unseen territory contains things the player is now capable of recognising.

This is not rubber-banding or content-serving. It's the generation algorithm using the player's knowledge state as one input among many when producing new districts. If the player has learned to read a particular kind of symbol, districts generated ahead of them are somewhat more likely to contain places where those symbols are relevant — not because the world is catering to the player, but because the player's understanding has made them capable of recognising things that would have been meaningless before.

The principle: the player's choices create a context in which certain encounters become plausible. The player who has spent time gathering herbs has been in the wet places, the shaded places, the edges of woods. Meeting an apothecary makes sense because their path through the world has been the kind of path that would naturally intersect with that person.

Encounters should also sometimes be orthogonal to what the player has been doing. The apothecary wants herbs, yes. But she also knows something about the standing stones to the north, and that knowledge opens a completely different branch. The player's choices created the meeting, but the meeting takes them somewhere they didn't plan. This is how real exploration works — you go looking for one thing and find another. The serendipity isn't random. It's a function of where curiosity has taken you.

---

## 9. Persistence and Change

The world of The Barrow is not static. Things change, things persist, and the game must track both.

This section addresses the question: what can change in the generated world, how does it change, and what does the game need to remember?

### 9.1 Things That Don't Change

Geology. The rock is permanent. A limestone gorge is always a limestone gorge. Rivers don't change their basic course (though they can flood). Mountains don't move. The coastline doesn't shift (with the slow exception of the water-lands, discussed below). The fixed frame is fixed.

Major landmarks. A standing stone that was placed thousands of years ago is not going to fall over in the course of the game (though see below for stones that are already leaning or fallen). The chalk escarpment is permanent. The great stone circles are permanent.

The dead. Barrows, burial chambers, cairns — these are permanent features. The bones inside them don't move. The marks on the stones don't change.

### 9.2 Things That Change Cyclically

Seasons. The most fundamental cyclical change. Vegetation changes — trees bare in winter, green in spring, heavy in summer, turning in autumn. Food sources change. Snow covers the high ground in winter and melts in spring. Animal behaviour shifts — migration, hibernation, breeding.

Moon phases. The monthly cycle affecting tides, the water-lands, certain plants, certain behaviours, certain sacred site properties.

Tides. In coastal areas and the water-lands, the tidal cycle creates daily and monthly change. Paths appear and disappear. The water-lands expand and contract. The coastline moves in and out. This is the most frequent cyclical change in the game.

Day and night. Sunrise and sunset, varying by latitude and season. Light levels, temperature, animal activity, human activity. Settlements are active during the day and quiet at night. The landscape looks different at dawn, midday, and dusk.

Weather. Weather cycles on a shorter timescale than seasons but is not strictly cyclical — it's variable within seasonal parameters. A run of wet days in autumn. A clear spell in winter. An unexpected warm day in early spring. Weather affects everything: travel, visibility, shelter needs, food availability, river levels, the player's comfort and mood.

### 9.3 Things That Change Progressively

The ice front. The glaciers retreat over the course of the game, slowly, imperceptibly in the short term but noticeably over years. Land that was under ice when the game began becomes exposed. New districts become accessible. This is the slowest progressive change in the game.

The water-lands. The eastern water-lands are sinking. Over the course of the game, the water levels rise slightly. Paths that were reliable in the first year become unreliable. Islands shrink. The oldest water-people remember land that is now submerged, and if the game runs long enough, the player might watch a path or a settlement edge slip beneath the water. This is elegy made mechanical.

Plant growth. A cleared area slowly regrows. A fallen tree sprouts new growth. A burnt area develops pioneering vegetation. These changes happen over seasons and years, not days. The landscape is slowly, constantly growing.

### 9.4 Things That Change Through Events

**Weather-driven events.** A fragile hillside collapses in a landslip after heavy rain. Trees fall in a storm and remain fallen. A river floods and deposits silt across a floodplain, changing the ground. A lightning strike starts a fire that burns a section of forest. These events are generated by the weather system and produce permanent changes to the landscape. They're rare but memorable — a player who returns to a familiar district and finds a hillside collapsed or a stretch of forest burnt has experienced the landscape as a living, changing thing.

**Human-driven events.** A chieftain's homestead burns in summer. Over the following seasons, the player witnesses a new, larger homestead being constructed. A new trackway is beaten through the forest by increased traffic between two settlements. A standing stone that had been leaning is righted by a group of people and stays righted. A new cairn appears on a hilltop, marking a recent burial. These events are driven by the NPC system and produce persistent changes that the player can witness over multiple visits.

**Player-driven changes.** The player's own actions leave traces. A shelter they built persists. A fire circle they made remains. A path they walked repeatedly becomes slightly more visible. Gifts they left at a site might still be there, or might have been taken. These traces are small but they create the sense that the player exists in the world rather than passing through it.

### 9.5 What the Game Must Remember

The persistence system needs to track changes at the site level. Each site has a base state (generated) and a modification history (changes that have occurred). When the player visits a site, the game applies the modification history to the base state to produce the current state.

The modification history should be compact — a list of changes, not a complete second copy of the site. "Tree fell across path" is a modification. "Hillside collapsed" is a modification. "Homestead burned" and "new homestead construction began" and "new homestead construction at stage 2 of 4" are sequential modifications.

For districts the player has not visited, the game can calculate what changes would have occurred (based on weather events, seasonal progression, NPC activity) without storing them explicitly. Changes only need to be persisted for districts the player has visited or has reason to revisit, since only those changes are observable.

The key principle: the world should feel like it continues to exist when the player isn't there. When you return to Breca's settlement after three months away, things should have changed — the season, the state of the buildings, maybe a new face, maybe an absence. The game doesn't need to simulate every moment of the world's existence between visits. It needs to calculate what would plausibly have changed and present it convincingly.

---

## 10. The Historical Landscape Layer

Human habitation is accumulated, not optimised. People don't rebuild their settlement in the ideal location every generation. They build where their grandparents built, and their grandparents built where conditions were right then. The landscape has moved on. The settlement hasn't.

The generation system needs a concept of historical landscape state in addition to current state. Not a full simulation of the past thousand years, but a recognition that certain features were placed under different conditions and now sit slightly at odds with the present landscape.

### 10.1 How It Works

Settlement placement, trackway routing, and sacred place positioning should use a historical landscape layer — a version of the terrain that represents conditions roughly one hundred to two hundred years before the game's present. This historical layer differs from the current layer in specific, predictable ways:

**Water levels were lower.** In the water-lands, this means more dry ground, larger islands, more navigable channels, more viable settlement locations. Crannogs and raised settlements were built at a time when the water was less threatening. Now the water has risen, the islands are smaller, the approaches are trickier. The settlement persists because it's home, because the ancestors are buried there, because abandonment means abandoning generations of meaning.

**The ice was further south.** In the north, the historical landscape layer has glacial debris covering land that is now exposed and beginning to grow. Settlements that were at the margin of habitable land a hundred years ago are now well within it, but they still carry the character of frontier communities — sparse, tough, self-reliant.

**Rivers ran differently.** A ford that was reliable a century ago might now be treacherous because the river has shifted or deepened. A settlement placed near that ford is now slightly too far from the current best crossing. A trackway designed to reach the ford arrives at a stretch of river that no longer makes sense to cross.

**Forest cover was different.** Areas that were cleared for settlement may have been partially reclaimed by forest as populations shifted. A trackway through what is now dense woodland made sense when the trees were thinner. A sacred site on what is now a forested hilltop was once in open ground with commanding views.

### 10.2 What the Player Sees

The player encounters the results of historical placement as subtle wrongness — features that don't quite fit their current surroundings. A settlement too close to the flood line. A trackway that leads through exposed ground for no obvious reason. A sacred site that's harder to reach than it should be, hemmed in by trees that have grown up around it. A barrow on what was once a prominent ridge but is now partially obscured.

This wrongness is information. A player who notices it is reading the landscape's history — seeing evidence that the world has changed since these features were placed. The wise woman might confirm what the player suspects: the river used to run differently, the water was lower, the forest stopped at the ridge.

This connects to word-tellings. A story about a great hall by a wide ford describes a place the player can identify — but the ford is narrow now, the hall is a more modest homestead, and the story remembers a version of the landscape that no longer matches the present. The word-telling isn't wrong. The world has changed since the telling was made.

### 10.3 The Direction of Change

Each district should have a trajectory — not just a current state but a vector. Is this place getting wetter or drier? More forested or less? More or less habitable? The water-lands are getting wetter. The ice is retreating. The forest is advancing in some places and retreating in others where people are clearing.

The player who understands these trajectories is reading the landscape at its deepest non-sacred level. They can look at a settlement and sense whether it's a place with a future or a place living on borrowed time.

The people who live in these places know. The water-people have watched the water rise for generations. It's in their word-tellings — the land that was swallowed. They're not surprised. They're grieving, slowly, for a future they can see coming.

### 10.4 Archaeology of Abandonment

The historical landscape layer implies that some places have already been abandoned. In the water-lands, this is most visible: posts sticking up through shallow water where a crannog used to be, a mound that's now an island at high tide but was once dry ground, submerged foundations where a settlement stood. The water-people know where these lost places are. Their word-tellings name them. Some may still contain objects — a pot, a tool, something placed deliberately before the waters took the floor. A player who can visit at the lowest tide of the year might reach what remains.

But abandonment isn't exclusive to the water-lands. A hill fort on granite moorland, abandoned when the climate deteriorated and the people moved to lower ground. A settlement in a valley that was abandoned after a landslip blocked the river and flooded the valley floor. A sacred site that's no longer visited because the community that maintained it has gone. These places are sites in the game — discoverable, explorable, carrying the traces of people who were here and aren't anymore. They're some of the most atmospherically powerful locations in the game, because they combine the physical landscape with the theme of loss and deep time.

### 10.5 Implementation

The historical landscape layer is generated alongside the current landscape layer at regional and district scale. At regional scale, the system generates a historical heightmap, historical water levels, and historical forest cover, all slightly different from the current versions. At district scale, settlements, trackways, and sacred places are placed according to the historical layer's conditions. The current layer then determines what the player actually experiences — including the tensions between historical placement and current conditions.

The historical layer doesn't need to be stored separately after generation. Once features have been placed, the reasons for their placement can be discarded — the settlement is where it is. But the generation system should tag features with their historical context ("settlement placed near historical ford; current ford 400 metres east") so that the voice layer can draw on this information when describing the site. A player arriving at the settlement might notice, if they have enough landscape knowledge, that the settlement seems oddly placed relative to the current river — and that observation is generated from the historical context tag.

---

## 11. Water-Lands Waterway Dynamics

The water-lands are the one region where landscape knowledge decays. Waterways in tidal marshland change constantly — channels migrate, silt builds up, storm surges cut new passages, reed beds shift. This creates a unique gameplay dynamic where the player's knowledge requires ongoing maintenance rather than simple accumulation.

### 11.1 Three Levels of Waterway Change

**Tidal change — hours.** The daily and monthly tidal cycle. Channels navigable at high water are mud at low water. Paths across tidal flats appear and disappear twice a day. This is entirely predictable once understood — the tidal pattern and moon phase determine when a crossing is possible. The generation places tidal flats and channels at their mean state. The game's tidal system determines what's accessible at any given time. This is a state calculation, not a landscape change. The water-people understand this cycle perfectly, and the player can learn it.

**Seasonal change — months.** Water levels rise in winter and fall in summer. The extent of marshland expands and contracts. Channels become broader in winter and narrower in summer. Some channels are only navigable in wetter months; others only safely used in summer when the flow is gentle. Like tidal change, this is predictable once understood, and handled by the same system — features placed at mean state, current accessibility calculated from seasonal water level. The water-people's seasonal knowledge is about understanding this cycle.

**Progressive change — years.** Over the course of years, the water-lands genuinely reshape. Channels silt up and new ones cut. Reed beds expand and block routes. Sections of bank collapse and open new passages. Islands shrink as water rises. This is the change that makes old knowledge unreliable and that the water-people's word-tellings lament.

### 11.2 Modelling Progressive Change

Progressive change is modelled as a stochastic modification system. At each seasonal transition, the game applies a small number of changes to each water-lands district. Each change is a simple operation:

A channel shifts position slightly — typically in the direction of prevailing water flow.
A reed bed expands into still water, narrowing or blocking a passage.
A reed bed contracts due to storm damage, opening a route.
A bank section collapses, creating a new channel or widening an existing one.
A channel silts up, becoming shallower or impassable.
An island edge erodes, shrinking the island.

The number of changes per district per season should be small — perhaps two or three. Over a year, that's eight to twelve changes per district. Over several years, the cumulative effect is significant: routes that were reliable in the first year of play are partly or wholly different several years later.

The changes are generated stochastically but deterministically from the world seed and the season number. This means unvisited districts don't need their changes stored — they can be regenerated from the seed and the seasonal counter. Only districts the player has actually visited need their specific modification history preserved, because only those modifications have been observed and would be noticed if they were inconsistent on return.

### 11.3 The Water-People as Living Knowledge Base

The water-people know about progressive changes before the player does. They live in the water-lands. They watch the water daily. When a channel shifts, they know within days. A player who maintains a relationship with the water-people gets updated information: "The south channel silted up in the spring rains. Take the eastern passage now."

A player who doesn't maintain that relationship arrives with outdated knowledge and discovers the hard way that their route no longer works. This might mean getting stuck in a silted channel, running aground on a newly formed mud bank, or finding that a passage they relied on is now blocked by reed growth.

This makes the water-people the only community in the game whose practical value to the player is ongoing rather than cumulative. Everywhere else, knowledge gained from a relationship persists indefinitely. In the water-lands, knowledge needs refreshing. This is a fundamentally different relationship dynamic, and it reinforces why the water-people are culturally distinct — they live in a landscape that demands constant attention in a way solid ground doesn't.

### 11.4 Word-Tellings and Ghost Geography

The water-people's word-tellings include detailed descriptions of waterways that no longer exist. A word-telling might describe a route to the great sandbank island that follows channels the player can partially trace but not fully navigate, because sections have silted up or shifted. Following a water-lands word-telling is like following a degraded map — some of it still works, some of it is ghost geography.

The oldest tellings describe a landscape so different from the current one that they sound like myth — a time when you could walk to the great sandbank, when the channels were rivers and the marsh was meadow. But they're not myth. They're history, and the water is the proof.

### 11.5 Design Implications

The water-lands waterway dynamics create several unique gameplay qualities:

The water-lands are the one region where mastery is temporary. The player can never fully "know" the water-lands the way they can know a limestone valley. This creates a distinctive mood — a landscape of impermanence and loss, where knowledge is precious precisely because it expires.

The water-people's relationship has a different structure from any other in the game. It's not just about depth of trust (though that matters for accessing their word-tellings and deeper knowledge). It's about frequency of contact. A player who visits the water-lands once a year gets outdated route information. A player who returns regularly gets current navigation. This rewards ongoing engagement with a specific community in a way that no other region requires.

The progressive changes create opportunities for the player to witness the water-lands' decline. An island they visited in their first year is noticeably smaller three years later. A channel that was the main approach to a crannog settlement has silted up, and the water-people have cut a new one. The game doesn't commentate on this — it simply presents the changed landscape, and the player feels the passage of time and the slow drowning of a world.

---

## 12. Summary of Generation Requirements

The landscape generation system must produce:

**At the regional scale:** geological zones placed within the fixed frame, with language families, broad cultural character, and density gradients. A historical landscape layer for placement of human features. Generated once at game start.

**At the district scale:** specific terrain, major features (rivers, ridges, hills, forests), sites, and path networks, consistent with regional geology and aware of neighbouring districts. Historical context tags on features placed according to the historical landscape layer. Generated when the player approaches (or when sightlines from a distance require basic knowledge of the district's major features).

**At the site scale:** specific places with physical, knowledge-gated, temporal, relational, resource, and connection properties. Generated as part of the district.

**At the moment scale:** the text the player reads, produced on the fly from site state, player knowledge, temporal conditions, and the fragment library. Never stored. Always fresh.

**Temporal systems:** solar calendar (season, day length, sunrise/sunset by latitude), lunar calendar (phase, tidal effects), weather (variable within seasonal parameters, affecting visibility, travel, river levels, and generating occasional events).

**Sightline system:** calculating what's visible from the player's current position based on altitude, terrain obstruction, weather, and light level. Drawing on district-level data for neighbouring and distant districts.

**Persistence system:** tracking changes to sites the player has visited, including cyclical changes (season, growth), event-driven changes (weather damage, human activity), player-driven changes (shelters built, fires made, paths worn), and water-lands progressive changes (channel migration, reed bed shifts, bank erosion).

**Underground system:** cave chambers as sites and cave passages as paths, with the specific modifications described in Section 5 — light as resource, sound as primary sense, air as information, asymmetric passages, hidden connections between surface locations, and support for the ritual darkness mechanic.

**Hydrological system:** rivers flowing consistently across districts, responding to rainfall and season, generating bankside paths and crossing points, connecting to the tidal system in coastal areas and the water-lands. Water-lands waterway dynamics operating at three timescales: tidal (hours, calculated from calendar state), seasonal (months, calculated from seasonal water level), and progressive (years, stochastic modifications at seasonal boundaries).

**Historical landscape layer:** a version of the terrain representing conditions one to two hundred years before the game's present, used for placement of settlements, trackways, and sacred places. Producing the characteristic tension between historical placement and current conditions that the player learns to read as landscape history.

The generation does not need to simulate plate tectonics, realistic hydrology, or ecological succession. It needs rules that produce plausible, specific, and regionally distinctive landscapes. Springs appear where chalk meets clay. Caves form where limestone meets water. Tors appear on granite hilltops. Settlements form near fords — or rather, near where fords used to be. Sacred places occupy positions that were prominent when they were placed. The rules should be simple and the results should feel real. The world should feel lived in, not optimised — a place with a past that's visible in the slight awkwardness of where things are.
