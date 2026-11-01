'use strict';

/**
 * Antigravity MAG v2.0 — Advanced Taxonomic Deconstructor & Obligation Compiler
 * Converts raw scraped game dossiers into a 6-subsystem mathematical engineering spec
 * and 30 verifiable obligations tailored for Serverless WebRTC P2P + GitHub Pages deployment.
 */
class DeconstructorV2 {
  constructor() {
    this.keywords = [
      'tether', 'chain', 'yarn', 'magnet', 'hammer', 'nail', 'portal', 'cook', 'cipher',
      'stealth', 'rhythm', 'gravity', 'bounce', 'grapple', 'laser', 'clone', 'time', 'size',
      'vehicle', 'pressure', 'platformer', 'puzzle', 'co-op', 'speed', 'spring', 'hazard',
      'boss', 'switch', 'companion', 'shield', 'wire', 'light', 'dash', 'parry', 'swing',
      'climb', 'lava', 'ice', 'conveyor', 'elevator'
    ];
  }

  extractKeywords(text) {
    const lower = (text || '').toLowerCase();
    return this.keywords.filter(kw => lower.includes(kw));
  }

  buildPhysicsProfile(keywords, genres) {
    const isClimbing = keywords.includes('climb') || keywords.includes('chain');
    const isFloaty = keywords.includes('gravity') || keywords.includes('portal') || keywords.includes('yarn');

    return {
      solverEngine: 'Phaser.Physics.Arcade + 12-Node Verlet Rope & Hooke Spring Solver',
      gravity: { x: 0, y: isFloaty ? 780 : (isClimbing ? 980 : 900) },
      terminalVelocity: { x: 380, y: 860 },
      coyoteTimeMs: 150,
      jumpBufferMs: 130,
      airDragCoefficient: 0.06,
      verletRopeNodes: 12,
      verletConstraintIterations: 6,
      hookesLawTether: {
        equation: 'F = -k * (dist - l0) - c * v_rel',
        springConstantK: 0.048,
        dampingConstantC: 0.026,
        naturalLength: 155,
        maxLength: 350,
        breakTensionThreshold: 500,
        slingshotImpulseMultiplier: 1.9
      }
    };
  }

  buildVisualProfile(gameName, keywords) {
    const lower = (gameName || '').toLowerCase();
    let palette = {
      name: 'Playful Amber & Azure',
      primaryP1: '#FF9E1B',
      secondaryP2: '#00B0FF',
      accentEnergy: '#00E676',
      bossCore: '#FF1744',
      backgroundDark: '#090D16',
      surfacePlatforms: '#1E293B',
      tetherGlow: '#38BDF8',
      textLight: '#F8FAFC'
    };

    if (lower.includes('chain') || keywords.includes('lava')) {
      palette = {
        name: 'Infernal Obsidian & Molten Gold',
        primaryP1: '#FF6D00',
        secondaryP2: '#FFD600',
        accentEnergy: '#00E5FF',
        bossCore: '#D50000',
        backgroundDark: '#120808',
        surfacePlatforms: '#2B1818',
        tetherGlow: '#FF9100',
        textLight: '#FFF8E1'
      };
    } else if (lower.includes('portal') || keywords.includes('laser')) {
      palette = {
        name: 'Aperture Cyan & Propulsion Orange',
        primaryP1: '#00E5FF',
        secondaryP2: '#FF6D00',
        accentEnergy: '#76FF03',
        bossCore: '#FF1744',
        backgroundDark: '#0A0F18',
        surfacePlatforms: '#1B2432',
        tetherGlow: '#00E5FF',
        textLight: '#FFFFFF'
      };
    } else if (lower.includes('unravel') || keywords.includes('yarn')) {
      palette = {
        name: 'Nordic Crimson & Cerulean Yarn',
        primaryP1: '#EF4444',
        secondaryP2: '#3B82F6',
        accentEnergy: '#FBBF24',
        bossCore: '#A855F7',
        backgroundDark: '#0B131E',
        surfacePlatforms: '#1E2D3D',
        tetherGlow: '#FDE047',
        textLight: '#F8FAFC'
      };
    }

    return {
      dominantPalette: palette,
      webglShaders: {
        bloomPostFX: { enabled: true, intensity: 1.25, threshold: 0.65 },
        chromaticAberration: { enabled: true, maxOffset: 0.0045 },
        vignetteScanline: { enabled: true, radius: 0.85, scanlineAlpha: 0.06 }
      },
      proceduralTextures: [
        'player_p1', 'player_p2', 'boss_core', 'platform_tile', 'moving_lift',
        'switch_plate_off', 'switch_plate_on', 'energy_gate', 'particle_spark', 'heart_emote'
      ],
      squashAndStretch: {
        jumpLaunch: { scaleX: 0.76, scaleY: 1.28, durationMs: 120 },
        groundLand: { scaleX: 1.32, scaleY: 0.72, durationMs: 140 }
      }
    };
  }

  buildAudioProfile(gameName, keywords) {
    return {
      engine: 'Polyphonic WebAudio DSP Studio + Algorithmic Convolution Reverb',
      reverbDecaySec: 1.4,
      soundPresets: [
        'jump', 'land', 'p1Ability', 'p2Ability', 'tetherSnap',
        'switchActivate', 'gateOpen', 'bossHit', 'partnerBoop', 'victoryFanfare'
      ],
      adaptiveSequencer: {
        tempoBpm: 114,
        tracks: ['SUB_BASS', 'ARPEGGIATOR', 'PAD_CHORDS', 'PERCUSSION_HIHAT'],
        dynamicStates: ['EXPLORATION', 'PUZZLE_TENSION', 'BOSS_FINALE']
      }
    };
  }

  buildCoopAndAiProfile(gameName, keywords) {
    const isHammerNail = keywords.includes('hammer') || keywords.includes('nail') || (gameName || '').toLowerCase().includes('takes two');

    return {
      networkArchitecture: 'Serverless WebRTC P2P DataChannel (PeerJS + STUN + BroadcastChannel Mirror + AI Autopilot)',
      roleP1: {
        roleId: 'P1_ARCHITECT',
        roleTitle: isHammerNail ? 'May (Kinetic Nail Anchor)' : 'Kinetic Architect (P1)',
        primaryAbility: 'KINETIC_ANCHOR_AND_TETHER_LOCK',
        cooldownMs: 1800,
        description: 'Anchors in place as a high-mass fulcrum for pendulum swings, deploys kinetic pads, and stabilizes tether.'
      },
      roleP2: {
        roleId: 'P2_CATALYST',
        roleTitle: isHammerNail ? 'Cody (Resonance Hammer Basher)' : 'Resonance Catalyst (P2)',
        primaryAbility: 'RESONANCE_DASH_AND_PULSE',
        cooldownMs: 1600,
        description: 'Executes mid-air impulse dash, shatters energy barriers, and triggers remote resonance switches.'
      },
      autonomousAiPartner: {
        enabledByDefaultWhenSolo: true,
        SeamlessHumanHandoverOnWebRtcConnect: true,
        behaviors: ['FOLLOW_PLAYER', 'SEEK_NEAREST_UNPRESSED_PLATE', 'AUTO_ANCHOR_NEAR_CHASM', 'ATTACK_BOSS_EXPOSED_CORE']
      }
    };
  }

  buildLevelDag(gameName) {
    return {
      totalStages: 3,
      stages: [
        {
          stageId: 'STAGE_01_CALIBRATION',
          stageName: `Stage 1: ${gameName} — Tether Calibration & Dual Plates`,
          width: 2400,
          height: 720,
          objective: 'Depress both Pressure Plates (A & B) simultaneously to drop the Force Gate and reach the Warp Conduit.',
          puzzles: ['DUAL_PRESSURE_INTERLOCK', 'CHASM_TETHER_SWING'],
          checkpointCount: 3
        },
        {
          stageId: 'STAGE_02_CRUCIBLE',
          stageName: `Stage 2: ${gameName} — Synchronized Kinetic Crucible`,
          width: 2600,
          height: 720,
          objective: 'Use Kinetic Anchor + Resonance Dash across moving lifts and dual security relays to unlock the Ascent Portal.',
          puzzles: ['MOVING_ELEVATOR_SYNC', 'HIGH_TENSION_SLINGSHOT'],
          checkpointCount: 3
        },
        {
          stageId: 'STAGE_03_BOSS_FINALE',
          stageName: `Stage 3: ${gameName} — The Convergence Core Boss Finale`,
          width: 2200,
          height: 720,
          objective: 'Stand on flanking Overload Pads to drop the Boss Core shield, then strike the Core with Ability Pulses (3 Health Phases).',
          puzzles: ['FLANKING_SHIELD_OVERLOAD', 'COOP_CORE_STRIKE_FINALE'],
          bossHealth: 100
        }
      ]
    };
  }

  generateObligations() {
    return [
      // VISUAL & SHADERS (5)
      {
        obligationId: 'OBL-VIS-001',
        category: 'VISUAL_SHADERS',
        title: '10-Asset Procedural High-DPI Canvas Texture Factory',
        description: 'Generate player_p1, player_p2, boss_core, platform_tile, moving_lift, switch plates, energy_gate, spark, and heart textures in canvas.',
        targetComponent: 'dist/sdk/agy-vfx-pipeline.js',
        verificationRule: { pattern: 'generateProceduralTextures.*player_p1.*boss_core.*energy_gate' },
        status: 'PENDING',
        evidence: null
      },
      {
        obligationId: 'OBL-VIS-002',
        category: 'VISUAL_SHADERS',
        title: 'Custom WebGL Post-FX Shader Pipeline (Bloom & Chromatic)',
        description: 'Implement WebGL fragment shader post-processing pipeline or glow/aberration FX controller.',
        targetComponent: 'dist/sdk/agy-vfx-pipeline.js',
        verificationRule: { pattern: 'BloomPostFX|fragmentShader|applyPostFXPipeline' },
        status: 'PENDING',
        evidence: null
      },
      {
        obligationId: 'OBL-VIS-003',
        category: 'VISUAL_SHADERS',
        title: 'Multi-Node Verlet Catenary Rope & Tension Renderer',
        description: 'Simulate and render a 12-node Verlet rope chain between P1 and P2 with tension color gradients.',
        targetComponent: 'dist/sdk/agy-vfx-pipeline.js',
        verificationRule: { pattern: 'renderVerletTether.*verletNodes' },
        status: 'PENDING',
        evidence: null
      },
      {
        obligationId: 'OBL-VIS-004',
        category: 'VISUAL_SHADERS',
        title: 'Squash-and-Stretch & Additive Camera Trauma',
        description: 'Provide tweened character deformation on jump/land and quadratic camera shake decay.',
        targetComponent: 'dist/sdk/agy-vfx-pipeline.js',
        verificationRule: { pattern: 'applySquashStretch.*triggerCameraTrauma' },
        status: 'PENDING',
        evidence: null
      },
      {
        obligationId: 'OBL-VIS-005',
        category: 'VISUAL_SHADERS',
        title: 'Multi-Layer Parallax Background & Particle Emitter',
        description: 'Render 3-depth scrolling parallax layers and procedural particle bursts + floating heart emotes.',
        targetComponent: 'dist/sdk/agy-vfx-pipeline.js',
        verificationRule: { pattern: 'createParallaxBackground.*spawnParticleBurst.*spawnFloatingEmote' },
        status: 'PENDING',
        evidence: null
      },

      // PHYSICS & VERLET SOLVER (5)
      {
        obligationId: 'OBL-PHY-001',
        category: 'PHYSICS_VERLET',
        title: 'Hooke\'s Law Spring & Damping Constraint Solver',
        description: 'Compute spring tension force F = -k * (dist - l0) - c * v_rel between tethered players.',
        targetComponent: 'dist/sdk/agy-net-p2p.js',
        verificationRule: { pattern: 'solveTetherPhysics.*springConstantK.*dampingConstantC' },
        status: 'PENDING',
        evidence: null
      },
      {
        obligationId: 'OBL-PHY-002',
        category: 'PHYSICS_VERLET',
        title: '12-Node Verlet Rope Integration & Relaxation',
        description: 'Run iterative distance constraint relaxation across intermediate rope nodes with gravity sag.',
        targetComponent: 'dist/sdk/agy-vfx-pipeline.js',
        verificationRule: { pattern: 'stepVerletRope.*iterations' },
        status: 'PENDING',
        evidence: null
      },
      {
        obligationId: 'OBL-PHY-003',
        category: 'PHYSICS_VERLET',
        title: 'Coyote Time & Jump Buffer Grace Windows',
        description: 'Enforce 150ms coyote ledge grace timer and 130ms pre-land jump input buffer.',
        targetComponent: 'dist/game.js',
        verificationRule: { pattern: 'coyoteTimer.*jumpBufferTimer' },
        status: 'PENDING',
        evidence: null
      },
      {
        obligationId: 'OBL-PHY-004',
        category: 'PHYSICS_VERLET',
        title: 'Anchor Fulcrum & Kinetic Slingshot Impulse',
        description: 'When P1 activates Kinetic Anchor, P1 mass locks and P2 receives a 1.9x slingshot boost.',
        targetComponent: 'dist/game.js',
        verificationRule: { pattern: 'isAnchored.*slingshotImpulse' },
        status: 'PENDING',
        evidence: null
      },
      {
        obligationId: 'OBL-PHY-005',
        category: 'PHYSICS_VERLET',
        title: 'Moving Platform Velocity Inheritance & Clamp',
        description: 'Configure arcade gravity, max velocity clamping, and moving elevator platform support.',
        targetComponent: 'dist/game.js',
        verificationRule: { pattern: 'setMaxVelocity.*movingPlatforms' },
        status: 'PENDING',
        evidence: null
      },

      // POLYPHONIC AUDIO DSP (5)
      {
        obligationId: 'OBL-AUD-001',
        category: 'AUDIO_POLY_DSP',
        title: 'Hardware WebAudio Graph & Algorithmic Convolution Reverb',
        description: 'Initialize AudioContext, master compressor/gain, and algorithmic impulse-response ConvolverNode.',
        targetComponent: 'dist/sdk/agy-audio-studio.js',
        verificationRule: { pattern: 'createConvolver.*buildImpulseResponse' },
        status: 'PENDING',
        evidence: null
      },
      {
        obligationId: 'OBL-AUD-002',
        category: 'AUDIO_POLY_DSP',
        title: 'Tactile Jump, Land & White-Noise Impact Envelopes',
        description: 'Synthesize exponential pitch-sweep jumps and low-pass filtered noise bursts on ground impact.',
        targetComponent: 'dist/sdk/agy-audio-studio.js',
        verificationRule: { pattern: 'playJump.*playLand.*exponentialRampToValueAtTime' },
        status: 'PENDING',
        evidence: null
      },
      {
        obligationId: 'OBL-AUD-003',
        category: 'AUDIO_POLY_DSP',
        title: 'Asymmetrical Role Ability & Boss Impact Synthesis',
        description: 'Synthesize distinct waveforms for P1 Anchor, P2 Resonance Dash, and Boss Core hits.',
        targetComponent: 'dist/sdk/agy-audio-studio.js',
        verificationRule: { pattern: 'playP1Ability.*playP2Ability.*playBossHit' },
        status: 'PENDING',
        evidence: null
      },
      {
        obligationId: 'OBL-AUD-004',
        category: 'AUDIO_POLY_DSP',
        title: '4-Track Adaptive Procedural Soundtrack Sequencer',
        description: 'Run a 4-track synthesizer (Sub-Bass, Arp, Pad, Hi-Hat) with dynamic state transitions (Exploration/Tension/Boss).',
        targetComponent: 'dist/sdk/agy-audio-studio.js',
        verificationRule: { pattern: 'startAdaptiveMusic.*setMusicIntensity' },
        status: 'PENDING',
        evidence: null
      },
      {
        obligationId: 'OBL-AUD-005',
        category: 'AUDIO_POLY_DSP',
        title: 'Puzzle Switch Triad, Gate Unlock & Victory Fanfare',
        description: 'Synthesize harmonic triads for pressure plates, sweeping chords for gates, and 5-note victory fanfare.',
        targetComponent: 'dist/sdk/agy-audio-studio.js',
        verificationRule: { pattern: 'playSwitchActivate.*playGateOpen.*playVictoryFanfare' },
        status: 'PENDING',
        evidence: null
      },

      // SERVERLESS WEBRTC P2P NETWORKING (5)
      {
        obligationId: 'OBL-P2P-001',
        category: 'WEBRTC_P2P_NET',
        title: 'Serverless WebRTC DataChannel P2P Engine (PeerJS + STUN)',
        description: 'Connect P1 Host and P2 Client directly over WebRTC DataChannels using deterministic room IDs without a backend server.',
        targetComponent: 'dist/sdk/agy-net-p2p.js',
        verificationRule: { pattern: 'Peer.*iceServers.*stun\\.l\\.google\\.com' },
        status: 'PENDING',
        evidence: null
      },
      {
        obligationId: 'OBL-P2P-002',
        category: 'WEBRTC_P2P_NET',
        title: 'BroadcastChannel Same-Device Dual-Tab Instant Mirror',
        description: 'Provide zero-latency BroadcastChannel transport alongside WebRTC so two browser tabs on one machine sync instantly.',
        targetComponent: 'dist/sdk/agy-net-p2p.js',
        verificationRule: { pattern: 'BroadcastChannel.*mag_p2p_' },
        status: 'PENDING',
        evidence: null
      },
      {
        obligationId: 'OBL-P2P-003',
        category: 'WEBRTC_P2P_NET',
        title: '3rd-Peer Intrusion Guard (ROOM_FULL Rejection)',
        description: 'Reject any 3rd connection attempt to an occupied 2-player P2P session with an explicit ROOM_FULL packet.',
        targetComponent: 'dist/sdk/agy-net-p2p.js',
        verificationRule: { pattern: 'ROOM_FULL' },
        status: 'PENDING',
        evidence: null
      },
      {
        obligationId: 'OBL-P2P-004',
        category: 'WEBRTC_P2P_NET',
        title: '30Hz Snapshot Interpolation Buffer (Hermite/Linear Lerp)',
        description: 'Buffer incoming P2P state frames and smoothly interpolate remote partner coordinates.',
        targetComponent: 'dist/sdk/agy-net-p2p.js',
        verificationRule: { pattern: 'getInterpolatedPartner.*remoteSnapshots' },
        status: 'PENDING',
        evidence: null
      },
      {
        obligationId: 'OBL-P2P-005',
        category: 'WEBRTC_P2P_NET',
        title: 'Session Token Persistence & Visibility Auto-Reconnect',
        description: 'Persist session identity in localStorage and automatically recover P2P link when returning from mobile background.',
        targetComponent: 'dist/sdk/agy-net-p2p.js',
        verificationRule: { pattern: 'visibilitychange.*reclaimSession' },
        status: 'PENDING',
        evidence: null
      },

      // MOBILE PWA & ERGONOMIC UX (5)
      {
        obligationId: 'OBL-MOB-001',
        category: 'MOBILE_PWA_UX',
        title: '4-Pointer Multi-Touch Input Registration',
        description: 'Register addPointer(4) in Phaser to handle simultaneous thumbstick, jump, ability, and tether actions.',
        targetComponent: 'dist/sdk/agy-mobile-pwa-hud.js',
        verificationRule: { pattern: 'addPointer\\(4\\)' },
        status: 'PENDING',
        evidence: null
      },
      {
        obligationId: 'OBL-MOB-002',
        category: 'MOBILE_PWA_UX',
        title: 'Floating/Fixed Virtual Analog Thumbstick with Deadzone',
        description: 'Implement left-screen virtual thumbstick with deadzone smoothing and normalized vector output.',
        targetComponent: 'dist/sdk/agy-mobile-pwa-hud.js',
        verificationRule: { pattern: 'joystick.*deadzone.*updateJoystickPosition' },
        status: 'PENDING',
        evidence: null
      },
      {
        obligationId: 'OBL-MOB-003',
        category: 'MOBILE_PWA_UX',
        title: '5-Button Ergonomic Action Cluster (Jump, Skill, Tether, Boop, AI Mode)',
        description: 'Render color-coded tactile touch buttons for Jump, Role Skill, Tether Lock, Partner Boop, and AI Call.',
        targetComponent: 'dist/sdk/agy-mobile-pwa-hud.js',
        verificationRule: { pattern: 'btnJump.*btnAbility.*btnTether.*btnBoop.*btnAiCommand' },
        status: 'PENDING',
        evidence: null
      },
      {
        obligationId: 'OBL-MOB-004',
        category: 'MOBILE_PWA_UX',
        title: 'In-Game Shareable Invite Modal + SVG QR Code Generator',
        description: 'Provide 1-tap Share Link button and procedural QR/Room Code overlay for instant mobile co-op pairing.',
        targetComponent: 'dist/sdk/agy-mobile-pwa-hud.js',
        verificationRule: { pattern: 'copyInviteLink.*showInviteModal' },
        status: 'PENDING',
        evidence: null
      },
      {
        obligationId: 'OBL-MOB-005',
        category: 'MOBILE_PWA_UX',
        title: 'Installable PWA Manifest & Offline Service Worker',
        description: 'Generate manifest.json and sw.js service worker for full-screen mobile home-screen installation.',
        targetComponent: 'dist/manifest.json + dist/sw.js',
        verificationRule: { pattern: 'standalone.*landscape|CACHE_NAME' },
        status: 'PENDING',
        evidence: null
      },

      // CO-OP AI COMPANION & 3-STAGE GAMEPLAY DAG (5)
      {
        obligationId: 'OBL-GAM-001',
        category: 'COOP_AI_AND_DAG',
        title: 'Autonomous Co-op AI Partner Bot with Seamless Human Handover',
        description: 'Provide an intelligent AI Partner controller for P2 when solo that automatically hands over control when a human joins via P2P.',
        targetComponent: 'dist/sdk/agy-net-p2p.js',
        verificationRule: { pattern: 'computeAiPartnerStep.*SEEK_PLATE.*FOLLOW' },
        status: 'PENDING',
        evidence: null
      },
      {
        obligationId: 'OBL-GAM-002',
        category: 'COOP_AI_AND_DAG',
        title: 'Simultaneous Dual Pressure Plate & Force-Gate State Machine',
        description: 'Open stage barrier gates only when Plate A and Plate B are depressed concurrently.',
        targetComponent: 'dist/game.js',
        verificationRule: { pattern: 'plateA.*plateB.*gateOpen' },
        status: 'PENDING',
        evidence: null
      },
      {
        obligationId: 'OBL-GAM-003',
        category: 'COOP_AI_AND_DAG',
        title: '3-Stage Level Topology DAG & Stage Transitions',
        description: 'Implement full progression across Stage 1 (Calibration), Stage 2 (Crucible), and Stage 3 (Boss Finale).',
        targetComponent: 'dist/game.js',
        verificationRule: { pattern: 'STAGE_01_CALIBRATION.*STAGE_02_CRUCIBLE.*STAGE_03_BOSS_FINALE' },
        status: 'PENDING',
        evidence: null
      },
      {
        obligationId: 'OBL-GAM-004',
        category: 'COOP_AI_AND_DAG',
        title: 'Multi-Phase Co-op Boss Encounter (Shield Overload & Core Strike)',
        description: 'Implement Stage 3 Boss with shield generators that require cooperative overload before damaging the Boss Core.',
        targetComponent: 'dist/game.js',
        verificationRule: { pattern: 'bossCore.*bossShieldDown.*bossHealth' },
        status: 'PENDING',
        evidence: null
      },
      {
        obligationId: 'OBL-GAM-005',
        category: 'COOP_AI_AND_DAG',
        title: 'Out-of-Bounds Checkpoint Respawn & Partner High-Five Boop',
        description: 'Safely respawn players at active checkpoints on hazard/abyss contact and broadcast partner heart boops.',
        targetComponent: 'dist/game.js',
        verificationRule: { pattern: 'respawnAtCheckpoint.*triggerPartnerBoop' },
        status: 'PENDING',
        evidence: null
      }
    ];
  }

  deconstruct(dossier) {
    const combinedText = `${dossier.name} ${dossier.shortDescription} ${dossier.detailedDescription} ${(dossier.genres || []).join(' ')} ${(dossier.categories || []).join(' ')}`;
    const detectedKeywords = this.extractKeywords(combinedText);

    const physics = this.buildPhysicsProfile(detectedKeywords, dossier.genres || []);
    const visual = this.buildVisualProfile(dossier.name, detectedKeywords);
    const audio = this.buildAudioProfile(dossier.name, detectedKeywords);
    const coop = this.buildCoopAndAiProfile(dossier.name, detectedKeywords);
    const levelDag = this.buildLevelDag(dossier.name);
    const obligations = this.generateObligations();

    return {
      schemaVersion: '2.0.0-ANTIGRAVITY',
      timestamp: new Date().toISOString(),
      target: dossier.target,
      gameId: dossier.appId,
      gameTitle: dossier.name,
      gameSlug: dossier.slug,
      shortDescription: dossier.shortDescription,
      source: dossier.source,
      detectedKeywords,
      hostingStrategy: {
        primary: 'GitHub Pages (100% Free Static CDN + Automated gh CLI Deploy)',
        alternatives: [
          'Cloudflare Pages (Unlimited Free Bandwidth via `npx wrangler pages deploy dist`)',
          'Surge.sh (`npx surge dist`)',
          'Vercel / Netlify Static Edge'
        ],
        multiplayerTransport: 'Serverless WebRTC P2P DataChannels (PeerJS Cloud Broker + Google/Twilio STUN + Local BroadcastChannel + AI Co-op Fallback)'
      },
      subsystems: {
        physicsProfile: physics,
        visualProfile: visual,
        audioProfile: audio,
        asymmetricalCoop: coop,
        levelTopologyDag: levelDag
      },
      obligations
    };
  }
}

module.exports = DeconstructorV2;
