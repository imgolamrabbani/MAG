---
name: antigravity-mag
description: Autonomous Serverless WebRTC P2P Game Deconstructor, Synthesizer, 30-Point Dual-Gate Verifier, and Zero-Cost GitHub Pages / Cloudflare Pages Cloud Deployer. Use whenever the user asks to replicate a game and host/deploy it online for free.
---

# Antigravity MAG v2.0 Skill

When the user asks to replicate any game (by Steam URL, Itch.io URL, or Game Title) and publish it online as a playable web replica, execute the **Antigravity MAG v2.0** pipeline located in `/Users/mdgolamrabbani/Academic/Vibe Coding/MAG/Antigravity_MAG`.

## One-Command End-to-End Execution (`ship`)

Run the unified 5-stage pipeline:
```bash
node "/Users/mdgolamrabbani/Academic/Vibe Coding/MAG/Antigravity_MAG/bin/agy-mag.js" ship "<GAME_URL_OR_TITLE>"
```

### What `ship` Executes Automatically:
1. **`ingest`**: Scrapes Steam Store Search & AppDetails APIs (`spider-v2.js`), classifies 40+ mechanic keywords (`deconstructor-v2.js`), and writes `mag-ledger.json` with 30 granular obligations.
2. **`scaffold`**: Copies the 4 v2 runtime SDKs (`agy-audio-studio.js`, `agy-vfx-pipeline.js`, `agy-mobile-pwa-hud.js`, `agy-net-p2p.js`) into `dist/sdk/`.
3. **`synthesize`**: Compiles a complete, 3-stage playable Phaser 3 + Serverless WebRTC P2P + 12-Node Verlet Rope + 4-Track Adaptive WebAudio game into `dist/index.html`, `dist/game.js`, `dist/manifest.json`, and `dist/sw.js`.
4. **`audit`**:
   - **Gate A**: Verifies all 30 obligations in `mag-ledger.json` via static AST/pattern scanning.
   - **Gate B**: Executes 8 live headless P2P, Verlet physics, Hooke's Law slingshot, and AI Companion tests.
5. **`deploy`**:
   - Automatically creates or updates a public GitHub repository (`mag-<slug>`), pushes `dist/` to the `gh-pages` branch, enables **GitHub Pages** via `gh api`, and outputs the live playable P2P URL (`https://<user>.github.io/mag-<slug>/?room=XXXX`).
   - Supports `--provider=cloudflare` for instant global edge deployment to Cloudflare Pages (`*.pages.dev`).

## Customizing Game Mechanics
If the user requests custom level layouts, bespoke shaders, or extra boss phases after synthesis:
1. Edit `/Users/mdgolamrabbani/Academic/Vibe Coding/MAG/Antigravity_MAG/dist/game.js` or `src/engine/synthesizer.js`.
2. Re-run `node bin/agy-mag.js audit` to guarantee 100% (30/30) obligation compliance.
3. Re-run `node bin/agy-mag.js deploy` to push the updated build live.
