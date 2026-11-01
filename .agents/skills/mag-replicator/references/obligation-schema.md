# Reconstruction Obligation Schema Reference (`mag-ledger.json`)

The **Reconstruction Obligation Ledger** is the mathematically enforced source of truth for game replication. Every game system deconstructed from target metadata is converted into an explicit obligation.

## Top-Level Schema

```json
{
  "schemaVersion": "1.0.0",
  "timestamp": "ISO-8601 string",
  "target": "URL or Title",
  "gameId": 1426210,
  "gameTitle": "Game Title",
  "source": "LIVE_STEAM_STORE_API | BUILTIN_KNOWLEDGE_BASE | SYNTHETIC_GENERATOR",
  "detectedKeywords": ["tether", "gravity", "puzzle", "co-op"],
  "taxonomyClassification": {
    "genreVector": ["Action", "Adventure", "Cooperative", "Platformer", "Puzzle"],
    "primaryParadigm": "Asymmetrical Cooperative Physical Sandbox",
    "playerCount": 2,
    "networkTopology": "Authoritative WebSocket Relay with Client Interpolation"
  },
  "subsystems": {
    "physicsProfile": { ... },
    "visualProfile": { ... },
    "audioDspProfile": { ... },
    "asymmetricalCoop": { ... },
    "levelTopologyDag": { ... }
  },
  "obligations": [
    {
      "obligationId": "OBL-VIS-001",
      "category": "VISUAL",
      "title": "Procedural Texture Asset Generation",
      "description": "Detailed explanation of what must be built",
      "targetComponent": "public/sdk/mag-vfx-shaders.js",
      "verificationRule": {
        "pattern": "regex_pattern",
        "type": "REGEX_PATTERN"
      },
      "status": "PENDING | VERIFIED | FAILED",
      "evidence": null | { ... }
    }
  ]
}
```

## Obligation Categories

| Category | Identifier Prefix | Core Systems Covered |
| :--- | :--- | :--- |
| `VISUAL` | `OBL-VIS-XXX` | Canvas procedural sprites, bezier tether curves, particle bursts, camera trauma, squash & stretch deformation |
| `PHYSICS` | `OBL-PHY-XXX` | Hooke's Law spring constraint ($F = -k \cdot \Delta x - c \cdot v$), coyote time, jump buffer, terminal velocity clamp |
| `AUDIO` | `OBL-AUD-XXX` | Zero-MP3 WebAudio hardware synthesis, ADSR envelopes, noise bursts, arpeggiated procedural BGM |
| `NETWORK` | `OBL-NET-XXX` | 2-player room lifecycle, 3rd player rejection (`ROOM_FULL`), 20Hz sync tick, linear interpolation, mobile grace period |
| `MOBILE_UX` | `OBL-MOB-XXX` | 3+ active touch pointers (`addPointer(3)`), virtual joystick with deadzone, 4-button diamond, landscape guard |
| `GAMEPLAY_LOOP` | `OBL-GAM-XXX` | Dual pressure plate interlocks, asymmetrical abilities, partner boop interaction, DAG stage progression, out-of-bounds respawn |

## Status Lifecycle
- `PENDING`: Initial state after ingestion.
- `VERIFIED`: Proven by Gate A AST scanner or Gate B Headless Bot telemetry suite with valid evidence.
- `FAILED`: Scanned but missing required architectural patterns or failed telemetry assertions.
