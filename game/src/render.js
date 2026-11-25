// render.js — semua fungsi gambar Dapur Kilat (canvas 2D, bentuk + warna orisinal).
'use strict';

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function txt(ctx, s, x, y, size, color, align, bold) {
  ctx.fillStyle = color;
  ctx.font = (bold ? 'bold ' : '') + size + 'px Verdana, sans-serif';
  ctx.textAlign = align || 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(s, x, y);
}

function circle(ctx, x, y, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

function ellipse(ctx, x, y, rx, ry, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
}

// Gambar satu bahan. kind: roti|selada|tomat|keju. prep: 'mentah'|'potong'|'panggang'.
function drawIngredient(ctx, kind, x, y, s, prep) {
  if (kind === 'tomat') {
    if (prep === 'potong') {
      circle(ctx, x - s * 0.28, y, s * 0.42, '#e63946');
      circle(ctx, x + s * 0.28, y, s * 0.42, '#d62828');
      circle(ctx, x - s * 0.28, y, s * 0.30, '#ff7a85');
      circle(ctx, x + s * 0.28, y, s * 0.30, '#ff7a85');
      circle(ctx, x - s * 0.28, y, s * 0.16, '#ffd6da');
      circle(ctx, x + s * 0.28, y, s * 0.16, '#ffd6da');
      circle(ctx, x - s * 0.38, y - s * 0.08, s * 0.05, '#fff3e0');
      circle(ctx, x + s * 0.18, y + s * 0.08, s * 0.05, '#fff3e0');
    } else {
      circle(ctx, x, y, s * 0.52, '#c1121f');
      circle(ctx, x, y, s * 0.48, '#e63946');
      circle(ctx, x - s * 0.14, y - s * 0.16, s * 0.2, '#ff6b6b');
      circle(ctx, x - s * 0.2, y - s * 0.2, s * 0.07, '#ffe5e5');
      ctx.strokeStyle = '#2a9d8f';
      ctx.lineWidth = Math.max(2, s * 0.05);
      ctx.beginPath();
      ctx.moveTo(x, y - s * 0.46);
      ctx.lineTo(x, y - s * 0.62);
      ctx.stroke();
      ctx.fillStyle = '#2a9d8f';
      ctx.beginPath();
      ctx.moveTo(x, y - s * 0.44);
      ctx.lineTo(x - s * 0.24, y - s * 0.6);
      ctx.lineTo(x - s * 0.02, y - s * 0.5);
      ctx.closePath();
      ctx.moveTo(x, y - s * 0.44);
      ctx.lineTo(x + s * 0.24, y - s * 0.6);
      ctx.lineTo(x + s * 0.02, y - s * 0.5);
      ctx.closePath();
      ctx.fill();
    }
  } else if (kind === 'selada') {
    ellipse(ctx, x, y + s * 0.12, s * 0.42, s * 0.2, '#2d7a3e');
    ellipse(ctx, x - s * 0.22, y + s * 0.05, s * 0.34, s * 0.22, '#43aa5b');
    ellipse(ctx, x + s * 0.22, y + s * 0.05, s * 0.34, s * 0.22, '#57cc6a');
    ellipse(ctx, x, y - s * 0.12, s * 0.36, s * 0.24, '#74d97e');
    ellipse(ctx, x, y - s * 0.1, s * 0.2, s * 0.12, '#a7f3b0');
    ctx.strokeStyle = '#2d7a3e';
    ctx.lineWidth = Math.max(2, s * 0.04);
    ctx.beginPath();
    ctx.moveTo(x - s * 0.3, y - s * 0.18);
    ctx.quadraticCurveTo(x, y + s * 0.05, x + s * 0.3, y - s * 0.18);
    ctx.stroke();
    if (prep === 'potong') {
      ctx.strokeStyle = '#2d7a3e';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x - s * 0.4, y);
      ctx.lineTo(x + s * 0.4, y);
      ctx.stroke();
    }
  } else if (kind === 'roti') {
    const crust = prep === 'panggang' ? '#8a5a2b' : '#c98a4b';
    const inner = prep === 'panggang' ? '#e8b06a' : '#f6d9a0';
    ellipse(ctx, x, y + s * 0.42, s * 0.42, s * 0.08, 'rgba(0,0,0,.18)');
    rr(ctx, x - s * 0.45, y - s * 0.4, s * 0.9, s * 0.8, s * 0.18);
    ctx.fillStyle = crust;
    ctx.fill();
    rr(ctx, x - s * 0.34, y - s * 0.29, s * 0.68, s * 0.58, s * 0.12);
    ctx.fillStyle = inner;
    ctx.fill();
    ellipse(ctx, x - s * 0.18, y - s * 0.18, s * 0.07, s * 0.04, '#fff3d6');
    ellipse(ctx, x + s * 0.08, y - s * 0.24, s * 0.07, s * 0.04, '#fff3d6');
    ellipse(ctx, x + s * 0.2, y - s * 0.1, s * 0.07, s * 0.04, '#fff3d6');
    if (prep === 'panggang') {
      ctx.strokeStyle = '#7a4a1f';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x - s * 0.25, y - s * 0.2);
      ctx.lineTo(x + s * 0.25, y + s * 0.2);
      ctx.moveTo(x + s * 0.25, y - s * 0.2);
      ctx.lineTo(x - s * 0.25, y + s * 0.2);
      ctx.stroke();
    }
  } else if (kind === 'keju') {
    ellipse(ctx, x, y + s * 0.34, s * 0.4, s * 0.07, 'rgba(0,0,0,.15)');
    ctx.fillStyle = '#ffd166';
    ctx.beginPath();
    ctx.moveTo(x - s * 0.45, y + s * 0.3);
    ctx.lineTo(x + s * 0.45, y + s * 0.3);
    ctx.lineTo(x + s * 0.45, y - s * 0.25);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#e9a13b';
    ctx.lineWidth = Math.max(2, s * 0.04);
    ctx.beginPath();
    ctx.moveTo(x - s * 0.45, y + s * 0.3);
    ctx.lineTo(x + s * 0.45, y - s * 0.25);
    ctx.stroke();
    circle(ctx, x - s * 0.1, y + s * 0.08, s * 0.09, '#f4a71d');
    circle(ctx, x + s * 0.2, y + s * 0.12, s * 0.07, '#f4a71d');
    circle(ctx, x + s * 0.05, y - s * 0.08, s * 0.06, '#f4a71d');
    circle(ctx, x - s * 0.28, y + s * 0.14, s * 0.05, '#f4a71d');
    circle(ctx, x + s * 0.3, y - s * 0.1, s * 0.05, '#ffdf8e');
  }
}

// Piring putih + isi rakitan di atasnya.
function drawPlate(ctx, items, x, y, r) {
  ellipse(ctx, x, y + r * 0.1, r * 1.02, r * 0.34, 'rgba(0,0,0,.14)');
  ellipse(ctx, x, y, r, r * 0.32, '#f8f9fa');
  ellipse(ctx, x, y, r * 0.82, r * 0.24, '#dee2e6');
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(x, y, r * 0.94, r * 0.29, 0, Math.PI * 1.15, Math.PI * 1.85);
  ctx.stroke();
  const kinds = items.map(function (it) { return it.kind; });
  const full = items.length === 4 && ['roti', 'selada', 'tomat', 'keju'].every(function (k) { return kinds.indexOf(k) >= 0; });
  if (full) { drawBurger(ctx, x, y); return; }
  if (items.length === 0) {
    txt(ctx, 'piring kosong', x, y - 6, 15, '#8a97a3', 'center');
    return;
  }
  let ox = x - (items.length - 1) * 26;
  for (const it of items) {
    drawIngredient(ctx, it.kind, ox, y - 18, 44, it.prep);
    ox += 52;
  }
}

// Burger lengkap berlapis: roti bawah, keju meleleh, tomat, selada, roti atas.
function drawBurger(ctx, x, y) {
  ellipse(ctx, x, y + 18, 48, 11, '#c98a4b');
  ellipse(ctx, x, y + 17, 44, 9, '#f6d9a0');
  ellipse(ctx, x, y + 8, 48, 8, '#ffd166');
  circle(ctx, x - 26, y + 14, 5, '#ffd166');
  circle(ctx, x + 6, y + 15, 5, '#ffd166');
  circle(ctx, x + 28, y + 14, 5, '#ffd166');
  circle(ctx, x - 18, y - 2, 13, '#e63946');
  circle(ctx, x + 18, y - 2, 13, '#d62828');
  circle(ctx, x - 18, y - 2, 8, '#ff7a85');
  circle(ctx, x + 18, y - 2, 8, '#ff7a85');
  ellipse(ctx, x, y - 12, 50, 9, '#57cc6a');
  circle(ctx, x - 30, y - 12, 7, '#74d97e');
  circle(ctx, x + 30, y - 12, 7, '#74d97e');
  ctx.fillStyle = '#f6d9a0';
  ctx.beginPath();
  ctx.arc(x, y - 12, 46, Math.PI, 0);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#c98a4b';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(x, y - 12, 46, Math.PI, 0);
  ctx.stroke();
  ellipse(ctx, x - 20, y - 32, 4, 2.5, '#fff3d6');
  ellipse(ctx, x + 2, y - 40, 4, 2.5, '#fff3d6');
  ellipse(ctx, x + 22, y - 30, 4, 2.5, '#fff3d6');
}

// Bar timer: hijau -> kuning -> merah.
function drawTimerBar(ctx, x, y, w, h, frac) {
  const f = Math.max(0, Math.min(1, frac));
  rr(ctx, x, y, w, h, h / 2);
  ctx.fillStyle = '#20262e';
  ctx.fill();
  if (f > 0.02) {
    const col = f > 0.5 ? '#2ec4b6' : f > 0.25 ? '#ffb703' : '#ef476f';
    rr(ctx, x + 2, y + 2, (w - 4) * f, h - 4, (h - 4) / 2);
    ctx.fillStyle = col;
    ctx.fill();
  }
}

function drawButton(ctx, x, y, w, h, label, enabled, hot) {
  rr(ctx, x + 2, y + 4, w, h, 10);
  ctx.fillStyle = 'rgba(0,0,0,.25)';
  ctx.fill();
  const g = ctx.createLinearGradient(x, y, x, y + h);
  if (!enabled) { g.addColorStop(0, '#6b7d8c'); g.addColorStop(1, '#546575'); }
  else if (hot) { g.addColorStop(0, '#ffe082'); g.addColorStop(1, '#ffb703'); }
  else { g.addColorStop(0, '#37b3a5'); g.addColorStop(1, '#1f7a6e'); }
  rr(ctx, x, y, w, h, 10);
  ctx.fillStyle = g;
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = hot ? '#fff3d6' : 'rgba(0,0,0,.35)';
  ctx.stroke();
  if (hot) {
    ctx.strokeStyle = 'rgba(255,209,102,.8)';
    ctx.lineWidth = 4;
    rr(ctx, x - 3, y - 3, w + 6, h + 6, 12);
    ctx.stroke();
  }
  txt(ctx, label, x + w / 2, y + h / 2 + 1, 20, enabled ? '#10231f' : '#d7dee5', 'center', true);
}

// Kartu pesanan: nama resep + ikon bahan + bar timer.
function drawOrderCard(ctx, o, x, y, w, h) {
  const urgent = !o.done && !o.failed && o.t <= 5;
  rr(ctx, x, y, w, h, 10);
  ctx.fillStyle = o.done ? '#2a9d8f' : (urgent ? '#ffe3e3' : '#fff8e7');
  ctx.fill();
  ctx.lineWidth = urgent ? 4 : 2;
  ctx.strokeStyle = (o.failed || urgent) ? '#ef476f' : '#d9a441';
  ctx.stroke();
  txt(ctx, o.recipe.name, x + 12, y + 18, 16, '#333333', 'left', true);
  let ix = x + 16;
  for (const k of o.recipe.items) {
    drawIngredient(ctx, k, ix + 16, y + 48, 30, 'mentah');
    ix += 40;
  }
  drawTimerBar(ctx, x + 12, y + h - 18, w - 24, 10, o.t / o.max);
  txt(ctx, Math.ceil(o.t) + ' dtk', x + w - 12, y + 18, 14, urgent ? '#d62828' : '#555555', 'right', true);
  if (urgent) {
    circle(ctx, x + w - 14, y + h - 34, 11, '#ef476f');
    txt(ctx, '!', x + w - 14, y + h - 33, 14, '#ffffff', 'center', true);
  }
}
