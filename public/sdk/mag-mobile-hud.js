/**
 * MAG (Master Autonomous Game-Replicator) - Multi-Touch Virtual HUD & PWA Controller
 * Implements 3+ touch pointer handling, virtual analog thumbstick with deadzone,
 * ergonomic 4-button diamond, room code invite bar, and orientation guard.
 */
(function(root) {
  'use strict';

  class MAGMobileHud {
    constructor() {
      this.scene = null;
      this.options = {};
      this.inputState = {
        moveX: 0,
        moveY: 0,
        jump: false,
        ability: false,
        tether: false,
        boop: false
      };

      this.joystick = {
        active: false,
        pointerId: null,
        baseX: 130,
        baseY: 480,
        currX: 130,
        currY: 480,
        radius: 65,
        deadzone: 12,
        baseGfx: null,
        knobGfx: null
      };

      this.actionButtons = {};
      this.hudContainer = null;
    }

    /**
     * Initializes the mobile touch controls inside Phaser.
     */
    init(scene, options = {}) {
      this.scene = scene;
      this.options = options;

      // Crucial: Add 3 extra pointers for multi-touch (joystick + jump + ability)
      if (scene.input) {
        scene.input.addPointer(3);
      }

      this.setupOrientationGuard();
      this.buildJoystick();
      this.buildActionDiamond();
      this.buildTopStatusBar();
      this.setupGlobalPointerListeners();

      console.log('[MAGHud] Mobile Multi-Touch Controller initialized with 3+ active touch pointers.');
      return this;
    }

    /**
     * Creates and toggles landscape orientation advisory overlay.
     */
    setupOrientationGuard() {
      let banner = document.getElementById('mag-orientation-guard');
      if (!banner) {
        banner = document.createElement('div');
        banner.id = 'mag-orientation-guard';
        banner.style.cssText = `
          position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
          background: rgba(13, 17, 23, 0.96); z-index: 999999;
          display: none; flex-direction: column; align-items: center; justify-content: center;
          color: #00E5FF; font-family: -apple-system, BlinkMacSystemFont, sans-serif;
          text-align: center; padding: 24px; box-sizing: border-box;
        `;
        banner.innerHTML = `
          <div style="font-size: 48px; margin-bottom: 16px;">🔄</div>
          <h2 style="margin: 0 0 8px 0; color: #FFFFFF;">Rotate Device to Landscape</h2>
          <p style="margin: 0; color: #9CA3AF; max-width: 320px;">MAG Co-op requires landscape mode for split-thumb precision controls.</p>
        `;
        document.body.appendChild(banner);
      }

      const checkOrientation = () => {
        const isPortrait = window.innerHeight > window.innerWidth;
        banner.style.display = isPortrait ? 'flex' : 'none';
      };

      window.addEventListener('resize', checkOrientation);
      window.addEventListener('orientationchange', checkOrientation);
      checkOrientation();
    }

    /**
     * Builds the virtual thumbstick on the bottom-left area.
     */
    buildJoystick() {
      const { width, height } = this.scene.scale;
      this.joystick.baseX = 130;
      this.joystick.baseY = height - 130;
      this.joystick.currX = this.joystick.baseX;
      this.joystick.currY = this.joystick.baseY;

      // Base ring graphics
      this.joystick.baseGfx = this.scene.add.graphics();
      this.joystick.baseGfx.setScrollFactor(0);
      this.joystick.baseGfx.setDepth(1000);
      this.joystick.baseGfx.lineStyle(3, 0x00E5FF, 0.4);
      this.joystick.baseGfx.strokeCircle(this.joystick.baseX, this.joystick.baseY, this.joystick.radius);
      this.joystick.baseGfx.fillStyle(0x00E5FF, 0.08);
      this.joystick.baseGfx.fillCircle(this.joystick.baseX, this.joystick.baseY, this.joystick.radius);

      // Inner knob graphics
      this.joystick.knobGfx = this.scene.add.graphics();
      this.joystick.knobGfx.setScrollFactor(0);
      this.joystick.knobGfx.setDepth(1001);
      this.drawKnob(this.joystick.baseX, this.joystick.baseY);
    }

    drawKnob(x, y) {
      if (!this.joystick.knobGfx) return;
      this.joystick.knobGfx.clear();
      this.joystick.knobGfx.fillStyle(0x00E5FF, 0.7);
      this.joystick.knobGfx.fillCircle(x, y, 26);
      this.joystick.knobGfx.lineStyle(2, 0xFFFFFF, 0.9);
      this.joystick.knobGfx.strokeCircle(x, y, 26);
    }

    /**
     * Builds ergonomic 4-button action diamond on bottom-right.
     * Diamond layout:
     *        [BOOP] (Top)
     * [TETHER]      [ABILITY]
     *        [JUMP] (Bottom)
     */
    buildActionDiamond() {
      const { width, height } = this.scene.scale;
      const centerX = width - 150;
      const centerY = height - 130;
      const spread = 54;
      const btnRadius = 26;

      const buttonConfigs = [
        { key: 'btnJump', name: 'jump', label: 'JUMP', color: 0x10B981, x: centerX, y: centerY + spread },
        { key: 'btnAbility', name: 'ability', label: 'SKILL', color: 0x3B82F6, x: centerX + spread, y: centerY },
        { key: 'btnTether', name: 'tether', label: 'TETH', color: 0xF59E0B, x: centerX - spread, y: centerY },
        { key: 'btnBoop', name: 'boop', label: '♥', color: 0xEC4899, x: centerX, y: centerY - spread }
      ];

      buttonConfigs.forEach(cfg => {
        const bg = this.scene.add.circle(cfg.x, cfg.y, btnRadius, cfg.color, 0.65);
        bg.setScrollFactor(0).setDepth(1000).setInteractive();

        const text = this.scene.add.text(cfg.x, cfg.y, cfg.label, {
          fontSize: cfg.label === '♥' ? '20px' : '11px',
          fontStyle: 'bold',
          color: '#FFFFFF'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(1001);

        bg.on('pointerdown', () => {
          this.inputState[cfg.name] = true;
          bg.setAlpha(1.0);
          bg.setScale(0.92);
        });

        const release = () => {
          this.inputState[cfg.name] = false;
          bg.setAlpha(0.65);
          bg.setScale(1.0);
        };

        bg.on('pointerup', release);
        bg.on('pointerout', release);

        this.actionButtons[cfg.key] = { bg, text, config: cfg };
      });
    }

    /**
     * Builds persistent top HUD status bar with Room Code, Ping, Role, and Copy Link.
     */
    buildTopStatusBar() {
      const { width } = this.scene.scale;
      const role = this.options.roleTitle || 'P1 ARCHITECT';
      const room = this.options.roomCode || 'DEMO';

      const barBg = this.scene.add.graphics();
      barBg.setScrollFactor(0).setDepth(999);
      barBg.fillStyle(0x0D1117, 0.85);
      barBg.fillRect(0, 0, width, 40);
      barBg.lineStyle(1, 0x21262D, 1);
      barBg.beginPath();
      barBg.moveTo(0, 40);
      barBg.lineTo(width, 40);
      barBg.strokePath();

      // Role badge
      this.roleBadge = this.scene.add.text(16, 12, `ROLE: ${role}`, {
        fontSize: '13px',
        fontStyle: 'bold',
        color: '#00E5FF'
      }).setScrollFactor(0).setDepth(1001);

      // Room code
      this.roomCodeText = this.scene.add.text(width / 2, 12, `ROOM: ${room}`, {
        fontSize: '13px',
        color: '#F3F4F6'
      }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(1001);

      // Ping indicator
      this.pingText = this.scene.add.text(width - 150, 12, `PING: 24ms`, {
        fontSize: '12px',
        color: '#10B981'
      }).setScrollFactor(0).setDepth(1001);

      // Copy invite button
      const copyBtn = this.scene.add.text(width - 65, 10, '🔗 SHARE', {
        fontSize: '11px',
        backgroundColor: '#1F2937',
        padding: { x: 6, y: 3 },
        color: '#60A5FA'
      }).setScrollFactor(0).setDepth(1001).setInteractive();

      copyBtn.on('pointerdown', () => {
        this.copyInviteLink();
        copyBtn.setText('✓ COPIED');
        setTimeout(() => copyBtn.setText('🔗 SHARE'), 1800);
      });
    }

    /**
     * Copies the game invite link to the clipboard.
     */
    copyInviteLink() {
      const shareUrl = window.location.href;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(shareUrl).then(() => {
          console.log('[MAGHud] Room invite link copied to clipboard.');
        }).catch(() => {});
      }
    }

    /**
     * Updates ping display
     */
    setPing(ms) {
      if (this.pingText) {
        this.pingText.setText(`PING: ${ms}ms`);
        this.pingText.setColor(ms < 75 ? '#10B981' : (ms < 150 ? '#F59E0B' : '#EF4444'));
      }
    }

    /**
     * Listens for touch drag events to update virtual joystick coordinates.
     */
    setupGlobalPointerListeners() {
      const { width, height } = this.scene.scale;
      const leftHalfWidth = width * 0.5;

      this.scene.input.on('pointerdown', (pointer) => {
        if (pointer.x < leftHalfWidth && pointer.y > 100 && !this.joystick.active) {
          this.joystick.active = true;
          this.joystick.pointerId = pointer.id;
          this.updateJoystickPosition(pointer.x, pointer.y);
        }
      });

      this.scene.input.on('pointermove', (pointer) => {
        if (this.joystick.active && pointer.id === this.joystick.pointerId) {
          this.updateJoystickPosition(pointer.x, pointer.y);
        }
      });

      const releaseJoystick = (pointer) => {
        if (this.joystick.active && pointer.id === this.joystick.pointerId) {
          this.joystick.active = false;
          this.joystick.pointerId = null;
          this.inputState.moveX = 0;
          this.inputState.moveY = 0;
          this.drawKnob(this.joystick.baseX, this.joystick.baseY);
        }
      };

      this.scene.input.on('pointerup', releaseJoystick);
      this.scene.input.on('pointerupoutside', releaseJoystick);
    }

    updateJoystickPosition(x, y) {
      const dx = x - this.joystick.baseX;
      const dy = y - this.joystick.baseY;
      const distance = Math.hypot(dx, dy);

      if (distance < this.joystick.deadzone) {
        this.inputState.moveX = 0;
        this.inputState.moveY = 0;
        this.drawKnob(this.joystick.baseX, this.joystick.baseY);
        return;
      }

      const clampedDist = Math.min(distance, this.joystick.radius);
      const angle = Math.atan2(dy, dx);
      const knobX = this.joystick.baseX + Math.cos(angle) * clampedDist;
      const knobY = this.joystick.baseY + Math.sin(angle) * clampedDist;

      this.drawKnob(knobX, knobY);

      // Normalized output [-1.0, 1.0]
      this.inputState.moveX = Math.cos(angle) * (clampedDist / this.joystick.radius);
      this.inputState.moveY = Math.sin(angle) * (clampedDist / this.joystick.radius);
    }

    /**
     * Returns current snapshot of user input state.
     */
    getInputs() {
      return { ...this.inputState };
    }
  }

  const instance = new MAGMobileHud();

  if (typeof window !== 'undefined') {
    window.MAGHud = instance;
    window.MAGMobileHud = MAGMobileHud;
  }
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = instance;
    module.exports.MAGMobileHud = MAGMobileHud;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);
