'use strict';
const { test, after } = require('node:test');
const assert = require('node:assert/strict');
const { io } = require('socket.io-client');
const { server } = require('../server');
const clients = [];
const event = (socket, name) => new Promise((resolve, reject) => {
  const timer = setTimeout(() => reject(new Error('Timeout: ' + name)), 2000);
  socket.once(name, data => { clearTimeout(timer); resolve(data); });
});
let port;
const ready = new Promise(resolve => server.listen(0, '127.0.0.1', () => { port = server.address().port; resolve(); }));
async function connect(room, token) {
  await ready;
  const socket = io('http://127.0.0.1:' + port, { transports: ['websocket'], forceNew: true });
  clients.push(socket);
  await event(socket, 'connect');
  socket.emit('join_room', { roomCode: room, sessionToken: token });
  return socket;
}
after(async () => {
  clients.forEach(c => c.disconnect());
  await new Promise(resolve => server.close(resolve));
});
test('two-role isolation, occupied-session protection, and finite telemetry', async () => {
  const first = await connect('UNIT_ROOM', 'unit_token_first');
  assert.equal((await event(first, 'room_joined')).role, 'P1_ARCHITECT');
  const duplicate = await connect('UNIT_ROOM', 'unit_token_first');
  assert.equal((await event(duplicate, 'error_packet')).code, 'SESSION_IN_USE');
  const second = await connect('UNIT_ROOM', 'unit_token_second');
  assert.equal((await event(second, 'room_joined')).role, 'P2_CATALYST');
  first.emit('player_tick', { x: null, y: 1, vx: 0, vy: 0 });
  const snapshot = await event(second, 'sync_state');
  assert.equal(snapshot.partnerPosition.x, 120);
  assert.ok(Number.isFinite(snapshot.partnerPosition.y));
  const stranger = await connect('UNIT_OTHER', 'unit_token_stranger');
  await event(stranger, 'room_joined');
  stranger.emit('pressure_plate_step', { roomCode: 'UNIT_ROOM', plateId: 'plateA' });
  const { rooms } = require('../server');
  assert.equal(rooms.get('UNIT_OTHER').players.get('unit_token_stranger').plate, null);
});
test('stage progression requires both players and gate completion', async () => {
  const a = await connect('UNIT_STAGES', 'stage_token_first');
  await event(a, 'room_joined');
  const b = await connect('UNIT_STAGES', 'stage_token_second');
  await event(b, 'room_joined');
  const tick = socket => socket.emit('player_tick', { x: 2280, y: 520, vx: 0, vy: 0 });
  tick(a); tick(b);
  a.emit('stage_complete'); b.emit('stage_complete');
  await new Promise(resolve => setTimeout(resolve, 70));
  const { rooms } = require('../server');
  assert.equal(rooms.get('UNIT_STAGES').stage, 0);
  const unlocked = event(a, 'puzzle_gate_triggered');
  a.emit('pressure_plate_step', { plateId: 'plateA' });
  b.emit('pressure_plate_step', { plateId: 'plateB' });
  assert.equal((await unlocked).gateId, 'GATE_01_A');
  const advanced = event(a, 'stage_complete');
  a.emit('stage_complete'); b.emit('stage_complete');
  assert.equal((await advanced).stage, 1);
});
