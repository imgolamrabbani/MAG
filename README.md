# MAG: The Elastic Bond

An original procedural browser co-op platformer built from MAG's generated
It Takes Two obligation ledger. This is a small inspired prototype, not a
reproduction of the commercial game's art, levels, narrative or full mechanics.

## Run

Requires Node.js 18+.

```sh
npm ci
npm start
```

Open port 3000, choose a room, and share the URL with a second player using
a separate browser profile or device. A session token is persisted per browser
profile; two tabs in the same profile intentionally share an identity.

Keyboard: A/D or arrows to move, Space to jump, E for the role ability, Q for
slingshot, H for hearts. Touch: left joystick and right action diamond.

## Progression

1. Calibration: cross the stepping stones, occupy the two plates together,
   then both reach the exit.
2. Synchrony: both use E near the lift to unlock the first gate. Near the second
   gate, May anchors with E while Cody stretches the bond and presses Q.
3. Convergence: occupy flanking plates, slingshot near the core, then both
   press E near the boss within 1.2 seconds.

## Verification

With `npm start` running on port 3000:

```sh
npm test
node bin/mag.js audit
```

The stock audit checks 27 source-pattern obligations and seven Socket.IO
contracts. Pattern matches do not establish visual fidelity or prove an
end-to-end playthrough of every level. `npm test` adds isolated-session,
invalid telemetry, cross-room isolation, and stage progression regressions.

All art and sound are procedural; Phaser and Socket.IO are served locally.
Room state is held in memory and disconnects reserve a role for 30 seconds.
Position and plate telemetry are client-reported: this is a cooperative
prototype, not a cheat-resistant authoritative physics server.
