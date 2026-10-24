# Cosmic Survivors Classic — Mega Evolution + Halloween & Waves (Fan Prototype)

This is an independent, noncommercial fan-game build based on the **PokéSurvivor MIT-era engine** by JPTER78 (immutable revision `b29708900da26b34e70d2dc07ad1659a719f4a78`, October 14, 2026).

## Play

Open https://galactus2099.github.io/cosmic-survivors/classic/ and sign in with a local account. Existing local Classic accounts and owned Pokémon are retained. Use **Jugar** for the original survivor game.

## Halloween & Waves — how to play

1. On the main menu, click **🌊 Waves Mode**, directly below Jugar (Play).
2. Defeat incoming Pokémon. Once a round's enemies are cleared, the next wave starts after a short break.
3. Every **25 waves**, a larger boss appears. The game continues until you lose or quit.
4. Earn **1 Candy Corn per 10 kills** in **both** Classic and Waves, plus bonus Candy Corn for cleared waves.
5. Your **🎃 Candy Corn** total is displayed in the Waves HUD. From the main menu, click **🎃 Halloween Shop** to spend it.
6. Shop rewards include Haunted Menu, Pumpkin Aura, Spectral Trail, Shadow Mewtwo and Shadow Lugia packs. Both packs unlock their base Pokémon and add a special aura; equip the existing Shadow tint in **Cosmic Wardrobe**.
7. The **Cosmic Wardrobe** and Spirit Lantern cosmetics remain available. **The pre-run Mega toggle has been retired** in favor of a rare in-run **Mega Evolution Unique card**. For eligible partners, the first chance appears at 30 minutes in regular solo runs, or from wave 20 in Waves. Charizard and Mewtwo have X/Y variants; Kyogre and Groudon have Primal forms, and Zacian/Zamazenta have Crowned forms. Once picked, the transformation's HP/damage/speed/cooldown buffs last for that run. A golden **Mega Capable** label appears on the partner menu.

Candy Corn and purchases are saved within your local game account using the existing local save system. **Guest saves are temporary.** Halloween Mode stays available year-round.

## Guest Test Lab (try everything without unlocking)

Open **https://galactus2099.github.io/cosmic-survivors/classic/?testlab=1**

1. Use **Invitado / Guest** mode. If you are already in your real local account, click **Salir / Log out** first, then click **Invitado / Guest**. This does **not** delete your existing local account; sign in again when you finish.
2. Complete the first-partner introduction if Guest prompts you to do so.
3. Click **🔬 TEST LAB** in the bottom-right.
4. Choose a temporary loaner: Charizard, Mewtwo, Gengar, Lucario, Kyogre, Groudon, Zacian, Zamazenta, Venusaur or Blastoise.
5. Click **Start Solo Test** or **Start Waves Test**.
6. During your run, click **🔬 TEST LAB** again. Use **Show Mega Choice Now** to see and choose the actual mid-run card immediately, rather than waiting 30 minutes. In Waves, use **Jump to Wave 20** to test the wave-20 stage too.
7. Choose Shadow, Gold, Prismatic, Galaxy or Crimson Nebula under **Preview skin**. You can also turn on temporary Halloween aura previews.

**Lab safety:** Guest-mode progress is temporary and does not save to your real account. No Pokémon or skins are permanently unlocked, and no real-account Candy Corn or Lanterns are spent. The Test Lab does not appear on the ordinary game URL. For normal progression, remove `?testlab=1` and sign into your existing local account.

## Haunted Hollow (visual first pass)

Waves mode now has Halloween ambiance with grave markers, pumpkins, violet ground haze, runic sigils and floating spectral motes. The decorative details are nonblocking and share the existing collision-safe maps. A unique Haunted Hollow biome with new objectives and event encounters is planned; **this is currently a visual scenery layer, not the full Doofcraft event map.**

## Cosmic Skins 2.0 — distinctive animated materials

The five special appearance families now change the **material visible inside your animated Pokémon sprite**, not only its color.

- **Shadow:** deep ink-black/violet shading with drifting smoke.
- **Gold:** moving metallic highlights, golden reflective bands and sparkles.
- **Prismatic:** shifting rainbow colors, crystal facets and sharp multicolor glints.
- **Galaxy:** rich blue/purple nebula shading with an animated starfield and twinkling points.
- **Crimson Nebula:** crimson-black-purple material, gold accents and sparks.

All five still use the **original animated sprite frames** for moving, attacking, being hurt and fainting. These are procedurally generated textures, not entirely separate, hand-painted sprite sheets or new anatomical forms. The in-game Wardrobe now previews the families with distinct animated material orbs.

### Compare quickly without grinding

Open [Guest Test Lab](https://galactus2099.github.io/cosmic-survivors/classic/?testlab=1), choose Guest, click TEST LAB, borrow Mewtwo and start a Solo Test. While playing, reopen TEST LAB and choose **Normal**, **Prismatic**, **Galaxy**, **Gold**, **Shadow** or **Crimson Nebula** from the skin dropdown, then close the panel to see the difference. These previews do not use currency or permanently unlock skins.

Real skin unlocks, Spirit Lanterns, Waves, Candy Corn, Halloween Shop and Mega Evolution remain as before. If you use a normal local account instead of Guest, the Lab won't alter it.

## Cosmic Species Art 2.1 — fitted visual details

**Mewtwo, Charizard, Gengar and Lucario** now receive additional *body-anchored* ornament geometry above the animated sprite textures. Each has its own head/shoulder/chest/arm layout, with distinct pieces for the five cosmetic families:

- **Prismatic:** three-piece crystal crown, faceted shoulder crystals, a shining chest jewel, arm crystals and species-specific details. Mewtwo also gets a psychic-tail crystal ring.
- **Galaxy:** celestial brow crest, star-studded shoulder plates, an orbiting crescent-and-star chest emblem and tiny star cuff marks.
- **Gold:** metallic crown, patterned golden shoulder armor, a reflective chest medallion and wrist bands.
- **Shadow:** dark curved horns, obsidian armor plates, violet psychic rune and shadow markings.
- **Crimson Nebula:** crimson-black horn fins, gold-trimmed battle armor, burning chest core and ember-like bracers; Charizard gains extra dragon-wing/ember accents.

The attachments use each animation's foot-anchor coordinates (idle/walk/attack/hurt) and extra transparent margins to accommodate larger spikes and crystals. Back-facing and defeated animations have special handling. Pokémon without fitted layouts still use the earlier animated material shaders.

**How to see it:** Open `https://galactus2099.github.io/cosmic-survivors/classic/?testlab=1`, enter **Guest**, open **TEST LAB**, borrow Mewtwo, then start a Solo Test. Open TEST LAB again during the battle and try **Prismatic**, **Galaxy**, **Gold**, **Shadow**, and **Crimson Nebula**. Normal removes the effects. You can also borrow Charizard, Gengar or Lucario for their own shapes.

This remains **procedural fan-art ornamentation on existing animated SpriteCollab sprites**, not new hand-drawn Mega-form sprite sheets or a finished species-specific alternate-sprite collection. The next art stage is individual transparent sprite sheets per Pokémon and skin.

## Cosmic Pixel Atlases 3.0 — Prismatic and Galaxy Mewtwo

**The first real, separate transparent skin animation files are included in the game:**

- `assets/variants/150/prismatic/{Idle,Walk,Attack,Shoot,Charge,Hurt,Faint}.png`
- `assets/variants/150/galaxy/{Idle,Walk,Attack,Shoot,Charge,Hurt,Faint}.png`

Each PNG is an animation *atlas*, containing every original frame and all eight directional rows. Frames are built from the original noncommercial SpriteCollab Mewtwo sprites, with recolored pixel materials and frame-aligned, code-authored crystal and star details **baked into their actual pixels**. The source animation timing, width, height, and foot anchors are unchanged. This is a new pre-rendered sprite-art layer and remains **derivative fan artwork**, not entirely hand-drawn original Pokémon graphics or canonical Mega-form sprites.

The sprite loader uses these atlases for **Mewtwo Prismatic** and **Mewtwo Galaxy**. While they download or if one is unavailable, the previous animated procedural skin renderer works as the fallback. All other species and skin combinations continue to work as before.

### Try the new artwork without spending currency

1. Open [Cosmic Test Lab](https://galactus2099.github.io/cosmic-survivors/classic/?testlab=1), enter **Guest** mode and click **TEST LAB**.
2. Borrow **Mewtwo**, click **Start Solo Test**.
3. Reopen **TEST LAB** during the run, choose **Prismatic** or **Galaxy**, and close the panel. Try moving, attacking, and turning around.
4. Reopen the Lab and click **Transparent Pixel Atlas ON (Mewtwo)**. The button switches to **Procedural shader comparison (PNG OFF)**. Close the panel to see the previous style.
5. Switch the button again to return to the baked PNG art. The normal Wardrobe now labels those two Mewtwo skins **ANIMATED PIXEL ATLAS**.

Your real local account is unchanged by Guest testing. Nothing is permanently unlocked. In normal play, Prismatic and Galaxy keep their prior Wardrobe unlock prices.

### Rebuilding the frames

Source: `tools/build_variant_atlases.py`, built through `.github/workflows/export-mewtwo-atlases.yml`, with a checksummed `assets/variants/150/manifest.json`. The generated PNGs are committed into the repository and served statically by GitHub Pages. Original SpriteCollab attribution and the CC BY-NC 4.0 obligations still apply.

## Cosmic Pixel Atlases 3.1 — three more fully animated Pokémon

The **Prismatic and Galaxy** pixel-baked animation atlases are now expanded from Mewtwo (#150) to:

- **Charizard (#6):** faceted dragon-brow gems and crystalline wing joints (Prismatic); star-speckled nebula wing armor and a planetary chest emblem (Galaxy).
- **Gengar (#94):** jagged prismatic spectral crown, jewel-studded cheek crystals and a shining ghost core; alternatively dark nebula horns, stars and a moonlit chest sigil.
- **Lucario (#448):** crystalline aura-ear ornaments, jewel shoulder guards and bright bracelets; alternatively galaxy-blue aura ears, comet shoulder patterns and a planetary chest core.

Every new skin ships **seven separate transparent animation PNG atlases**—Idle, Walk, Attack, Shoot, Charge, Hurt and Faint—and each contains all eight direction rows and the original frame timings. That's **42 new animation atlases**, plus Mewtwo's previously released 14.

Each atlas is a generated derivative of SpriteCollab Pokémon sprite artwork with baked pixel-art flourishes: it is not a completely independently hand-painted replacement. Some frames have tight original boundaries, so the additions are kept within the original frame geometry.

### How to compare new artwork

Open [Guest Test Lab](https://galactus2099.github.io/cosmic-survivors/classic/?testlab=1), enter Guest mode, and borrow **Charizard**, **Gengar** or **Lucario**. Start a Solo Test. Reopen Test Lab during the run, choose **Prismatic** or **Galaxy**, and close it. You can toggle **Transparent Pixel Atlases ON** to compare these saved PNG animation frames with the old procedural shader.

### Rebuilding and attribution

The repeatable exporter is `tools/build_more_variant_atlases.py`, using per-species original SpriteCollab frame metadata and existing `tools/build_variant_atlases.py` color-material functions. Binary PNGs and SHA-256 manifests are stored under `classic/assets/variants/{6,94,448}`. The PNGs are checked in automatically by the GitHub Actions export job.

Noncommercial derivative art: keep the original `classic/CREDITS.md` and SpriteCollab CC BY-NC 4.0 obligations. Other species, and the Shadow/Gold/Crimson Nebula families, still use previous procedural effects pending additional frames.

## Galaxy Mega Charizard — approved design implemented

**After transforming Charizard into Mega X or Mega Y with the Galaxy skin equipped**, the game uses separate transparent Mega-specific animation sprite sheets, not the normal Galaxy Charizard atlases.

- **Full-body cosmic colors.** The generator repaints every original Charizard body pixel (including the orange head, arms, wings, belly, legs and tail) using deep navy/blue/violet nebula tones. Automated pixel checks ensure the original orange does not show.
- **Charizard-recognizable face.** All frames retain the original SpriteCollab Charizard head silhouette and facial anatomy; galaxy horns and markings are carefully attached around it.
- **Clearly different Mega form.** Unique star-patterned extended wing membranes, crystal-like crests, a glowing spiral chest core and a **blue/cyan/pink flame tail** are baked into Mega-specific artwork. Mega X and Mega Y have distinct color accents.
- **Effects chosen in the concept review.** Two little orbiting planets, one horizontal-and-one angled *partial* halo, and exactly three soft crosses resembling stars. No ambiguous large floating diamonds.
- **Seven original animations**, with eight direction rows each: Idle, Walk, Attack, Shoot, Charge, Hurt and Faint. Original gameplay timing and all non-Galaxy forms remain unchanged.
- If an image fails to load, the old animated Galaxy appearance is used so combat remains playable.

**How to test:** Open [Guest Test Lab](https://galactus2099.github.io/cosmic-survivors/classic/?testlab=1), choose **Guest**, click **TEST LAB**, borrow **Charizard** and **Start Solo Test**. During the run, use **TEST LAB → Galaxy**, close it, then reopen **TEST LAB → Show Mega Choice Now**. Choose **Mega Charizard X or Y**. Moving, turning around and attacking should show the full galaxy colors, tailored wings and blue/pink tail. The prior atlas-comparison toggle still works to compare the older shader style. No unlocks or permanent save changes occur during Guest testing.

**Scope and honesty:** These are **new generated, derivative pixel-art animation frames fitted to the real Charizard silhouette**, not officially licensed or fully hand-painted Pokémon artwork. They aim at the approved artwork's design language at the game's existing low pixel resolution, rather than matching its high-resolution illustration pixel-for-pixel. Original CC BY-NC SpriteCollab credits in `CREDITS.md` and upstream MIT code notices in `LICENSE` are retained. Megas in other skin families are still separate future work.

## Current limitations (important)

This adds functional *original adaptations* of Waves and rare in-run Mega/Primal/Crowned transformation cards, not a full recreation of all Doofcraft additions. The new forms currently show animated **base Pokémon sprites with new crest/ring VFX**; accurate alternative Mega-form sprite sheets have not yet been sourced or animated. It does **not** yet include the Haunted Hollow map, Bloodmoon Ursaluna, or unique Shadow Mewtwo/Lugia species artwork. Normal solo-run combat, maps, moves, leveling, Pokémon selection, gacha, and upgrades are inherited from the historical engine.

Online multiplayer, leaderboards, and cloud accounts remain disconnected from the original creator's services. The two fan-game routes are separate: `/` is the earlier Cosmic Survivors game and `/classic/` is the original-style engine + new extras.

## Licenses and attribution

The historical PokéSurvivor code was MIT-licensed; see `LICENSE` and preserve the developer's copyright notice. SpriteCollab Pokémon sprites are under **CC BY-NC 4.0** and credited in `CREDITS.md`. Pokémon designs and trademarks remain owned by their respective owners. This is an unofficial, noncommercial fan project—not a permission grant from the brand owner.

**Never modify or mix with `nightfall-monster-rpg`.**
