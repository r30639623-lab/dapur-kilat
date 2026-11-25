// kitchen.js — tata letak dapur + gambar dapur Dapur Kilat.
'use strict';

const LAYOUT = {
  board: { x: 8, y: 8, w: 1264, h: 104 },
  cardW: 250, cardH: 88, cardGap: 14,
  scoreBox: { x: 972, y: 16, w: 292, h: 88 },
  stove: { x: 60, y: 168, w: 280, h: 236 },
  cutBoard: { x: 470, y: 188, w: 340, h: 196 },
  plateArea: { x: 920, y: 168, w: 300, h: 236 },
  bins: [
    { kind: 'roti', x: 60, y: 500, w: 220, h: 150 },
    { kind: 'selada', x: 310, y: 500, w: 220, h: 150 },
    { kind: 'tomat', x: 560, y: 500, w: 220, h: 150 },
    { kind: 'keju', x: 810, y: 500, w: 220, h: 150 },
  ],
  cutBtn: { x: 520, y: 416, w: 240, h: 52 },
  serveBtn: { x: 950, y: 416, w: 240, h: 52 },
  msg: { x: 640, y: 692 },
};

function pointIn(r, x, y) {
  return x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;
}

function hitBin(x, y) {
  for (const b of LAYOUT.bins) {
    if (pointIn(b, x, y)) return b.kind;
  }
  return null;
}

function hitButton(x, y) {
  if (pointIn(LAYOUT.cutBtn, x, y)) return 'cut';
  if (pointIn(LAYOUT.serveBtn, x, y)) return 'serve';
  return null;
}

function drawKitchen(ctx, G) {
  // dinding + lantai dapur
  ctx.fillStyle = '#f4ead8';
  ctx.fillRect(0, 0, 1280, 470);
  ctx.fillStyle = '#8d6e63';
  ctx.fillRect(0, 470, 1280, 250);
  ctx.strokeStyle = 'rgba(0,0,0,.06)';
  ctx.lineWidth = 1;
  for (let x = 0; x < 1280; x += 80) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 470); ctx.stroke();
  }
  for (let y = 0; y < 470; y += 80) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(1280, y); ctx.stroke();
  }
  // papan pesanan
  rr(ctx, LAYOUT.board.x, LAYOUT.board.y, LAYOUT.board.w, LAYOUT.board.h, 12);
  ctx.fillStyle = '#3d405b';
  ctx.fill();
  txt(ctx, 'PAPAN PESANAN', 24, 30, 15, '#ffd166', 'left', true);
  let cx = 180;
  for (let i = 0; i < 3; i++) {
    const o = G.orders[i];
    if (o) {
      drawOrderCard(ctx, o, cx, 20, LAYOUT.cardW, LAYOUT.cardH);
    } else {
      rr(ctx, cx, 20, LAYOUT.cardW, LAYOUT.cardH, 10);
      ctx.fillStyle = 'rgba(255,255,255,.08)';
      ctx.fill();
      txt(ctx, 'menunggu pesanan…', cx + LAYOUT.cardW / 2, 64, 14, '#b8c0cc', 'center');
    }
    cx += LAYOUT.cardW + LAYOUT.cardGap;
  }
  // kotak skor
  rr(ctx, LAYOUT.scoreBox.x, LAYOUT.scoreBox.y, LAYOUT.scoreBox.w, LAYOUT.scoreBox.h, 10);
  ctx.fillStyle = '#22223b';
  ctx.fill();
  txt(ctx, 'SKOR  ' + G.score, LAYOUT.scoreBox.x + 16, LAYOUT.scoreBox.y + 24, 20, '#ffd166', 'left', true);
  txt(ctx, 'Kombo x' + G.combo + '   •   Saji: ' + G.served, LAYOUT.scoreBox.x + 16, LAYOUT.scoreBox.y + 56, 15, '#e8eaf6', 'left');
  // kompor
  rr(ctx, LAYOUT.stove.x, LAYOUT.stove.y, LAYOUT.stove.w, LAYOUT.stove.h, 12);
  ctx.fillStyle = '#37474f';
  ctx.fill();
  txt(ctx, 'KOMPOR', LAYOUT.stove.x + 16, LAYOUT.stove.y + 22, 15, '#eceff1', 'left', true);
  circle(ctx, LAYOUT.stove.x + 90, LAYOUT.stove.y + 120, 52, '#263238');
  circle(ctx, LAYOUT.stove.x + 190, LAYOUT.stove.y + 120, 52, '#263238');
  rr(ctx, LAYOUT.stove.x + 150, LAYOUT.stove.y + 92, 80, 56, 8);
  ctx.fillStyle = '#90a4ae';
  ctx.fill();
  if (G.toasting) {
    ctx.fillStyle = '#ff7043';
    ctx.beginPath();
    ctx.moveTo(LAYOUT.stove.x + 66, LAYOUT.stove.y + 122);
    ctx.lineTo(LAYOUT.stove.x + 90, LAYOUT.stove.y + 76);
    ctx.lineTo(LAYOUT.stove.x + 114, LAYOUT.stove.y + 122);
    ctx.closePath();
    ctx.fill();
    drawIngredient(ctx, 'roti', LAYOUT.stove.x + 90, LAYOUT.stove.y + 120, 64, 'panggang');
    drawTimerBar(ctx, LAYOUT.stove.x + 30, LAYOUT.stove.y + 190, 220, 12, G.toasting.prog);
  }
  // talenan
  rr(ctx, LAYOUT.cutBoard.x, LAYOUT.cutBoard.y, LAYOUT.cutBoard.w, LAYOUT.cutBoard.h, 12);
  ctx.fillStyle = '#d7ccc8';
  ctx.fill();
  txt(ctx, 'TALENAN', LAYOUT.cutBoard.x + 16, LAYOUT.cutBoard.y + 22, 15, '#5d4037', 'left', true);
  if (G.cutting) {
    const shown = G.cutting.cutting && G.cutting.prog > 0 ? 'potong' : 'mentah';
    drawIngredient(ctx, G.cutting.kind, LAYOUT.cutBoard.x + 170, LAYOUT.cutBoard.y + 100, 90, shown);
    if (G.cutting.cutting) {
      drawTimerBar(ctx, LAYOUT.cutBoard.x + 40, LAYOUT.cutBoard.y + 160, 260, 12, G.cutting.prog);
    } else {
      txt(ctx, 'tekan POTONG', LAYOUT.cutBoard.x + 170, LAYOUT.cutBoard.y + 165, 14, '#795548', 'center');
    }
  } else {
    txt(ctx, 'kosong — klik tomat / selada', LAYOUT.cutBoard.x + 170, LAYOUT.cutBoard.y + 100, 14, '#8d6e63', 'center');
  }
  // area piring rakitan
  rr(ctx, LAYOUT.plateArea.x, LAYOUT.plateArea.y, LAYOUT.plateArea.w, LAYOUT.plateArea.h, 12);
  ctx.fillStyle = '#eceff1';
  ctx.fill();
  txt(ctx, 'PIRING RAKITAN', LAYOUT.plateArea.x + 16, LAYOUT.plateArea.y + 22, 15, '#37474f', 'left', true);
  drawPlate(ctx, G.plate, LAYOUT.plateArea.x + 150, LAYOUT.plateArea.y + 150, 110);
  // 4 kotak bahan di meja bawah
  for (const b of LAYOUT.bins) {
    rr(ctx, b.x, b.y, b.w, b.h, 12);
    ctx.fillStyle = '#a1887f';
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#6d4c41';
    ctx.stroke();
    drawIngredient(ctx, b.kind, b.x + b.w / 2, b.y + 62, 84, 'mentah');
    txt(ctx, ING[b.kind].name, b.x + b.w / 2, b.y + 122, 17, '#ffffff', 'center', true);
    txt(ctx, ING[b.kind].hint, b.x + b.w / 2, b.y + 142, 11, '#ffe0b2', 'center');
  }
  // tombol
  drawButton(ctx, LAYOUT.cutBtn.x, LAYOUT.cutBtn.y, LAYOUT.cutBtn.w, LAYOUT.cutBtn.h, 'POTONG', !!G.cutting, false);
  drawButton(ctx, LAYOUT.serveBtn.x, LAYOUT.serveBtn.y, LAYOUT.serveBtn.w, LAYOUT.serveBtn.h, 'SAJIKAN', G.plate.length > 0, plateMatches(G));
  // pesan + sisa waktu
  if (G.message) {
    txt(ctx, G.message, LAYOUT.msg.x, LAYOUT.msg.y, 18, '#ffd166', 'center', true);
  }
  txt(ctx, 'Sisa waktu: ' + Math.max(0, Math.ceil(120 - G.elapsed)) + ' dtk', 1120, 692, 14, '#ffe0b2', 'center');
  if (G.state === 'menu') drawMenu(ctx, G);
  else if (G.state === 'over') drawOver(ctx, G);
}
function drawMenu(ctx, G) {
  ctx.fillStyle = 'rgba(20, 30, 40, 0.72)';
  ctx.fillRect(0, 0, 1280, 720);
  txt(ctx, 'DAPUR KILAT', 640, 220, 64, '#ffd166', 'center', true);
  txt(ctx, 'Game masak cepat — layani pesanan sebelum waktunya habis!', 640, 290, 20, '#ffffff', 'center');
  txt(ctx, '1. Klik bahan di meja bawah', 640, 350, 17, '#cfe3d8', 'center');
  txt(ctx, '2. Tomat & selada dipotong di talenan • Roti dipanggang di kompor', 640, 382, 17, '#cfe3d8', 'center');
  txt(ctx, '3. Rakit di piring, tekan SAJIKAN kalau cocok dengan pesanan', 640, 414, 17, '#cfe3d8', 'center');
  txt(ctx, 'Klik atau tekan Spasi untuk mulai', 640, 480, 22, '#ffd166', 'center', true);
}

function drawOver(ctx, G) {
  ctx.fillStyle = 'rgba(20, 30, 40, 0.78)';
  ctx.fillRect(0, 0, 1280, 720);
  txt(ctx, 'WAKTU HABIS!', 640, 240, 56, '#ffd166', 'center', true);
  txt(ctx, 'Skor akhir: ' + G.score, 640, 320, 26, '#ffffff', 'center', true);
  txt(ctx, 'Pesanan disajikan: ' + G.served + '   •   Hangus: ' + G.missed, 640, 370, 20, '#cfe3d8', 'center');
  txt(ctx, 'Tekan R atau klik untuk main lagi', 640, 440, 20, '#ffd166', 'center');
}
