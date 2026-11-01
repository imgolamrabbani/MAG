'use strict';

/**
 * Deterministic Mechanic & Taxonomy Classifier and Deconstruction Engine
 * Maps natural language game metadata and genre tags into concrete mathematical game systems
 * and compiles at least 20 granular reconstruction obligations.
 */
class Deconstructor {
  constructor() {
    this.keywordTaxonomy = [
      'tether', 'magnet', 'hammer', 'nail', 'portal', 'cook', 'cipher', 'stealth',
      'rhythm', 'gravity', 'bounce', 'grapple', 'laser', 'clone', 'time', 'size',
      'vehicle', 'pressure plate', 'platformer', 'puzzle', 'co-op', 'speed',
      'spring', 'hazard', 'boss', 'switch', 'companion', 'shield', 'wire', 'light'
    ];
  }

  /**
   * Scans text for matching keywords and computes thematic weights.
   */
  extractThematicKeywords(fullText) {
    const textLower = fullText.toLowerCase();
    const detected = [];
    for (const kw of this.keywordTaxonomy) {
      if (textLower.includes(kw)) {
        detected.push(kw);
      }
    }
    return detected;
  }

  /**
   * Generates Physics Solver Profile based on detected mechanics.
   */
  buildPhysicsProfile(keywords, genres) {
    const hasBounce = keywords.includes('bounce') || keywords.includes('spring');
    const isFloaty = keywords.includes('gravity') || keywords.includes('portal') || genres.includes('Puzzle');
    const isFast = keywords.includes('speed') || keywords.includes('runner') || keywords.includes('rhythm');

    return {
      solverEngine: 'Phaser.Physics.Arcade + MAG Elastic Verlet Solver',
      gravity: {
        x: 0,
        y: isFloaty ? 750 : (isFast ? 1050 : 920)
      },
      terminalVelocity: {
        x: isFast ? 420 : 360,
        y: 850
      },
      coyoteTimeMs: 140,
      jumpBufferMs: 120,
      airDragCoefficient: 0.06,
      groundFriction: 0.22,
      hookesLawTether: {
        equation: 'F = -k * (x - l0) - c * v',
        springConstantK: 0.045,
        dampingConstantC: 0.025,
        naturalLength: 150,
        maxLength: 340,
        breakTensionThreshold: 480,
        slingshotBoostMultiplier: 1.85
      },
      collisionRestitution: {
        defaultPlatform: 0.0,
        bouncyPlatform: hasBounce ? 0.85 : 0.70,
        partnerCollision: 0.40
      }
    };
  }

  /**
   * Generates Visual & Shader Pipeline Profile.
   */
  buildVisualProfile(gameName, keywords) {
    // Generate harmonious thematic color palettes
    const isCyber = keywords.includes('laser') || keywords.includes('portal') || keywords.includes('cipher');
    const isWarmOrPlayful = keywords.includes('cook') || keywords.includes('hammer') || keywords.includes('nail') || gameName.toLowerCase().includes('takes two');

    const palette = isWarmOrPlayful
      ? {
          name: 'Playful Amber & Azure',
          primaryP1: '#FF9E1B',       // Warm Amber / Cody
          secondaryP2: '#00B0FF',     // Vivid Azure / May
          accentEnergy: '#76FF03',    // Electric Green
          backgroundDark: '#0D1117',  // Deep Midnight
          surfacePlatforms: '#21262D',// Sleek Charcoal
          hazardSpikes: '#FF1744',    // Laser Crimson
          tetherGlow: '#00E5FF',      // Neon Cyan
          textWhite: '#F0F6FC'
        }
      : (isCyber
        ? {
            name: 'Cyberpunk Neon Resonance',
            primaryP1: '#00E5FF',       // Cyan Pulse
            secondaryP2: '#D500F9',     // Neon Purple
            accentEnergy: '#00E676',    // Mint Light
            backgroundDark: '#0A0E17',  // Pitch Void
            surfacePlatforms: '#161B22',// Metallic Slate
            hazardSpikes: '#FF3D00',    // Plasma Orange
            tetherGlow: '#00E5FF',      // Cyan Energy
            textWhite: '#FFFFFF'
          }
        : {
            name: 'Universal Co-op Vibrant',
            primaryP1: '#2979FF',       // P1 Cobalt
            secondaryP2: '#FF3D00',     // P2 Coral Red
            accentEnergy: '#FFD600',    // Sunlight Yellow
            backgroundDark: '#0B0F19',  // Dark Indigo
            surfacePlatforms: '#1E293B',// Slate Base
            hazardSpikes: '#E11D48',    // Rose Hazard
            tetherGlow: '#38BDF8',      // Sky Blue
            textWhite: '#F8FAFC'
          });

    return {
      dominantPalette: palette,
      proceduralCanvasTextures: [
        { key: 'player_p1', type: 'AVATAR_CIRCULAR_GLOW', radius: 18, color: palette.primaryP1 },
        { key: 'player_p2', type: 'AVATAR_CIRCULAR_GLOW', radius: 18, color: palette.secondaryP2 },
        { key: 'platform_tile', type: 'BEVELED_RECTANGLE', width: 64, height: 24, color: palette.surfacePlatforms },
        { key: 'switch_plate_off', type: 'PRESSURE_PAD', width: 44, height: 12, color: '#4B5563' },
        { key: 'switch_plate_on', type: 'PRESSURE_PAD_ACTIVE', width: 44, height: 12, color: palette.accentEnergy },
        { key: 'energy_gate', type: 'FORCE_FIELD_EMITTER', width: 24, height: 120, color: palette.hazardSpikes },
        { key: 'particle_spark', type: 'RADIAL_BURST', radius: 6, color: palette.tetherGlow },
        { key: 'heart_emote', type: 'EMOTE_SHAPE', radius: 16, color: '#FF4081' }
      ],
      postFxPipeline: {
        bloom: { intensity: 1.15, blurSteps: 4 },
        vignette: { radius: 0.85, darkness: 0.35 },
        chromaticAberration: { trigger: 'ON_IMPACT', offsetPx: 3.5, durationMs: 140 }
      },
      particleEmitterCurves: {
        jumpDust: { count: 6, speed: { min: 20, max: 60 }, lifespan: 350 },
        tetherSnapSpark: { count: 18, speed: { min: 80, max: 220 }, lifespan: 450 },
        plateActivated: { count: 14, speed: { min: 40, max: 120 }, lifespan: 500 }
      },
      squashAndStretch: {
        jumpLaunch: { scaleX: 0.78, scaleY: 1.28, durationMs: 120 },
        groundLand: { scaleX: 1.32, scaleY: 0.72, durationMs: 140 },
        neutral: { scaleX: 1.0, scaleY: 1.0, durationMs: 100 }
      },
      parallaxDepthLayers: [
        { depth: 0.1, scrollFactor: 0.15, alpha: 0.35, description: 'Distant celestial nebula / architectural horizon' },
        { depth: 0.4, scrollFactor: 0.50, alpha: 0.65, description: 'Midground structural silhouettes and conduits' },
        { depth: 1.0, scrollFactor: 1.00, alpha: 1.00, description: 'Playfield collision surfaces & interactive actors' }
      ]
    };
  }

  /**
   * Generates Procedural WebAudio DSP Graph (Zero external MP3 reliance).
   */
  buildAudioDspProfile(gameName, keywords) {
    const isPlayful = gameName.toLowerCase().includes('takes two') || keywords.includes('cook');

    return {
      engine: 'WebAudio API Hardware Graph',
      masterGain: 0.85,
      soundBank: {
        jump: {
          oscillatorType: 'sine',
          frequencyStart: 180,
          frequencyEnd: 420,
          rampType: 'exponentialRampToValueAtTime',
          durationSec: 0.16,
          envelope: { attack: 0.01, decay: 0.05, sustain: 0.3, release: 0.10 }
        },
        land: {
          oscillatorType: 'triangle',
          frequencyStart: 120,
          frequencyEnd: 45,
          durationSec: 0.12,
          envelope: { attack: 0.005, decay: 0.04, sustain: 0.2, release: 0.075 },
          noiseBufferMix: 0.25
        },
        p1Ability: {
          oscillatorType: 'square',
          frequencyStart: 320,
          frequencyEnd: 640,
          biquadFilter: { type: 'bandpass', frequency: 800, Q: 3.5 },
          durationSec: 0.22,
          envelope: { attack: 0.02, decay: 0.08, sustain: 0.4, release: 0.12 }
        },
        p2Ability: {
          oscillatorType: 'sawtooth',
          frequencyStart: 580,
          frequencyEnd: 290,
          biquadFilter: { type: 'lowpass', frequency: 1200, Q: 2.0 },
          durationSec: 0.24,
          envelope: { attack: 0.01, decay: 0.09, sustain: 0.5, release: 0.14 }
        },
        tetherSnap: {
          oscillatorType: 'sawtooth',
          frequencyStart: 880,
          frequencyEnd: 110,
          durationSec: 0.35,
          envelope: { attack: 0.005, decay: 0.12, sustain: 0.1, release: 0.22 },
          noiseBufferMix: 0.40
        },
        switchActivate: {
          oscillatorType: 'triangle',
          arpeggioNotes: [440, 554.37, 659.25], // A Major chord triad
          noteDurationSec: 0.07,
          envelope: { attack: 0.005, decay: 0.05, sustain: 0.4, release: 0.06 }
        },
        gateOpen: {
          oscillatorType: 'sine',
          frequencyStart: 220,
          frequencyEnd: 880,
          durationSec: 0.65,
          envelope: { attack: 0.05, decay: 0.2, sustain: 0.6, release: 0.4 }
        },
        partnerBoop: {
          oscillatorType: 'sine',
          arpeggioNotes: [523.25, 659.25, 783.99, 1046.50], // C major arpeggio cheerful
          noteDurationSec: 0.055,
          envelope: { attack: 0.005, decay: 0.04, sustain: 0.3, release: 0.08 }
        },
        victoryFanfare: {
          oscillatorType: 'triangle',
          arpeggioNotes: [392, 523.25, 659.25, 783.99, 1046.5],
          noteDurationSec: 0.18,
          envelope: { attack: 0.02, decay: 0.1, sustain: 0.7, release: 0.3 }
        }
      },
      proceduralBgmSequencer: {
        tempoBpm: isPlayful ? 116 : 108,
        scale: isPlayful ? 'PENTATONIC_MAJOR' : 'DORIAN_CHILL_WAVE',
        rootFrequency: 220.0, // A3
        progression: [
          [220.0, 277.18, 329.63], // I
          [174.61, 220.0, 261.63], // VI
          [196.0, 246.94, 293.66], // VII
          [164.81, 196.0, 246.94]  // V
        ],
        subBassOscillator: 'sine',
        arpeggiatorOscillator: 'triangle',
        filterSweepCutoff: { min: 400, max: 2400, cyclePeriodSec: 16 }
      }
    };
  }

  /**
   * Generates Asymmetrical Co-op State Machine.
   */
  buildCoopStateMachine(gameName, keywords) {
    const isHammerNail = keywords.includes('hammer') || keywords.includes('nail') || gameName.toLowerCase().includes('takes two');
    const isMagnet = keywords.includes('magnet');

    let role1 = {
      roleId: 'P1_ARCHITECT',
      roleTitle: 'Kinetic Anchor / Builder',
      badgeColor: '#FF9E1B',
      primaryAbility: 'KINETIC_ANCHOR',
      description: 'Can ground in place to act as a solid fulcrum, retract the tether line, or deploy a magnetic kinetic platform for P2.',
      cooldownMs: 2200,
      auraColor: 'rgba(255, 158, 27, 0.4)'
    };

    let role2 = {
      roleId: 'P2_CATALYST',
      roleTitle: 'Resonance Catalyst / Explorer',
      badgeColor: '#00B0FF',
      primaryAbility: 'RESONANCE_PULSE',
      description: 'Can fire a high-frequency pulse that activates remote crystals, propels off P1 anchor, and extends jump trajectory.',
      cooldownMs: 1800,
      auraColor: 'rgba(0, 176, 255, 0.4)'
    };

    if (isHammerNail) {
      role1.roleTitle = 'Nail Slinger (May)';
      role1.primaryAbility = 'PIN_AND_TETHER';
      role1.description = 'Can pin moving obstacles in place and fire tension anchors to bridge vertical chasms.';
      role2.roleTitle = 'Hammer Basher (Cody)';
      role2.primaryAbility = 'SMASH_AND_SWING';
      role2.description = 'Can smash heavy obstacle buttons, swing from pinned nails, and launch Partner across hazards.';
    } else if (isMagnet) {
      role1.roleTitle = 'Positive Polarity (+)';
      role1.primaryAbility = 'MAGNETIC_REPULSE';
      role2.roleTitle = 'Negative Polarity (-)';
      role2.primaryAbility = 'MAGNETIC_ATTRACT';
    }

    return {
      roleP1: role1,
      roleP2: role2,
      synergyInteractions: [
        {
          name: 'Elastic Slingshot Launch',
          trigger: 'P1 Anchors while P2 runs past max tether length',
          result: 'P2 receives high-velocity horizontal momentum impulse'
        },
        {
          name: 'Simultaneous Pressure Interlock',
          trigger: 'Both players occupy matching pressure plates within 600ms',
          result: 'Permanent deactivation of barrier / Gate opens'
        },
        {
          name: 'Partner Emote & High-Five Boop',
          trigger: 'Button 4 press while within 120px radius',
          result: 'Floating heart animation, cheer chime, and momentary speed boost'
        },
        {
          name: 'Tension Warning Indicator',
          trigger: 'Tether stretch exceeds 85% max length',
          result: 'Tether flashes warning crimson, screen pulse, auditory tension hum'
        }
      ],
      antiGriefMechanics: {
        tetherBreakGracefulDisconnect: true,
        outOfBoundsAutoRespawnCheckpointMs: 650,
        tetherBreakTensionThreshold: 480
      }
    };
  }

  /**
   * Generates Multi-Stage Level Topology Directed Acyclic Graph (DAG).
   */
  buildLevelTopologyDag(gameName, keywords) {
    return {
      totalStages: 3,
      stages: [
        {
          stageId: 'STAGE_01_CALIBRATION',
          stageName: 'Stage 1: Calibration & The Elastic Bond',
          worldBounds: { width: 2400, height: 720 },
          spawnPoints: {
            p1: { x: 120, y: 520 },
            p2: { x: 200, y: 520 }
          },
          mechanicFocus: 'Movement calibration, multi-touch controls, and Hooke\'s law tether coordination.',
          puzzleGates: [
            {
              gateId: 'GATE_01_A',
              type: 'DUAL_PRESSURE_PLATE',
              position: { x: 1100, y: 480 },
              triggerConditions: ['p1_on_plate_A', 'p2_on_plate_B'],
              timeWindowMs: 800,
              unlocks: 'Barrier at x=1250 opens'
            }
          ],
          hazards: [
            { type: 'ABYSS_PIT', startX: 680, endX: 920, y: 690, respawnCheckpointId: 'CP_01' }
          ],
          checkpoints: [
            { id: 'CP_00', x: 150, y: 520 },
            { id: 'CP_01', x: 1050, y: 520 },
            { id: 'CP_GOAL', x: 2280, y: 520 }
          ]
        },
        {
          stageId: 'STAGE_02_SYNCHRONY',
          stageName: 'Stage 2: The Dual Synchronized Crucible',
          worldBounds: { width: 3200, height: 900 },
          spawnPoints: {
            p1: { x: 140, y: 700 },
            p2: { x: 220, y: 700 }
          },
          mechanicFocus: 'Asymmetrical role abilities: P1 anchors moving conveyor lift while P2 activates energy switches.',
          puzzleGates: [
            {
              gateId: 'GATE_02_A',
              type: 'TIMED_SEQUENCE_INTERLOCK',
              position: { x: 1400, y: 650 },
              triggerConditions: ['p1_kinetic_anchor_active', 'p2_resonance_crystal_hit'],
              timeWindowMs: 1200,
              unlocks: 'Ascending elevator platform active'
            },
            {
              gateId: 'GATE_02_B',
              type: 'TETHER_TENSION_SLINGSHOT_GAP',
              position: { x: 2200, y: 600 },
              triggerConditions: ['slingshot_impulse_achieved'],
              unlocks: 'Chasm bridge lowered'
            }
          ],
          hazards: [
            { type: 'PULSE_LASER_GRID', startX: 850, endX: 1150, cyclePeriodSec: 2.5 },
            { type: 'VOID_SPIKES', startX: 1800, endX: 2050, y: 880 }
          ],
          checkpoints: [
            { id: 'CP_02_START', x: 150, y: 700 },
            { id: 'CP_02_MID', x: 1550, y: 650 },
            { id: 'CP_02_GOAL', x: 3050, y: 650 }
          ]
        },
        {
          stageId: 'STAGE_03_CONVERGENCE_FINALE',
          stageName: 'Stage 3: The Convergence Core & Boss Finale',
          worldBounds: { width: 2800, height: 900 },
          spawnPoints: {
            p1: { x: 200, y: 720 },
            p2: { x: 300, y: 720 }
          },
          mechanicFocus: 'Climactic boss encounter requiring alternating anchor-tether whip attacks against the core.',
          bossEncounter: {
            name: 'The Entropy Overlord',
            healthStages: 3,
            phase1: 'Dodge shockwaves and stand on opposite flanking plates to expose boss power core',
            phase2: 'Slingshot partner through the vulnerable energy shield',
            phase3: 'Synchronized dual ability discharge for final victory sequence'
          },
          checkpoints: [
            { id: 'CP_03_ARENA', x: 400, y: 720 },
            { id: 'CP_03_VICTORY', x: 2600, y: 720 }
          ]
        }
      ]
    };
  }

  /**
   * Generates at least 20 granular Reconstruction Obligations.
   */
  generateObligations(gameName, physics, visual, audio, coop, levelDag) {
    const obligations = [
      // VISUAL OBLIGATIONS
      {
        obligationId: 'OBL-VIS-001',
        category: 'VISUAL',
        title: 'Procedural Texture Asset Generation',
        description: 'Implement procedural canvas texture generation in MAGVFX for P1, P2, platforms, switches, particles, and energy gates without external asset dependencies.',
        targetComponent: 'public/sdk/mag-vfx-shaders.js',
        verificationRule: {
          pattern: 'generateProceduralTextures.*createCanvas.*generateTexture',
          type: 'REGEX_PATTERN'
        },
        status: 'PENDING',
        evidence: null
      },
      {
        obligationId: 'OBL-VIS-002',
        category: 'VISUAL',
        title: 'Elastic Tether Bezier & Catenary Rendering',
        description: 'Implement dynamic elastic tether rendering with sagging catenary curve under low tension and straight taut line with color shifting under high tension.',
        targetComponent: 'public/sdk/mag-vfx-shaders.js',
        verificationRule: {
          pattern: 'renderElasticTether.*beginPath.*quadraticCurveTo|strokePath',
          type: 'REGEX_PATTERN'
        },
        status: 'PENDING',
        evidence: null
      },
      {
        obligationId: 'OBL-VIS-003',
        category: 'VISUAL',
        title: 'Camera Trauma & Impact Shake System',
        description: 'Provide an additive camera trauma and shake controller that decays trauma quadratically on heavy landings and hazard collisions.',
        targetComponent: 'public/sdk/mag-vfx-shaders.js',
        verificationRule: {
          pattern: 'triggerCameraTrauma.*shake',
          type: 'REGEX_PATTERN'
        },
        status: 'PENDING',
        evidence: null
      },
      {
        obligationId: 'OBL-VIS-004',
        category: 'VISUAL',
        title: 'Squash and Stretch Character Deformation',
        description: 'Implement procedural tween-based squash and stretch deformation matrices for jump launch and ground impact landing.',
        targetComponent: 'public/sdk/mag-vfx-shaders.js',
        verificationRule: {
          pattern: 'applySquashStretch.*scaleX.*scaleY',
          type: 'REGEX_PATTERN'
        },
        status: 'PENDING',
        evidence: null
      },
      {
        obligationId: 'OBL-VIS-005',
        category: 'VISUAL',
        title: 'Particle Burst & Emote FX',
        description: 'Provide particle burst emitter for footstep dust, tether snaps, gate activation, and floating partner heart/boop emotes.',
        targetComponent: 'public/sdk/mag-vfx-shaders.js',
        verificationRule: {
          pattern: 'spawnParticleBurst.*spawnFloatingHeartOrBoop',
          type: 'REGEX_PATTERN'
        },
        status: 'PENDING',
        evidence: null
      },

      // PHYSICS OBLIGATIONS
      {
        obligationId: 'OBL-PHY-001',
        category: 'PHYSICS',
        title: 'Hooke\'s Law Spring-Tether Constraint Solver',
        description: 'Enforce mathematical Hooke\'s Law spring force calculation (F = -k * deltaX - c * velocity) between P1 and P2 with maximum distance clamp.',
        targetComponent: 'src/sdk/mag-net-sync.js or public/game.js',
        verificationRule: {
          pattern: 'hooke|springConstantK|dampingConstantC|applyTetherConstraint',
          type: 'REGEX_PATTERN'
        },
        status: 'PENDING',
        evidence: null
      },
      {
        obligationId: 'OBL-PHY-002',
        category: 'PHYSICS',
        title: 'Coyote Time & Jump Buffer Windows',
        description: 'Implement 120ms+ coyote time grace period after falling off ledges and 100ms+ jump buffer queue before touching ground.',
        targetComponent: 'public/game.js',
        verificationRule: {
          pattern: 'coyoteTime|jumpBuffer',
          type: 'REGEX_PATTERN'
        },
        status: 'PENDING',
        evidence: null
      },
      {
        obligationId: 'OBL-PHY-003',
        category: 'PHYSICS',
        title: 'Dual Gravity & Terminal Velocity Clamping',
        description: 'Configure standard arcade gravity vector with terminal velocity clamping to prevent tunneling through thin platforms.',
        targetComponent: 'public/game.js',
        verificationRule: {
          pattern: 'setGravityY.*setMaxVelocity',
          type: 'REGEX_PATTERN'
        },
        status: 'PENDING',
        evidence: null
      },
      {
        obligationId: 'OBL-PHY-004',
        category: 'PHYSICS',
        title: 'Kinetic Slingshot Momentum Transfer',
        description: 'Calculate momentum transfer when one player anchors and the other swings around them, multiplying exit velocity.',
        targetComponent: 'public/game.js',
        verificationRule: {
          pattern: 'slingshot|momentum|tether.*boost',
          type: 'REGEX_PATTERN'
        },
        status: 'PENDING',
        evidence: null
      },

      // AUDIO OBLIGATIONS
      {
        obligationId: 'OBL-AUD-001',
        category: 'AUDIO',
        title: 'Zero-Asset WebAudio DSP Synthesizer Initialization',
        description: 'Initialize clean WebAudio API AudioContext with master gain node and browser autoplay unlocking.',
        targetComponent: 'public/sdk/mag-audio-dsp.js',
        verificationRule: {
          pattern: 'AudioContext.*createGain.*resume',
          type: 'REGEX_PATTERN'
        },
        status: 'PENDING',
        evidence: null
      },
      {
        obligationId: 'OBL-AUD-002',
        category: 'AUDIO',
        title: 'Procedural Jump and Land SFX Envelopes',
        description: 'Synthesize dynamic pitch sweeps for jump and noise-mixed decay envelopes for landing impacts without audio files.',
        targetComponent: 'public/sdk/mag-audio-dsp.js',
        verificationRule: {
          pattern: 'playJump.*playLand.*exponentialRampToValueAtTime',
          type: 'REGEX_PATTERN'
        },
        status: 'PENDING',
        evidence: null
      },
      {
        obligationId: 'OBL-AUD-003',
        category: 'AUDIO',
        title: 'Asymmetrical Role Ability Sound Synthesis',
        description: 'Implement distinct sound signatures for P1 ability (anchor/square wave) and P2 ability (catalyst/sawtooth wave).',
        targetComponent: 'public/sdk/mag-audio-dsp.js',
        verificationRule: {
          pattern: 'playP1Ability.*playP2Ability',
          type: 'REGEX_PATTERN'
        },
        status: 'PENDING',
        evidence: null
      },
      {
        obligationId: 'OBL-AUD-004',
        category: 'AUDIO',
        title: 'Procedural Background Music Arpeggiator',
        description: 'Provide an autonomous algorithmic chord progression and arpeggiator sequencer tailored to mood and BPM.',
        targetComponent: 'public/sdk/mag-audio-dsp.js',
        verificationRule: {
          pattern: 'startAmbientMusic.*progression|tempoBpm',
          type: 'REGEX_PATTERN'
        },
        status: 'PENDING',
        evidence: null
      },
      {
        obligationId: 'OBL-AUD-005',
        category: 'AUDIO',
        title: 'Interaction & Fanfare SFX (Boop, Snap, Victory)',
        description: 'Synthesize tether snap alerts, pressure switch chord triads, partner boop chimes, and victory fanfare.',
        targetComponent: 'public/sdk/mag-audio-dsp.js',
        verificationRule: {
          pattern: 'playTetherSnap.*playSwitchActivate.*playPartnerBoop.*playVictoryFanfare',
          type: 'REGEX_PATTERN'
        },
        status: 'PENDING',
        evidence: null
      },

      // NETWORK OBLIGATIONS
      {
        obligationId: 'OBL-NET-001',
        category: 'NETWORK',
        title: 'Room Creation and Asymmetrical Handshake',
        description: 'Enforce WebSocket server room lifecycle with exact 2-player capacity and distinct role assignments (P1_ARCHITECT vs P2_CATALYST).',
        targetComponent: 'server.js',
        verificationRule: {
          pattern: 'create_room|join_room.*P1_ARCHITECT.*P2_CATALYST',
          type: 'REGEX_PATTERN'
        },
        status: 'PENDING',
        evidence: null
      },
      {
        obligationId: 'OBL-NET-002',
        category: 'NETWORK',
        title: 'Strict 3rd-Player Intrusion Rejection',
        description: 'Server must reject any connection attempts to a full room with an explicit ROOM_FULL error packet.',
        targetComponent: 'server.js',
        verificationRule: {
          pattern: 'ROOM_FULL',
          type: 'REGEX_PATTERN'
        },
        status: 'PENDING',
        evidence: null
      },
      {
        obligationId: 'OBL-NET-003',
        category: 'NETWORK',
        title: '20Hz Fixed Physics Synchronization & Client Lerp',
        description: 'Server broadcasts world snapshots at 20Hz (50ms interval) with client-side linear interpolation buffer to eliminate jitter.',
        targetComponent: 'server.js + public/sdk/mag-net-sync.js',
        verificationRule: {
          pattern: '50|20Hz|sync_state|Linear|lerp',
          type: 'REGEX_PATTERN'
        },
        status: 'PENDING',
        evidence: null
      },
      {
        obligationId: 'OBL-NET-004',
        category: 'NETWORK',
        title: 'Mobile Disconnect Grace Period & Token Reclamation',
        description: 'Provide 30-second room retention grace period upon client disconnect and allow instant state/role reclamation via session token.',
        targetComponent: 'server.js + public/sdk/mag-net-sync.js',
        verificationRule: {
          pattern: 'gracePeriod|sessionToken|reclaim_role',
          type: 'REGEX_PATTERN'
        },
        status: 'PENDING',
        evidence: null
      },

      // MOBILE UX OBLIGATIONS
      {
        obligationId: 'OBL-MOB-001',
        category: 'MOBILE_UX',
        title: '3-Pointer Multi-Touch Controller Integration',
        description: 'Configure Phaser input with at least 3 active touch pointers to support simultaneous thumbstick steering and multi-button tapping.',
        targetComponent: 'public/sdk/mag-mobile-hud.js or public/game.js',
        verificationRule: {
          pattern: 'addPointer\\(3\\)|activePointers|pointer1.*pointer2',
          type: 'REGEX_PATTERN'
        },
        status: 'PENDING',
        evidence: null
      },
      {
        obligationId: 'OBL-MOB-002',
        category: 'MOBILE_UX',
        title: 'Virtual Analog Thumbstick with Deadzone Smoothing',
        description: 'Implement floating/fixed virtual joystick on left screen half with deadzone radius and normalized [x, y] output.',
        targetComponent: 'public/sdk/mag-mobile-hud.js',
        verificationRule: {
          pattern: 'virtualJoystick|deadzone|thumbstick',
          type: 'REGEX_PATTERN'
        },
        status: 'PENDING',
        evidence: null
      },
      {
        obligationId: 'OBL-MOB-003',
        category: 'MOBILE_UX',
        title: 'Ergonomic 4-Button Action Diamond',
        description: 'Provide responsive 4-button cluster (JUMP, ABILITY, TETHER, BOOP/EMOTE) on right screen half with visual down-states.',
        targetComponent: 'public/sdk/mag-mobile-hud.js',
        verificationRule: {
          pattern: 'actionButtons|btnJump|btnAbility|btnTether|btnBoop',
          type: 'REGEX_PATTERN'
        },
        status: 'PENDING',
        evidence: null
      },
      {
        obligationId: 'OBL-MOB-004',
        category: 'MOBILE_UX',
        title: 'Landscape Orientation Guard & 1-Tap Room Share',
        description: 'Implement orientation warning banner for portrait orientation and one-tap invite link copying to clipboard.',
        targetComponent: 'public/sdk/mag-mobile-hud.js',
        verificationRule: {
          pattern: 'orientationWarning|copyInviteLink|clipboard',
          type: 'REGEX_PATTERN'
        },
        status: 'PENDING',
        evidence: null
      },

      // GAMEPLAY LOOP OBLIGATIONS
      {
        obligationId: 'OBL-GAM-001',
        category: 'GAMEPLAY_LOOP',
        title: 'Dual-Player Synchronized Puzzle Gate State Machine',
        description: 'Enforce puzzle gate transition that opens only when both players depress corresponding pressure pads within timing tolerance.',
        targetComponent: 'server.js + public/game.js',
        verificationRule: {
          pattern: 'pressure_plate|puzzle_gate|plateA.*plateB',
          type: 'REGEX_PATTERN'
        },
        status: 'PENDING',
        evidence: null
      },
      {
        obligationId: 'OBL-GAM-002',
        category: 'GAMEPLAY_LOOP',
        title: 'Asymmetrical Role Mechanics Execution',
        description: 'Execute distinct character abilities in gameplay (P1 kinetic anchoring and P2 resonance pulse trigger).',
        targetComponent: 'public/game.js',
        verificationRule: {
          pattern: 'KINETIC_ANCHOR|RESONANCE_PULSE|roleId',
          type: 'REGEX_PATTERN'
        },
        status: 'PENDING',
        evidence: null
      },
      {
        obligationId: 'OBL-GAM-003',
        category: 'GAMEPLAY_LOOP',
        title: 'Partner Affection/Sabotage Interaction Event',
        description: 'Broadcast and display partner interaction event (boop/high-five emote) between clients with celebratory feedback.',
        targetComponent: 'server.js + public/game.js',
        verificationRule: {
          pattern: 'partner_boop|partner_emote',
          type: 'REGEX_PATTERN'
        },
        status: 'PENDING',
        evidence: null
      },
      {
        obligationId: 'OBL-GAM-004',
        category: 'GAMEPLAY_LOOP',
        title: 'Multi-Stage DAG Progression & Victory Condition',
        description: 'Implement stage progression logic advancing players through calibration, synchronized crucible, and core finale to victory.',
        targetComponent: 'public/game.js',
        verificationRule: {
          pattern: 'stage_complete|STAGE_01|STAGE_02|STAGE_03|VICTORY',
          type: 'REGEX_PATTERN'
        },
        status: 'PENDING',
        evidence: null
      },
      {
        obligationId: 'OBL-GAM-005',
        category: 'GAMEPLAY_LOOP',
        title: 'Out-of-Bounds Respawn Safety Trigger',
        description: 'Detect when either player falls below the world threshold and safely respawn both players at the active checkpoint.',
        targetComponent: 'server.js + public/game.js',
        verificationRule: {
          pattern: 'respawn|out_of_bounds|checkpoint',
          type: 'REGEX_PATTERN'
        },
        status: 'PENDING',
        evidence: null
      }
    ];

    return obligations;
  }

  /**
   * Main deconstruction entrypoint.
   * Compiles the raw dossier into a comprehensive game specification.
   */
  deconstruct(dossier) {
    const fullText = `${dossier.name} ${dossier.shortDescription} ${dossier.detailedDescription} ${(dossier.genres || []).join(' ')} ${(dossier.categories || []).join(' ')}`;
    const keywords = this.extractThematicKeywords(fullText);

    const physics = this.buildPhysicsProfile(keywords, dossier.genres || []);
    const visual = this.buildVisualProfile(dossier.name, keywords);
    const audio = this.buildAudioDspProfile(dossier.name, keywords);
    const coop = this.buildCoopStateMachine(dossier.name, keywords);
    const levelDag = this.buildLevelTopologyDag(dossier.name, keywords);
    const obligations = this.generateObligations(dossier.name, physics, visual, audio, coop, levelDag);

    return {
      schemaVersion: '1.0.0',
      timestamp: new Date().toISOString(),
      target: dossier.target,
      gameId: dossier.appId,
      gameTitle: dossier.name,
      source: dossier.source,
      detectedKeywords: keywords,
      taxonomyClassification: {
        genreVector: dossier.genres || ['Cooperative', 'Platformer', 'Puzzle'],
        primaryParadigm: 'Asymmetrical Cooperative Physical Sandbox',
        playerCount: 2,
        networkTopology: 'Authoritative WebSocket Relay with Client Interpolation'
      },
      subsystems: {
        physicsProfile: physics,
        visualProfile: visual,
        audioDspProfile: audio,
        asymmetricalCoop: coop,
        levelTopologyDag: levelDag
      },
      obligations
    };
  }
}

module.exports = Deconstructor;
