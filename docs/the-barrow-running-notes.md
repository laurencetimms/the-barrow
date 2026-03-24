# The Barrow — Running Notes

## Ideas, decisions, and topics for future development.

This document captures things raised during design conversations that need to be developed later, organised by category.

---

## Word-Telling Seeds

Ideas for specific word-tellings to be developed as part of the knowledge layer.

**The Ice Visionary.** A woman who leads a small clan living at the ice boundary in the far north. She claims she is from the distant past — that she lived in the ice for a long time and re-emerged as the glaciers retreated. Her clan follows her, believes her, and lives at the extreme margin of the habitable world because she insists something lies beneath or beyond the ice. Whether her claim is literally true, a sacred metaphor, a delusion, or something else entirely is a question the game does not answer. She is one of the few people pushing into the glacial debris zone, and encountering her and her clan would be one of the rarest and strangest experiences in the far north. Her word-tellings, if the player can earn them, might describe the world as it was before the ice — a landscape no living person has seen, but which the retreating glaciers are slowly revealing. Her knowledge might connect to The Old Knowledge in ways that no other living person's does, because she claims to remember it firsthand.

---

## Foundational Design Decisions

Decisions made during design conversations that are firm and must be reflected across all documents.

**The player begins by emerging from a barrow.** Every new game starts this way. The player wakes in a barrow — a dark, enclosed, underground passage. They emerge into the landscape. The specifics may vary: the barrow's location in the generated world, the experience of emergence, what the player sees first. But the act of crawling out of a barrow is always the beginning.

Critically, the barrow contains grave goods — food, clothing, basic tools — which is how the player starts with the materials they need to survive the first session. And critically, there is no dead body in the barrow. The player realises, gradually or immediately, that they have awoken in their own barrow. They are the person who was buried here. The grave goods are their own.

This has profound implications:

It establishes the barrow metaphor from the very first moment of play. The game begins with the central act — crawling through a dark passage and emerging somewhere else.

It explains the player's lack of lineage. They have no people because they are, in some sense, already dead — or returned from death, or displaced in time, or something the game refuses to specify. The people they meet sense this wrongness. The player is nobody's child because the player is from the barrow.

It connects the beginning of the game to its end. The game starts with emergence from a barrow and ends (potentially) with Passage through a barrow. The symmetry is the game's deepest structural feature.

It provides a plausible reason for the player's amnesia about the world without using the cliché of memory loss. The player doesn't have amnesia. They have *displacement*. They know how to walk, how to eat, how to use tools. But they don't know this landscape, these people, this time. They are learning the world not because they forgot it but because they were not here before — or were here so long ago that everything has changed.

The grave goods found in the barrow might include items that are slightly anachronistic — tools of a style nobody in the current world makes, materials that don't quite match local traditions. These are the first clues that the player is from somewhere (or somewhen) else, and they connect to the impossible objects and The Old Knowledge in ways that unfold over the course of the game.

**The game always ends with the player returning to a barrow.** This is the complement to the emergence decision. The game begins with crawling out of a barrow and it ends with entering one. The symmetry is complete.

There are two forms of this ending:

*Death.* If the player dies — from injury, exposure, illness, starvation, or any other cause — they do not simply see a "game over" screen. Instead, the player experiences their own preparation for burial and interment. This is rendered by the voice layer not as horror — not as being buried alive — but as an out-of-body experience. The player watches (or senses, or drifts through) their own funeral rites. They see or feel the people who knew them preparing the body. They sense the barrow around them — the dark passage, the chamber, the placement of grave goods. The experience has wonder and mystery and anticipation — a sense of something continuing, of a threshold being approached from the other side. The tone is not grief but transition. The player's death is, within the logic of this world, not an ending but a change of state. What happens after — whether the player becomes one of The Far Dead, whether the barrow they're placed in is the barrow that someone else will emerge from, whether the cycle begins again — is left open.

*Passage.* If the player reaches the threshold conditions for deliberate Passage — Pattern recognition, ritual knowledge, sacred site identification, sacrifice readiness, convergence — they may choose to enter a barrow with full understanding of what they're doing. This is not death. It is the act the entire game has been building toward — the informed, prepared, willing entry into the dark passage with the knowledge of how to pass through to whatever lies beyond. The barrow they enter may not be the barrow they emerged from at the start of the game. It may be a barrow they discovered through the deep knowledge web, a barrow whose name in the Old Tongue means something the player now understands, a barrow at a sacred site where the convergence conditions reach their apex. The voice layer's description of Passage is the most carefully crafted text in the entire game — ambiguous, profound, personal to the player's specific journey, and open to interpretation. What is on the other side is a question the game does not answer.

Both endings return the player to the barrow. Both endings are thresholds. But they are fundamentally different experiences — one is a threshold the player is carried through, the other is a threshold the player walks through — and the entire game is the distance between them.

This needs to be developed in detail as a future design topic, particularly: the voice layer's handling of the death experience, the mechanical conditions for Passage, the relationship between the emergence barrow and the ending barrow, and whether the game supports any form of continuation or new-game-plus after either ending.

---

## Topics to Develop

Subjects identified during design conversations that need their own focused treatment.

**Power.** How power is held, exercised, and resisted. Who leads settlements and why. How decisions are made. How disputes are resolved. How the arriving people's bronze gives them leverage. How the wise woman's knowledge is a form of power. How the translators' position gives them unique influence. How taboos are enforced. How exile works. How violence (rare but real) shapes social relationships. How coercion works in a pre-state society. Design boundaries around the kinds of violence the player experiences. (Flagged in Habitation Layer, Section 14.)

**Construction types and warps.** *(Now addressed in standalone Construction document.)* May need further development on the arriving people's construction influence and on the relationship between construction and sacred architecture.

**Endings — death and Passage.** The detailed design of both ending experiences. The voice layer's handling of the death-as-transition experience. The mechanical conditions for deliberate Passage. The relationship between the emergence barrow and the ending barrow. Whether the game supports continuation or new-game-plus. The emotional and narrative design of the most important text the voice layer will ever produce.

**The fragment library taxonomy.** What categories of fragments are needed, how many per category, how they combine, and what the authoring process looks like. This is the bridge between design and production — the point where the game's voice is defined in practical, writable terms.

**The Old Tongue root system.** The fifty to one hundred roots, their meanings, their combinatorial rules, and how they're distributed across the landscape. This is a specific creative and linguistic task that needs focused work.

**The generation algorithm in detail.** The technical implementation of layered generation — what runs when, what data structures are used, how seeds work, how districts are generated on approach, how sightlines trigger distant-district generation, how the knowledge layer's threads are distributed across generated content. This is the bridge between design and engineering.

**The illustration library.** What subjects need to be illustrated, how many illustrations are needed, what the style guidelines are, and how illustrations are tagged for selection by the voice layer. This is the bridge between design and art production. **Placeholder art style: F.L. Griggs.** During development, AI-generated placeholder illustrations should use the style of Frederick Landseer Maur Griggs (1876–1938) as the primary reference. Griggs was an etcher and illustrator whose work depicts the English landscape — churches, ruins, barns, ancient trees, stone walls, rolling country — with a precise, atmospheric, deeply felt quality. His etchings are spare but rich in texture, with strong blacks, fine line work, and a sense of age and weight. They feel handmade and rooted in place. This is closer to the right tone for The Barrow than the broader Rackham-Ravilious reference used in earlier design documents. When commissioning final illustrations for the Steam release, the brief should reference Griggs alongside other artists in the English etching and wood-engraving tradition.

**Altered states and convergence.** The detailed mechanics of how exhaustion, fear, hunger, cold, ingested substances, and sensory deprivation feed into convergence density. What the player experiences at each level. How the voice layer's guidelines shift. How the game handles the survival cost versus the perceptual reward.

**Animals.** The fauna of The Barrow's world — what lives where, how animals behave, how they interact with the player, how they connect to the food system, the craft system (bone, antler, hide), the knowledge system (animal signs), and the sacred system (animal symbolism in word-tellings and ritual).

**The player's body.** A more detailed treatment of the player's physical state — hunger, cold, injury, illness, fatigue, strength, agility — and how it affects what they can do, how fast they travel, and what they experience. This connects to the convergence system and to the survival mechanics.

**Music and sound.** Whether The Barrow has a soundscape beyond text. Ambient sound, music, the sound of wind or water or fire. If so, how it's generated or selected, and how it contributes to atmosphere without contradicting the game's text-primary design.

---

## Continuity Notes

Things to check or update across documents when changes are made.

The player emergence from a barrow needs to be reflected in the game description document, which currently says "You emerge into a landscape" without specifying how.

The Ice Visionary and her clan, once developed, need to be placed in the habitation layer as a specific mobile group in the far north.

The construction types discussion may require updates to the settlement properties in the habitation layer and to the site types in the landscape model. (Partly addressed — standalone construction document now exists.)

The barrow-return endings (death and Passage) need to be reflected in the game description document, which currently doesn't describe how the game ends.

The five impossible objects are now specified in the knowledge layer document. References to them in the game description should be checked for consistency.

## Easter Eggs
The Psychic Potato (just a little in-joke, we'll hide it somewhere and we'll just identify it as a strange vegetable and it'll confer brief future-seeing experiences if you eat it)