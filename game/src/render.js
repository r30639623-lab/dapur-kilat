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
      circle(ctx, x - s * 0.28, y, s * 0.16, '#ff8fa3');
      circle(ctx, x + s * 0.28, y, s * 0.16, '#ff8fa3');
    } else {
      circle(ctx, x, y, s * 0.5, '#e63946');
      circle(ctx, x - s * 0.14, y - s * 0.14, s * 0.16, '#ff6b6b');
      ctx.fillStyle = '#2a9d8f';
      ctx.beginPath();
      ctx.moveTo(x, y - s * 0.42);
      ctx.lineTo(x - s * 0.2, y - s * 0.62);
      ctx.lineTo(x + s * 0.2, y - s * 0.62);
      ctx.closePath();
      ctx.fill();
    }
  } else if (kind === 'selada') {
    ellipse(ctx, x - s * 0.22, y + s * 0.05, s * 0.34, s * 0.22, '#43aa5b');
    ellipse(ctx, x + s * 0.22, y + s * 0.05, s * 0.34, s * 0.22, '#57cc6a');
    ellipse(ctx, x, y - s * 0.12, s * 0.36, s * 0.24, '#74d97e');
    ellipse(ctx, x, y - s * 0.1, s * 0.2, s * 0.12, '#a7f3b0');
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
    rr(ctx, x - s * 0.45, y - s * 0.4, s * 0.9, s * 0.8, s * 0.18);
    ctx.fillStyle = crust;
    ctx.fill();
    rr(ctx, x - s * 0.34, y - s * 0.29, s * 0.68, s * 0.58, s * 0.12);
    ctx.fillStyle = inner;
    ctx.fill();
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
    ctx.fillStyle = '#ffd166';
    ctx.beginPath();
    ctx.moveTo(x - s * 0.45, y + s * 0.3);
    ctx.lineTo(x + s * 0.45, y + s * 0.3);
    ctx.lineTo(x + s * 0.45, y - s * 0.25);
    ctx.closePath();
    ctx.fill();
    circle(ctx, x - s * 0.1, y + s * 0.08, s * 0.09, '#f4a71d');
    circle(ctx, x + s * 0.2, y + s * 0.12, s * 0.07, '#f4a71d');
    circle(ctx, x + s * 0.05, y - s * 0.08, s * 0.06, '#f4a71d');
  }
}

// Piring putih + isi rakitan di atasnya.
function drawPlate(ctx, items, x, y, r) {
  ellipse(ctx, x, y, r, r * 0.32, '#f8f9fa');
  ellipse(ctx, x, y, r * 0.82, r * 0.24, '#dee2e6');
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
  rr(ctx, x, y, w, h, 10);
  ctx.fillStyle = enabled ? (hot ? '#ffd166' : '#2a9d8f') : '#5a6b7a';
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = 'rgba(0,0,0,.35)';
  ctx.stroke();
  txt(ctx, label, x + w / 2, y + h / 2 + 1, 20, enabled ? '#10231f' : '#d7dee5', 'center', true);
}

// Kartu pesanan: nama resep + ikon bahan + bar timer.
function drawOrderCard(ctx, o, x, y, w, h) {
  rr(ctx, x, y, w, h, 10);
  ctx.fillStyle = o.done ? '#2a9d8f' : '#fff8e7';
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = o.failed ? '#ef476f' : '#d9a441';
  ctx.stroke();
  txt(ctx, o.recipe.name, x + 12, y + 18, 16, '#333333', 'left', true);
  let ix = x + 16;
  for (const k of o.recipe.items) {
    drawIngredient(ctx, k, ix + 16, y + 48, 30, 'mentah');
    ix += 40;
  }
  drawTimerBar(ctx, x + 12, y + h - 18, w - 24, 10, o.t / o.max);
  txt(ctx, Math.ceil(o.t) + ' dtk', x + w - 12, y + 18, 14, '#555555', 'right', true);
}
