# The Barrow — System Layers

## The architecture above the landscape: habitation, knowledge, relationship, player state, and voice.

---

## 1. Layer Overview

The Barrow's architecture is a stack of six layers. The landscape layer is documented separately. This document describes the five layers above it, each depending on the ones below.

**Landscape** (bottom) — the physical world. Geology, terrain, rivers, caves, weather, temporal systems. Exists independently of everything else.

**Habitation** — people and beings placed in the landscape. Settlements, individuals, cultures, trade networks, the wights. Depends on landscape.

**Knowledge** — the web of meaning woven through landscape and habitation. Symbols, word-tellings, Old Tongue names, sacred significance, common beliefs, deep secrets. Depends on landscape and habitation.

**Relationship** — the dynamic connections between the player and the world's people. Trust, shared language, reputation, encounter history, identity reading. Depends on habitation, knowledge, and player state.

**Player State** — the accumulation of everything the player has done, learned, seen, and become. The unique fingerprint of this particular life in the landscape. Depends on all lower layers.

**Voice** (top) — the text the player reads and the choices they're offered. Produced from all layers below, using the fragment library and constrained LLM generation. Never stored. Always fresh.

Each layer queries the layers below it. The voice layer reads everything. The landscape layer reads nothing — it simply exists.

One additional principle cuts across the entire stack: **the supernatural as convergence**. The game does not model the supernatural as a system. It has no spirit layer, no divine favour variable. Instead, when enough material conditions align — the right place, the right time, the right knowledge, the right relationship, the right physical state — the voice layer is authorised to describe experiences that push toward the liminal and the ambiguous. The supernatural is an emergent property of the architecture, not an addition to it. This is documented in Section 4.

---

## 2. The Habitation Layer

The habitation layer takes the generated landscape and populates it with living beings. It is generated after the landscape and constrained by it — settlements can only exist where the landscape supports them, trade routes follow viable paths, cultures are shaped by the geology and geography they inhabit.

### 2.1 Settlements

Settlements are placed according to the historical landscape layer (see Landscape Model, Section 10), at locations that were suitable for habitation one to two hundred years before the game's present. Each settlement has:

**Location and context.** Near a ford, a spring, good farmland, a sheltered valley. The specific reason for the settlement's location should be legible to an attentive player — and the tensions between historical placement and current conditions (a ford that's shifted, water levels that have risen) should also be readable.

**Size and character.** From a single homestead to a walled town. Size is determined by the carrying capacity of the surrounding landscape — chalk and clay support larger settlements than granite moorland. Character is shaped by geology, available materials, and cultural tradition.

**Economy.** What the settlement produces, what it needs, what it trades. A chalk settlement has flint to trade. A coastal settlement has fish and salt. A clay-lowland settlement has timber and grain. A granite settlement has little surplus and trades rarely. Economy drives the trade connections between settlements and determines what the player can exchange.

**Relationships with other settlements.** Trade connections, kinship ties, territorial tensions, shared sacred obligations. These inter-settlement relationships exist independently of the player and shape the world the player moves through. Two settlements at war affect the safety of the paths between them. Two settlements with kinship ties share information — the player's reputation can travel along these connections.

### 2.2 Individuals

Each settlement contains individuals — not a generic population but specific named people with properties. The game doesn't need to simulate hundreds of individuals. It needs enough distinct characters in each settlement to create meaningful social texture, and it needs certain individuals to be deeply realised because they carry important knowledge or occupy important social positions.

Each individual has:

**A name.** Drawn from the linguistic traditions of their region.

**A role.** Not a game-mechanical role but a social one — the person who tends pigs, the person who works flint, the elder, the healer, the person who speaks for the settlement in disputes. Roles determine what the individual knows (specialist common knowledge), what they do daily (which affects where the player encounters them), and how other people in the settlement relate to them.

**Knowledge.** What they know, drawn from the knowledge layer. This includes common knowledge appropriate to their culture and region, specialist knowledge appropriate to their role, and in some cases fragments of deep knowledge — word-tellings they carry, symbols they can interpret, sacred knowledge they've been entrusted with.

**Routine.** Where they are at different times of day and season. The pig-tender is at the enclosure in the morning and the settlement in the evening. The healer might be gathering herbs in the valley for days at a time. Routines determine when and where the player can encounter each individual, creating the natural rhythm of settlement life.

**Disposition.** Their general character — wary, open, curious, hostile, generous. Disposition affects initial encounters and the speed at which trust builds. It's not a personality simulation — it's a simple parameter that shapes the voice layer's description of the person and their behaviour.

**Relationships with other individuals.** Within the settlement and potentially beyond it. The elder and the healer might disagree about a sacred practice. The flint-knapper's daughter might have married into the next settlement. These relationships create social texture and occasionally affect the player's experience — gaining the trust of one person might make another more wary, if the two are in tension.

### 2.3 Mobile Individuals

Not everyone is tied to a settlement. Some individuals move through the landscape on their own logic.

**The wise woman** moves within her valley but rarely leaves it. She has seasonal routines — gathering herbs in certain places at certain times, visiting sacred sites at calendar-significant moments. Finding her requires knowing her patterns, which requires spending time in her territory.

**The men from across the water** follow routes dictated by their word-tellings and the sacred calendar. They arrive at certain places at certain times — the stone circle at midsummer, the coast where they land, the route north that their forebears walked. Their movements are predictable to someone who knows their patterns but invisible to someone who doesn't. They are a small group — perhaps five to eight individuals across the entire game world — and encountering them is significant.

**Traders** move between settlements along trade routes. They carry goods, news, and reputation. A trader who visits two settlements carries information between them — including information about the player. Traders are one of the mechanisms by which reputation propagates.

**The translators** are specific, rare individuals — perhaps three or four in the entire game world — who can mediate between the native languages and the arriving tongue from across the water. Each translator has their own history, their own position, their own reasons for being what they are. They are among the most important individuals in the game, and finding one is a significant achievement.

**Outcasts and hermits** live outside settlements — in caves, in remote shelters, on the margins. They might have been expelled, or they might have chosen isolation. They often carry unusual knowledge, precisely because they've lived outside the normal social structures.

### 2.4 The Wights

The cave-wights and the small folk are placed by the habitation layer but handled differently from humans. They are presences rather than characters.

**The cave-wights** have territories — specific limestone cave systems and the surrounding landscape. They are not placed as individuals but as a presence within a territory. The game tracks whether a cave-wight presence exists in a given area, what traces they leave (trails that end at rock faces, sounds in caves, signs of inhabitation in deep chambers), and the infinitesimally small probability of a direct encounter. The cave-wights' behaviour is simple: they avoid humans, they know the underground geography, they leave traces.

**The small folk** have territories in the warm, wet places — reed beds, warm springs, dense wet woodland. Like the cave-wights, they're a presence rather than individuals. Their traces are different — glimpses at the edge of vision, sounds that aren't quite language, paths through marsh that follow invisible logic. They are rarer than the cave-wights and their territories are more fragile.

Neither species should be overrepresented. Most districts have no wight presence at all. The districts that do have one should feel slightly different — an extra layer of Body Sense alertness, an occasional trace that doesn't fit the normal patterns of the landscape.

### 2.5 Cultural Groups

The habitation layer also tracks cultural groupings that span multiple settlements. A cultural group shares a language variety, a set of common beliefs, a style of pottery and building, a set of god-names, and a body of word-tellings. Cultural groups are shaped by geography — the mountain spine divides western and eastern cultural traditions, the chalk south has its own character, the water-lands people are distinct.

Cultural boundaries are gradients, not lines. A settlement near the boundary between two cultural groups might show influences from both — mixed pottery styles, bilingual individuals, contested god-names. These boundary settlements are often the most interesting places in the game, because they contain multiple perspectives on the same landscape.

The men from across the water are a distinct cultural group with no overlap with native traditions. Their culture is opaque to the player except through the mediation of translators.

---

## 3. The Knowledge Layer

The knowledge layer weaves meaning through landscape and habitation. It is the most complex layer in the game and the one most responsible for the game's distinctive experience — the sense that the world contains discoverable depth, that things connect across distances, and that understanding is always partial but growing.

The knowledge layer contains two distinct strata: **common knowledge** and **deep knowledge**. They have different distribution patterns, different access requirements, and different functions in the player's experience.

### 3.1 Common Knowledge

Common knowledge is the vast body of understanding that is shared freely, learned through proximity and time, and forms the foundation that makes deep knowledge meaningful. It is not trivial — it is the fabric of how these people understand the world. Without it, the deep knowledge has no context.

Common knowledge operates in four registers:

**Universal knowledge.** Things virtually every person in the world knows regardless of region, language, or culture. The sun rises in the east. Fire burns. Winter is cold and food is scarce. The dead are placed in barrows. The full moon is brighter than the new moon. Water flows downhill. Certain plants are poisonous. Flint is the best material for sharp edges.

Universal knowledge is absorbed almost immediately — within the first few encounters with any person. It is not gated by trust or language depth. A stranger will share it through gesture if necessary. It's the bedrock of shared understanding.

**Regional common knowledge.** Things everyone in a particular area knows but that differ between regions. The name of the nearest river. Which hilltop has the barrow. Where the ford is. What's safe to eat locally. Which direction the nearest settlement lies. What the local weather patterns are. The name the local people use for the cave-wights. Which paths to avoid in winter.

Regional common knowledge is the first thing the player acquires when they spend time in a new area. It comes from anyone — even the most casual encounter yields it, because it costs nothing to share. It is the equivalent of giving a stranger directions. Moving to a new region means starting this accumulation again, because regional knowledge doesn't transfer.

**Cultural common knowledge.** Things a whole cultural group shares — beliefs, practices, calendar observances, basic mythology. Midwinter is when the dead draw near. The oak is sacred. You bow to the rising sun at midsummer. You don't enter a barrow uninvited. Red ochre protects the dead. Bronze comes from across the water. A standing stone marks something that must be respected. The cave-wights were here before us.

Cultural common knowledge requires some relationship and some shared language, because it concerns abstract concepts — death, sacredness, time, obligation — that cannot be communicated through pointing and gestures. Any member of the culture will share it once basic communication is established. It is not secret. It is the shared fabric of meaning that holds a community together.

Crucially, cultural common knowledge differs between cultures. The chalk-south people and the granite-west people share some beliefs but diverge on others. The water-people have distinct beliefs shaped by their distinct landscape. The men from across the water have an entirely different body of cultural common knowledge, accessible only through translators. The player who travels widely accumulates multiple, sometimes contradictory, bodies of cultural knowledge — and the contradictions are themselves information, pointing toward deeper truths that no single culture possesses.

**Specialist common knowledge.** Things everyone in a particular role or practice knows. Every healer knows which herbs reduce fever. Every flint-knapper knows the best flint beds on the chalk. Every person who tends animals knows the signs of sickness. Every fisher knows the river's moods. Every water-person knows the tidal patterns.

Specialist common knowledge is common within its community of practice but not universal. The player acquires it by spending time with practitioners — not through deep trust, but through proximity and shared activity. Helping the wise woman gather herbs teaches what every herb-gatherer knows. It's not her secret knowledge. It's her everyday knowledge, shared casually because the player is there and helping.

### 3.2 Common Knowledge — Mechanical Representation

Common knowledge is represented as a set of knowledge tags on the player state. Each tag records a specific piece of understanding:

"Knows: midwinter significance (chalk culture)"
"Knows: local ford location (Breca's district)"
"Knows: oak sacredness (chalk culture)"
"Knows: basic herb identification (healer practice)"
"Knows: cave-wight name (western mountain culture)"
"Knows: tidal patterns (water-lands)"

Tags are acquired through encounters and time spent in places, without requiring specific trust thresholds beyond basic communication. They accumulate naturally as the player lives in the world.

The voice layer checks these tags when generating text. If the player knows that midwinter is when the dead draw near, the game can reference this in its descriptions without needing an NPC to explain it. The knowledge has become part of the player's understanding of the world, and the text assumes it.

Common knowledge tags also influence what the player notices. A player who has absorbed cultural beliefs about midwinter will experience a barrow on a midwinter evening differently — the game describes the barrow with that context available, not because the barrow has changed but because the player now understands why this place, at this time, feels the way it does. Body Sense and common cultural knowledge working together produce experiences that neither could produce alone.

The critical design principle: common knowledge should feel absorbed rather than delivered. The player should not feel lectured or given a lore dump. They should feel that they've been among these people long enough that they just know things now. The wise woman mentions midwinter in passing, with the assumption that the player understands. The game gives enough context to infer the rest. Over time, inferences accumulate into a coherent picture of how these people understand the world.

### 3.3 Deep Knowledge

Deep knowledge is the web of specific connections, hidden meanings, and gated secrets that forms the game's primary discovery system. It is the opposite of common knowledge in almost every respect: specific rather than general, rare rather than ubiquitous, earned through trust and effort rather than absorbed through proximity, and structured as threads rather than fields.

Deep knowledge encompasses:

**Symbols and their connections.** Which marks appear at which sites, how they relate to each other across distances, what system they belong to. The spiral on Breca's wicker panel. The same spiral on the cairn on the ridge. The same spiral on the bronze amulet carried by the men from across the water. The knowledge layer generates a set of symbol systems — perhaps three to five major symbol traditions — and distributes instances across the landscape and across people, ensuring that each system is discoverable through multiple pathways.

**Word-tellings and their variants.** The oral histories carried by specific individuals. Each word-telling exists as a core narrative with multiple surface versions — different tellers emphasise different details, use different names, include or omit different episodes. The knowledge layer generates the core narratives and the variant parameters, and the voice layer produces the specific telling the player hears based on who is telling it, their trust level, their shared language depth, and their cultural context.

Word-tellings reference landscape features, legendary figures, historical events, sacred places, and ritual practices. These references are the primary mechanism by which the player connects the knowledge layer to the landscape layer — a story mentions a hill, and the player recognises it; a name in the telling matches a name carved in stone.

**The Old Tongue naming system.** A set of approximately fifty to one hundred roots with meanings, and rules for how they combine. The knowledge layer uses this system to generate names for landscape features, seasons, gods, and legendary figures. The names are distributed so that roots recur meaningfully — the same root appearing in the name of a spring, a god, and a legendary figure, creating connections that are discoverable by a player who pays attention to the sounds of names.

The Old Tongue names encode:

Names of places — hills, rivers, springs, escarpments, ranges, coastlines.
Names of things past — glaciers, volcanoes, former landscape features.
Names of events — tsunamis, earthquakes, eruptions, great storms, influxes of water.
Names of seasons and calendar moments — especially where lunar and solar cycles converge.
Names of gods — diverse, regional, some masculine, some feminine, some neither, some tied to places, some carried by peoples.
Names of legendary figures — people in the word-tellings with god-adjacent powers, who travelled great distances, had great strength or wisdom, communed with gods, spoke to the dead, vanished into caves and reappeared years later unchanged.

The legendary figures serve a specific narrative function: they are precedents for what the player is doing. Their names, when decoded through the Old Tongue root system, are clues — not directions but resonances, confirmations that the player is retracing paths walked before.

**Sacred place significance.** What specific sacred places mean — what happens there at solstice, what the cave paintings depict, what the stone circle alignment reveals, what the holy well is for. This knowledge is distributed across word-tellings, symbols, cultural common knowledge, and direct experience (tarrying at the right time). No single source provides the full picture. The player assembles understanding from fragments.

**Ritual knowledge.** The specific practices — what to do at a place, when to do it, what to say, what to bring. Ritual knowledge is the most heavily trust-gated content in the game. It is shared only with those who have earned the right to witness or participate, because ritual is maintenance — the rites keep the world functioning — and performing a rite incorrectly is dangerous.

**The impossible objects.** No more than five in the entire world. Each is placed by the knowledge layer at a specific site, guarded by specific trust requirements, and connected to the deep knowledge web through word-tellings and symbols. Most players will never see any of them. Some will only hear of them.

**Threshold conditions.** The knowledge layer defines what is required for Passage — the game's ultimate threshold. This is not a checklist but a convergence of understanding — enough pattern recognition, enough ritual knowledge, enough relationship with the deep past, and the willingness to sacrifice something real. The knowledge layer knows the shape of the endgame even though the player never will until they're in it.

### 3.4 Common Knowledge as Foundation for Deep Knowledge

The two strata of the knowledge layer are not separate systems. Common knowledge is the foundation that makes deep knowledge legible.

The word-telling about the woman who vanished into a cave is deep knowledge, gated by trust. But the common knowledge that caves are mouths of the earth, that the dead dwell underground, that certain people can walk between worlds — that's the context that makes the word-telling meaningful rather than merely strange.

The deep knowledge is the specific. The common knowledge is the grammar that lets the player parse it.

A player who has accumulated rich common knowledge from multiple cultures is better equipped to interpret deep knowledge when they encounter it, because they have more contextual frameworks to draw on. The chalk-south understanding of midwinter and the granite-west understanding of midwinter are both partial. A player who holds both can triangulate toward something deeper than either culture possesses alone. This triangulation — holding multiple partial truths simultaneously and seeing what they have in common — is one of the game's deepest skills, and it mirrors what Tolkien said about word-tellings: the truth is triangulated from the differences between versions, not found in any single telling.

---

## 4. The Supernatural as Convergence

The Barrow does not model the supernatural as a system. There is no spirit layer, no divine favour variable, no entity tracking for gods or ghosts. The game's systems are entirely material — they track knowledge, geology, astronomical positions, cave-wight territories, trust levels, physical conditions.

But the game does not deny the supernatural either. It refuses the question. The distinction between natural and supernatural is a modern invention, and The Barrow's world predates it. The wise woman doesn't think she's experiencing the supernatural. She doesn't have a category called "supernatural." The dead are present at midwinter because the dead are present at midwinter.

### 4.1 The Principle

The supernatural lives in the convergence between existing systems, not in a system of its own. When enough material conditions align at a single point — the right place, the right time, the right knowledge, the right relationship, the right physical state — the voice layer is authorised to describe experiences that exceed what the material systems can individually explain. Not by inventing supernatural events, but by describing the edges of material experience — the moments where perception becomes uncertain, where the boundary between what's real and what's felt dissolves.

### 4.2 Convergence Density

The knowledge layer tracks convergence density — how many significant systems are aligning at a given moment for the player at their current location.

Factors contributing to convergence density:

**Landscape significance.** Geological distinctiveness, acoustic properties, astronomical alignment of features. A cave with unusual resonance. A stone circle aligned to midwinter sunrise. A spring at a geological boundary.

**Temporal alignment.** The right time of day, the right season, the right lunar phase, the right point in a longer cycle. Midwinter dawn. Full moon at equinox. The dark of the moon in the dead of winter.

**Knowledge depth.** What the player knows about this place — word-tellings heard, symbols recognised, cultural common knowledge about its significance, Old Tongue name decoded. The more the player understands, the more the voice layer can draw on that understanding.

**Relationship depth.** Whether the player has been invited or prepared by someone with ritual knowledge. Whether they've been told what to expect, what to do, what to bring.

**Player physical state.** Exhaustion, fear, hunger, cold, the aftereffects of the wise woman's concoction, the heightened awareness that comes from prolonged time in darkness. These altered states are not side effects of the ritual — they are the ritual. Fasting, sleep deprivation, psychoactive substances, extreme conditions — these are technologies for reaching a state where convergence becomes perceptible. The player state layer tracks physical condition, and altered states feed into convergence density as an additional factor.

This creates a meaningful choice: do you drink what the wise woman offers? Do you push through exhaustion rather than resting? These choices have survival costs — a hallucinating player is vulnerable, an exhausted player makes poor decisions — but they also have perceptual rewards. The sceptical reading says: you were hallucinating. The sacred reading says: this is how you open the door. Both readings are correct simultaneously.

**Wight presence.** Whether cave-wights or small folk are in the vicinity. Their presence registers on Body Sense and contributes to convergence, but the player cannot distinguish between "a cave-wight is watching me" and "something numinous is present."

### 4.3 The Convergence Spectrum

Convergence density produces a spectrum of voice layer output.

**Low convergence.** The player walks past a standing stone on a Tuesday afternoon in drizzle. It's a stone. Maybe they notice a mark. The voice layer describes it materially.

**Moderate convergence.** The player stands at the same stone at dusk, having heard a word-telling about this place. The voice layer might note the quality of the light, the way the shadow falls, a feeling of attention. Still material, but richer, more suggestive.

**High convergence.** The player stands at the stone at midwinter dawn, having heard three versions of the word-telling, having traced the symbol, having built deep trust with the wise woman, having learned the ritual significance of this alignment, perhaps having drunk something the wise woman prepared, perhaps having walked through the night to be here at this moment. The voice layer describes something that makes the hair on the back of the neck stand up. A sound that isn't wind. A presence that Body Sense registers but that doesn't resolve into anything identifiable. A shadow that falls across something that wasn't visible before. The quality of the air changes.

The voice layer never states that anything supernatural has occurred. It describes experience — what the player perceives — and the perception is shaped by the convergence of everything the player has brought to this moment. A player who arrives at the same place without the knowledge, the relationship, the preparation, the physical state — they experience a stone at dawn. The game hasn't cheated. The stone is the same stone. The dawn is the same dawn. What differs is the player, and what the player has earned the capacity to perceive.

### 4.4 Spirits, Gods, and the Dead

The small gods, the spirits of places, the dead — these exist in exactly one place in the architecture: the mouths of the people who believe in them. They are cultural common knowledge, carried in the knowledge layer, distributed through the habitation layer. The wise woman speaks of the spirit of the spring. The men from across the water invoke a god of the sea. The water-people speak of voices in the reed beds.

The game takes these beliefs seriously. It never undermines or ironises them. But it does not model spirits as entities with agency. The spirit of the spring is what the wise woman calls the experience of being at that spring when convergence conditions are right. Whether that experience is "really" a spirit or "really" a combination of geology, acoustics, and human attention is a question the game refuses to answer.

The more the player investigates, the more the material explanations and the sacred explanations reinforce each other rather than separating. The cave-wights are real, biological beings. But the word-tellings describe them as spirits. The cave-wight navigates darkness better than any human. It knows passages no human has found. It's been here longer than human memory. At what point does "biological being with extraordinary abilities" and "spirit of the underground" become a distinction without a difference?

### 4.5 Passage and the Apex of Ambiguity

Passage — the game's final threshold — is where the ambiguity reaches its apex. Crawling through the barrow and emerging somewhere else. If the entire game has maintained ambiguity about the supernatural, then Passage is where it matters most.

Does the player emerge in another part of the landscape, having traversed a physical passage they didn't know existed? Do they emerge in the same place but changed, having undergone a transformative experience in the dark? Or do they emerge somewhere that the material landscape cannot explain?

The game should support all three interpretations simultaneously. The player's experience of Passage is shaped by who they've become — what they know, what they believe, what they've sacrificed. The voice layer's description of what's on the other side is the most ambiguous text in the entire game, and every player should read it differently.

### 4.6 Architectural Implications

The supernatural-as-convergence principle requires:

The knowledge layer must define convergence conditions for significant sites — what combinations of knowledge, time, relationship, and physical state produce threshold experiences.

The player state layer must track altered physical states (exhaustion, fear, ingested substances, sensory deprivation) as factors that feed into convergence density.

The voice layer must have clear guidelines for the convergence spectrum — how far toward the liminal it's permitted to push at each density level, and how to maintain ambiguity at every level. The voice layer must never confirm the supernatural. It must never deny it. It describes experience.

No other layer is required. The supernatural is an emergent property of the existing architecture, not an addition to it. This is by design.

---

## 5. The Relationship Layer

The relationship layer tracks the dynamic connections between the player and the world's people. It mediates access to the knowledge layer — determining what the player can learn, from whom, and when.

### 5.1 Trust

Trust is the primary currency of the relationship layer and the bottleneck to deep knowledge. It is tracked per individual, not per settlement or culture.

Trust is built through:

**Time and presence.** Repeated visits. Being in proximity without threat. The tarrying mechanic applied to people.

**Reciprocity.** Gifts given. Help offered. Work shared. The gift economy — bringing something the person needs, not because they asked but because the player noticed.

**Positive encounters.** Interactions that go well. Shared experiences. Moments of mutual understanding.

Trust is damaged by:

**Negative encounters.** Trespass. Theft. Unpredictable behaviour. Aggression.

**Identity conflict.** The player's tattoos, god-names, or cultural markers may conflict with the individual's allegiances. Tarrying near someone who reads your identity as threatening can make things worse rather than better.

**Prolonged absence.** Trust doesn't reset to zero, but it cools over time without maintenance. A relationship not visited for a long time settles to a lower resting state. The wise woman remembers you, but the warmth has faded.

Trust is not visible as a number. The player reads trust through the quality of interaction — body language described in the text, willingness to share, physical proximity, whether the person turns their back, what they volunteer versus what must be asked for.

### 5.2 Shared Language

Shared language depth is tracked per individual. It represents the mutual vocabulary and understanding built through time together. It starts at the most basic level — gestures, pointing, essential nouns — and deepens through repeated contact.

Shared language is partially transferable within a language family. Time spent building communication with Breca helps somewhat with others in her region, because the underlying language is related. But it helps not at all with people from across a major linguistic boundary, and especially not with the men from across the water, whose language is from a different family entirely.

Shared language depth determines what the player can discuss with a given individual. At low depth: concrete, immediate, physical. "She offers dried fish. She points north." At moderate depth: local information, stories, practical knowledge. At high depth: abstract concepts, word-tellings, beliefs, subtle distinctions, metaphor.

The deepest knowledge can only be communicated at the highest shared language depth, because it involves complex, abstract ideas that require nuanced expression. This is the natural gating mechanism — not an artificial lock but a realistic consequence of how communication works.

### 5.3 Reputation

Reputation is a network of stories about the player, propagated through the world at the speed of human travel. It is not a single number but a distributed, approximate, and sometimes inaccurate body of information.

Reputation propagates through:

**Direct contact.** People the player has met talk about them to others.

**Trade networks.** Traders carry news between settlements. The player's reputation can travel along trade routes faster than the player can walk.

**Kinship ties.** Information passes between related settlements.

Reputation is shaped by:

**Craft.** A player known for fine flint-work has a positive reputation among people who value flint.

**Trade.** A player known for fair dealing is welcomed. A player known for greed is not.

**Identity markers.** The player's tattoos, god-names, and cultural affiliations precede them.

**Notable actions.** Helping a settlement, witnessing something significant, being present at a sacred event.

**The player's lack of lineage.** In a culture where genealogy is your credentials, having no people is conspicuous. This is an active element of the player's reputation, especially early in the game.

Reputation is imperfect. What arrives at a distant settlement is a simplified, possibly distorted version of who the player actually is. The player might arrive somewhere to find that their reputation has been shaped by a single encounter that was misunderstood or exaggerated. This imperfection is realistic and creates interesting social situations.

### 5.4 Encounter History

The relationship layer tracks the history of encounters with each known individual — not a full transcript but a record of key events. Positive encounters, negative encounters, gifts given, time spent, things shared. This history affects trust and informs the voice layer's description of each interaction.

The encounter history also tracks the player's relationship with the translators — a particularly important subset, because access to the men from across the water's knowledge depends on it.

### 5.5 Identity Reading

Every NPC reads the player's identity markers and responds accordingly. The relationship layer manages this reading — determining, for each individual, how they interpret the player's tattoos, god-names, speech patterns, craft objects, food choices, and other visible signals.

Identity reading is not uniform. The same tattoo might be read positively by one person and negatively by another, depending on their own cultural position. The relationship layer needs to know enough about each NPC's cultural context to determine how they read specific markers.

This means the player's identity choices have consequences that are distributed, unpredictable, and partially invisible. Taking the hill people's mark opens doors with some people and closes them with others, and the player may not know which doors they've closed until they encounter someone who reads the mark differently.

---

## 6. The Player State Layer

The player state layer is the accumulation of everything the player has done, learned, seen, and become. It is the unique fingerprint of this particular life in the landscape.

### 6.1 What the Player State Contains

**Physical state.** Location (current district, current site or path), physical condition (cold, hungry, injured, well-rested), what they carry (tools, food, materials, trade goods, any impossible objects).

**Knowledge state.** All common knowledge tags acquired. All deep knowledge fragments encountered — word-tellings heard (including which version from which teller), symbols seen, sacred places visited and at what times, ritual knowledge gained, Old Tongue name fragments collected.

**Skill state.** Practice levels for craft activities — flint-knapping, woodworking, pottery, fire-making, herb identification. These are not numeric levels displayed to the player but internal values that affect what the player can make and how the voice layer describes their attempts.

**Identity state.** Tattoos received, god-names spoken at shrines, cultural markers accumulated through time spent with specific peoples. Lineage status (which begins as "none" and may or may not change through the game). Speech patterns and vocabulary shaped by the people the player has spent the most time with.

**Relationship state.** Trust levels, shared language depths, encounter histories, and reputation network for all known individuals.

**Memory state.** Sites visited, paths travelled, caves explored (including the mental map of any cave system visited with light, which determines whether the player can navigate it in darkness). Sightlines seen — what the player has observed from hilltops, which determines their mental geography.

**Temporal state.** How long the player has been in the world. How many seasons they've lived through. Which calendar events they've witnessed. This determines what Seasons and Moon knowledge they've accumulated passively.

**Quest state.** Not a formal quest log but a record of the threads the player has pulled — which connections they've made, which mysteries they're pursuing, which word-tellings they're trying to verify. This is not prescriptive. The game doesn't track "active quests." It tracks which pieces of deep knowledge the player has encountered, which allows the generation system to ensure that further pieces are discoverable.

### 6.2 How the Player State Is Used

Every other layer queries the player state to personalise the player's experience.

The voice layer uses it to determine which knowledge-gated content is visible at a site, which choices to offer, how to describe the landscape (based on what the player knows about geology, ecology, weather), and how to frame encounters (based on the player's identity and reputation).

The knowledge layer uses it to bias the generation of unseen territory — subtly, not as a vending machine, but as plausibility. A player who has been gathering herbs is more likely to encounter people for whom herbs are relevant.

The relationship layer uses it to determine how NPCs respond — reading identity markers, checking trust levels, modulating what they're willing to share.

The landscape layer's persistence system uses it to track what the player has modified — shelters built, fires made, paths worn.

### 6.3 The Player State as Identity

The player state is, in a very real sense, the player's identity in the game. It is not a character sheet they chose at the start. It is the residue of every small choice they've made — where to go, who to spend time with, what to learn, what to carry, whose god to name at whose shrine. Two players with different states are different people, moving through the same landscape but experiencing it differently.

This is the core of the game's replayability. The world is generated from a seed and is theoretically the same for any player using that seed. But the player state transforms the experience so thoroughly that two players in the same world would have fundamentally different games — different relationships, different knowledge, different identities, different quests, different understandings of what the world means.

---

## 7. The Voice Layer

The voice layer is the top of the stack. It takes everything below — the landscape, the habitation, the knowledge, the relationships, the player state, the current temporal conditions — and produces the text the player reads and the choices they're offered.

### 7.1 The Fragment Library

The fragment library is a structured database of hand-authored prose fragments, written in the game's specific literary voice: short sentences, concrete detail, no purple prose, trust the reader. Fragments are organised by context:

**Terrain fragments.** Descriptions of landscape types — chalk downland, limestone dale, granite moorland, clay forest, sandstone heath, coastal cliff, marshland, glacial debris. Multiple variants per type, varying in detail and emphasis.

**Weather fragments.** Descriptions of weather conditions — rain, fog, clear sky, wind, snow, frost, heat, storm. Combined with terrain fragments to produce landscape descriptions. "Rain on chalk downland" draws from both the rain set and the chalk set.

**Sensory fragments.** Specific sensory details — sounds, smells, textures, temperatures, light qualities. These are the finest-grain fragments and provide the concrete specificity that makes the voice distinctive. "Pig tracks in the mud." "The smell of smoke is stronger." "Frost on the thatch, the first of the season."

**Temporal fragments.** Descriptions of time of day, season, and light conditions. Dawn, midday, dusk, night, moonlight, firelight. Combined with everything else.

**Site-type fragments.** Descriptions of different kinds of places — settlements, standing stones, caves, fords, hilltops, springs. Multiple variants per type.

**Underground fragments.** A separate set for cave descriptions — emphasising sound, touch, air, light, and the specific quality of being inside rock. These fragments have a different character from surface fragments: shorter, more compressed, more focused on non-visual senses.

**Relational fragments.** Descriptions of people — their appearance, their body language, their tone. These are more variable than landscape fragments because they depend on relationship state. A person described at low trust looks different from the same person described at high trust.

**Observation fragments.** Things the player might notice — animal signs, useful plants, distant features, path-side discoveries. These are the fragments that generate the "off to the left, a break in the trees" moments that lead to site discovery.

The fragment library needs to be large enough that the player rarely reads the exact same description twice for the same type of situation. This is achieved combinatorially — ten terrain descriptions times ten weather descriptions times ten sensory details produces a thousand combinations before the LLM adds variation.

### 7.2 The LLM's Role

The LLM is a limited and controlled contributor, not a core feature. Its role is:

**Smoothing fragment combinations.** The fragment library provides components. The LLM joins them into flowing prose, adjusting transitions and avoiding mechanical-sounding assembly.

**Generating relational content.** What people say, how encounters unfold. This is too dependent on state variables to pre-author exhaustively. The LLM is given the current state (who is speaking, their trust level, their shared language depth, what they know, what they're willing to share, the player's identity) and voice guidelines, and it produces the encounter text.

**Varying descriptions.** Ensuring that even with the same fragment inputs, the output text varies enough to feel fresh. The LLM adds small details, rephrases, adjusts emphasis.

**Maintaining voice.** The LLM is constrained by explicit voice guidelines: short sentences, concrete nouns, no purple prose, no explanation, trust the reader. The guidelines are part of every prompt. The LLM's tendency toward verbosity and abstraction must be actively counteracted.

The LLM does not:

**Invent plot.** It does not decide what happens. The state and knowledge layers determine what's true. The LLM describes it.

**Decide what people know.** The knowledge layer determines knowledge. The LLM expresses it through the relationship layer's constraints.

**Generate new world content.** It does not create new sites, new symbols, new word-tellings. It describes existing ones.

### 7.3 Illustration Selection

The voice layer determines when an illustration appears. Illustrations are selected from a curated library of several hundred drawings — line art in a consistent style, reminiscent of early twentieth-century book illustration. Spare, atmospheric, more suggested than rendered.

An illustration appears when the player encounters something visually significant — a standing stone, a carved symbol, a bronze object, a cave painting, a landscape viewed from a summit, a specific artefact. The voice layer selects from the library based on what's present at the site.

The appearance of an illustration is a signal. It says: look at this. Because it happens rarely — most screens are text only — the player pays attention when an image appears. Illustrations punctuate the experience rather than decorating it.

### 7.4 Choice Generation

The voice layer generates the choices offered to the player at each decision point. Choices emerge from the situation — what's physically possible, what the player knows, what relationships allow — and are phrased as natural impulses.

**Movement choices** when in the landscape: "Continue along the ridge." "Descend into the valley." "Wait and watch."

**Social choices** when among people: "Go to Breca." "Help her mend the panel." "Say nothing and sit with her."

**Exploration choices** when at a site: "Examine the mark on the stone." "Enter the cave." "Climb to the hilltop for a better view."

**Knowledge-gated choices** that only appear because of what the player knows: "Show your hands, palms open" (because you learned this gesture from another culture). "Trace the spiral in the dirt between you" (because you recognise the symbol).

The number of choices varies with the complexity of the situation. A simple travel moment might offer two or three. A socially complex settlement visit might offer four or five. The game never offers so many choices that the player feels overwhelmed, and never so few that the world feels constrained.

The game never tells the player which choice matters most. There is no highlighted option, no hint system, no subtle glow on the important thing. The player chooses based on what they care about, and that choice reveals their quest to them as much as it advances it.

---

## 8. Layer Interactions

The layers interact in specific, defined ways.

### 8.1 Upward Dependencies

Each layer depends on the layers below it. The voice layer reads everything. The landscape reads nothing.

Landscape → Habitation: settlements can only exist where landscape supports them.
Landscape + Habitation → Knowledge: symbols are placed at landscape features, word-tellings reference specific places and are carried by specific people.
Habitation + Knowledge + Player State → Relationship: how an NPC relates to the player depends on who the NPC is, what they know, and who the player is.
All layers → Voice: text generation draws on everything.

### 8.2 Downward Feedback

The player state feeds back downward through the stack.

Player State → Knowledge: the player's accumulated knowledge subtly influences the generation of unseen territory, biasing (not determining) what content appears in newly generated districts.
Player State → Habitation: the player's reputation, carried by traders and travellers, changes how settlements they haven't yet visited will receive them.
Player State → Landscape: the player's physical actions (fires, shelters, worn paths) create persistent modifications to sites.

### 8.3 Cross-Layer Queries

Some interactions cross multiple layers at once.

Body Sense (Player State) + Sacred Place (Knowledge) + Time (Landscape temporal system) = the experience of being at a sacred place at a significant time. This requires the voice layer to query the player's knowledge state (do they know this place is sacred?), the knowledge layer (what's significant about this place at this time?), and the landscape's temporal system (is it actually solstice right now?) simultaneously.

Identity Reading (Relationship) + Cultural Common Knowledge (Knowledge) + NPC Disposition (Habitation) = how a new encounter unfolds. The relationship layer reads the player's identity markers, checks the NPC's cultural context from the knowledge layer, factors in the NPC's disposition from the habitation layer, and produces an initial encounter quality that the voice layer describes.

Cave Navigation in Darkness (Player State memory of cave + Landscape cave structure + Knowledge ritual requirements) = whether the player can attempt and succeed at the ritual darkness mechanic. The player state must contain a sufficiently detailed memory of the cave, the landscape layer provides the cave's actual structure, and the knowledge layer determines whether the ritual conditions are met.

Supernatural Convergence (Landscape sacred site properties + Landscape temporal alignment + Knowledge convergence conditions + Player State knowledge depth + Player State physical condition + Relationship trust depth + Habitation wight presence) = whether the voice layer pushes toward liminal description. This is the most complex cross-layer query in the game, drawing on every layer simultaneously. The result is not a binary — it's a density value that determines how far along the convergence spectrum the voice layer is permitted to go.

---

## 9. Summary

The five layers above the landscape — habitation, knowledge, relationship, player state, and voice — together produce the experience of being a person in a world. The landscape provides the stage. The habitation populates it. The knowledge gives it meaning. The relationship layer gates access to that meaning. The player state makes the experience personal. And the voice layer turns it all into prose that the player reads in short sessions, over weeks and months, gradually becoming someone who understands this world in a way that no one else does.

The supernatural is not a layer. It is what happens when the layers converge — when the right place, the right time, the right knowledge, the right relationship, and the right physical state produce an experience that the architecture's material systems cannot individually explain but that the voice layer can describe. The game never confirms the sacred. It never denies it. It describes experience, and the player brings their own interpretation. This ambiguity is not evasion. It is the most honest place for the sacred to be.

The architecture is designed to support the game's core experience: quiet anticipation, incremental discovery, the pleasure of watching your own decisions compound inside a system you're still discovering. Every layer serves this experience. No layer exists for its own sake.
