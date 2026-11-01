'use strict';

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { randomUUID } = require('crypto');
const path = require('path');
const ledger = require('./mag-ledger.json');
const stages = ledger.subsystems.levelTopologyDag.stages;
const app = express();
app.use(express.static(path.join(__dirname, 'public')));
app.get('/vendor/phaser.js', (_req, res) => res.sendFile(require.resolve('phaser/dist/phaser.min.js')));
app.get('/config', (_req, res) => res.json(ledger.subsystems));
const server = http.createServer(app);
const io = new Server(server);
const rooms = new Map();
const gracePeriod = 30000;
const roles = ['P1_ARCHITECT', 'P2_CATALYST'];
const failure = (socket, code) => socket.emit('error_packet', { code, message: code });

function spawn(room, role) {
  return { ...stages[room.stage].spawnPoints[role === roles[0] ? 'p1' : 'p2'], vx: 0, vy: 0 };
}
function state(room) {
  return { stage: room.stage, gates: [...room.gates], bossPhase: room.bossPhase, victory: room.victory };
}
function respawn(room) {
  for (const player of room.players.values()) {
    Object.assign(player, room.checkpoint ? { ...room.checkpoint, x: room.checkpoint.x + (player.role === roles[1] ? 70 : 0), vx: 0, vy: 0 } : spawn(room, player.role));
    player.plate = null;
    if (player.socketId) io.to(player.socketId).emit('player_respawn', { x: player.x, y: player.y });
  }
}
function unlock(room, id) {
  if (room.gates.has(id)) return;
  room.gates.add(id);
  io.to(room.code).emit('puzzle_gate_triggered', { gateId: id });
}
function authorize(socket, data) {
  const room = rooms.get(socket.data.roomCode);
  const player = room?.players.get(socket.data.token);
  return room && player && player.socketId === socket.id &&
    (!data.roomCode || data.roomCode === room.code) &&
    (!data.sessionToken || data.sessionToken === socket.data.token) ? { room, player } : null;
}
function join(socket, data = {}, reclaim = false) {
  const { roomCode, sessionToken } = data;
  if (typeof roomCode !== 'string' || !/^[A-Z0-9_]{4,16}$/.test(roomCode) ||
      typeof sessionToken !== 'string' || sessionToken.length < 8 || sessionToken.length > 160) return failure(socket, 'INVALID_SESSION');
  if (socket.data.roomCode && (socket.data.roomCode !== roomCode || socket.data.token !== sessionToken)) return failure(socket, 'ALREADY_JOINED');
  let room = rooms.get(roomCode);
  if (!room && reclaim) return failure(socket, 'SESSION_EXPIRED');
  if (!room) {
    if (rooms.size >= 500) return failure(socket, 'SERVER_FULL');
    room = { code: roomCode, stage: 0, players: new Map(), gates: new Set(), bossPhase: 0, victory: false, checkpoint: null };
    rooms.set(roomCode, room);
  }
  let player = room.players.get(sessionToken);
  if (player?.socketId && player.socketId !== socket.id) return failure(socket, 'SESSION_IN_USE');
  if (!player) {
    if (reclaim) return failure(socket, 'SESSION_EXPIRED');
    if (room.players.size >= 2) return failure(socket, 'ROOM_FULL');
    const role = roles.find(r => ![...room.players.values()].some(p => p.role === r));
    player = { role, playerId: randomUUID(), socketId: socket.id, cooldown: 0, boopAt: 0, abilityAt: 0, anchoredUntil: 0, plate: null, ready: false };
    Object.assign(player, spawn(room, role));
    room.players.set(sessionToken, player);
  }
  clearTimeout(player.expiry);
  player.socketId = socket.id;
  socket.data.roomCode = roomCode;
  socket.data.token = sessionToken;
  socket.join(roomCode);
  socket.emit('room_joined', { role: player.role, playerId: player.playerId, ...state(room), x: player.x, y: player.y });
  socket.to(roomCode).emit('partner_joined', { role: player.role });
}

io.on('connection', socket => {
  socket.on('join_room', data => join(socket, data));
  socket.on('reclaim_role', data => join(socket, data, true));
  socket.on('ping_request', timestamp => socket.emit('pong_response', timestamp));
  socket.on('player_tick', (data = {}) => {
    const auth = authorize(socket, data);
    if (!auth || !['x', 'y', 'vx', 'vy'].every(k => Number.isFinite(data[k]))) return;
    const { room, player } = auth;
    if (player.tickAt && Date.now() - player.tickAt < 25) return;
    player.tickAt = Date.now();
    const stage = stages[room.stage];
    if (data.y > stage.worldBounds.height + 80 || data.y < -500) return respawn(room);
    Object.assign(player, { x: Math.max(18, Math.min(stage.worldBounds.width - 18, data.x)), y: data.y, vx: Math.max(-666, Math.min(666, data.vx)), vy: Math.max(-850, Math.min(850, data.vy)) });
    const cp = stage.checkpoints.filter(c => c.x <= player.x && c.x < stage.worldBounds.width - 200).pop();
    if (cp && (!room.checkpoint || cp.x > room.checkpoint.x)) room.checkpoint = cp;
  });
  socket.on('pressure_plate_step', (data = {}) => {
    const auth = authorize(socket, data);
    if (!auth || !['plateA', 'plateB'].includes(data.plateId)) return;
    const { room, player } = auth;
    if (data.active === false) { player.plate = null; return; }
    player.plate = data.plateId;
    player.plateAt = Date.now();
    const ps = [...room.players.values()].filter(p => p.socketId);
    if (ps.length === 2 && ps[0].plate && ps[1].plate && ps[0].plate !== ps[1].plate && Math.abs(ps[0].plateAt - ps[1].plateAt) <= 800) {
      if (room.stage === 0) unlock(room, 'GATE_01_A');
      if (room.stage === 2 && room.bossPhase === 0) {
        room.bossPhase = 1;
        io.to(room.code).emit('world_update', state(room));
      }
    }
  });
  socket.on('use_ability', (data = {}) => {
    const auth = authorize(socket, data);
    if (!auth) return;
    const { room, player } = auth;
    if (Date.now() < player.cooldown) return;
    player.cooldown = Date.now() + (player.role === roles[0] ? 2200 : 1800);
    player.abilityAt = Date.now();
    if (player.role === roles[0]) player.anchoredUntil = Date.now() + 2200;
    const ps = [...room.players.values()];
    const synchronized = ps.length === 2 && ps.every(p => p.socketId && Date.now() - p.abilityAt < 1200);
    if (room.stage === 1 && synchronized && ps.every(p => Math.abs(p.x - 1400) < 250)) unlock(room, 'GATE_02_A');
    if (room.stage === 2 && room.bossPhase === 2 && synchronized && ps.every(p => Math.abs(p.x - 2100) < 300)) {
      room.bossPhase = 3;
      room.victory = true;
      io.to(room.code).emit('VICTORY', state(room));
    }
    io.to(room.code).emit('ability_used', { role: player.role, x: player.x, y: player.y });
  });
  socket.on('slingshot', (data = {}) => {
    const auth = authorize(socket, data);
    if (!auth) return;
    const { room, player } = auth;
    const partner = [...room.players.values()].find(p => p !== player && p.socketId);
    if (!partner || partner.anchoredUntil < Date.now() || Math.hypot(player.x - partner.x, player.y - partner.y) < 200) return;
    if (room.stage === 1 && room.gates.has('GATE_02_A') && player.x > 1900) unlock(room, 'GATE_02_B');
    if (room.stage === 2 && room.bossPhase === 1 && player.x > 1700) {
      room.bossPhase = 2;
      io.to(room.code).emit('world_update', state(room));
    }
  });
  socket.on('trigger_boop', (data = {}) => {
    const auth = authorize(socket, data);
    if (!auth) return;
    const { room, player } = auth;
    if (Date.now() - player.boopAt < 800) return;
    player.boopAt = Date.now();
    io.to(room.code).emit('partner_boop', { senderRole: player.role, x: player.x, y: player.y });
  });
  socket.on('stage_complete', (data = {}) => {
    const auth = authorize(socket, data);
    if (!auth) return;
    const { room, player } = auth;
    if (room.stage === 2 || player.x < stages[room.stage].worldBounds.width - 220) return;
    if (!stages[room.stage].puzzleGates.every(g => room.gates.has(g.gateId))) return;
    player.ready = true;
    if (room.players.size === 2 && [...room.players.values()].every(p => p.ready && p.socketId)) {
      room.stage++;
      room.checkpoint = null;
      for (const p of room.players.values()) { p.ready = false; p.plate = null; }
      respawn(room);
      io.to(room.code).emit('stage_complete', state(room));
    }
  });
  socket.on('disconnect', () => {
    const room = rooms.get(socket.data.roomCode);
    const player = room?.players.get(socket.data.token);
    if (!player || player.socketId !== socket.id) return;
    player.socketId = null;
    player.plate = null;
    socket.to(room.code).emit('partner_disconnected', { gracePeriod });
    player.expiry = setTimeout(() => {
      room.players.delete(socket.data.token);
      if (!room.players.size) rooms.delete(room.code);
    }, gracePeriod);
    player.expiry.unref();
  });
});
setInterval(() => {
  for (const room of rooms.values()) {
    for (const player of room.players.values()) {
      if (!player.socketId) continue;
      const partner = [...room.players.values()].find(p => p !== player && p.socketId);
      io.to(player.socketId).emit('sync_state', {
        ...state(room), serverTimestamp: Date.now(),
        partnerPosition: partner ? { x: partner.x, y: partner.y, vx: partner.vx, vy: partner.vy, anchored: partner.anchoredUntil > Date.now() } : null
      });
    }
  }
}, 50).unref();
if (require.main === module) server.listen(process.env.PORT || 3000, '0.0.0.0', () => console.log('MAG listening on port ' + (process.env.PORT || 3000)));
module.exports = { server, rooms };
