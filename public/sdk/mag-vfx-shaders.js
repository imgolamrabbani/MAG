/**
 * MAG (Master Autonomous Game-Replicator) - Procedural VFX, Canvas Textures & Shaders
 * Delivers procedural graphics, elastic tether rendering, particles, and camera trauma for Phaser 3.
 */
(function(root) {
  'use strict';

  class MAGVFXEngine {
    constructor() {
      this.activeTrauma = 0;
    }

    /**
     * Generates all core game textures procedurally into the Phaser texture cache.
     * Guarantees 0 missing assets or 404 network errors.
     */
    generateProceduralTextures(scene, palette = {}) {
      if (!scene || !scene.textures) {
        console.warn('[MAGVFX] Invalid Phaser scene supplied to generateProceduralTextures.');
        return;
      }

      const p1Color = palette.primaryP1 || '#FF9E1B';
      const p2Color = palette.secondaryP2 || '#00B0FF';
      const surfaceColor = palette.surfacePlatforms || '#21262D';
      const hazardColor = palette.hazardSpikes || '#FF1744';
      const activeColor = palette.accentEnergy || '#76FF03';
      const tetherColor = palette.tetherGlow || '#00E5FF';

      // 1. Player 1 Avatar (Circle with inner core + eye accents)
      this.createCanvasTexture(scene, 'player_p1', 40, 40, (ctx) => {
        // Outer glow
        const grad = ctx.createRadialGradient(20, 20, 6, 20, 20, 20);
        grad.addColorStop(0, '#FFFFFF');
        grad.addColorStop(0.4, p1Color);
        grad.addColorStop(1, 'rgba(255, 158, 27, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(20, 20, 19, 0, Math.PI * 2);
        ctx.fill();

        // Inner solid body
        ctx.fillStyle = p1Color;
        ctx.beginPath();
        ctx.arc(20, 20, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#FFFFFF';
        ctx.stroke();

        // Stylized eyes
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(16, 17, 3, 0, Math.PI * 2);
        ctx.arc(24, 17, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#0D1117';
        ctx.beginPath();
        ctx.arc(17, 17, 1.5, 0, Math.PI * 2);
        ctx.arc(25, 17, 1.5, 0, Math.PI * 2);
        ctx.fill();
      });

      // 2. Player 2 Avatar (Cyan / Azure variant)
      this.createCanvasTexture(scene, 'player_p2', 40, 40, (ctx) => {
        const grad = ctx.createRadialGradient(20, 20, 6, 20, 20, 20);
        grad.addColorStop(0, '#FFFFFF');
        grad.addColorStop(0.4, p2Color);
        grad.addColorStop(1, 'rgba(0, 176, 255, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(20, 20, 19, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = p2Color;
        ctx.beginPath();
        ctx.arc(20, 20, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#FFFFFF';
        ctx.stroke();

        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(16, 17, 3, 0, Math.PI * 2);
        ctx.arc(24, 17, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#0D1117';
        ctx.beginPath();
        ctx.arc(17, 17, 1.5, 0, Math.PI * 2);
        ctx.arc(25, 17, 1.5, 0, Math.PI * 2);
        ctx.fill();
      });

      // 3. Platform Block Texture (Beveled high-tech slab)
      this.createCanvasTexture(scene, 'platform_tile', 64, 32, (ctx) => {
        ctx.fillStyle = surfaceColor;
        ctx.fillRect(0, 0, 64, 32);

        // Top highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.18)';
        ctx.fillRect(0, 0, 64, 4);

        // Tech grid lines
        ctx.strokeStyle = 'rgba(0, 229, 255, 0.35)';
        ctx.lineWidth = 1;
        ctx.strokeRect(2, 2, 60, 28);
        ctx.beginPath();
        ctx.moveTo(32, 2);
        ctx.lineTo(32, 30);
        ctx.stroke();
      });

      // 4. Pressure Switch Off
      this.createCanvasTexture(scene, 'switch_plate_off', 48, 14, (ctx) => {
        ctx.fillStyle = '#4B5563';
        ctx.fillRect(2, 4, 44, 10);
        ctx.fillStyle = '#9CA3AF';
        ctx.fillRect(6, 6, 36, 4);
      });

      // 5. Pressure Switch On (Glowing Green)
      this.createCanvasTexture(scene, 'switch_plate_on', 48, 14, (ctx) => {
        ctx.fillStyle = '#10B981';
        ctx.fillRect(2, 7, 44, 7); // Pressed down
        ctx.fillStyle = activeColor;
        ctx.fillRect(4, 8, 40, 4);
        ctx.shadowColor = activeColor;
        ctx.shadowBlur = 8;
      });

      // 6. Energy Barrier Gate (Pulsing Force Field)
      this.createCanvasTexture(scene, 'energy_gate', 24, 120, (ctx) => {
        ctx.fillStyle = 'rgba(255, 23, 68, 0.25)';
        ctx.fillRect(0, 0, 24, 120);

        ctx.strokeStyle = hazardColor;
        ctx.lineWidth = 2;
        ctx.strokeRect(2, 2, 20, 116);

        // Horizontal laser lines
        for (let y = 12; y < 120; y += 14) {
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
          ctx.beginPath();
          ctx.moveTo(4, y);
          ctx.lineTo(20, y);
          ctx.stroke();
        }
      });

      // 7. Particle Spark Texture
      this.createCanvasTexture(scene, 'particle_spark', 12, 12, (ctx) => {
        const grad = ctx.createRadialGradient(6, 6, 1, 6, 6, 6);
        grad.addColorStop(0, '#FFFFFF');
        grad.addColorStop(0.5, tetherColor);
        grad.addColorStop(1, 'rgba(0, 229, 255, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(6, 6, 5, 0, Math.PI * 2);
        ctx.fill();
      });

      // 8. Floating Heart / Boop Emote
      this.createCanvasTexture(scene, 'heart_emote', 32, 32, (ctx) => {
        ctx.fillStyle = '#FF4081';
        ctx.beginPath();
        const x = 16, y = 16;
        ctx.moveTo(x, y + 6);
        ctx.bezierCurveTo(x, y + 2, x - 12, y - 6, x - 12, y + 6);
        ctx.bezierCurveTo(x - 12, y + 14, x, y + 22, x, y + 24);
        ctx.bezierCurveTo(x, y + 22, x + 12, y + 14, x + 12, y + 6);
        ctx.bezierCurveTo(x + 12, y - 6, x, y + 2, x, y + 6);
        ctx.fill();
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      });

      console.log('[MAGVFX] Procedural canvas textures registered successfully.');
    }

    /**
     * Helper to render dynamic HTML5 Canvas directly into Phaser texture manager.
     */
    createCanvasTexture(scene, key, width, height, drawFn) {
      if (scene.textures.exists(key)) {
        scene.textures.remove(key);
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      drawFn(ctx);
      scene.textures.addCanvas(key, canvas);
    }

    /**
     * Procedural Squash & Stretch Deformation Matrix
     */
    applySquashStretch(scene, sprite, targetScaleX, targetScaleY, duration = 120) {
      if (!scene || !sprite || !sprite.scene) return;

      scene.tweens.killTweensOf(sprite);
      scene.tweens.add({
        targets: sprite,
        scaleX: targetScaleX,
        scaleY: targetScaleY,
        duration: duration * 0.45,
        ease: 'Quad.easeOut',
        yoyo: true,
        onComplete: () => {
          sprite.setScale(1.0, 1.0);
        }
      });
    }

    /**
     * Additive Camera Trauma & Impact Shake System
     */
    triggerCameraTrauma(scene, intensity = 0.015, duration = 160) {
      if (!scene || !scene.cameras || !scene.cameras.main) return;
      scene.cameras.main.shake(duration, intensity);
    }

    /**
     * Mathematical Elastic Tether Bezier & Catenary Rendering
     * Calculates sag under low tension and electric vibration under high tension.
     */
    renderElasticTether(graphics, p1, p2, maxLen = 340, tensionColor = 0x00E5FF) {
      if (!graphics || !p1 || !p2) return;

      graphics.clear();
      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const distance = Math.hypot(dx, dy);

      const tensionRatio = Math.min(distance / maxLen, 1.0);

      // Color shifts: Cyan (0x00E5FF) -> Amber (0xFF9E1B) -> Neon Red (0xFF1744)
      let lineColor = tensionColor;
      let lineWidth = 3;

      if (tensionRatio > 0.85) {
        lineColor = 0xFF1744; // Warning crimson
        lineWidth = 4;
      } else if (tensionRatio > 0.65) {
        lineColor = 0xFF9E1B; // Warning amber
        lineWidth = 3.5;
      }

      graphics.lineStyle(lineWidth, lineColor, 0.9);

      if (tensionRatio < 0.6) {
        // Catenary sag curve when relaxed
        const midX = (p1.x + p2.x) / 2;
        const sagAmount = (1.0 - tensionRatio) * 35;
        const midY = (p1.y + p2.y) / 2 + sagAmount;

        graphics.beginPath();
        graphics.moveTo(p1.x, p1.y);
        graphics.quadraticCurveTo(midX, midY, p2.x, p2.y);
        graphics.strokePath();
      } else {
        // Taut electric line with jitter when stretched
        graphics.beginPath();
        graphics.moveTo(p1.x, p1.y);
        if (tensionRatio > 0.85) {
          const jitterX = (Math.random() - 0.5) * 6;
          const jitterY = (Math.random() - 0.5) * 6;
          const midX = (p1.x + p2.x) / 2 + jitterX;
          const midY = (p1.y + p2.y) / 2 + jitterY;
          graphics.lineTo(midX, midY);
        }
        graphics.lineTo(p2.x, p2.y);
        graphics.strokePath();
      }

      // Render glowing energy anchors at player joints
      graphics.fillStyle(lineColor, 0.8);
      graphics.fillCircle(p1.x, p1.y, 4);
      graphics.fillCircle(p2.x, p2.y, 4);
    }

    /**
     * Spawns a procedural particle burst
     */
    spawnParticleBurst(scene, x, y, color = 0x00E5FF, count = 12) {
      if (!scene || !scene.add) return;

      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 40 + Math.random() * 120;
        const spark = scene.add.circle(x, y, 3, color, 1);

        scene.tweens.add({
          targets: spark,
          x: x + Math.cos(angle) * speed,
          y: y + Math.sin(angle) * speed,
          alpha: 0,
          scale: 0.2,
          duration: 300 + Math.random() * 250,
          ease: 'Cubic.easeOut',
          onComplete: () => {
            spark.destroy();
          }
        });
      }
    }

    /**
     * Spawns an animated floating Heart or Boop icon
     */
    spawnFloatingHeartOrBoop(scene, x, y, type = 'heart') {
      if (!scene || !scene.add) return;

      const heart = scene.add.image(x, y - 20, 'heart_emote');
      heart.setScale(0.4);

      scene.tweens.add({
        targets: heart,
        y: y - 80,
        scale: 1.1,
        alpha: { from: 1, to: 0 },
        duration: 900,
        ease: 'Sine.easeOut',
        onComplete: () => {
          heart.destroy();
        }
      });
    }
  }

  const instance = new MAGVFXEngine();

  if (typeof window !== 'undefined') {
    window.MAGVFX = instance;
    window.MAGVFXEngine = MAGVFXEngine;
  }
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = instance;
    module.exports.MAGVFXEngine = MAGVFXEngine;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);
