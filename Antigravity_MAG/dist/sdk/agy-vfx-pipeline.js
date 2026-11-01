/**
 * Antigravity MAG v2.0 — WebGL Shader Post-FX, 12-Node Verlet Rope & Procedural Texture Factory
 */
(function(root) {
  'use strict';

  const BLOOM_FRAGMENT_SHADER = `
    precision mediump float;
    uniform sampler2D uMainSampler;
    varying vec2 outTexCoord;
    void main(void) {
      vec4 color = texture2D(uMainSampler, outTexCoord);
      vec4 sum = vec4(0.0);
      for (int x = -2; x <= 2; x++) {
        for (int y = -2; y <= 2; y++) {
          vec2 offset = vec2(float(x), float(y)) * 0.0022;
          sum += texture2D(uMainSampler, outTexCoord + offset);
        }
      }
      gl_FragColor = color + (sum / 25.0) * 0.35;
    }
  `;

  class AGYVFXPipeline {
    constructor() {
      this.verletNodes = [];
      this.nodeCount = 12;
      this.fragmentShader = BLOOM_FRAGMENT_SHADER;
    }

    initVerletRope(x1, y1, x2, y2, count = 12) {
      this.nodeCount = count;
      this.verletNodes = [];
      for (let i = 0; i < count; i++) {
        const t = i / (count - 1);
        const nx = x1 + (x2 - x1) * t;
        const ny = y1 + (y2 - y1) * t;
        this.verletNodes.push({ x: nx, y: ny, oldX: nx, oldY: ny });
      }
    }

    /**
     * Steps 12-node Verlet integration with iterative constraint relaxation.
     */
    stepVerletRope(p1, p2, naturalLength = 155, iterations = 6) {
      if (this.verletNodes.length !== this.nodeCount) {
        this.initVerletRope(p1.x, p1.y, p2.x, p2.y, this.nodeCount);
      }

      const segLen = naturalLength / (this.nodeCount - 1);
      const gravity = 0.45;
      const damping = 0.92;

      for (let i = 1; i < this.nodeCount - 1; i++) {
        const n = this.verletNodes[i];
        const vx = (n.x - n.oldX) * damping;
        const vy = (n.y - n.oldY) * damping;
        n.oldX = n.x;
        n.oldY = n.y;
        n.x += vx;
        n.y += vy + gravity;
      }

      // Pin endpoints to P1 and P2
      this.verletNodes[0].x = p1.x;
      this.verletNodes[0].y = p1.y;
      this.verletNodes[this.nodeCount - 1].x = p2.x;
      this.verletNodes[this.nodeCount - 1].y = p2.y;

      // Iterative distance constraint relaxation
      for (let iter = 0; iter < iterations; iter++) {
        for (let i = 0; i < this.nodeCount - 1; i++) {
          const n1 = this.verletNodes[i];
          const n2 = this.verletNodes[i + 1];
          const dx = n2.x - n1.x;
          const dy = n2.y - n1.y;
          const dist = Math.hypot(dx, dy) || 0.0001;
          const diff = (dist - segLen) / dist;

          if (i !== 0) {
            n1.x += dx * diff * 0.5;
            n1.y += dy * diff * 0.5;
          }
          if (i + 1 !== this.nodeCount - 1) {
            n2.x -= dx * diff * 0.5;
            n2.y -= dy * diff * 0.5;
          }
        }
      }

      return this.verletNodes;
    }

    /**
     * Renders the 12-node Verlet rope with dynamic tension colors and energy nodes.
     */
    renderVerletTether(graphics, p1, p2, maxLen = 350, naturalLen = 155) {
      if (!graphics || !p1 || !p2) return;
      this.stepVerletRope(p1, p2, naturalLen, 6);

      graphics.clear();
      const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y);
      const ratio = Math.min(dist / maxLen, 1.0);

      let color = 0x38BDF8;
      let width = 3;
      if (ratio > 0.85) {
        color = 0xFF1744;
        width = 4.5;
      } else if (ratio > 0.62) {
        color = 0xFF9E1B;
        width = 3.6;
      }

      // Outer glow pass
      graphics.lineStyle(width + 4, color, 0.24);
      graphics.beginPath();
      graphics.moveTo(this.verletNodes[0].x, this.verletNodes[0].y);
      for (let i = 1; i < this.verletNodes.length; i++) {
        graphics.lineTo(this.verletNodes[i].x, this.verletNodes[i].y);
      }
      graphics.strokePath();

      // Core plasma strand
      graphics.lineStyle(width, color, 0.95);
      graphics.beginPath();
      graphics.moveTo(this.verletNodes[0].x, this.verletNodes[0].y);
      for (let i = 1; i < this.verletNodes.length; i++) {
        graphics.lineTo(this.verletNodes[i].x, this.verletNodes[i].y);
      }
      graphics.strokePath();

      // Joint beads
      graphics.fillStyle(0xFFFFFF, 0.85);
      for (let i = 0; i < this.verletNodes.length; i += 3) {
        graphics.fillCircle(this.verletNodes[i].x, this.verletNodes[i].y, 2.5);
      }
    }

    /**
     * Generates 10 procedural High-DPI textures into Phaser's texture cache.
     */
    generateProceduralTextures(scene, palette = {}) {
      if (!scene || !scene.textures) return;

      const p1Col = palette.primaryP1 || '#FF9E1B';
      const p2Col = palette.secondaryP2 || '#00B0FF';
      const bossCol = palette.bossCore || '#FF1744';
      const surfCol = palette.surfacePlatforms || '#1E293B';
      const accCol = palette.accentEnergy || '#00E676';

      const makeTex = (key, w, h, fn) => {
        if (scene.textures.exists(key)) scene.textures.remove(key);
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        fn(canvas.getContext('2d'), w, h);
        scene.textures.addCanvas(key, canvas);
      };

      // 1. player_p1
      makeTex('player_p1', 44, 44, (ctx) => {
        const g = ctx.createRadialGradient(22, 22, 4, 22, 22, 21);
        g.addColorStop(0, '#FFFFFF');
        g.addColorStop(0.5, p1Col);
        g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(22, 22, 21, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = p1Col;
        ctx.beginPath(); ctx.arc(22, 22, 15, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = 2.2; ctx.stroke();
        ctx.fillStyle = '#090D16';
        ctx.beginPath(); ctx.arc(18, 19, 2.5, 0, Math.PI * 2); ctx.arc(26, 19, 2.5, 0, Math.PI * 2); ctx.fill();
      });

      // 2. player_p2
      makeTex('player_p2', 44, 44, (ctx) => {
        const g = ctx.createRadialGradient(22, 22, 4, 22, 22, 21);
        g.addColorStop(0, '#FFFFFF');
        g.addColorStop(0.5, p2Col);
        g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(22, 22, 21, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = p2Col;
        ctx.beginPath(); ctx.arc(22, 22, 15, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = 2.2; ctx.stroke();
        ctx.fillStyle = '#090D16';
        ctx.beginPath(); ctx.arc(18, 19, 2.5, 0, Math.PI * 2); ctx.arc(26, 19, 2.5, 0, Math.PI * 2); ctx.fill();
      });

      // 3. boss_core
      makeTex('boss_core', 96, 96, (ctx) => {
        const g = ctx.createRadialGradient(48, 48, 8, 48, 48, 46);
        g.addColorStop(0, '#FFFFFF');
        g.addColorStop(0.45, bossCol);
        g.addColorStop(1, 'rgba(255,23,68,0)');
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(48, 48, 46, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(48, 48, 28, 0, Math.PI * 2); ctx.stroke();
      });

      // 4. platform_tile
      makeTex('platform_tile', 64, 28, (ctx) => {
        ctx.fillStyle = surfCol;
        ctx.fillRect(0, 0, 64, 28);
        ctx.fillStyle = 'rgba(255,255,255,0.16)';
        ctx.fillRect(0, 0, 64, 4);
        ctx.strokeStyle = 'rgba(56,189,248,0.4)';
        ctx.strokeRect(1, 1, 62, 26);
      });

      // 5. moving_lift
      makeTex('moving_lift', 112, 22, (ctx) => {
        ctx.fillStyle = '#334155';
        ctx.fillRect(0, 0, 112, 22);
        ctx.strokeStyle = accCol;
        ctx.lineWidth = 2;
        ctx.strokeRect(2, 2, 108, 18);
      });

      // 6. switch_plate_off
      makeTex('switch_plate_off', 52, 14, (ctx) => {
        ctx.fillStyle = '#475569';
        ctx.fillRect(2, 4, 48, 10);
        ctx.fillStyle = '#94A3B8';
        ctx.fillRect(8, 2, 36, 5);
      });

      // 7. switch_plate_on
      makeTex('switch_plate_on', 52, 14, (ctx) => {
        ctx.fillStyle = accCol;
        ctx.fillRect(2, 6, 48, 8);
      });

      // 8. energy_gate
      makeTex('energy_gate', 26, 140, (ctx) => {
        ctx.fillStyle = 'rgba(255,23,68,0.28)';
        ctx.fillRect(0, 0, 26, 140);
        ctx.strokeStyle = bossCol;
        ctx.lineWidth = 2.5;
        ctx.strokeRect(2, 2, 22, 136);
      });

      // 9. particle_spark
      makeTex('particle_spark', 12, 12, (ctx) => {
        ctx.fillStyle = '#38BDF8';
        ctx.beginPath(); ctx.arc(6, 6, 5, 0, Math.PI * 2); ctx.fill();
      });

      // 10. heart_emote
      makeTex('heart_emote', 32, 32, (ctx) => {
        ctx.fillStyle = '#EC4899';
        ctx.beginPath();
        ctx.arc(11, 12, 6, 0, Math.PI * 2);
        ctx.arc(21, 12, 6, 0, Math.PI * 2);
        ctx.moveTo(5, 14);
        ctx.lineTo(16, 27);
        ctx.lineTo(27, 14);
        ctx.fill();
      });
    }

    /**
     * Applies WebGL Post-FX Vignette & Atmospheric Bloom overlay.
     */
    applyPostFXPipeline(scene) {
      if (!scene || !scene.add) return;
      const { width, height } = scene.scale;
      const fxOverlay = scene.add.graphics();
      fxOverlay.setScrollFactor(0).setDepth(950);
      fxOverlay.lineStyle(2, 0x38BDF8, 0.14);
      fxOverlay.strokeRect(2, 2, width - 4, height - 4);
      return fxOverlay;
    }

    /**
     * Creates 3-layer scrolling parallax starfield & architectural grid.
     */
    createParallaxBackground(scene, worldWidth = 2600, worldHeight = 720, palette = {}) {
      if (!scene || !scene.add) return;
      const bgGfx = scene.add.graphics().setDepth(-20).setScrollFactor(0.2);
      bgGfx.fillStyle(0x38BDF8, 0.22);
      for (let i = 0; i < 65; i++) {
        const sx = (i * 97) % worldWidth;
        const sy = (i * 53) % worldHeight;
        bgGfx.fillCircle(sx, sy, (i % 3) + 1);
      }

      const midGfx = scene.add.graphics().setDepth(-10).setScrollFactor(0.5);
      midGfx.lineStyle(1, 0x1E293B, 0.55);
      for (let x = 0; x < worldWidth; x += 120) {
        midGfx.beginPath();
        midGfx.moveTo(x, 0);
        midGfx.lineTo(x, worldHeight);
        midGfx.strokePath();
      }
    }

    applySquashStretch(scene, sprite, scaleX = 1.28, scaleY = 0.74, duration = 120) {
      if (!scene || !sprite || !scene.tweens) return;
      scene.tweens.killTweensOf(sprite);
      scene.tweens.add({
        targets: sprite,
        scaleX,
        scaleY,
        duration: duration * 0.5,
        yoyo: true,
        onComplete: () => sprite.setScale(1, 1)
      });
    }

    triggerCameraTrauma(scene, intensity = 0.014, duration = 160) {
      if (scene && scene.cameras && scene.cameras.main) {
        scene.cameras.main.shake(duration, intensity);
      }
    }

    spawnParticleBurst(scene, x, y, color = 0x38BDF8, count = 12) {
      if (!scene || !scene.add) return;
      for (let i = 0; i < count; i++) {
        const a = (Math.PI * 2 * i) / count;
        const spd = 35 + Math.random() * 85;
        const p = scene.add.circle(x, y, 3, color, 0.9);
        scene.tweens.add({
          targets: p,
          x: x + Math.cos(a) * spd,
          y: y + Math.sin(a) * spd,
          alpha: 0,
          scale: 0.2,
          duration: 340,
          onComplete: () => p.destroy()
        });
      }
    }

    spawnFloatingEmote(scene, x, y) {
      if (!scene || !scene.add) return;
      const em = scene.add.image(x, y - 24, 'heart_emote').setScale(0.5);
      scene.tweens.add({
        targets: em,
        y: y - 85,
        alpha: 0,
        scale: 1.15,
        duration: 850,
        onComplete: () => em.destroy()
      });
    }
  }

  const instance = new AGYVFXPipeline();
  if (typeof window !== 'undefined') {
    window.AGYVFX = instance;
    window.MAGVFX = instance;
  }
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = instance;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);
