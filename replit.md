# Master Autonomous Game-Replicator (MAG)

## Overview
**MAG** is an empirical, evidence-driven autonomous game deconstruction and replication engine inspired by the architecture of `morluto/rea` (Reverse Engineer Anything). It ingests any game URL (Steam store URL, itch.io, YouTube gameplay URL, or Game Title), performs multi-source reverse-engineering, compiles a strict mathematical **Reconstruction Obligation Ledger (`mag-ledger.json`)**, scaffolds client SDKs, and enforces dual static/runtime verification gates.

## Autonomous Replicator Workflow (Strict Execution Protocol)
Whenever you are given a game URL or game title to replicate or reverse-engineer, execute this 4-step sequence without deviation:

### Step 1: Deconstruct Target Game
Run the multi-source deconstruction spider and taxonomy classifier:
```bash
node bin/mag.js ingest "<target_game_url_or_name>"
```
*Outputs: `mag-ledger.json` containing physics profiles, dominant palettes, procedural WebAudio graph, co-op state machine, level DAG, and at least 20 granular obligations.*

### Step 2: Scaffold Runtime Browser SDKs
Copy pre-built AAA runtime engines to the public directory:
```bash
node bin/mag.js scaffold
```
*Outputs: `public/sdk/mag-audio-dsp.js`, `public/sdk/mag-vfx-shaders.js`, `public/sdk/mag-mobile-hud.js`, `public/sdk/mag-net-sync.js`.*

### Step 3: Implement Game Server & Client
Build `server.js` and `public/index.html` + `public/game.js` to satisfy every obligation specified in `mag-ledger.json`:
- Use `window.MAGAudio` for procedural audio synthesis (zero external MP3s).
- Use `window.MAGVFX` for procedural canvas sprites, bezier/catenary tether graphics, camera trauma, and particle bursts.
- Use `window.MAGHud` for 3-pointer multi-touch, virtual joystick with deadzone, 4-button action diamond, and orientation guard.
- Use `window.MAGNet` for 20Hz state synchronization, linear interpolation (`lerp`), and session recovery.

### Step 4: Ruthless Dual-Gate Verification Loop
Audit codebase against all obligations:
```bash
node bin/mag.js audit
```
*Gate A scans the static AST and pattern matches. Gate B boots headless bots (`Bot_P1`, `Bot_P2`, `Bot_Intruder`) to stress test live WebSocket server telemetry.*
**Iterate and fix code until output shows: `100% RECONSTRUCTION OBLIGATIONS VERIFIED (0 FAILED)`.**

## Available Commands
- `node bin/mag.js ingest "<target>"`: Scrape, deconstruct, and compile `mag-ledger.json`.
- `node bin/mag.js scaffold`: Deploy runtime SDK modules to `public/sdk/`.
- `node bin/mag.js status`: Display obligation progress matrix and category breakdowns.
- `node bin/mag.js audit`: Execute Gate A (static AST) and Gate B (bot telemetry) verification.
- `node bin/mag.js all "<target>"`: Unified end-to-end execution.
