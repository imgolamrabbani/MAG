# Asymmetrical Mobile Co-op Architecture

This document describes the runtime architecture for 2-player asymmetrical co-op experiences deployed across mobile browsers and desktop.

## 1. Network Topology: Authoritative Relay & Client Interpolation

```text
[Client P1] <------- 20Hz Snapshot Buffer -------> [Node.js / Socket.io Server]
                                                            ^
                                                            |
[Client P2] <------- 20Hz Snapshot Buffer ------------------+
```

### Protocol Specifications:
1. **Room Lifecycle**: Rooms use 4-character alphanumeric codes (e.g., `ROOM: AB3D`). Exactly two players can inhabit a room:
   - First player receives `P1_ARCHITECT`
   - Second player receives `P2_CATALYST`
   - Additional connection attempts receive `error_packet: "ROOM_FULL"`
2. **Session Resilience**:
   - `sessionToken` is stored in `localStorage.getItem('mag_session_token')`.
   - On mobile tab-switch, browser screen lock, or connection drop, a 30-second grace period keeps the room alive.
   - When returning, the client issues `reclaim_role`, instantaneously re-attaching without restarting the game.
3. **20Hz Interpolation Buffer**:
   - Server broadcasts `sync_state` every 50ms.
   - Clients maintain an interpolation buffer with a 70ms playback offset, interpolating positions via `Phaser.Math.Linear`:
   $$\text{pos}(t) = \text{pos}_0 + (\text{pos}_1 - \text{pos}_0) \cdot \frac{t - t_0}{t_1 - t_0}$$

---

## 2. Physics & Elastic Tether Solver

Both players are linked by an elastic kinetic tether governed by Hooke's Law with linear viscous damping:

$$F = -k \cdot (\Delta x - l_0) - c \cdot v_{\text{rel}}$$

Where:
- $k$: Spring constant ($0.045$)
- $l_0$: Natural resting tether length ($150\text{px}$)
- $c$: Viscous damping constant ($0.025$)
- $v_{\text{rel}}$: Relative velocity along the tether axis

### Slingshot Boost:
When one player anchors (velocity near 0) and the other stretches past $l_0$, releasing the anchor imparts an exit momentum impulse:
$$v_{\text{exit}} = v_0 \cdot 1.85$$

---

## 3. Mobile Multi-Touch Ergonomics

Mobile landscape gaming requires concurrent dual-thumb control without touch gesture cancellation.
- **Left Thumb**: Virtual analog thumbstick with 12px deadzone and normalized $[-1.0, 1.0]$ vector output.
- **Right Thumb**: Ergonomic 4-button action diamond:
  - **Bottom Button (JUMP)**: Primary jump trigger.
  - **Right Button (ABILITY)**: Character-specific asymmetrical power (P1 Anchor / P2 Pulse).
  - **Left Button (TETHER)**: Tether retract or tension lock.
  - **Top Button (BOOP)**: Partner affection emote / high-five impulse.
- **Pointer Configuration**: Requires `scene.input.addPointer(3)` to track three simultaneous physical touch pointers.
