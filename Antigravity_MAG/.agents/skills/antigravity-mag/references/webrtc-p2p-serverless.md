# Serverless WebRTC P2P + Free Static Cloud Hosting Architecture

## 1. The Free Hosting Dilemma & How Antigravity MAG v2.0 Solves It
Traditional multiplayer web games require a running Node.js + Socket.io backend server. Free Node.js tiers either require a credit card, sleep after 15 minutes of inactivity, or have been discontinued.

**GitHub Pages** and **Cloudflare Pages** are 100% free forever with global CDN caching and HTTPS—but they only serve static files (`HTML/JS/CSS/WASM`).

**Antigravity MAG v2.0** bridges this gap using a **3-Layer Serverless Multiplayer Transport (`agy-net-p2p.js`)**:
1. **Layer 1 — WebRTC DataChannels (`PeerJS` + Google/Twilio STUN)**:
   - Player 1 opens `https://<user>.github.io/mag-<game>/?room=ABCD` and registers deterministic Peer ID `agy-mag-v2-abcd-host`.
   - Player 2 opens the exact same URL on any mobile phone or desktop browser, detects that the host ID is active, and opens an encrypted, low-latency **WebRTC DataChannel** directly to Player 1's browser!
2. **Layer 2 — `BroadcastChannel` Zero-Latency Local Mirror**:
   - When testing in two browser tabs on the same device, `BroadcastChannel('mag_p2p_ABCD')` synchronizes both tabs in `<1ms` even without internet access.
3. **Layer 3 — Autonomous Co-op AI Partner (`computeAiPartnerStep`)**:
   - While waiting for Player 2 to join (or when playing solo), a built-in AI Companion controls Player 2, automatically navigating to pressure plates (`SEEK_PLATE`) and anchoring tether jumps (`FOLLOW`), then handing over control the instant a human partner connects!

## 2. Comparison of Free Hosting Providers Supported by `agy-mag deploy`

| Provider | Cost | Bandwidth | Build / Deploy Speed | CLI Command |
| :--- | :--- | :--- | :--- | :--- |
| **GitHub Pages** *(Default)* | 100% Free | 100 GB/mo | ~25 seconds (Automated via `gh` CLI) | `node bin/agy-mag.js deploy --provider=github` |
| **Cloudflare Pages** *(Fastest Alternative)* | 100% Free | **Unlimited** | **~3 seconds** (300+ Edge PoPs) | `node bin/agy-mag.js deploy --provider=cloudflare` |
