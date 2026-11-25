// Everything the player sees, painted on one canvas in the fixed 1280x720 field.
// The kitchen is drawn top-down: the order board on the left, ingredient bins along
// the top wall, the work row (board, wok, plate, serve window) below them, and the
// cook walking the floor. Food is drawn as flat vector shapes, so the game looks the
// same on any machine with no font or image downloads.

import { FIELD, PALETTE, FONT, INGREDIENTS, STATIONS } from './config.js';
import { plateMatchesOrder } from './world.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_PAUSED = 'paused';
export const SCREEN_OVER = 'over';

function stateLabel(state) {
  if (state === 'chopped') return 'potong';
  if (state === 'cooked') return 'matang';
  if (state === 'burned') return 'gosong';
  return 'mentah';
}

function stateColor(state) {
  if (state === 'chopped') return '#8fce9b';
  if (state === 'cooked') return '#f2c94c';
  if (state === 'burned') return '#555049';
  return '#cfc4ae';
}

export function createRenderer(canvas) {
  const ctx = canvas.getContext('2d');

  function rr(x, y, w, h, r) {
    const rad = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + rad, y);
    ctx.arcTo(x + w, y, x + w, y + h, rad);
    ctx.arcTo(x + w, y + h, x, y + h, rad);
    ctx.arcTo(x, y + h, x, y, rad);
    ctx.arcTo(x, y, x + w, y, rad);
    ctx.closePath();
  }

  function text(str, x, y, size, color, align, weight) {
    ctx.fillStyle = color;
    ctx.font = `${weight || '700'} ${size}px ${FONT}`;
    ctx.textAlign = align || 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(str, x, y);
  }

  function bar(x, y, w, h, fraction, color, back) {
    rr(x, y, w, h, h / 2);
    ctx.fillStyle = back || 'rgba(0,0,0,0.35)';
    ctx.fill();
    if (fraction > 0) {
      rr(x, y, Math.max(h, w * Math.min(1, fraction)), h, h / 2);
      ctx.fillStyle = color;
      ctx.fill();
    }
  }

  /** One ingredient, drawn as a flat vector shape, with a state tint. */
  function drawIcon(kind, itemState, cx, cy, s) {
    const spec = INGREDIENTS[kind];
    ctx.save();
    ctx.translate(cx, cy);
    if (itemState === 'burned') {
      ctx.fillStyle = '#3a352f';
      ctx.beginPath();
      ctx.arc(0, 0, s * 0.55, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#8b8578';
      ctx.lineWidth = Math.max(2, s * 0.08);
      ctx.beginPath();
      ctx.moveTo(-s * 0.3, -s * 0.3);
      ctx.lineTo(s * 0.3, s * 0.3);
      ctx.moveTo(s * 0.3, -s * 0.3);
      ctx.lineTo(-s * 0.3, s * 0.3);
      ctx.stroke();
      ctx.restore();
      return;
    }
    if (kind === 'nasi') {
      ctx.fillStyle = itemState === 'cooked' ? '#f0d9a0' : '#f5efdc';
      ctx.beginPath();
      ctx.ellipse(0, s * 0.12, s * 0.62, s * 0.42, 0, Math.PI, 0);
      ctx.fill();
      ctx.strokeStyle = '#b09a7a';
      ctx.lineWidth = Math.max(1.5, s * 0.06);
      ctx.stroke();
      ctx.fillStyle = 'rgba(0,0,0,0.18)';
      for (let i = 0; i < 5; i += 1) {
        ctx.beginPath();
        ctx.arc(-s * 0.35 + i * s * 0.17, s * 0.05, s * 0.05, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (kind === 'mie') {
      ctx.strokeStyle = '#f2c94c';
      ctx.lineWidth = Math.max(2, s * 0.12);
      ctx.lineCap = 'round';
      for (let i = 0; i < 3; i += 1) {
        const y = -s * 0.3 + i * s * 0.3;
        ctx.beginPath();
        ctx.moveTo(-s * 0.55, y);
        ctx.bezierCurveTo(-s * 0.25, y - s * 0.22, s * 0.25, y + s * 0.22, s * 0.55, y);
        ctx.stroke();
      }
    } else if (kind === 'ayam') {
      ctx.fillStyle = '#d98a4b';
      ctx.beginPath();
      ctx.arc(-s * 0.08, -s * 0.05, s * 0.48, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#f5efdc';
      ctx.lineWidth = Math.max(2, s * 0.1);
      ctx.beginPath();
      ctx.moveTo(s * 0.25, s * 0.25);
      ctx.lineTo(s * 0.55, s * 0.55);
      ctx.stroke();
      ctx.fillStyle = '#f5efdc';
      ctx.beginPath();
      ctx.arc(s * 0.58, s * 0.55, s * 0.13, 0, Math.PI * 2);
      ctx.arc(s * 0.42, s * 0.68, s * 0.13, 0, Math.PI * 2);
      ctx.fill();
    } else if (kind === 'telur') {
      ctx.fillStyle = '#fffdf4';
      ctx.beginPath();
      ctx.ellipse(0, 0, s * 0.6, s * 0.48, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = itemState === 'cooked' ? '#f09a1f' : '#f2c94c';
      ctx.beginPath();
      ctx.arc(0, 0, s * 0.28, 0, Math.PI * 2);
      ctx.fill();
    } else if (kind === 'sayur') {
      ctx.fillStyle = '#58b368';
      for (let i = -1; i <= 1; i += 1) {
        ctx.save();
        ctx.rotate(i * 0.5);
        ctx.beginPath();
        ctx.ellipse(0, -s * 0.18, s * 0.22, s * 0.45, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    } else if (kind === 'sambal') {
      ctx.strokeStyle = '#e5534b';
      ctx.lineWidth = Math.max(3, s * 0.18);
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(0, -s * 0.1, s * 0.5, Math.PI * 0.15, Math.PI * 0.85);
      ctx.stroke();
      ctx.strokeStyle = '#58b368';
      ctx.lineWidth = Math.max(2, s * 0.1);
      ctx.beginPath();
      ctx.moveTo(-s * 0.45, -s * 0.42);
      ctx.lineTo(-s * 0.6, -s * 0.62);
      ctx.stroke();
    }
    if (itemState === 'chopped') {
      ctx.strokeStyle = 'rgba(255,255,255,0.85)';
      ctx.lineWidth = Math.max(2, s * 0.07);
      ctx.beginPath();
      ctx.moveTo(-s * 0.4, s * 0.1);
      ctx.lineTo(s * 0.4, -s * 0.1);
      ctx.moveTo(-s * 0.4, -s * 0.15);
      ctx.lineTo(s * 0.4, -s * 0.35);
      ctx.stroke();
    }
    if (itemState === 'cooked') {
      ctx.strokeStyle = 'rgba(242,160,40,0.9)';
      ctx.lineWidth = Math.max(2, s * 0.09);
      ctx.beginPath();
      ctx.arc(0, 0, s * 0.66, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawHeart(x, y, s, filled) {
    ctx.fillStyle = filled ? '#e5534b' : 'rgba(255,255,255,0.25)';
    ctx.beginPath();
    ctx.moveTo(x, y + s * 0.35);
    ctx.bezierCurveTo(x - s, y - s * 0.4, x - s * 0.35, y - s, x, y - s * 0.35);
    ctx.bezierCurveTo(x + s * 0.35, y - s, x + s, y - s * 0.4, x, y + s * 0.35);
    ctx.fill();
  }

  function drawFloor() {
    ctx.fillStyle = PALETTE.wall;
    ctx.fillRect(0, 0, FIELD.width, 76);
    ctx.fillStyle = PALETTE.wallTop;
    ctx.fillRect(0, 70, FIELD.width, 6);
    for (let y = 0; y < 10; y += 1) {
      for (let x = 0; x < 16; x += 1) {
        ctx.fillStyle = (x + y) % 2 === 0 ? PALETTE.floorA : PALETTE.floorB;
        ctx.fillRect(x * 80, 76 + y * 65, 80, 65);
      }
    }
  }

  function drawBoard(state) {
    const match = plateMatchesOrder(state);
    rr(16, 76, 264, 300, 12);
    ctx.fillStyle = PALETTE.board;
    ctx.fill();
    ctx.strokeStyle = PALETTE.boardEdge;
    ctx.lineWidth = 2;
    ctx.stroke();
    text('PAPAN PESANAN', 148, 98, 17, PALETTE.text, 'center');
    if (state.orders.length === 0) {
      text('Belum ada pesanan…', 148, 150, 14, PALETTE.muted, 'center', '400');
      return;
    }
    state.orders.forEach((order, index) => {
      const y = 118 + index * 66;
      const ready = match === order;
      rr(28, y, 240, 58, 8);
      ctx.fillStyle = ready ? '#2f5d3a' : '#3a4a63';
      ctx.fill();
      if (ready) {
        ctx.strokeStyle = PALETTE.good;
        ctx.lineWidth = 2;
        ctx.stroke();
      }
      text(order.recipe.name, 40, y + 16, 15, PALETTE.text);
      text(`Rp${order.recipe.price}`, 256, y + 16, 13, PALETTE.warn, 'right');
      order.recipe.needs.forEach((need, i) => {
        const cx = 56 + i * 52;
        ctx.strokeStyle = stateColor(need.state);
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(cx, y + 38, 16, 0, Math.PI * 2);
        ctx.stroke();
        drawIcon(need.kind, need.state, cx, y + 38, 13);
      });
      const fraction = Math.max(0, order.patience / order.maxPatience);
      const color = fraction > 0.5 ? PALETTE.good : fraction > 0.25 ? PALETTE.warn : PALETTE.bad;
      bar(40, y + 50, 216, 6, fraction, color);
      if (ready) text('SIAP DISAJI!', 256, y + 38, 11, PALETTE.good, 'right');
    });
  }

  function drawStations(state) {
    for (const station of STATIONS) {
      const { x, y, w, h } = station;
      rr(x, y, w, h, 10);
      ctx.fillStyle = PALETTE.counter;
      ctx.fill();
      ctx.strokeStyle = PALETTE.counterEdge;
      ctx.lineWidth = 2;
      ctx.stroke();
      text(station.label, x + w / 2, y + 16, 14, PALETTE.dark, 'center');
      if (station.sub) text(station.sub, x + w / 2, y + 32, 11, '#7a6a55', 'center', '400');
      if (station.kind === 'bin') {
        drawIcon(station.ingredient, 'raw', x + w / 2, y + 52, 15);
        text(`[${station.key}]`, x + w - 8, y + h - 12, 11, '#7a6a55', 'right', '400');
      }
      if (station.kind === 'talenan') {
        const job = state.jobs.talenan;
        ctx.strokeStyle = '#8a8f98';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(x + 28, y + 88);
        ctx.lineTo(x + 62, y + 62);
        ctx.stroke();
        if (job) {
          drawIcon(job.kind, job.result, x + 118, y + 78, 16);
          bar(x + 84, y + 100, 80, 8, job.progress / job.duration, job.done ? PALETTE.good : PALETTE.warn);
          if (job.done) text('SIAP!', x + 118, y + 52, 13, PALETTE.good, 'center');
        } else {
          text('letakkan bahan', x + 118, y + 78, 11, '#7a6a55', 'center', '400');
        }
      }
      if (station.kind === 'wajan') {
        const job = state.jobs.wajan;
        ctx.fillStyle = '#3c3c46';
        ctx.beginPath();
        ctx.arc(x + 88, y + 76, 34, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#24242c';
        ctx.beginPath();
        ctx.arc(x + 88, y + 76, 27, 0, Math.PI * 2);
        ctx.fill();
        if (job) {
          drawIcon(job.kind, job.done ? (job.burned ? 'burned' : job.result) : job.kind === 'ayam' ? 'chopped' : 'raw', x + 88, y + 76, 16);
          const flicker = 0.6 + 0.4 * Math.sin(state.time * 9);
          ctx.fillStyle = job.done ? 'rgba(120,120,120,0.7)' : `rgba(229,83,75,${0.5 + 0.4 * flicker})`;
          for (let i = 0; i < 3; i += 1) {
            const fx = x + 66 + i * 22;
            ctx.beginPath();
            ctx.moveTo(fx, y + h - 8);
            ctx.lineTo(fx + 7, y + h - 26 - flicker * 6);
            ctx.lineTo(fx + 14, y + h - 8);
            ctx.closePath();
            ctx.fill();
          }
          bar(x + 150, y + 60, 56, 8, job.progress / job.duration, job.done ? (job.burned ? PALETTE.bad : PALETTE.good) : PALETTE.warn);
          if (job.done && !job.burned) text('SIAP!', x + 178, y + 82, 13, PALETTE.good, 'center');
          if (job.burned) text('GOSONG!', x + 178, y + 82, 13, PALETTE.bad, 'center');
        } else {
          text('wajan kosong', x + 178, y + 76, 11, '#7a6a55', 'center', '400');
        }
      }
      if (station.kind === 'piring') {
        ctx.fillStyle = '#fffdf4';
        ctx.beginPath();
        ctx.arc(x + 110, y + 76, 40, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#d8c9ae';
        ctx.lineWidth = 2;
        ctx.stroke();
        state.plate.forEach((item, i) => {
          const px = x + 72 + i * 38;
          drawIcon(item.kind, item.state, px, y + 76, 13);
        });
        if (state.plate.length === 0) text('piring kosong', x + 110, y + 76, 11, '#7a6a55', 'center', '400');
      }
      if (station.kind === 'saji') {
        ctx.fillStyle = '#f2c94c';
        rr(x + 62, y + 52, 100, 30, 6);
        ctx.fill();
        text('ANTAR DI SINI', x + 112, y + 67, 12, PALETTE.dark, 'center');
        ctx.strokeStyle = '#8a6d2f';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(x + 112, y + 98, 10, Math.PI, 0);
        ctx.stroke();
        ctx.fillStyle = '#8a6d2f';
        ctx.fillRect(x + 100, y + 96, 24, 4);
      }
      if (station.kind === 'sampah') {
        ctx.fillStyle = '#4a4a52';
        rr(x + 34, y + 30, 52, 26, 4);
        ctx.fill();
        ctx.fillStyle = '#33333a';
        ctx.fillRect(x + 30, y + 24, 60, 8);
      }
    }
  }

  function drawChef(state) {
    const chef = state.chef;
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.beginPath();
    ctx.ellipse(chef.x, chef.y + 20, 24, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    const bob = chef.moving ? Math.sin(state.time * 14) * 2 : 0;
    ctx.fillStyle = '#e8543f';
    rr(chef.x - 16, chef.y - 14 + bob, 32, 30, 10);
    ctx.fill();
    ctx.fillStyle = '#fffdf4';
    rr(chef.x - 16, chef.y - 2 + bob, 32, 18, 6);
    ctx.fill();
    ctx.fillStyle = '#f2c49b';
    ctx.beginPath();
    ctx.arc(chef.x, chef.y - 24 + bob, 13, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fffdf4';
    rr(chef.x - 13, chef.y - 42 + bob, 26, 12, 6);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(chef.x - 8, chef.y - 42 + bob, 7, 0, Math.PI * 2);
    ctx.arc(chef.x, chef.y - 45 + bob, 7, 0, Math.PI * 2);
    ctx.arc(chef.x + 8, chef.y - 42 + bob, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#26221e';
    ctx.beginPath();
    ctx.arc(chef.x - 5 + chef.face * 2, chef.y - 25 + bob, 1.8, 0, Math.PI * 2);
    ctx.arc(chef.x + 5 + chef.face * 2, chef.y - 25 + bob, 1.8, 0, Math.PI * 2);
    ctx.fill();
    if (state.hand) {
      ctx.fillStyle = '#fffdf4';
      ctx.beginPath();
      ctx.arc(chef.x + 22, chef.y - 44 + bob, 15, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#b09a7a';
      ctx.lineWidth = 2;
      ctx.stroke();
      drawIcon(state.hand.kind, state.hand.state, chef.x + 22, chef.y - 44 + bob, 10);
    }
  }

  function drawHud(state) {
    ctx.fillStyle = PALETTE.hud;
    ctx.fillRect(0, 0, FIELD.width, 64);
    text('DAPUR KILAT', 20, 26, 24, PALETTE.text);
    text('masak cepat saji', 20, 50, 12, PALETTE.muted, 'left', '400');
    const minutes = Math.floor(state.timeLeft / 60);
    const seconds = Math.floor(state.timeLeft % 60);
    text(`Sisa ${minutes}:${String(seconds).padStart(2, '0')}`, 640, 26, 20, PALETTE.text, 'center');
    bar(520, 44, 240, 8, state.timeLeft / 150, state.timeLeft < 30 ? PALETTE.bad : PALETTE.good);
    text(`Level ${state.level}`, 640, 60, 11, PALETTE.muted, 'center', '400');
    text(`Skor ${state.score}`, 900, 26, 18, PALETTE.text);
    text(`Koin Rp${state.coins}`, 900, 48, 13, PALETTE.warn);
    text(`Kombo x${state.combo}`, 1060, 26, 18, state.combo >= 3 ? PALETTE.good : PALETTE.text);
    text(`Saji ${state.served}`, 1060, 48, 13, PALETTE.muted, 'left', '400');
    for (let i = 0; i < 3; i += 1) drawHeart(1210 + i * 22, 30, 9, i < state.hearts);
    text('Klik stasiun untuk jalan & pakai  •  WASD gerak  •  Spasi pakai  •  1-6 ambil bahan  •  P jeda', 640, 706, 12, 'rgba(255,247,232,0.75)', 'center', '400');
  }

  function drawPopups(state) {
    for (const popup of state.popups) {
      ctx.globalAlpha = Math.min(1, popup.t);
      text(popup.text, popup.x, popup.y, 22, popup.color, 'center');
      ctx.globalAlpha = 1;
    }
    if (state.flash) {
      ctx.globalAlpha = Math.min(1, state.flash.t);
      text(state.flash.text, 640, 96, 24, state.flash.color, 'center');
      ctx.globalAlpha = 1;
    }
  }

  function drawKitchen(state) {
    drawFloor();
    drawBoard(state);
    drawStations(state);
    drawChef(state);
    drawHud(state);
    drawPopups(state);
  }

  function drawTitle(state, best) {
    drawKitchen(state);
    ctx.fillStyle = 'rgba(23,19,16,0.72)';
    ctx.fillRect(0, 0, FIELD.width, FIELD.height);
    text('DAPUR KILAT', 640, 190, 72, PALETTE.text, 'center');
    text('Game masak cepat saji — layani pesanan sebelum pelanggan kabur!', 640, 250, 20, PALETTE.warn, 'center', '400');
    text('1. Ambil bahan dari rak atas (klik / tombol 1-6)', 640, 310, 17, PALETTE.text, 'center', '400');
    text('2. Potong di talenan, masak di wajan — jangan sampai gosong', 640, 340, 17, PALETTE.text, 'center', '400');
    text('3. Rakit di piring, antar ke jendela saji sebelum waktu habis', 640, 370, 17, PALETTE.text, 'center', '400');
    text('Klik atau tekan Spasi untuk mulai', 640, 440, 22, PALETTE.good, 'center');
    if (best > 0) text(`Skor terbaik: ${best}`, 640, 480, 16, PALETTE.muted, 'center', '400');
  }

  function drawPaused() {
    ctx.fillStyle = 'rgba(23,19,16,0.65)';
    ctx.fillRect(0, 0, FIELD.width, FIELD.height);
    text('JEDA', 640, 330, 56, PALETTE.text, 'center');
    text('Tekan P untuk lanjut', 640, 390, 18, PALETTE.muted, 'center', '400');
  }

  function drawOver(state, best) {
    ctx.fillStyle = 'rgba(23,19,16,0.78)';
    ctx.fillRect(0, 0, FIELD.width, FIELD.height);
    text('SHIFT SELESAI!', 640, 220, 56, PALETTE.text, 'center');
    text(`Skor akhir: ${state.score}`, 640, 300, 26, PALETTE.warn, 'center');
    text(`Pesanan disajikan: ${state.served}  •  Hangus: ${state.lost}  •  Kombo terbaik: x${state.bestCombo}`, 640, 350, 18, PALETTE.text, 'center', '400');
    text(`Koin terkumpul: Rp${state.coins}`, 640, 385, 18, PALETTE.text, 'center', '400');
    if (state.score >= best && state.score > 0) text('Skor terbaik baru!', 640, 425, 20, PALETTE.good, 'center');
    else if (best > 0) text(`Skor terbaik: ${best}`, 640, 425, 16, PALETTE.muted, 'center', '400');
    text('Klik atau tekan Spasi untuk main lagi', 640, 480, 20, PALETTE.good, 'center');
  }

  function draw(state, screen, best) {
    ctx.clearRect(0, 0, FIELD.width, FIELD.height);
    if (screen === SCREEN_TITLE) drawTitle(state, best);
    else if (screen === SCREEN_OVER) {
      drawKitchen(state);
      drawOver(state, best);
    } else if (screen === SCREEN_PAUSED) {
      drawKitchen(state);
      drawPaused();
    } else drawKitchen(state);
  }

  return { draw };
}
