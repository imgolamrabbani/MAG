---
name: mag-replicator
description: Empirical game deconstruction and autonomous replication engine using the morluto/rea ledger paradigm and dual-gate verification.
---

# MAG Autonomous Game Replicator Skill

Use this skill whenever tasked with deconstructing, reverse-engineering, or replicating a video game into an empirical, playable, mobile-first web co-op experience.

## Mandatory Architectural Paradigm

Never write ad-hoc placeholder scripts, placeholder squares, or mock audio MP3s that fail. Follow the 4-phase **morluto/rea** paradigm:

1. **Empirical Deconstruction (`mag ingest`)**:
   - Extract raw game metadata via Steam Store APIs (`appdetails`, `storesearch`, tags, genres, media).
   - Classify taxonomy into mathematical parameters:
     - Physics Solver Profile (Gravity, terminal velocity, Hooke's Law spring-tether $F = -k \cdot \Delta x - c \cdot v$).
     - Visual & Shader Profile (Procedural canvas sprites, bloom/vignette, catenary curves, camera trauma).
     - Procedural WebAudio DSP Graph (Zero audio files; 100% synthesized ADSR and algorithmic arpeggiator).
     - Asymmetrical Co-op State Machine (`P1_ARCHITECT` and `P2_CATALYST` complementary abilities).
     - Multi-Stage Level Topology DAG (3-5 progression stages with puzzle gates and boss encounters).

2. **Reconstruction Obligation Ledger (`mag ledger`)**:
   - Every system is recorded in `mag-ledger.json` as a discrete, verifiable obligation with an ID (`OBL-VIS-XXX`, `OBL-PHY-XXX`, `OBL-AUD-XXX`, `OBL-NET-XXX`, `OBL-MOB-XXX`, `OBL-GAM-XXX`).

3. **Pre-Built SDK Integration (`mag scaffold`)**:
   - Bundle `src/sdk/*.js` into `public/sdk/`:
     - `MAGAudio`: Procedural WebAudio sound effects and sequencer.
     - `MAGVFX`: Procedural canvas textures, bezier tether, camera trauma.
     - `MAGHud`: 3-pointer multi-touch, virtual joystick, 4-button ergonomic diamond, PWA orientation lock.
     - `MAGNet`: 20Hz sync tick, snapshot interpolation (`lerp`), localStorage session recovery.

4. **Dual-Gate Verification (`mag audit`)**:
   - **Gate A (Static AST & Pattern Auditor)**: Verifies presence of code patterns in `server.js` and `public/`.
   - **Gate B (Headless Bot Stress Suite)**: Spawns simulated clients against WebSocket server to test handshake, 3rd player rejection, 20Hz sync, dual pressure plates, boop emotes, disconnect grace recovery, and out-of-bounds respawn.

## Step-by-Step Operator Instructions

```bash
# 1. Ingest target game
node bin/mag.js ingest "<Steam URL or Game Title>"

# 2. Scaffold browser SDK modules
node bin/mag.js scaffold

# 3. Check obligations
node bin/mag.js status

# 4. Construct server and client code to satisfy mag-ledger.json

# 5. Execute audit and repeat until 100% verified
node bin/mag.js audit
```

## References
- See [Obligation Schema](references/obligation-schema.md) for full schema definition of `mag-ledger.json`.
- See [Mobile Co-op Architecture](references/mobile-coop-architecture.md) for network, physics, and input sync design.
