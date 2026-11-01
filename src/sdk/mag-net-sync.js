/**
 * MAG (Master Autonomous Game-Replicator) - Network Sync & Snapshot Interpolation
 * Implements client-side entity interpolation buffer, 20Hz state broadcast,
 * latency ping tracking, and mobile session auto-recovery via localStorage.
 */
(function(root) {
  'use strict';

  class MAGNetSync {
    constructor() {
      this.socket = null;
      this.roomCode = null;
      this.role = null;
      this.playerId = null;
      this.sessionToken = null;
      this.latencyMs = 0;
      this.lastPingSent = 0;

      // Entity interpolation buffer
      this.remoteSnapshots = [];
      this.interpolationDelayMs = 70; // 70ms buffer to smooth over 50ms 20Hz ticks

      this.callbacks = {
        onRoomJoined: null,
        onPartnerJoined: null,
        onPartnerDisconnected: null,
        onStateUpdate: null,
        onPuzzleTrigger: null,
        onBoopReceived: null,
        onError: null
      };
    }

    /**
     * Initializes network connection, binds session token, and joins or creates room.
     */
    init(options = {}) {
      this.callbacks = { ...this.callbacks, ...options.callbacks };

      // Load or create persistent session identity
      this.sessionToken = localStorage.getItem('mag_session_token');
      if (!this.sessionToken) {
        this.sessionToken = 'sess_' + Math.random().toString(36).substring(2, 12);
        localStorage.setItem('mag_session_token', this.sessionToken);
      }

      // Check URL query parameters for room code
      const urlParams = new URLSearchParams(window.location.search);
      let queryRoom = urlParams.get('room');
      if (!queryRoom) {
        queryRoom = localStorage.getItem('mag_room_code') || this.generateRoomCode();
        urlParams.set('room', queryRoom);
        window.history.replaceState({}, '', `${window.location.pathname}?${urlParams.toString()}`);
      }
      this.roomCode = queryRoom.toUpperCase();
      localStorage.setItem('mag_room_code', this.roomCode);

      // Establish Socket.io connection
      const socketUrl = options.serverUrl || window.location.origin;
      if (typeof io !== 'undefined') {
        this.socket = io(socketUrl, {
          transports: ['websocket', 'polling'],
          reconnectionAttempts: 10,
          reconnectionDelay: 1000
        });
        this.bindSocketEvents();
      } else {
        console.warn('[MAGNet] Socket.io client not loaded in window. Operating in offline simulation mode.');
      }

      this.setupVisibilityRecovery();
      this.startPingLoop();
      return this;
    }

    generateRoomCode() {
      return Math.random().toString(36).substring(2, 6).toUpperCase();
    }

    /**
     * Binds all server network events and handshake protocols.
     */
    bindSocketEvents() {
      if (!this.socket) return;

      this.socket.on('connect', () => {
        console.log('[MAGNet] Connected to server socket:', this.socket.id);
        // Handshake: join or reclaim role in room
        this.socket.emit('join_room', {
          roomCode: this.roomCode,
          sessionToken: this.sessionToken
        });
      });

      this.socket.on('room_joined', (data) => {
        this.role = data.role; // P1_ARCHITECT or P2_CATALYST
        this.playerId = data.playerId;
        console.log(`[MAGNet] Successfully joined room [${this.roomCode}] as ${this.role}.`);
        if (this.callbacks.onRoomJoined) this.callbacks.onRoomJoined(data);
      });

      this.socket.on('partner_joined', (data) => {
        console.log('[MAGNet] Partner joined room:', data);
        if (this.callbacks.onPartnerJoined) this.callbacks.onPartnerJoined(data);
      });

      this.socket.on('partner_disconnected', (data) => {
        console.warn('[MAGNet] Partner disconnected (grace period active):', data);
        if (this.callbacks.onPartnerDisconnected) this.callbacks.onPartnerDisconnected(data);
      });

      // 20Hz state synchronization tick from server
      this.socket.on('sync_state', (snapshot) => {
        this.pushRemoteSnapshot(snapshot);
        if (this.callbacks.onStateUpdate) this.callbacks.onStateUpdate(snapshot);
      });

      this.socket.on('puzzle_gate_triggered', (data) => {
        if (this.callbacks.onPuzzleTrigger) this.callbacks.onPuzzleTrigger(data);
      });

      this.socket.on('partner_boop', (data) => {
        if (this.callbacks.onBoopReceived) this.callbacks.onBoopReceived(data);
      });

      this.socket.on('error_packet', (err) => {
        console.error('[MAGNet] Server error:', err.message);
        if (this.callbacks.onError) this.callbacks.onError(err);
      });

      this.socket.on('pong_response', (timestamp) => {
        this.latencyMs = Math.max(1, Date.now() - timestamp);
        if (window.MAGHud && window.MAGHud.setPing) {
          window.MAGHud.setPing(this.latencyMs);
        }
      });
    }

    /**
     * Mobile Visibility Change Handler (Auto-Reclaims session on tab-switch/unlock)
     */
    setupVisibilityRecovery() {
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          console.log('[MAGNet] App returned from background, verifying session connection...');
          if (this.socket && (!this.socket.connected || !this.role)) {
            this.socket.emit('reclaim_role', {
              roomCode: this.roomCode,
              sessionToken: this.sessionToken
            });
          }
        }
      });
    }

    /**
     * Ping Latency Monitor
     */
    startPingLoop() {
      setInterval(() => {
        if (this.socket && this.socket.connected) {
          this.socket.emit('ping_request', Date.now());
        }
      }, 2500);
    }

    /**
     * Stores incoming server snapshots into an interpolation buffer.
     */
    pushRemoteSnapshot(snapshot) {
      snapshot.localReceivedAt = Date.now();
      this.remoteSnapshots.push(snapshot);
      // Keep buffer bounded
      if (this.remoteSnapshots.length > 20) {
        this.remoteSnapshots.shift();
      }
    }

    /**
     * Computes smooth interpolated position for the remote partner using Linear Interpolation (lerp).
     */
    getInterpolatedPartnerPosition(currentServerTime = Date.now()) {
      if (this.remoteSnapshots.length === 0) return null;
      if (this.remoteSnapshots.length === 1) {
        return this.remoteSnapshots[0].partnerPosition;
      }

      const renderTime = currentServerTime - this.interpolationDelayMs;

      // Find the two surrounding snapshots
      for (let i = this.remoteSnapshots.length - 1; i >= 0; i--) {
        const s = this.remoteSnapshots[i];
        if (s.serverTimestamp <= renderTime) {
          const s0 = s;
          const s1 = this.remoteSnapshots[i + 1] || s;
          const timeDelta = Math.max(1, s1.serverTimestamp - s0.serverTimestamp);
          const t = Math.max(0, Math.min(1, (renderTime - s0.serverTimestamp) / timeDelta));

          if (!s0.partnerPosition || !s1.partnerPosition) return null;

          // Phaser.Math.Linear equivalent: a + (b - a) * t
          const lerpX = s0.partnerPosition.x + (s1.partnerPosition.x - s0.partnerPosition.x) * t;
          const lerpY = s0.partnerPosition.y + (s1.partnerPosition.y - s0.partnerPosition.y) * t;

          return {
            x: lerpX,
            y: lerpY,
            vx: s1.partnerPosition.vx,
            vy: s1.partnerPosition.vy
          };
        }
      }

      return this.remoteSnapshots[this.remoteSnapshots.length - 1].partnerPosition;
    }

    /**
     * Emits client position & input state to server at 20Hz.
     */
    emitClientState(x, y, vx, vy, inputs) {
      if (!this.socket || !this.socket.connected) return;

      this.socket.emit('player_tick', {
        roomCode: this.roomCode,
        sessionToken: this.sessionToken,
        x,
        y,
        vx,
        vy,
        inputs,
        clientTimestamp: Date.now()
      });
    }

    /**
     * Triggers co-op partner boop / emote event
     */
    emitPartnerBoop() {
      if (!this.socket || !this.socket.connected) return;
      this.socket.emit('trigger_boop', {
        roomCode: this.roomCode,
        sessionToken: this.sessionToken
      });
    }

    /**
     * Mathematical Hooke's Law Spring-Tether Constraint Solver Helper
     * F = -k * (dist - l0) - c * relVelocity
     */
    applyTetherConstraint(p1, p2, k = 0.045, c = 0.025, naturalLen = 150, maxLen = 340) {
      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const distance = Math.hypot(dx, dy);

      if (distance <= naturalLen) {
        return { fx1: 0, fy1: 0, fx2: 0, fy2: 0, tension: 0 };
      }

      const deltaX = distance - naturalLen;
      const nx = dx / distance;
      const ny = dy / distance;

      // Relative velocity projection
      const relVx = (p2.body ? p2.body.velocity.x : 0) - (p1.body ? p1.body.velocity.x : 0);
      const relVy = (p2.body ? p2.body.velocity.y : 0) - (p1.body ? p1.body.velocity.y : 0);
      const dampingForce = (relVx * nx + relVy * ny) * c;

      const springForce = deltaX * k + dampingForce;
      const tension = Math.min(springForce, 450);

      const fx = nx * tension * 60;
      const fy = ny * tension * 60;

      return {
        fx1: fx,
        fy1: fy,
        fx2: -fx,
        fy2: -fy,
        tension,
        isOverstretched: distance > maxLen
      };
    }
  }

  const instance = new MAGNetSync();

  if (typeof window !== 'undefined') {
    window.MAGNet = instance;
    window.MAGNetSync = MAGNetSync;
  }
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = instance;
    module.exports.MAGNetSync = MAGNetSync;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);
