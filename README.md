# Cosmic Survivors 🌌

A Pokémon-inspired, browser-based bullet-heaven survival prototype with Shadow, Gold, Prismatic, Galaxy and fusion variants. **Version 0.5 — Rift Realms** introduces distinct dungeon environments, new enemy silhouettes, and telegraphed radial attacks.

## Play

Choose a companion and dungeon, then press **Enter the dungeon**. The entire game is contained in `index.html`.

- **WASD / Arrow keys** — move (drag on the arena on touchscreens)
- **Space or Dash button** — dodge forward; 3.5-second recharge
- **Automatic attacks** — shoot nearby enemies; choose new abilities when leveling up
- **P / Escape** — pause and resume
- **Starling evolution** — pick the original creature Starling; evolve into Nebulynx at level 4 and Astralynx at level 8
- **Final-stage concept Pokémon** — keep their Awakening upgrades at levels 5 and 10 rather than receiving invented canonical evolutions

Run three dungeons, fight Seers and bosses, gather XP, earn stardust, equip eight cosmetic looks, and buy permanent upgrades. Progress is stored locally in the browser.

## Deploying on GitHub Pages

The `main` branch is the release branch. GitHub Pages publishes the website at:

https://galactus2099.github.io/cosmic-survivors/

Changes on feature branches can be reviewed in pull requests before merging to `main`.

## Development notes

See [CHANGELOG.md](CHANGELOG.md) for v0.5 details. This one-file game is a prototype; modularizing the engine and adding authored animations/assets are planned improvements. Browser rendering regression testing is still required after the new version is merged.

**Rights:** The Pokémon-themed fan artwork belongs to its respective rights holders and is not cleared for commercial distribution. New original creatures and properly licensed artwork are recommended for a commercial version.

This repository is independent of Nightfall. Do not modify `nightfall-monster-rpg` when working on Cosmic Survivors.
