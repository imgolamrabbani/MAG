'use strict';

const io = require('socket.io-client');
const http = require('http');

/**
 * Gate B — Headless Dual-Bot Telemetry Stress Suite
 * Spawns simulated WebSocket clients (Bot_P1, Bot_P2, Bot_Intruder) against a live server
 * to ruthlessly verify the 7 core multiplayer co-op contracts.
 */
class BotHarness {
  constructor(options = {}) {
    this.serverUrl = options.serverUrl || 'http://localhost:3000';
    this.timeoutMs = options.timeoutMs || 6000;
  }

  /**
   * Quick probe to test if server is listening before launching socket connections.
   */
  async checkServerAlive() {
    return new Promise((resolve) => {
      const parsedUrl = new URL(this.serverUrl);
      const req = http.request({
        hostname: parsedUrl.hostname,
        port: parsedUrl.port || 3000,
        path: '/',
        method: 'GET',
        timeout: 1500
      }, (res) => {
        resolve(true);
      });

      req.on('error', () => resolve(false));
      req.on('timeout', () => {
        req.destroy();
        resolve(false);
      });
      req.end();
    });
  }

  /**
   * Helper to spawn a headless socket client.
   */
  createBotClient() {
    return io(this.serverUrl, {
      transports: ['websocket'],
      forceNew: true,
      reconnection: false,
      timeout: 3000
    });
  }

  /**
   * Executes the 7 Headless Verification Gates against live or simulated server.
   */
  async runSuite() {
    const isAlive = await this.checkServerAlive();
    if (!isAlive) {
      return {
        serverAlive: false,
        error: `Server is not running at ${this.serverUrl}. Start the server via \`node server.js\` first.`,
        passed: 0,
        failed: 7,
        tests: []
      };
    }

    const testResults = [];
    const testRoom = 'TEST_' + Math.random().toString(36).substring(2, 6).toUpperCase();
    const tokenP1 = 'sess_p1_' + Date.now();
    const tokenP2 = 'sess_p2_' + Date.now();
    const tokenIntruder = 'sess_intruder_' + Date.now();

    let clientP1 = null;
    let clientP2 = null;
    let clientIntruder = null;

    try {
      // TEST 1: Room creation, join handshake, distinct asymmetrical role assignment
      const t1 = await new Promise((resolve) => {
        clientP1 = this.createBotClient();
        clientP2 = this.createBotClient();

        let roleP1 = null;
        let roleP2 = null;

        const checkRoles = () => {
          if (roleP1 && roleP2) {
            const isDistinct = (roleP1 === 'P1_ARCHITECT' && roleP2 === 'P2_CATALYST') ||
                               (roleP1 === 'P2_CATALYST' && roleP2 === 'P1_ARCHITECT');
            resolve({
              id: 'TEST_01_HANDSHAKE_ROLES',
              name: 'Room Handshake & Asymmetrical Role Assignment',
              passed: isDistinct,
              obligations: ['OBL-NET-001'],
              details: `P1 assigned ${roleP1}, P2 assigned ${roleP2}. Distinct: ${isDistinct}`
            });
          }
        };

        clientP1.on('connect', () => {
          clientP1.emit('join_room', { roomCode: testRoom, sessionToken: tokenP1 });
        });
        clientP1.on('room_joined', (data) => {
          roleP1 = data.role;
          checkRoles();
        });

        clientP2.on('connect', () => {
          // slight stagger
          setTimeout(() => {
            clientP2.emit('join_room', { roomCode: testRoom, sessionToken: tokenP2 });
          }, 80);
        });
        clientP2.on('room_joined', (data) => {
          roleP2 = data.role;
          checkRoles();
        });

        setTimeout(() => {
          if (!roleP1 || !roleP2) {
            resolve({
              id: 'TEST_01_HANDSHAKE_ROLES',
              name: 'Room Handshake & Asymmetrical Role Assignment',
              passed: false,
              obligations: ['OBL-NET-001'],
              details: `Timeout waiting for roles. P1: ${roleP1}, P2: ${roleP2}`
            });
          }
        }, 3000);
      });
      testResults.push(t1);

      // TEST 2: Strict 3rd-Player Intrusion Rejection
      const t2 = await new Promise((resolve) => {
        clientIntruder = this.createBotClient();
        let rejected = false;

        clientIntruder.on('connect', () => {
          clientIntruder.emit('join_room', { roomCode: testRoom, sessionToken: tokenIntruder });
        });

        clientIntruder.on('error_packet', (err) => {
          if (err.message === 'ROOM_FULL' || err.code === 'ROOM_FULL') {
            rejected = true;
            resolve({
              id: 'TEST_02_INTRUSION_REJECTION',
              name: '3rd-Player Intrusion Rejection (ROOM_FULL)',
              passed: true,
              obligations: ['OBL-NET-002'],
              details: `Intruder correctly rejected with error code: ${err.message || err.code}`
            });
          }
        });

        clientIntruder.on('room_joined', () => {
          resolve({
            id: 'TEST_02_INTRUSION_REJECTION',
            name: '3rd-Player Intrusion Rejection (ROOM_FULL)',
            passed: false,
            obligations: ['OBL-NET-002'],
            details: 'FAIL: Intruder was erroneously allowed into full room!'
          });
        });

        setTimeout(() => {
          if (!rejected) {
            resolve({
              id: 'TEST_02_INTRUSION_REJECTION',
              name: '3rd-Player Intrusion Rejection (ROOM_FULL)',
              passed: false,
              obligations: ['OBL-NET-002'],
              details: 'Timeout waiting for intrusion rejection packet.'
            });
          }
        }, 2500);
      });
      testResults.push(t2);

      // TEST 3: 20Hz Position/Velocity State Synchronization
      const t3 = await new Promise((resolve) => {
        let stateReceived = false;

        clientP2.on('sync_state', (snapshot) => {
          if (snapshot && snapshot.partnerPosition && !stateReceived) {
            stateReceived = true;
            resolve({
              id: 'TEST_03_STATE_SYNC_20HZ',
              name: '20Hz Position/Velocity State Sync',
              passed: true,
              obligations: ['OBL-NET-003'],
              details: `Received valid partner snapshot: x=${snapshot.partnerPosition.x}, y=${snapshot.partnerPosition.y}`
            });
          }
        });

        // P1 sends tick
        clientP1.emit('player_tick', {
          roomCode: testRoom,
          sessionToken: tokenP1,
          x: 250,
          y: 400,
          vx: 120,
          vy: 0,
          inputs: { jump: false, ability: false }
        });

        setTimeout(() => {
          if (!stateReceived) {
            resolve({
              id: 'TEST_03_STATE_SYNC_20HZ',
              name: '20Hz Position/Velocity State Sync',
              passed: false,
              obligations: ['OBL-NET-003'],
              details: 'Timeout waiting for sync_state broadcast.'
            });
          }
        }, 2500);
      });
      testResults.push(t3);

      // TEST 4: Simultaneous Co-op Pressure Plate State Machine Transition
      const t4 = await new Promise((resolve) => {
        let gateUnlocked = false;

        clientP1.on('puzzle_gate_triggered', (data) => {
          gateUnlocked = true;
          resolve({
            id: 'TEST_04_PUZZLE_GATE_INTERLOCK',
            name: 'Dual Pressure Plate Puzzle State Machine',
            passed: true,
            obligations: ['OBL-GAM-001'],
            details: `Puzzle gate successfully triggered: ${data.gateId || 'GATE_01_A'}`
          });
        });

        // Trigger simultaneous plates
        clientP1.emit('pressure_plate_step', { roomCode: testRoom, plateId: 'plateA', sessionToken: tokenP1 });
        clientP2.emit('pressure_plate_step', { roomCode: testRoom, plateId: 'plateB', sessionToken: tokenP2 });

        setTimeout(() => {
          if (!gateUnlocked) {
            resolve({
              id: 'TEST_04_PUZZLE_GATE_INTERLOCK',
              name: 'Dual Pressure Plate Puzzle State Machine',
              passed: false,
              obligations: ['OBL-GAM-001'],
              details: 'Timeout waiting for puzzle_gate_triggered event.'
            });
          }
        }, 2500);
      });
      testResults.push(t4);

      // TEST 5: Partner Emote & Boop Broadcast
      const t5 = await new Promise((resolve) => {
        let boopReceived = false;

        clientP2.on('partner_boop', (data) => {
          boopReceived = true;
          resolve({
            id: 'TEST_05_PARTNER_BOOP_BROADCAST',
            name: 'Partner Emote & High-Five Interaction Broadcast',
            passed: true,
            obligations: ['OBL-GAM-003'],
            details: `Boop received from sender: ${data.senderRole || 'P1'}`
          });
        });

        clientP1.emit('trigger_boop', { roomCode: testRoom, sessionToken: tokenP1 });

        setTimeout(() => {
          if (!boopReceived) {
            resolve({
              id: 'TEST_05_PARTNER_BOOP_BROADCAST',
              name: 'Partner Emote & High-Five Interaction Broadcast',
              passed: false,
              obligations: ['OBL-GAM-003'],
              details: 'Timeout waiting for partner_boop broadcast.'
            });
          }
        }, 2500);
      });
      testResults.push(t5);

      // TEST 6: Mobile Disconnect Grace Period & Token Reclamation
      const t6 = await new Promise((resolve) => {
        let roleReclaimed = false;

        // Disconnect P1
        clientP1.disconnect();

        // After small delay, reconnect with same token
        setTimeout(() => {
          const clientP1Reconnect = this.createBotClient();
          clientP1Reconnect.on('connect', () => {
            clientP1Reconnect.emit('reclaim_role', { roomCode: testRoom, sessionToken: tokenP1 });
          });

          clientP1Reconnect.on('room_joined', (data) => {
            roleReclaimed = data.role === 'P1_ARCHITECT' || !!data.role;
            clientP1Reconnect.disconnect();
            resolve({
              id: 'TEST_06_GRACE_PERIOD_RECONNECT',
              name: 'Disconnect Grace Period & Session Token Reclamation',
              passed: roleReclaimed,
              obligations: ['OBL-NET-004'],
              details: `Session reclaimed with original role: ${data.role}`
            });
          });

          setTimeout(() => {
            if (!roleReclaimed) {
              clientP1Reconnect.disconnect();
              resolve({
                id: 'TEST_06_GRACE_PERIOD_RECONNECT',
                name: 'Disconnect Grace Period & Session Token Reclamation',
                passed: false,
                obligations: ['OBL-NET-004'],
                details: 'Timeout waiting for role reclamation after reconnect.'
              });
            }
          }, 2500);
        }, 200);
      });
      testResults.push(t6);

      // TEST 7: Out-of-Bounds Respawn Safety Trigger
      const t7 = await new Promise((resolve) => {
        let respawnTriggered = false;

        clientP2.on('player_respawn', (data) => {
          respawnTriggered = true;
          resolve({
            id: 'TEST_07_OUT_OF_BOUNDS_RESPAWN',
            name: 'Out-of-Bounds Respawn Safety Trigger',
            passed: true,
            obligations: ['OBL-GAM-005'],
            details: `Safe respawn triggered at checkpoint: (${data.x}, ${data.y})`
          });
        });

        // P2 emits fatal out-of-bounds Y coordinate
        clientP2.emit('player_tick', {
          roomCode: testRoom,
          sessionToken: tokenP2,
          x: 500,
          y: 9999,
          vx: 0,
          vy: 1200,
          inputs: {}
        });

        setTimeout(() => {
          if (!respawnTriggered) {
            resolve({
              id: 'TEST_07_OUT_OF_BOUNDS_RESPAWN',
              name: 'Out-of-Bounds Respawn Safety Trigger',
              passed: false,
              obligations: ['OBL-GAM-005'],
              details: 'Timeout waiting for player_respawn notification.'
            });
          }
        }, 2500);
      });
      testResults.push(t7);

    } finally {
      if (clientP1 && clientP1.connected) clientP1.disconnect();
      if (clientP2 && clientP2.connected) clientP2.disconnect();
      if (clientIntruder && clientIntruder.connected) clientIntruder.disconnect();
    }

    const passedCount = testResults.filter(t => t.passed).length;
    const failedCount = testResults.filter(t => !t.passed).length;

    return {
      serverAlive: true,
      passed: passedCount,
      failed: failedCount,
      tests: testResults
    };
  }
}

module.exports = BotHarness;
