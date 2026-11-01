'use strict';

const { AGYNetP2P } = require('../sdk/agy-net-p2p');
const AGYVFX = require('../sdk/agy-vfx-pipeline');

/**
 * Antigravity MAG v2.0 — Gate B: Headless P2P Protocol, Verlet Physics & AI Companion Stress Suite
 * Executes 8 live runtime verification gates directly against the P2P & Physics SDK modules.
 */
class P2PBotHarness {
  async runSuite() {
    const tests = [];

    // Create two linked P2P instances + 1 intruder instance
    const hostP1 = new AGYNetP2P();
    const clientP2 = new AGYNetP2P();
    const intruderP3 = new AGYNetP2P();

    hostP1.sessionToken = 'tok_p1_host';
    clientP2.sessionToken = 'tok_p2_client';
    intruderP3.sessionToken = 'tok_p3_intruder';

    // Wire virtual P2P signaling/data bus between peers
    const peers = [hostP1, clientP2, intruderP3];
    for (const sender of peers) {
      sender.sendPacket = (payload) => {
        const pkt = { ...payload, senderToken: sender.sessionToken, serverTimestamp: Date.now() };
        for (const receiver of peers) {
          if (receiver !== sender) {
            receiver.handleIncomingPacket(pkt);
          }
        }
      };
    }

    // TEST 1: P2P Handshake & Distinct Asymmetrical Role Assignment
    hostP1.handleIncomingPacket({ type: 'HELLO_PROBE', senderToken: 'tok_p2_client' });
    const t1Passed = hostP1.role === 'P1_ARCHITECT' && clientP2.role === 'P2_CATALYST' && hostP1.isHumanPartnerConnected;
    tests.push({
      id: 'TEST_01_P2P_HANDSHAKE_ROLES',
      name: 'Serverless P2P Handshake & Asymmetrical Roles',
      passed: t1Passed,
      obligations: ['OBL-P2P-001', 'OBL-P2P-002'],
      details: `Host=${hostP1.role}, Client=${clientP2.role}, Connected=${hostP1.isHumanPartnerConnected}`
    });

    // TEST 2: 3rd-Peer Intrusion Guard (ROOM_FULL Rejection)
    let intruderRejected = false;
    intruderP3.callbacks.onError = (err) => {
      if (err && err.code === 'ROOM_FULL') intruderRejected = true;
    };
    hostP1.connectedPeers.add(clientP2.sessionToken);
    hostP1.handleIncomingPacket({ type: 'HELLO_PROBE', senderToken: intruderP3.sessionToken });
    tests.push({
      id: 'TEST_02_INTRUDER_ROOM_FULL',
      name: '3rd-Peer Intrusion Guard (ROOM_FULL Rejection)',
      passed: intruderRejected,
      obligations: ['OBL-P2P-003'],
      details: `Intruder rejected with ROOM_FULL: ${intruderRejected}`
    });

    // TEST 3: 30Hz Snapshot Interpolation Buffer
    hostP1.emitState(200, 500, 140, 0);
    hostP1.emitState(260, 480, 140, -20);
    const interp = clientP2.getInterpolatedPartner(Date.now());
    const t3Passed = !!interp && interp.x >= 200 && interp.x <= 260;
    tests.push({
      id: 'TEST_03_INTERPOLATION_LERP_30HZ',
      name: '30Hz Snapshot Interpolation Buffer (Lerp)',
      passed: t3Passed,
      obligations: ['OBL-P2P-004'],
      details: `Interpolated partner coords: (${interp ? interp.x.toFixed(1) : 'N/A'}, ${interp ? interp.y.toFixed(1) : 'N/A'})`
    });

    // TEST 4: Hooke's Law Spring-Tether Solver & Anchor Slingshot Multiplier
    const p1Mock = { x: 100, y: 500, vx: 0, vy: 0, isAnchored: true };
    const p2Mock = { x: 380, y: 500, vx: 50, vy: 0 };
    const tetherRes = hostP1.solveTetherPhysics(p1Mock, p2Mock);
    const t4Passed = tetherRes.tension > 0 && tetherRes.fx1 === 0 && tetherRes.fx2 < -100;
    tests.push({
      id: 'TEST_04_HOOKE_TETHER_AND_SLINGSHOT',
      name: 'Hooke\'s Law Tether Force & Anchor Slingshot Boost',
      passed: t4Passed,
      obligations: ['OBL-PHY-001', 'OBL-PHY-004'],
      details: `Tension=${tetherRes.tension.toFixed(2)}N, P1_Anchored_FX=${tetherRes.fx1}, P2_Slingshot_FX=${tetherRes.fx2.toFixed(1)}`
    });

    // TEST 5: 12-Node Verlet Rope Catenary Solver
    AGYVFX.initVerletRope(100, 400, 240, 400, 12);
    const nodes = AGYVFX.stepVerletRope({ x: 100, y: 400 }, { x: 240, y: 400 }, 155, 8);
    const midNode = nodes[6];
    const t5Passed = nodes.length === 12 && midNode.y > 400 && nodes[0].x === 100 && nodes[11].x === 240;
    tests.push({
      id: 'TEST_05_VERLET_12_NODE_CATENARY',
      name: '12-Node Verlet Catenary Rope Integration',
      passed: t5Passed,
      obligations: ['OBL-PHY-002', 'OBL-VIS-003'],
      details: `Nodes=${nodes.length}, MidNodeSagY=${midNode.y.toFixed(2)}px (>400px)`
    });

    // TEST 6: Autonomous Co-op AI Partner Plate-Seeking Behavior
    const aiStep = hostP1.computeAiPartnerStep(
      { x: 1020, y: 500 },
      { x: 1650, y: 500, body: { velocity: { x: 0, y: 0 } } },
      { plates: [{ x: 1030, y: 499 }, { x: 1900, y: 499 }], gateOpen: false }
    );
    const t6Passed = aiStep.state === 'SEEK_PLATE' && aiStep.vx > 0;
    tests.push({
      id: 'TEST_06_AI_COMPANION_PLATE_SEEK',
      name: 'Autonomous AI Partner Plate-Seeking Intelligence',
      passed: t6Passed,
      obligations: ['OBL-GAM-001'],
      details: `AI State=${aiStep.state}, VelocityX=${aiStep.vx.toFixed(1)} toward Plate B`
    });

    // TEST 7: Dual Pressure Plate Puzzle Sync & Partner Boop Broadcast
    let puzzleSynced = false;
    let boopSynced = false;
    clientP2.callbacks.onPuzzleSync = (ev) => {
      if (ev.action === 'GATE_UNLOCKED') puzzleSynced = true;
    };
    clientP2.callbacks.onBoop = () => {
      boopSynced = true;
    };
    hostP1.emitPuzzleEvent({ action: 'GATE_UNLOCKED' });
    hostP1.emitBoop();
    const t7Passed = puzzleSynced && boopSynced;
    tests.push({
      id: 'TEST_07_DUAL_PLATE_PUZZLE_SYNC',
      name: 'Co-op Gate Unlock & Partner Boop P2P Broadcast',
      passed: t7Passed,
      obligations: ['OBL-GAM-002', 'OBL-GAM-005'],
      details: `GateSynced=${puzzleSynced}, BoopSynced=${boopSynced}`
    });

    // TEST 8: Session Persistence & Reclaim Recovery
    hostP1.reclaimSession();
    const t8Passed = !!hostP1.sessionToken && hostP1.isHumanPartnerConnected;
    tests.push({
      id: 'TEST_08_SESSION_RECLAIM_RECOVERY',
      name: 'Mobile Visibility Session Token Reclamation',
      passed: t8Passed,
      obligations: ['OBL-P2P-005'],
      details: `Token=${hostP1.sessionToken}, SessionActive=${t8Passed}`
    });

    const passedCount = tests.filter(t => t.passed).length;
    return {
      passed: passedCount,
      failed: tests.length - passedCount,
      total: tests.length,
      tests
    };
  }
}

module.exports = P2PBotHarness;
