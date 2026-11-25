// main.js — loop utama Dapur Kilat: state, input, demo hook.
'use strict';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const G = {
  state: 'menu', score: 0, combo: 0, served: 0, missed: 0,
  elapsed: 0, spawnT: 1.2,
  orders: [], plate: [], cutting: null, toasting: null,
  message: '', messageT: 0, floaters: [],
};

function startGame() {
  resetGame(G);
  G.state = 'play';
}

function update(dt) {
  if (G.state !== 'play') return;
  G.elapsed += dt;
  if (G.messageT > 0) {
    G.messageT -= dt;
    if (G.messageT <= 0) G.message = '';
  }
  for (let i = G.floaters.length - 1; i >= 0; i--) {
    const f = G.floaters[i];
    f.t -= dt;
    f.y -= 28 * dt;
    if (f.t <= 0) G.floaters.splice(i, 1);
  }
  updateOrders(G, dt);
  updatePrep(G, dt);
  if (G.elapsed >= 120) G.state = 'over';
}

function draw() {
  drawKitchen(ctx, G);
}

let last = 0;
function loop(t) {
  const dt = Math.min(0.05, (t - last) / 1000 || 0);
  last = t;
  update(dt);
  draw();
  requestAnimationFrame(loop);
}

function canvasPos(e) {
  const r = canvas.getBoundingClientRect();
  const sx = canvas.width / r.width;
  const sy = canvas.height / r.height;
  return { x: (e.clientX - r.left) * sx, y: (e.clientY - r.top) * sy };
}
canvas.addEventListener('click', (e) => {
  const p = canvasPos(e);
  if (G.state === 'menu' || G.state === 'over') { startGame(); return; }
  const btn = hitButton(p.x, p.y);
  if (btn === 'cut') { doCut(G); return; }
  if (btn === 'serve') { tryServe(G); return; }
  const kind = hitBin(p.x, p.y);
  if (kind) addIngredient(G, kind);
});

document.addEventListener('keydown', (e) => {
  if (e.code === 'Space') {
    e.preventDefault();
    if (G.state === 'menu' || G.state === 'over') startGame();
    else doCut(G);
  } else if (e.code === 'KeyS') {
    if (G.state === 'play') tryServe(G);
  } else if (e.code === 'KeyR') {
    if (G.state === 'over') startGame();
  } else if (e.code === 'Digit1') addIngredient(G, 'roti');
  else if (e.code === 'Digit2') addIngredient(G, 'selada');
  else if (e.code === 'Digit3') addIngredient(G, 'tomat');
  else if (e.code === 'Digit4') addIngredient(G, 'keju');
});

// Hook demo untuk screenshot fase 2: ?demo=cover|rakit|masak|saji
const demo = new URLSearchParams(location.search).get('demo');
if (demo) demoPreset(G, demo);

requestAnimationFrame(loop);
