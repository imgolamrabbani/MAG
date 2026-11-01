'use strict';

// SDKs are loaded locally before this entrypoint; no external art or audio.
const { MAGAudio, MAGVFX, MAGHud, MAGNet } = window;
let config;
const statusText = document.getElementById('status');
const roomInput = document.getElementById('room');
roomInput.value = new URLSearchParams(location.search).get('room') || '';
document.getElementById('start').onclick = async () => {
  try {
    const room = roomInput.value.trim().toUpperCase();
    if (room && !/^[A-Z0-9_]{4,16}$/.test(room)) throw new Error('Use 4–16 letters, numbers or underscores.');
    if (room) history.replaceState({}, '', '?room=' + encodeURIComponent(room));
    const response = await fetch('/config');
    if (!response.ok) throw new Error('Unable to load game configuration.');
    config = await response.json();
    MAGAudio.init();
    MAGAudio.startAmbientMusic(config.audioDspProfile.proceduralBgmSequencer.tempoBpm);
    document.getElementById('welcome').style.display = 'none';
    new Phaser.Game({
      type: Phaser.AUTO, width: 1280, height: 720, backgroundColor: '#0d1117',
      scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
      physics: { default: 'arcade', arcade: { gravity: { y: 920 } } },
      scene: BondScene
    });
  } catch (error) { document.getElementById('error').textContent = error.message; }
};

class BondScene extends Phaser.Scene {
  constructor() { super('bond'); this.stageIndex = 0; this.gates = new Set(); this.lastTick = 0; this.coyoteTime = 0; this.jumpBuffer = -Infinity; this.previous = {}; this.abilityUntil = 0; this.nextAbility = 0; this.partnerActive = false; this.plate = null; this.bossPhase = 0; }
  create() {
    MAGVFX.generateProceduralTextures(this, config.visualProfile.dominantPalette);
    this.tether = this.add.graphics().setDepth(15);
    // Phaser Graphics has no quadraticCurveTo; sample the curve into its path.
    this.tether.quadraticCurveTo = function(cx, cy, x, y) {
      const p = this.curveStart;
      for (let i = 1; i <= 24; i++) {
        const t = i / 24, u = 1 - t;
        this.lineTo(u*u*p.x + 2*u*t*cx + t*t*x, u*u*p.y + 2*u*t*cy + t*t*y);
      }
    };
    const moveTo = this.tether.moveTo;
    this.tether.moveTo = function(x, y) { this.curveStart = { x, y }; return moveTo.call(this, x, y); };
    this.local = this.physics.add.sprite(120, 520, 'player_p1').setDepth(20);
    this.local.body.setSize(28, 30).setOffset(6, 5).setGravityY(0).setMaxVelocity(666, 850);
    this.local.setCollideWorldBounds(false);
    this.partner = this.add.sprite(200, 520, 'player_p2').setDepth(20).setAlpha(0);
    this.keys = this.input.keyboard.addKeys('A,D,LEFT,RIGHT,SPACE,E,Q,H');
    this.input.keyboard.addCapture(['SPACE', 'UP', 'DOWN']);
    MAGHud.init(this, { roleTitle: 'CONNECTING', roomCode: '…' });
    MAGHud.pingText.setText('PING: …');
    this.buildStage();
    MAGNet.init({ callbacks: {
      onRoomJoined: data => {
        this.role = data.role;
        this.stageIndex = data.stage;
        this.gates = new Set(data.gates);
        this.bossPhase = data.bossPhase;
        this.local.setTexture(this.role === 'P1_ARCHITECT' ? 'player_p1' : 'player_p2');
        this.partner.setTexture(this.role === 'P1_ARCHITECT' ? 'player_p2' : 'player_p1');
        this.buildStage();
        this.local.setPosition(data.x, data.y);
        MAGHud.roleBadge.setText(this.role === 'P1_ARCHITECT' ? 'MAY / NAIL SLINGER' : 'CODY / HAMMER BASHER');
        MAGHud.roomCodeText.setText('ROOM: ' + MAGNet.roomCode);
        this.message('Share your room link. Waiting for your partner…');
        this.bindGameplayEvents();
      },
      onStateUpdate: data => {
        this.partnerActive = !!data.partnerPosition;
        this.partner.setAlpha(this.partnerActive ? 1 : 0);
        if (data.partnerPosition) {
          this.partnerAnchored = data.partnerPosition.anchored;
          if (!this.seenPartner) { this.message('Connected. Find the two glowing plates together.'); this.seenPartner = true; }
        }
      },
      onPartnerDisconnected: () => {
        this.partnerActive = false; this.partner.setAlpha(0); this.seenPartner = false;
        MAGNet.remoteSnapshots.length = 0;
        this.message('Partner disconnected. Their role is reserved for 30 seconds.');
      },
      onPuzzleTrigger: data => {
        this.gates.add(data.gateId); this.refreshGates(); MAGAudio.playGateOpen();
        MAGVFX.spawnParticleBurst(this, this.local.x, this.local.y, 0x76ff03, 18);
        this.message('Gate unlocked! Continue together toward the exit.');
      },
      onBoopReceived: () => {
        MAGVFX.spawnFloatingHeartOrBoop(this, this.local.x, this.local.y);
        MAGAudio.playPartnerBoop();
        if (this.partnerActive && Phaser.Math.Distance.Between(this.local.x, this.local.y, this.partner.x, this.partner.y) < 120) this.boostUntil = this.time.now + 1200;
      },
      onError: error => this.message(error.code === 'ROOM_FULL' ? 'Room full. Open a different room with ?room=YOURCODE.' : error.message)
    } });
  }
  message(text) { statusText.textContent = `${this.stageIndex + 1} / 3 · ${text}`; }
  emit(name, data = {}) {
    MAGNet.socket?.emit(name, { ...data, roomCode: MAGNet.roomCode, sessionToken: MAGNet.sessionToken });
  }
  bindGameplayEvents() {
    if (this.bound) return;
    this.bound = true;
    MAGNet.socket.on('player_respawn', p => {
      this.local.setPosition(p.x, p.y).setVelocity(0, 0);
      MAGAudio.playTetherSnap(); MAGVFX.triggerCameraTrauma(this);
    });
    MAGNet.socket.on('stage_complete', data => {
      this.stageIndex = data.stage; this.gates = new Set(data.gates); this.buildStage();
      MAGNet.remoteSnapshots.length = 0;
      const spawn = this.stage.spawnPoints[this.role === 'P1_ARCHITECT' ? 'p1' : 'p2'];
      this.local.setPosition(spawn.x, spawn.y).setVelocity(0, 0);
      this.message(this.stage.mechanicFocus);
    });
    MAGNet.socket.on('world_update', data => {
      this.bossPhase = data.bossPhase;
      this.message(this.bossPhase === 1 ? 'Core exposed. Anchor with E, stretch the tether, then Q to slingshot near the core.' : 'Shield broken! Both use E near the core within 1.2 seconds.');
    });
    MAGNet.socket.on('ability_used', data => MAGVFX.spawnParticleBurst(this, data.x, data.y, data.role === 'P1_ARCHITECT' ? 0xff9e1b : 0x00b0ff, 12));
    MAGNet.socket.on('VICTORY', () => {
      MAGAudio.playVictoryFanfare(); this.won = true;
      this.add.text(640, 290, 'BETTER TOGETHER\nCONVERGENCE COMPLETE', { fontSize: '44px', align: 'center', color: '#76ff03', backgroundColor: '#0d1117', padding: { x: 28, y: 28 } }).setOrigin(.5).setScrollFactor(0).setDepth(500);
      this.message('Victory! All three stages complete.');
    });
  }
  buildStage() {
    if (this.platformCollider) this.platformCollider.destroy();
    if (this.barrierCollider) this.barrierCollider.destroy();
    if (this.decor) this.decor.clear(true, true);
    this.platforms?.clear(true, true); this.barriers?.clear(true, true);
    this.decor = this.add.group();
    this.platforms = this.physics.add.staticGroup();
    this.barriers = this.physics.add.staticGroup();
    this.stage = config.levelTopologyDag.stages[this.stageIndex];
    const { width, height } = this.stage.worldBounds;
    this.floorY = this.stageIndex === 0 ? 580 : 760;
    this.cameras.main.setBounds(0, 0, width, height);
    this.physics.world.setBounds(0, -400, width, height + 700);
    this.cameras.main.startFollow(this.local, true, .07, .07);
    for (let layer = 0; layer < 2; layer++) {
      for (let x = 0; x < width * 2; x += 160) {
        const art = this.add.rectangle(x, this.floorY - 100 - layer * 140, 70 + (x % 110), 200 + (x % 130), layer ? 0x142636 : 0x193242, .5).setScrollFactor(layer ? .15 : .5).setDepth(-10);
        this.decor.add(art);
      }
    }
    for (let x = 0; x < width; x += 64) {
      const pit = (this.stage.hazards || []).some(h => ['ABYSS_PIT', 'VOID_SPIKES'].includes(h.type) && x + 32 > h.startX && x < h.endX);
      if (!pit) this.platforms.create(x + 32, this.floorY + 16, 'platform_tile');
    }
    // Stepping stones make the abyss traversable; the elastic bond rewards coordination.
    for (const hazard of this.stage.hazards || []) {
      if (hazard.type !== 'PULSE_LASER_GRID') {
        for (let x = hazard.startX + 64; x < hazard.endX; x += 100) this.platforms.create(x, this.floorY - 60, 'platform_tile');
      }
    }
    this.platePositions = this.stageIndex === 2 ? [1660, 1850] : [1010, 1180];
    this.plateSprites = this.platePositions.map(x => {
      const s = this.add.image(x, this.floorY - 5, 'switch_plate_off').setDepth(5); this.decor.add(s); return s;
    });
    this.gateSprites = [];
    for (const gate of this.stage.puzzleGates || []) {
      const x = gate.gateId === 'GATE_01_A' ? 1250 : gate.position.x + 180;
      const sprite = this.barriers.create(x, this.floorY - 60, 'energy_gate');
      this.gateSprites.push({ id: gate.gateId, sprite });
    }
    if (this.stageIndex === 1) {
      this.lift = this.platforms.create(1400, this.floorY - 100, 'platform_tile');
      const label = this.add.text(1300, this.floorY - 190, 'PIN + SMASH\nBoth press E nearby', { color: '#00e5ff', align: 'center', fontSize: '16px' }); this.decor.add(label);
    } else this.lift = null;
    if (this.stageIndex === 2) {
      this.boss = this.add.circle(2100, this.floorY - 100, 65, 0xff1744, .8).setStrokeStyle(6, 0x00e5ff);
      this.decor.add(this.boss);
      this.decor.add(this.add.text(1940, this.floorY - 220, 'THE ENTROPY OVERLORD\n1. Twin plates  2. Slingshot  3. Dual E', { fontSize: '17px', color: '#f0f6fc', align: 'center' }));
    }
    this.decor.add(this.add.text(120, this.floorY - 220, this.stage.stageName, { fontSize: '25px', color: '#ff9e1b' }));
    this.decor.add(this.add.text(width - 250, this.floorY - 85, 'EXIT →\nBoth players', { fontSize: '22px', color: '#76ff03' }));
    this.platformCollider = this.physics.add.collider(this.local, this.platforms);
    this.barrierCollider = this.physics.add.collider(this.local, this.barriers);
    this.refreshGates();
    this.plate = null;
  }
  refreshGates() {
    for (const { id, sprite } of this.gateSprites) {
      if (this.gates.has(id)) { sprite.disableBody(true, true); }
    }
  }
  update(now, delta) {
    if (!this.local || !this.role || this.won) return;
    const dt = Math.min(delta / 1000, .033);
    const input = MAGHud.getInputs();
    input.moveX = input.moveX || (this.keys.D.isDown || this.keys.RIGHT.isDown ? 1 : 0) - (this.keys.A.isDown || this.keys.LEFT.isDown ? 1 : 0);
    input.jump ||= this.keys.SPACE.isDown;
    input.ability ||= this.keys.E.isDown;
    input.tether ||= this.keys.Q.isDown;
    input.boop ||= this.keys.H.isDown;
    const grounded = this.local.body.blocked.down || this.local.body.touching.down;
    if (grounded) this.coyoteTime = now;
    if (input.jump && !this.previous.jump) this.jumpBuffer = now;
    const anchored = this.role === 'P1_ARCHITECT' && now < this.abilityUntil;
    if (now < this.slingshotUntil) this.local.setVelocityX(this.slingshotVelocity);
    else this.local.setVelocityX(anchored ? 0 : input.moveX * (now < this.boostUntil ? 360 : 290));
    if (now - this.jumpBuffer <= 120 && now - this.coyoteTime <= 140) {
      this.local.setVelocityY(-490); this.jumpBuffer = -Infinity; this.coyoteTime = -Infinity;
      MAGAudio.playJump(); MAGVFX.applySquashStretch(this, this.local, .78, 1.28);
      MAGVFX.spawnParticleBurst(this, this.local.x, this.local.y + 18, 0x00e5ff, 6);
    }
    if (grounded && !this.wasGrounded) {
      MAGAudio.playLand(); MAGVFX.applySquashStretch(this, this.local, 1.32, .72);
      if (this.lastVy > 550) MAGVFX.triggerCameraTrauma(this, .008, 160);
    }
    if (input.ability && !this.previous.ability && now >= this.nextAbility) {
      this.abilityUntil = now + 2200;
      this.nextAbility = now + (this.role === 'P1_ARCHITECT' ? 2200 : 1800);
      if (this.role === 'P1_ARCHITECT') MAGAudio.playP1Ability(); else { MAGAudio.playP2Ability(); MAGVFX.triggerCameraTrauma(this, .01, 180); }
      this.emit('use_ability', { roleId: this.role, ability: this.role === 'P1_ARCHITECT' ? 'KINETIC_ANCHOR' : 'RESONANCE_PULSE' });
    }
    const partner = this.partnerActive ? MAGNet.getInterpolatedPartnerPosition() : null;
    if (partner) {
      this.partner.setPosition(partner.x, partner.y);
      const force = MAGNet.applyTetherConstraint(this.local, this.partner);
      if (!anchored) {
        this.local.body.velocity.x += force.fx1 * dt;
        this.local.body.velocity.y += force.fy1 * dt;
      }
      const distance = Phaser.Math.Distance.Between(this.local.x, this.local.y, partner.x, partner.y);
      if (distance > 340) {
        const ratio = 340 / distance;
        this.local.setPosition(partner.x + (this.local.x - partner.x) * ratio, partner.y + (this.local.y - partner.y) * ratio);
      }
      MAGVFX.renderElasticTether(this.tether, this.local, this.partner);
      if (distance > 289 && now > (this.warningAt || 0)) { MAGAudio.playTetherSnap(); this.warningAt = now + 1800; }
      if (input.tether && !this.previous.tether && this.partnerAnchored && distance > 200) {
        // Slingshot momentum is transferred from the pinned partner's anchor.
        this.slingshotVelocity = Math.sign(this.local.x - partner.x || 1) * 360 * 1.85;
        this.slingshotUntil = now + 450;
        this.local.setVelocity(this.slingshotVelocity, -420);
        this.emit('slingshot'); MAGAudio.playTetherSnap();
        MAGVFX.spawnParticleBurst(this, this.local.x, this.local.y, 0xff9e1b, 18);
      }
    } else this.tether.clear();
    if (input.boop && !this.previous.boop) MAGNet.emitPartnerBoop();
    const plateIndex = this.platePositions.findIndex(x => Math.abs(this.local.x - x) < 25 && Math.abs(this.local.y + 18 - this.floorY) < 28);
    const plate = plateIndex < 0 ? null : (plateIndex === 0 ? 'plateA' : 'plateB');
    if (plate !== this.plate) {
      if (this.plate) this.emit('pressure_plate_step', { plateId: this.plate, active: false });
      if (plate) {
        this.emit('pressure_plate_step', { plateId: plate, active: true }); MAGAudio.playSwitchActivate();
        MAGVFX.spawnParticleBurst(this, this.local.x, this.floorY, 0x76ff03, 14);
      }
      this.plate = plate;
    }
    // Renew occupancy so partners can arrive at a plate at different times.
    if (plate && now - (this.lastPlateTick || 0) > 300) { this.emit('pressure_plate_step', { plateId: plate }); this.lastPlateTick = now; }
    this.plateSprites.forEach((s, i) => s.setTexture(i === plateIndex ? 'switch_plate_on' : 'switch_plate_off'));
    if (this.lift && !this.gates.has('GATE_02_A') && now > this.abilityUntil) this.lift.setY(this.floorY - 90 + Math.sin(now / 1200) * 45).refreshBody();
    const laser = this.stage.hazards?.find(h => h.type === 'PULSE_LASER_GRID');
    if (laser && (now / 1000) % laser.cyclePeriodSec < 1 && this.local.x > laser.startX && this.local.x < laser.endX && grounded) {
      this.local.y = this.stage.worldBounds.height + 100;
    }
    if (this.boss) {
      this.boss.setScale(1 + Math.sin(now / 400) * .05).setFillStyle(this.bossPhase > 0 ? 0xff9e1b : 0xff1744, .8);
      // Periodic shockwave: jump to avoid the ground pulse.
      if (Math.floor(now / 3000) !== this.lastWave) {
        this.lastWave = Math.floor(now / 3000);
        MAGVFX.spawnParticleBurst(this, 2100, this.floorY - 5, 0xff1744, 20);
        if (grounded && Math.abs(this.local.x - 2100) < 300) this.local.setVelocityY(-280);
      }
    }
    this.local.x = Phaser.Math.Clamp(this.local.x, 18, this.stage.worldBounds.width - 18);
    if (now - this.lastTick >= 50) {
      MAGNet.emitClientState(this.local.x, this.local.y, this.local.body.velocity.x, this.local.body.velocity.y, input);
      this.lastTick = now;
    }
    if (this.local.x > this.stage.worldBounds.width - 220 && now - (this.lastExit || 0) > 500) { this.emit('stage_complete'); this.lastExit = now; }
    this.previous = { ...input }; this.wasGrounded = grounded; this.lastVy = this.local.body.velocity.y;
  }
}
