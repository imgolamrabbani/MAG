'use strict';

const fs = require('fs');
const path = require('path');

/**
 * Antigravity MAG v2.0 — Autonomous Full-Game Code Synthesizer
 * Compiles `mag-ledger.json` into a complete, self-contained, serverless WebRTC P2P
 * multi-stage Phaser 3 game inside `dist/` ready for GitHub Pages / Cloudflare Pages.
 */
class GameSynthesizer {
  constructor(baseDir = process.cwd()) {
    this.baseDir = baseDir;
    this.distDir = path.resolve(this.baseDir, 'dist');
  }

  synthesize(ledger) {
    if (!ledger) {
      throw new Error('Cannot synthesize without a valid mag-ledger.json object');
    }

    const sdkDest = path.join(this.distDir, 'sdk');
    fs.mkdirSync(sdkDest, { recursive: true });

    // 1. Copy all SDK modules into dist/sdk/
    const sdkSrc = path.resolve(__dirname, '../sdk');
    const sdkFiles = fs.readdirSync(sdkSrc).filter(f => f.endsWith('.js'));
    for (const file of sdkFiles) {
      fs.copyFileSync(path.join(sdkSrc, file), path.join(sdkDest, file));
    }

    // 2. Write PWA manifest.json
    const palette = ledger.subsystems.visualProfile.dominantPalette;
    const manifest = {
      name: `${ledger.gameTitle} — Antigravity WebRTC Replica`,
      short_name: ledger.gameTitle.substring(0, 16),
      start_url: './index.html',
      display: 'standalone',
      orientation: 'landscape',
      background_color: palette.backgroundDark,
      theme_color: palette.primaryP1,
      icons: []
    };
    fs.writeFileSync(path.join(this.distDir, 'manifest.json'), JSON.stringify(manifest, null, 2), 'utf8');

    // 3. Write Offline Service Worker sw.js
    const swCode = `
const CACHE_NAME = 'agy-mag-${ledger.gameSlug}-v2';
const ASSETS = ['./index.html', './game.js', './manifest.json'];
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)));
});
self.addEventListener('fetch', (e) => {
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});
`.trim();
    fs.writeFileSync(path.join(this.distDir, 'sw.js'), swCode + '\n', 'utf8');

    // 4. Write dist/index.html
    const htmlCode = this.generateIndexHtml(ledger);
    fs.writeFileSync(path.join(this.distDir, 'index.html'), htmlCode, 'utf8');

    // 5. Write dist/game.js
    const gameCode = this.generateGameJs(ledger);
    fs.writeFileSync(path.join(this.distDir, 'game.js'), gameCode, 'utf8');

    return {
      distDir: this.distDir,
      files: ['index.html', 'game.js', 'manifest.json', 'sw.js', ...sdkFiles.map(f => `sdk/${f}`)]
    };
  }

  generateIndexHtml(ledger) {
    const palette = ledger.subsystems.visualProfile.dominantPalette;
    const p1Role = ledger.subsystems.asymmetricalCoop.roleP1.roleTitle;
    const p2Role = ledger.subsystems.asymmetricalCoop.roleP2.roleTitle;

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <title>${ledger.gameTitle} — Co-op WebRTC Replica</title>
  <link rel="manifest" href="./manifest.json" />
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; user-select: none; -webkit-user-select: none; }
    html, body {
      width: 100%; height: 100%; overflow: hidden;
      background: ${palette.backgroundDark};
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      color: #F8FAFC;
    }
    #game-container { width: 100vw; height: 100vh; display: flex; align-items: center; justify-content: center; }
    #controls-legend {
      position: fixed; bottom: 8px; left: 50%; transform: translateX(-50%);
      background: rgba(9, 13, 22, 0.82); border: 1px solid rgba(56, 189, 248, 0.3);
      padding: 5px 14px; border-radius: 999px; font-size: 11px; color: #94A3B8;
      pointer-events: none; z-index: 50; white-space: nowrap;
    }
    #controls-legend b { color: #38BDF8; }
  </style>
  <!-- Phaser 3.80 & PeerJS 1.5 (Serverless WebRTC DataChannels) -->
  <script src="https://cdn.jsdelivr.net/npm/phaser@3.80.1/dist/phaser.min.js"></script>
  <script src="https://unpkg.com/peerjs@1.5.4/dist/peerjs.min.js"></script>
</head>
<body>
  <div id="game-container"></div>
  <div id="controls-legend">
    <b>${ledger.gameTitle}</b> | <b>WASD / Arrows</b> Move & Jump | <b>E / Space</b> Ability (${p1Role} / ${p2Role}) | <b>Q</b> Anchor Tether | <b>B</b> Partner Boop | <b>R</b> Stage Skip
  </div>

  <!-- Antigravity MAG v2.0 Runtime SDKs -->
  <script src="./sdk/agy-audio-studio.js"></script>
  <script src="./sdk/agy-vfx-pipeline.js"></script>
  <script src="./sdk/agy-mobile-pwa-hud.js"></script>
  <script src="./sdk/agy-net-p2p.js"></script>
  <script src="./game.js"></script>
</body>
</html>
`;
  }

  generateGameJs(ledger) {
    const configJson = JSON.stringify({
      gameTitle: ledger.gameTitle,
      gameSlug: ledger.gameSlug,
      physics: ledger.subsystems.physicsProfile,
      palette: ledger.subsystems.visualProfile.dominantPalette,
      coop: ledger.subsystems.asymmetricalCoop,
      stages: ledger.subsystems.levelTopologyDag.stages
    }, null, 2);

    return `/**
 * Antigravity MAG v2.0 — Synthesized Playable Co-op Replica
 * Target: ${ledger.gameTitle} (${ledger.gameId})
 * Architecture: Serverless WebRTC P2P + 12-Node Verlet Tether + 4-Track WebAudio + 3-Stage Boss DAG
 */
(function() {
  'use strict';

  const LEDGER_CONFIG = ${configJson};

  class ReplicaMainScene extends Phaser.Scene {
    constructor() {
      super({ key: 'ReplicaMainScene' });
      this.stageIndex = 0;
      this.stagesList = ['STAGE_01_CALIBRATION', 'STAGE_02_CRUCIBLE', 'STAGE_03_BOSS_FINALE'];
      this.coyoteTimer = 0;
      this.jumpBufferTimer = 0;
      this.isAnchored = false;
      this.slingshotImpulse = 1.9;
      this.plateA = false;
      this.plateB = false;
      this.gateOpen = false;
      this.bossHealth = 100;
      this.bossShieldDown = false;
      this.activeCheckpoint = { x: 140, y: 500 };
      this.lastBoopTime = 0;
      this.lastAbilityTime = 0;
    }

    create() {
      // 1. Initialize Procedural Textures & Post-FX Shaders
      window.AGYVFX.generateProceduralTextures(this, LEDGER_CONFIG.palette);
      window.AGYVFX.applyPostFXPipeline(this);

      // 2. Initialize Mobile Multi-Touch 5-Button HUD
      window.AGYHud.init(this, {
        roleTitle: LEDGER_CONFIG.coop.roleP1.roleTitle
      });

      // 3. Initialize Serverless WebRTC P2P + BroadcastChannel + AI Companion
      window.AGYNet.init({
        callbacks: {
          onRoleAssigned: (role) => this.updateHudBanner(),
          onPartnerConnected: () => this.updateHudBanner(),
          onPartnerDisconnected: () => this.updateHudBanner(),
          onPuzzleSync: (ev) => this.handleRemotePuzzleEvent(ev),
          onBoop: () => this.renderPartnerBoopFX()
        }
      });

      // Unlock WebAudio & 4-Track Adaptive Sequencer on first input
      this.input.once('pointerdown', () => {
        window.AGYAudio.init();
        window.AGYAudio.startAdaptiveMusic(114);
      });
      this.input.keyboard.once('keydown', () => {
        window.AGYAudio.init();
        window.AGYAudio.startAdaptiveMusic(114);
      });

      // Keyboard bindings
      this.cursors = this.input.keyboard.createCursorKeys();
      this.keys = this.input.keyboard.addKeys({
        W: Phaser.Input.Keyboard.KeyCodes.W,
        A: Phaser.Input.Keyboard.KeyCodes.A,
        S: Phaser.Input.Keyboard.KeyCodes.S,
        D: Phaser.Input.Keyboard.KeyCodes.D,
        E: Phaser.Input.Keyboard.KeyCodes.E,
        Q: Phaser.Input.Keyboard.KeyCodes.Q,
        B: Phaser.Input.Keyboard.KeyCodes.B,
        R: Phaser.Input.Keyboard.KeyCodes.R
      });

      // Build initial stage from Level Topology DAG
      this.loadStage(this.stageIndex);
    }

    loadStage(index) {
      this.stageIndex = index % this.stagesList.length;
      const stageId = this.stagesList[this.stageIndex];
      const stageMeta = LEDGER_CONFIG.stages[this.stageIndex] || LEDGER_CONFIG.stages[0];

      // Clear previous stage objects if reloading
      if (this.worldGroup) this.worldGroup.clear(true, true);
      if (this.movingPlatforms) this.movingPlatforms.clear(true, true);
      if (this.tetherGfx) this.tetherGfx.destroy();
      if (this.p1) this.p1.destroy();
      if (this.p2) this.p2.destroy();
      if (this.bossCore) { this.bossCore.destroy(); this.bossCore = null; }
      if (this.stageBanner) this.stageBanner.destroy();

      this.plateA = false;
      this.plateB = false;
      this.gateOpen = false;
      this.bossHealth = 100;
      this.bossShieldDown = false;
      this.activeCheckpoint = { x: 140, y: 500 };

      const worldW = stageMeta.width || 2400;
      const worldH = stageMeta.height || 720;
      this.physics.world.setBounds(0, 0, worldW, worldH + 250);
      this.cameras.main.setBounds(0, 0, worldW, worldH);

      window.AGYVFX.createParallaxBackground(this, worldW, worldH, LEDGER_CONFIG.palette);

      this.worldGroup = this.physics.add.staticGroup();
      this.movingPlatforms = this.physics.add.group({ allowGravity: false, immovable: true });

      // Build ground segments with an abyss gap in the middle for tether swings
      for (let x = 0; x < worldW; x += 64) {
        const isGap = (x >= 640 && x <= 832) || (x >= 1472 && x <= 1664);
        if (!isGap) {
          this.worldGroup.create(x + 32, worldH - 20, 'platform_tile');
        }
      }

      // Elevated cooperative ledges & stepping stones
      const ledges = [
        { x: 420, y: 540 }, { x: 484, y: 540 },
        { x: 736, y: 450 },
        { x: 1020, y: 520 }, { x: 1084, y: 520 }, { x: 1148, y: 520 },
        { x: 1568, y: 440 },
        { x: 1860, y: 520 }, { x: 1924, y: 520 }
      ];
      ledges.forEach(l => this.worldGroup.create(l.x, l.y, 'platform_tile'));

      // Moving kinetic elevator platform
      this.elevator = this.movingPlatforms.create(736, 560, 'moving_lift');
      this.tweens.add({
        targets: this.elevator,
        y: 380,
        duration: 2400,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });

      // Dual Co-op Pressure Plates (Plate A & Plate B)
      this.plateASprite = this.physics.add.staticImage(1030, 499, 'switch_plate_off');
      this.plateBSprite = this.physics.add.staticImage(1900, 499, 'switch_plate_off');

      // Force Field Energy Gate
      this.gateSprite = this.physics.add.staticImage(2040, worldH - 104, 'energy_gate');

      // Stage Exit Warp Conduit
      this.goalZone = this.add.circle(worldW - 110, worldH - 80, 32, 0x00E676, 0.45);
      this.physics.add.existing(this.goalZone, true);

      // Spawn Stage 3 Co-op Boss Core if on STAGE_03_BOSS_FINALE
      if (stageId === 'STAGE_03_BOSS_FINALE') {
        window.AGYAudio.setMusicIntensity('BOSS_FINALE');
        this.bossCore = this.physics.add.image(1500, 340, 'boss_core');
        this.bossCore.body.setAllowGravity(false);
        this.bossCore.setImmovable(true);
        this.tweens.add({
          targets: this.bossCore,
          y: 440,
          x: 1620,
          duration: 1800,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        });
      } else {
        window.AGYAudio.setMusicIntensity(this.stageIndex === 1 ? 'PUZZLE_TENSION' : 'EXPLORATION');
      }

      // Spawn Player 1 & Player 2
      this.p1 = this.physics.add.sprite(140, 520, 'player_p1');
      this.p2 = this.physics.add.sprite(210, 520, 'player_p2');

      [this.p1, this.p2].forEach(p => {
        p.body.setGravityY(LEDGER_CONFIG.physics.gravity.y);
        p.body.setMaxVelocity(LEDGER_CONFIG.physics.terminalVelocity.x, LEDGER_CONFIG.physics.terminalVelocity.y);
        p.setCollideWorldBounds(false);
      });

      this.physics.add.collider([this.p1, this.p2], this.worldGroup);
      this.physics.add.collider([this.p1, this.p2], this.movingPlatforms);
      this.gateCollider = this.physics.add.collider([this.p1, this.p2], this.gateSprite);

      this.tetherGfx = this.add.graphics().setDepth(50);
      this.cameras.main.startFollow(this.p1, true, 0.1, 0.1);

      // Stage Title Overlay
      this.stageBanner = this.add.text(this.scale.width * 0.5, 68, stageMeta.stageName + '\\n' + stageMeta.objective, {
        fontSize: '14px',
        fontStyle: 'bold',
        color: '#F8FAFC',
        backgroundColor: 'rgba(15, 23, 42, 0.85)',
        padding: { x: 14, y: 8 },
        align: 'center'
      }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(990);

      this.updateHudBanner();
    }

    updateHudBanner() {
      const role = window.AGYNet.role === 'P2_CATALYST' ? 'P2 CATALYST' : 'P1 ARCHITECT';
      const stageLabel = \`STAGE \${this.stageIndex + 1}/3\`;
      const netMode = window.AGYNet.isHumanPartnerConnected
        ? \`⚡ P2P LIVE (ROOM: \${window.AGYNet.roomCode})\`
        : \`🤖 AI CO-OP PARTNER | ROOM: \${window.AGYNet.roomCode}\`;
      window.AGYHud.setStatus(role, stageLabel, netMode);
    }

    handleRemotePuzzleEvent(ev) {
      if (ev.action === 'GATE_UNLOCKED' && !this.gateOpen) {
        this.unlockForceGate();
      } else if (ev.action === 'STAGE_ADVANCE') {
        this.loadStage(ev.nextStageIndex);
      } else if (ev.action === 'BOSS_DAMAGED' && this.bossCore) {
        this.bossHealth = ev.bossHealth;
        if (this.bossHealth <= 0) this.triggerVictorySequence();
      }
    }

    unlockForceGate() {
      if (this.gateOpen) return;
      this.gateOpen = true;
      window.AGYAudio.playGateOpen();
      window.AGYVFX.triggerCameraTrauma(this, 0.016, 220);
      window.AGYVFX.spawnParticleBurst(this, this.gateSprite.x, this.gateSprite.y, 0x00E676, 18);
      if (this.gateCollider) this.physics.world.removeCollider(this.gateCollider);
      this.gateSprite.setVisible(false);
    }

    triggerPartnerBoop() {
      const now = this.time.now;
      if (now - this.lastBoopTime < 450) return;
      this.lastBoopTime = now;
      window.AGYAudio.playPartnerBoop();
      window.AGYNet.emitBoop();
      this.renderPartnerBoopFX();
    }

    renderPartnerBoopFX() {
      window.AGYVFX.spawnFloatingEmote(this, this.p1.x, this.p1.y);
      window.AGYVFX.spawnFloatingEmote(this, this.p2.x, this.p2.y);
    }

    respawnAtCheckpoint() {
      window.AGYAudio.playTetherSnap();
      window.AGYVFX.triggerCameraTrauma(this, 0.02, 200);
      this.p1.setPosition(this.activeCheckpoint.x, this.activeCheckpoint.y);
      this.p1.body.setVelocity(0, 0);
      this.p2.setPosition(this.activeCheckpoint.x + 60, this.activeCheckpoint.y);
      this.p2.body.setVelocity(0, 0);
    }

    triggerVictorySequence() {
      window.AGYAudio.playVictoryFanfare();
      window.AGYVFX.spawnParticleBurst(this, this.p1.x, this.p1.y - 40, 0xFFD600, 28);
      if (this.stageBanner) {
        this.stageBanner.setText('🏆 CONVERGENCE CORE DEFEATED! 100% CO-OP VICTORY!\\nPress R or tap to replay Stage 1');
      }
      if (this.bossCore) {
        this.bossCore.destroy();
        this.bossCore = null;
      }
      this.unlockForceGate();
    }

    update(time, delta) {
      if (!this.p1 || !this.p2) return;

      const hudInputs = window.AGYHud.getInputs();
      const localSprite = window.AGYNet.role === 'P2_CATALYST' ? this.p2 : this.p1;
      const partnerSprite = window.AGYNet.role === 'P2_CATALYST' ? this.p1 : this.p2;

      // Stage quick-cycle for testing
      if (Phaser.Input.Keyboard.JustDown(this.keys.R)) {
        this.loadStage(this.stageIndex + 1);
        return;
      }

      // 1. Coyote Time & Jump Buffer Windows
      const onFloor = localSprite.body.blocked.down || localSprite.body.touching.down;
      if (onFloor) {
        this.coyoteTimer = 150;
      } else {
        this.coyoteTimer = Math.max(0, this.coyoteTimer - delta);
      }

      const jumpPressed = this.cursors.up.isDown || this.keys.W.isDown || hudInputs.jump;
      if (jumpPressed) {
        this.jumpBufferTimer = 130;
      } else {
        this.jumpBufferTimer = Math.max(0, this.jumpBufferTimer - delta);
      }

      // Horizontal Movement
      let moveDir = hudInputs.moveX;
      if (this.cursors.left.isDown || this.keys.A.isDown) moveDir = -1;
      else if (this.cursors.right.isDown || this.keys.D.isDown) moveDir = 1;

      this.isAnchored = this.keys.Q.isDown || hudInputs.tether;
      this.p1.isAnchored = this.isAnchored;

      if (this.isAnchored && localSprite === this.p1) {
        localSprite.body.setVelocityX(0);
        localSprite.setTint(0xFFD600);
      } else {
        localSprite.clearTint();
        localSprite.body.setVelocityX(moveDir * 290);
      }

      // Execute Jump if within Coyote & Jump Buffer Grace Windows
      if (this.jumpBufferTimer > 0 && this.coyoteTimer > 0) {
        localSprite.body.setVelocityY(-540);
        this.coyoteTimer = 0;
        this.jumpBufferTimer = 0;
        window.AGYAudio.playJump();
        window.AGYVFX.applySquashStretch(this, localSprite, 0.76, 1.28, 120);
      }

      // Role Ability Execution (KINETIC_ANCHOR / RESONANCE_PULSE)
      if ((this.keys.E.isDown || hudInputs.ability) && time - this.lastAbilityTime > 900) {
        this.lastAbilityTime = time;
        if (window.AGYNet.role === 'P2_CATALYST') {
          window.AGYAudio.playP2Ability();
          localSprite.body.setVelocityX((moveDir || 1) * 520);
          localSprite.body.setVelocityY(-220);
          window.AGYVFX.spawnParticleBurst(this, localSprite.x, localSprite.y, 0x00B0FF, 14);
        } else {
          window.AGYAudio.playP1Ability();
          this.p2.body.setVelocityY(-460 * this.slingshotImpulse * 0.65);
          window.AGYVFX.spawnParticleBurst(this, localSprite.x, localSprite.y, 0xFF9E1B, 14);
        }

        // Check Boss Core damage when shield is down
        if (this.bossCore && this.bossShieldDown) {
          const distToBoss = Phaser.Math.Distance.Between(localSprite.x, localSprite.y, this.bossCore.x, this.bossCore.y);
          if (distToBoss < 240) {
            this.bossHealth = Math.max(0, this.bossHealth - 35);
            window.AGYAudio.playBossHit();
            window.AGYVFX.triggerCameraTrauma(this, 0.022, 240);
            window.AGYVFX.spawnParticleBurst(this, this.bossCore.x, this.bossCore.y, 0xFF1744, 22);
            window.AGYNet.emitPuzzleEvent({ action: 'BOSS_DAMAGED', bossHealth: this.bossHealth });
            if (this.bossHealth <= 0) this.triggerVictorySequence();
          }
        }
      }

      // Partner Boop
      if (this.keys.B.isDown || hudInputs.boop) {
        this.triggerPartnerBoop();
      }

      // 2. Update Partner (Via Live P2P Interpolation OR Autonomous Co-op AI Bot)
      if (window.AGYNet.isHumanPartnerConnected) {
        const remotePos = window.AGYNet.getInterpolatedPartner(Date.now());
        if (remotePos) {
          partnerSprite.setPosition(remotePos.x, remotePos.y);
          partnerSprite.body.setVelocity(remotePos.vx || 0, remotePos.vy || 0);
        }
      } else {
        const aiDecision = window.AGYNet.computeAiPartnerStep(localSprite, partnerSprite, {
          plates: [this.plateASprite, this.plateBSprite],
          gateOpen: this.gateOpen
        });
        partnerSprite.body.setVelocityX(aiDecision.vx);
        const aiOnFloor = partnerSprite.body.blocked.down || partnerSprite.body.touching.down;
        if (aiDecision.jump && aiOnFloor) {
          partnerSprite.body.setVelocityY(-530);
        }
      }

      // Emit 30Hz P2P state snapshot
      window.AGYNet.emitState(
        localSprite.x,
        localSprite.y,
        localSprite.body.velocity.x,
        localSprite.body.velocity.y
      );

      // 3. Apply Hooke's Law Spring-Tether Constraint & Render 12-Node Verlet Rope
      const tetherForces = window.AGYNet.solveTetherPhysics(this.p1, this.p2, LEDGER_CONFIG.physics.hookesLawTether);
      this.p1.body.velocity.x += tetherForces.fx1 * (delta / 1000);
      this.p1.body.velocity.y += tetherForces.fy1 * (delta / 1000);
      this.p2.body.velocity.x += tetherForces.fx2 * (delta / 1000);
      this.p2.body.velocity.y += tetherForces.fy2 * (delta / 1000);

      window.AGYVFX.renderVerletTether(this.tetherGfx, this.p1, this.p2, 350, 155);

      // 4. Evaluate Dual Co-op Pressure Plates (plateA & plateB -> gateOpen)
      const d1A = Phaser.Math.Distance.Between(this.p1.x, this.p1.y, this.plateASprite.x, this.plateASprite.y);
      const d2A = Phaser.Math.Distance.Between(this.p2.x, this.p2.y, this.plateASprite.x, this.plateASprite.y);
      const d1B = Phaser.Math.Distance.Between(this.p1.x, this.p1.y, this.plateBSprite.x, this.plateBSprite.y);
      const d2B = Phaser.Math.Distance.Between(this.p2.x, this.p2.y, this.plateBSprite.x, this.plateBSprite.y);

      const wasPlateA = this.plateA;
      const wasPlateB = this.plateB;
      this.plateA = (d1A < 48 || d2A < 48);
      this.plateB = (d1B < 48 || d2B < 48);

      if (this.plateA && !wasPlateA) window.AGYAudio.playSwitchActivate();
      if (this.plateB && !wasPlateB) window.AGYAudio.playSwitchActivate();

      this.plateASprite.setTexture(this.plateA ? 'switch_plate_on' : 'switch_plate_off');
      this.plateBSprite.setTexture(this.plateB ? 'switch_plate_on' : 'switch_plate_off');

      if (this.plateA && this.plateB) {
        if (!this.gateOpen) {
          this.unlockForceGate();
          window.AGYNet.emitPuzzleEvent({ action: 'GATE_UNLOCKED' });
        }
        if (this.bossCore && !this.bossShieldDown) {
          this.bossShieldDown = true;
          this.bossCore.setTint(0x00E676);
        }
      }

      // Update Checkpoint as players progress
      if (this.p1.x > 1000 && this.activeCheckpoint.x < 1000) {
        this.activeCheckpoint = { x: 1030, y: 460 };
      }

      // 5. Out-of-Bounds Abyss Respawn Safety Trigger
      if (this.p1.y > 760 || this.p2.y > 760) {
        this.respawnAtCheckpoint();
      }

      // 6. Stage Progression Goal Check
      const distGoal = Phaser.Math.Distance.Between(this.p1.x, this.p1.y, this.goalZone.x, this.goalZone.y);
      if (distGoal < 52 && this.gateOpen) {
        const nextStage = (this.stageIndex + 1) % this.stagesList.length;
        window.AGYAudio.playVictoryFanfare();
        window.AGYNet.emitPuzzleEvent({ action: 'STAGE_ADVANCE', nextStageIndex: nextStage });
        this.loadStage(nextStage);
      }
    }
  }

  const gameConfig = {
    type: Phaser.AUTO,
    parent: 'game-container',
    width: 1120,
    height: 640,
    backgroundColor: LEDGER_CONFIG.palette.backgroundDark,
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { y: 0 },
        debug: false
      }
    },
    scene: [ReplicaMainScene]
  };

  window.addEventListener('DOMContentLoaded', () => {
    window.AGY_GAME_INSTANCE = new Phaser.Game(gameConfig);
  });
})();
`;
  }
}

module.exports = GameSynthesizer;
