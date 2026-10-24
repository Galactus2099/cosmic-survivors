# Cosmic Survivors Changelog

## v0.5 — Rift Realms (October 24, 2026)
- Three redesigned moving dungeon floors. Nebula Hollow uses violet cosmic ruins; Cinder Spire adds crimson fissures; Astral Ruins has luminous seals and wandering motes.
- Procedural parallax-like environmental details include broken obelisks, cracked tiles, ancient circles, floating particles and glowing sigils, all deterministically positioned in world space.
- Enemy visual redesign: wisp flames, swift darts, armored bulwarks, seer eyes, elite shard-crowns and the multi-spiked Rift Guardian.
- Elite and boss radial blasts now show a visible warning circle before doing damage; dash grants a brief invulnerability window.
- Menu and HUD polish: moving celestial portrait, layered panels, updated selected states, stronger arena frame and reduced-motion handling.
- Keeps the v0.4 Starling → Nebulynx → Astralynx evolutions, skin collection, shop and saves intact.

### Testing
- JavaScript syntax checks pass on the three inlined scripts.
- Existing VM smoke test passes for the Starling evolution progression.
- Actual headless Chromium test confirms: menu rendering, six companions, dungeon selection, Starling gameplay, dodge cooldown, auto-attacks, pause/resume, Cinder Spire appearance; no page exceptions.
- The full 90-second survival balance and long-run performance still need more testing.

### Roadmap
Replace prototype character portraits with correctly animated original sprite sheets (idle/run/attack/hurt/evolve), more varied bosses, stronger map identity, mobile controls, and rebalance difficulty.

## v0.4 — Evolution & Combat
- Starling, Nebulynx and Astralynx original evolution line (levels 4/8).
- Dash, ranged Seers, cosmetic animation effects and evolution mastery mission.

## Earlier
- v0.3 implemented baseline survival dungeons, weapons, wardrobe, boss, upgrades and collectible progression.

All changes are confined to Cosmic Survivors. Nightfall is a separate project.
