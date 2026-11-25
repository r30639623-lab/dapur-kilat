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

function panelShadow(ctx, x, y, w, h) {
  rr(ctx, x + 3, y + 6, w, h, 12);
  ctx.fillStyle = 'rgba(0,0,0,.14)';
  ctx.fill();
}

// Panel seragam: bayangan + isi + garis tepi 3px warna garis palet, sudut 12.
function panel(ctx, x, y, w, h, fill) {
  panelShadow(ctx, x, y, w, h);
  rr(ctx, x, y, w, h, R_PANEL);
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.lineWidth = LINE_W;
  ctx.strokeStyle = PAL.line;
  ctx.stroke();
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
  // dinding ubin + meja dapur
  ctx.fillStyle = '#f4ead8';
  ctx.fillRect(0, 0, 1280, 470);
  ctx.fillStyle = 'rgba(190,160,120,.22)';
  for (let ty = 0; ty < 470; ty += 80) {
    for (let tx = 0; tx < 1280; tx += 80) {
      if (((tx + ty) / 80) % 2 === 0) ctx.fillRect(tx, ty, 80, 80);
    }
  }
  ctx.fillStyle = '#8d6e63';
  ctx.fillRect(0, 470, 1280, 250);
  ctx.fillStyle = '#a1887f';
  ctx.fillRect(0, 470, 1280, 10);
  ctx.fillStyle = 'rgba(0,0,0,.18)';
  ctx.fillRect(0, 480, 1280, 6);
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
  txt(ctx, 'PAPAN PESANAN', 24, 30, 16, '#ffd166', 'left', true);
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
  ctx.lineWidth = 2;
  ctx.strokeStyle = 'rgba(255,209,102,.35)';
  ctx.stroke();
  txt(ctx, 'SKOR  ' + G.score, LAYOUT.scoreBox.x + 16, LAYOUT.scoreBox.y + 24, 24, '#ffd166', 'left', true);
  ctx.strokeStyle = 'rgba(255,209,102,.35)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(LAYOUT.scoreBox.x + 16, LAYOUT.scoreBox.y + 44);
  ctx.lineTo(LAYOUT.scoreBox.x + LAYOUT.scoreBox.w - 16, LAYOUT.scoreBox.y + 44);
  ctx.stroke();
  txt(ctx, 'Kombo x' + G.combo + '   •   Saji: ' + G.served, LAYOUT.scoreBox.x + 16, LAYOUT.scoreBox.y + 64, 15, '#e8eaf6', 'left');
  // papan menu kecil + jam dinding (strip kosong y 112..168)
  rr(ctx, 368, 118, 92, 44, 6);
  ctx.fillStyle = '#fff8e7';
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#6d4c41';
  ctx.stroke();
  txt(ctx, 'MENU', 414, 141, 15, '#6d4c41', 'center', true);
  circle(ctx, 1216, 140, 20, '#fff8e7');
  ctx.strokeStyle = '#3d405b';
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.arc(1216, 140, 20, 0, Math.PI * 2); ctx.stroke();
  const ha = -Math.PI / 2 + (G.elapsed % 60) / 60 * Math.PI * 2;
  ctx.strokeStyle = '#333333';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(1216, 140);
  ctx.lineTo(1216 + Math.cos(ha) * 13, 140 + Math.sin(ha) * 13); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(1216, 140);
  ctx.lineTo(1216, 140 - 9); ctx.stroke();
  // rak dinding dengan toples — kedalaman latar (strip kosong y 112..168)
  rr(ctx, 520, 150, 360, 8, 4);
  ctx.fillStyle = '#6d4c41';
  ctx.fill();
  const jars = ['#e63946', '#57cc6a', '#ffd166'];
  for (let j = 0; j < 3; j++) {
    const jx = 560 + j * 130;
    rr(ctx, jx, 116, 46, 34, 8);
    ctx.fillStyle = jars[j];
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(0,0,0,.25)';
    ctx.stroke();
    circle(ctx, jx + 13, 128, 5, 'rgba(255,255,255,.45)');
  }
  // kompor
  panel(ctx, LAYOUT.stove.x, LAYOUT.stove.y, LAYOUT.stove.w, LAYOUT.stove.h, '#37474f');
  txt(ctx, 'KOMPOR', LAYOUT.stove.x + 16, LAYOUT.stove.y + 22, 16, '#eceff1', 'left', true);
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
    const st = (G.elapsed * 30) % 46;
    circle(ctx, LAYOUT.stove.x + 76, LAYOUT.stove.y - 6 - st, 9, 'rgba(255,255,255,.45)');
    circle(ctx, LAYOUT.stove.x + 104, LAYOUT.stove.y - 18 - ((st + 18) % 46), 7, 'rgba(255,255,255,.35)');
    circle(ctx, LAYOUT.stove.x + 90, LAYOUT.stove.y - 12 - ((st + 32) % 46), 6, 'rgba(255,255,255,.3)');
    circle(ctx, LAYOUT.stove.x + 118, LAYOUT.stove.y - 10 - ((st + 40) % 46), 8, 'rgba(255,255,255,.4)');
    ctx.strokeStyle = 'rgba(255,255,255,.35)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(LAYOUT.stove.x + 90, LAYOUT.stove.y - 8);
    ctx.quadraticCurveTo(LAYOUT.stove.x + 78, LAYOUT.stove.y - 30, LAYOUT.stove.x + 92, LAYOUT.stove.y - 48);
    ctx.stroke();
    drawIngredient(ctx, 'roti', LAYOUT.stove.x + 90, LAYOUT.stove.y + 120, 64, 'panggang');
    drawTimerBar(ctx, LAYOUT.stove.x + 30, LAYOUT.stove.y + 190, 220, 12, G.toasting.prog);
  }
  // talenan
  panel(ctx, LAYOUT.cutBoard.x, LAYOUT.cutBoard.y, LAYOUT.cutBoard.w, LAYOUT.cutBoard.h, '#d7ccc8');
  txt(ctx, 'TALENAN', LAYOUT.cutBoard.x + 16, LAYOUT.cutBoard.y + 22, 16, '#5d4037', 'left', true);
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
  // koki kecil di celah kompor-talenan
  drawChef(ctx, G);
  // area piring rakitan
  panel(ctx, LAYOUT.plateArea.x, LAYOUT.plateArea.y, LAYOUT.plateArea.w, LAYOUT.plateArea.h, '#eceff1');
  txt(ctx, 'PIRING RAKITAN', LAYOUT.plateArea.x + 16, LAYOUT.plateArea.y + 22, 16, '#37474f', 'left', true);
  drawPlate(ctx, G.plate, LAYOUT.plateArea.x + 150, LAYOUT.plateArea.y + 150, 110);
  // 4 kotak bahan di meja bawah
  for (const b of LAYOUT.bins) {
    panel(ctx, b.x, b.y, b.w, b.h, '#a1887f');
    const pop = (G.popKind === b.kind) ? 1 + 0.22 * Math.max(0, 1 - (G.elapsed - G.popAt) / 0.25) : 1;
    drawIngredient(ctx, b.kind, b.x + b.w / 2, b.y + 62, 84 * pop, 'mentah');
    txt(ctx, ING[b.kind].name, b.x + b.w / 2, b.y + 122, 17, '#ffffff', 'center', true);
    txt(ctx, ING[b.kind].hint, b.x + b.w / 2, b.y + 142, 12, '#ffe0b2', 'center');
  }
  // tombol
  drawButton(ctx, LAYOUT.cutBtn.x, LAYOUT.cutBtn.y, LAYOUT.cutBtn.w, LAYOUT.cutBtn.h, 'POTONG', !!G.cutting, false, G.pressBtn === 'cut' && (G.elapsed - G.pressAt) < 0.18);
  drawButton(ctx, LAYOUT.serveBtn.x, LAYOUT.serveBtn.y, LAYOUT.serveBtn.w, LAYOUT.serveBtn.h, 'SAJIKAN', G.plate.length > 0, plateMatches(G), G.pressBtn === 'serve' && (G.elapsed - G.pressAt) < 0.18);
  // teks skor melayang
  for (const f of G.floaters) {
    ctx.globalAlpha = Math.max(0, Math.min(1, f.t));
    ctx.font = 'bold 24px Verdana, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineWidth = 5;
    ctx.strokeStyle = 'rgba(90,40,0,.75)';
    ctx.strokeText(f.text, f.x, f.y);
    txt(ctx, f.text, f.x, f.y, 24, '#ffd166', 'center', true);
    ctx.globalAlpha = 1;
  }
  // pesan + sisa waktu
  if (G.message) {
    txtO(ctx, G.message, LAYOUT.msg.x, LAYOUT.msg.y, 18, '#ffd166', 'center', true);
  }
  txt(ctx, 'Sisa waktu: ' + Math.max(0, Math.ceil(120 - G.elapsed)) + ' dtk', 1120, 692, 14, '#ffe0b2', 'center', true);
  if (G.state === 'menu') drawMenu(ctx, G);
  else if (G.state === 'over') drawOver(ctx, G);
}
// Koki kecil berdiri di celah antara kompor dan talenan, di belakang meja.
function drawChef(ctx, G) {
  const cx = 407, base = 470;
  const bob = Math.sin(G.elapsed * 2) * 2;
  rr(ctx, cx - 35, base - 66 + bob, 70, 66, 12);
  ctx.fillStyle = '#f8f9fa';
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#cfd8dc';
  ctx.stroke();
  ctx.fillStyle = '#e63946';
  ctx.beginPath();
  ctx.moveTo(cx - 12, base - 62 + bob);
  ctx.lineTo(cx + 12, base - 62 + bob);
  ctx.lineTo(cx, base - 46 + bob);
  ctx.closePath();
  ctx.fill();
  circle(ctx, cx, base - 86 + bob, 23, '#f2c89b');
  ellipse(ctx, cx, base - 106 + bob, 30, 13, '#ffffff');
  circle(ctx, cx - 18, base - 106 + bob, 10, '#ffffff');
  circle(ctx, cx + 18, base - 106 + bob, 10, '#ffffff');
  rr(ctx, cx - 24, base - 104 + bob, 48, 8, 4);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  circle(ctx, cx - 8, base - 88 + bob, 2.5, '#333333');
  circle(ctx, cx + 8, base - 88 + bob, 2.5, '#333333');
  ctx.strokeStyle = '#8d6e63';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cx, base - 84 + bob, 7, Math.PI * 0.15, Math.PI * 0.85);
  ctx.stroke();
  ctx.strokeStyle = '#f8f9fa';
  ctx.lineWidth = 9;
  ctx.beginPath();
  ctx.moveTo(cx - 32, base - 52 + bob);
  ctx.lineTo(cx - 52, base - 30 + bob);
  ctx.stroke();
  rr(ctx, cx - 62, base - 34 + bob, 8, 22, 3);
  ctx.fillStyle = '#90a4ae';
  ctx.fill();
}

function drawMenu(ctx, G) {
  ctx.fillStyle = 'rgba(20, 30, 40, 0.72)';
  ctx.fillRect(0, 0, 1280, 720);
  txt(ctx, 'DAPUR KILAT', 640, 220, 64, '#ffd166', 'center', true);
  rr(ctx, 520, 252, 240, 6, 3);
  ctx.fillStyle = '#ffd166';
  ctx.fill();
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
