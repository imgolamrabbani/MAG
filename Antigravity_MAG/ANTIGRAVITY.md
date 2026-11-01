# Antigravity MAG v2.0 — Autonomous Serverless WebRTC Game Replicator & Cloud Deployer

## Why Antigravity MAG v2.0 Surpasses Standard Replit Generators
1. **100% Serverless Real-Time Multiplayer (`agy-net-p2p.js`)**:
   - Standard Node.js/Socket.io games fail on free static hosts (like GitHub Pages or Cloudflare Pages) because static hosts cannot run a persistent backend process.
   - **Antigravity MAG v2.0** solves this by using **WebRTC P2P DataChannels (PeerJS + Google/Twilio STUN) + Same-Device `BroadcastChannel` Mirroring + an Autonomous Co-op AI Partner Bot**.
   - Two players anywhere in the world connect directly Peer-to-Peer via `?room=XXXX` hosted 100% free on **GitHub Pages** or **Cloudflare Pages**!
   - When playing solo (before Player 2 joins), the built-in **AI Companion Bot** automatically helps solve dual-pressure-plate puzzles and hands over control the instant a human joins!
2. **12-Node Verlet Rope Physics & Custom WebGL Shaders (`agy-vfx-pipeline.js`)**:
   - Simulates a 12-node Verlet catenary tether with iterative constraint relaxation alongside Hooke's Law spring physics ($F = -k \cdot \Delta x - c \cdot v_{\text{rel}}$) and 10 procedural High-DPI canvas textures.
3. **Polyphonic WebAudio DSP Studio & Convolution Reverb (`agy-audio-studio.js`)**:
   - Algorithmic impulse-response Convolution Reverb, Dynamics Compressor, 10 synthesized sound effects, and a 4-track adaptive music sequencer (`EXPLORATION` -> `PUZZLE_TENSION` -> `BOSS_FINALE`).
4. **One-Command Autonomous Synthesis, Dual-Gate Audit & Live Cloud Deployment (`ship`)**:
   - Runs `ingest` -> `scaffold` -> `synthesize` -> `audit` (30 AST obligations + 8 headless P2P/Verlet telemetry tests) -> `deploy` (creates GitHub repo, pushes `gh-pages`, enables GitHub Pages via REST API, and prints the live URL).

---

## Single-Command Pipeline
```bash
node "/Users/mdgolamrabbani/Academic/Vibe Coding/MAG/Antigravity_MAG/bin/agy-mag.js" ship "<GAME_URL_OR_TITLE>"
```
