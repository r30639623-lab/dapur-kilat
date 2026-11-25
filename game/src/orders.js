// orders.js — resep, pesanan, potong/panggang, sajikan, skor Dapur Kilat.
'use strict';

const ING = {
  roti: { name: 'Roti', prep: 'panggang', hint: 'klik → panggang' },
  selada: { name: 'Selada', prep: 'potong', hint: 'klik → potong' },
  tomat: { name: 'Tomat', prep: 'potong', hint: 'klik → potong' },
  keju: { name: 'Keju', prep: 'langsung', hint: 'klik → piring' },
};

const RECIPES = [
  { name: 'Burger Kilat', items: ['roti', 'selada', 'tomat', 'keju'] },
  { name: 'Sandwich Tomat', items: ['roti', 'tomat', 'keju'] },
  { name: 'Salad Segar', items: ['selada', 'tomat'] },
  { name: 'Roti Keju', items: ['roti', 'keju'] },
];

let orderId = 1;

function setMsg(G, s) {
  G.message = s;
  G.messageT = 3;
}

function spawnInterval(G) {
  return Math.max(5, 9 - Math.floor(G.elapsed / 30));
}

function orderTime(G) {
  return Math.max(22, 35 - Math.floor(G.elapsed / 45) * 2);
}

function newOrder(G) {
  const r = RECIPES[Math.floor(Math.random() * RECIPES.length)];
  const max = orderTime(G);
  return { id: orderId++, recipe: r, t: max, max: max, done: false, failed: false };
}

function updateOrders(G, dt) {
  G.spawnT -= dt;
  if (G.spawnT <= 0 && G.orders.length < 3) {
    G.orders.push(newOrder(G));
    G.spawnT = spawnInterval(G);
  }
  for (let i = G.orders.length - 1; i >= 0; i--) {
    const o = G.orders[i];
    o.t -= dt;
    if (o.t <= 0) {
      G.orders.splice(i, 1);
      G.missed++;
      G.combo = 0;
      setMsg(G, 'Pesanan hangus! Kombo reset.');
    }
  }
}

function addIngredient(G, kind) {
  const prep = ING[kind].prep;
  if (prep === 'potong') {
    if (G.cutting) { setMsg(G, 'Talenan masih dipakai!'); return; }
    G.cutting = { kind: kind, prog: 0, cutting: false };
    setMsg(G, ING[kind].name + ' di talenan — tekan POTONG / Spasi.');
  } else if (prep === 'panggang') {
    if (G.toasting) { setMsg(G, 'Kompor masih dipakai!'); return; }
    G.toasting = { kind: kind, prog: 0 };
    setMsg(G, 'Roti di kompor — tunggu sampai matang.');
  } else {
    if (G.plate.length >= 4) { setMsg(G, 'Piring penuh! Sajikan dulu.'); return; }
    G.plate.push({ kind: kind, prep: 'mentah' });
  }
}
function doCut(G) {
  if (!G.cutting || G.cutting.cutting) return;
  if (G.plate.length >= 4) { setMsg(G, 'Piring penuh! Sajikan dulu.'); return; }
  G.cutting.cutting = true;
  G.cutting.prog = 0;
}

function updatePrep(G, dt) {
  if (G.cutting && G.cutting.cutting) {
    G.cutting.prog += dt / 0.7;
    if (G.cutting.prog >= 1) {
      if (G.plate.length < 4) {
        G.plate.push({ kind: G.cutting.kind, prep: 'potong' });
        setMsg(G, ING[G.cutting.kind].name + ' sudah dipotong, masuk piring.');
        G.cutting = null;
      } else {
        G.cutting.prog = 1;
      }
    }
  }
  if (G.toasting) {
    G.toasting.prog += dt / 2.0;
    if (G.toasting.prog >= 1) {
      if (G.plate.length < 4) {
        G.plate.push({ kind: 'roti', prep: 'panggang' });
        setMsg(G, 'Roti matang, masuk piring.');
        G.toasting = null;
      } else {
        G.toasting.prog = 1;
      }
    }
  }
}

function sameItems(a, b) {
  if (a.length !== b.length) return false;
  const count = {};
  for (const k of a) count[k] = (count[k] || 0) + 1;
  for (const k of b) {
    if (!count[k]) return false;
    count[k]--;
  }
  return true;
}

function plateKinds(G) {
  return G.plate.map(p => p.kind);
}

function plateMatches(G) {
  const kinds = plateKinds(G);
  return G.orders.some(o => sameItems(kinds, o.recipe.items));
}

function tryServe(G) {
  if (G.plate.length === 0) { setMsg(G, 'Piring masih kosong!'); return; }
  const kinds = plateKinds(G);
  const idx = G.orders.findIndex(o => sameItems(kinds, o.recipe.items));
  if (idx >= 0) {
    const o = G.orders[idx];
    const pts = 100 + Math.ceil(o.t) * 2 + (G.combo >= 2 ? 50 : 0);
    G.score += pts;
    G.combo++;
    G.served++;
    G.orders.splice(idx, 1);
    G.plate = [];
    setMsg(G, o.recipe.name + ' disajikan! +' + pts + (G.combo >= 2 ? ' (kombo x' + G.combo + ')' : ''));
  } else {
    G.plate = [];
    G.combo = 0;
    setMsg(G, 'Tidak cocok dengan pesanan — piring dibersihkan.');
  }
}
function resetGame(G) {
  G.state = 'play';
  G.score = 0; G.combo = 0; G.served = 0; G.missed = 0;
  G.elapsed = 0; G.spawnT = 1.2;
  G.orders = []; G.plate = []; G.cutting = null; G.toasting = null;
  G.message = ''; G.messageT = 0;
}

// Preset demo untuk screenshot fase 2 (render asli kode game sendiri).
function demoPreset(G, kind) {
  resetGame(G);
  if (kind === 'cover') {
    G.state = 'menu';
    G.orders = [
      { id: 901, recipe: RECIPES[0], t: 28, max: 35, done: false, failed: false },
      { id: 902, recipe: RECIPES[2], t: 18, max: 30, done: false, failed: false },
    ];
  } else if (kind === 'rakit') {
    G.state = 'play';
    G.orders = [
      { id: 903, recipe: RECIPES[0], t: 24, max: 35, done: false, failed: false },
      { id: 904, recipe: RECIPES[1], t: 15, max: 30, done: false, failed: false },
    ];
    G.plate = [
      { kind: 'roti', prep: 'panggang' },
      { kind: 'selada', prep: 'potong' },
    ];
    G.score = 120; G.combo = 1; G.served = 1;
    setMsg(G, 'Rakit Burger Kilat: tambah tomat + keju!');
  } else if (kind === 'masak') {
    G.state = 'play';
    G.orders = [
      { id: 905, recipe: RECIPES[0], t: 20, max: 35, done: false, failed: false },
    ];
    G.cutting = { kind: 'tomat', prog: 0.6, cutting: true };
    G.toasting = { kind: 'roti', prog: 0.45 };
    G.plate = [{ kind: 'keju', prep: 'mentah' }];
    setMsg(G, 'Tomat dipotong, roti dipanggang…');
  } else if (kind === 'saji') {
    G.state = 'play';
    G.orders = [
      { id: 906, recipe: RECIPES[0], t: 26, max: 35, done: false, failed: false },
    ];
    G.plate = [
      { kind: 'roti', prep: 'panggang' },
      { kind: 'selada', prep: 'potong' },
      { kind: 'tomat', prep: 'potong' },
      { kind: 'keju', prep: 'mentah' },
    ];
    G.score = 340; G.combo = 2; G.served = 2;
    setMsg(G, 'Burger Kilat siap disajikan!');
  }
}
