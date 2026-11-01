# 30-Point Reconstruction Obligation Schema v2.0 (`mag-ledger.json`)

Every game synthesized by **Antigravity MAG v2.0** must pass 30 granular obligations across 6 engineering categories before cloud deployment:

1. **`VISUAL_SHADERS` (`OBL-VIS-001` .. `005`)**:
   - 10 Procedural High-DPI Canvas Textures (`player_p1`, `player_p2`, `boss_core`, `platform_tile`, `moving_lift`, `switch_plate_off`, `switch_plate_on`, `energy_gate`, `particle_spark`, `heart_emote`).
   - WebGL Bloom Post-FX shader pipeline.
   - 12-Node Verlet rope catenary renderer.
   - Squash-and-stretch deformation & camera trauma.
   - 3-Layer scrolling parallax background & particle emitters.
2. **`PHYSICS_VERLET` (`OBL-PHY-001` .. `005`)**:
   - Hooke's Law spring-tether solver ($F = -k \cdot \Delta x - c \cdot v_{\text{rel}}$).
   - 12-Node Verlet iterative distance relaxation.
   - 150ms Coyote Time & 130ms Jump Buffer grace windows.
   - Anchor fulcrum lock & 1.9x slingshot impulse boost.
   - Terminal velocity clamping & moving elevator platforms.
3. **`AUDIO_POLY_DSP` (`OBL-AUD-001` .. `005`)**:
   - Hardware WebAudio graph + algorithmic Impulse-Response Convolution Reverb.
   - Tactile jump sweeps & filtered noise landing impacts.
   - Asymmetrical role ability & Boss Core hit synthesis.
   - 4-Track adaptive soundtrack sequencer (`SUB_BASS`, `ARPEGGIATOR`, `PAD_CHORDS`, `PERCUSSION_HIHAT`).
   - Harmonic switch triads, gate unlock sweeps, and victory fanfare.
4. **`WEBRTC_P2P_NET` (`OBL-P2P-001` .. `005`)**:
   - Serverless WebRTC DataChannel P2P transport (PeerJS + Google/Twilio STUN).
   - Same-device `BroadcastChannel` zero-latency mirror.
   - 3rd-peer intrusion guard (`ROOM_FULL` rejection).
   - 30Hz snapshot linear interpolation buffer (`getInterpolatedPartner`).
   - Session token persistence & mobile visibility auto-recovery.
5. **`MOBILE_PWA_UX` (`OBL-MOB-001` .. `005`)**:
   - 4-pointer multi-touch registration (`addPointer(4)`).
   - Virtual analog thumbstick with deadzone smoothing.
   - 5-button ergonomic action cluster (`JUMP`, `SKILL`, `ANCHOR`, `♥ BOOP`, `🤖 AI`).
   - In-game shareable P2P Invite Modal + clipboard copy.
   - Installable PWA `manifest.json` + offline `sw.js` Service Worker.
6. **`COOP_AI_AND_DAG` (`OBL-GAM-001` .. `005`)**:
   - Autonomous Co-op AI Partner (`SEEK_PLATE` & `FOLLOW`) with instant human P2 handover.
   - Simultaneous dual pressure plate & force-gate state machine.
   - 3-Stage Level Topology DAG (`STAGE_01_CALIBRATION`, `STAGE_02_CRUCIBLE`, `STAGE_03_BOSS_FINALE`).
   - Multi-phase Co-op Boss encounter (`bossCore`, `bossShieldDown`, `bossHealth`).
   - Out-of-bounds checkpoint respawn & partner heart boop broadcast.
