// Boot and the one loop: input is read every frame, the world advances in fixed
// 1/60 s steps (several in a slow frame, none in a fast one), and the renderer
// paints what is there. The game moves between four screens: title, play, paused
// and game over.
//
// ?seed=N fixes the dealt orders. ?shot=cover|assembly|cooking|serve (with &seed=N)
// stages that scene instead of running the loop, paints it twice and sets
// window.__shotReady for a screenshot. ?selftest=1 runs the serve loop headlessly
// and writes its report into #selftest and the document title.

import { BEST_KEY, STEP, STATIONS } from './config.js';
import { createWorld, EVENT_ACT, EVENT_DENY, EVENT_OVER, stationById } from './world.js';
import { ACTION_CONFIRM, ACTION_PAUSE, createInput } from './input.js';
import { createRenderer, SCREEN_OVER, SCREEN_PAUSED, SCREEN_PLAY, SCREEN_TITLE } from './render.js';
import { stageShot, runSelfTest } from './shots.js';

/** The longest frame the loop catches up on; a longer stall is dropped, not replayed. */
const MAX_FRAME = 0.25;

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
const seedParam = Number.parseInt(params.get('seed') ?? '', 10);
const seed = Number.isInteger(seedParam) ? seedParam : Math.floor(Math.random() * 4294967296);
const selftest = params.get('selftest') === '1';

const canvas = document.getElementById('game');
const status = document.getElementById('status');
const world = createWorld(seed);
const renderer = createRenderer(canvas);

function readBest() {
  try {
    return Number.parseInt(window.localStorage.getItem(BEST_KEY) ?? '0', 10) || 0;
  } catch {
    return 0;
  }
}

function saveBest(value) {
  try {
    window.localStorage.setItem(BEST_KEY, String(value));
  } catch {
    // Storage can be off (private windows): the best score then lasts this visit only.
  }
}

function runShot(name) {
  const scene = stageShot(name, world);
  let painted = 0;
  function paint() {
    renderer.draw(world.state, scene.screen, scene.best);
    painted += 1;
    if (painted < 2) requestAnimationFrame(paint);
    else window.__shotReady = true;
  }
  requestAnimationFrame(paint);
}

function runSelftestMode() {
  const report = runSelfTest(world);
  const element = document.getElementById('selftest');
  element.style.display = 'block';
  element.textContent = JSON.stringify(report, null, 2);
  document.title = report.pass ? 'SELFTEST:PASS' : 'SELFTEST:FAIL';
  renderer.draw(world.state, SCREEN_PLAY, world.state.score);
  window.__shotReady = true;
}

function stationAt(point) {
  for (const station of STATIONS) {
    if (point.x >= station.x - 6 && point.x <= station.x + station.w + 6
      && point.y >= station.y - 6 && point.y <= station.y + station.h + 6) return station;
  }
  return null;
}

function nearestStation(point, maxDist) {
  let best = null;
  let bestDist = maxDist;
  for (const station of STATIONS) {
    const dist = Math.hypot(station.anchor.x - point.x, station.anchor.y - point.y);
    if (dist < bestDist) {
      bestDist = dist;
      best = station;
    }
  }
  return best;
}

function runGame() {
  const input = createInput(canvas);
  let screen = SCREEN_TITLE;
  let best = readBest();
  let held = null;
  let accumulator = 0;
  let last = performance.now();

  // Screen readers (and anyone watching the page's text) hear the screen changes.
  function announce(message) {
    status.textContent = message;
  }

  function startGame() {
    world.reset();
    accumulator = 0;
    held = null;
    screen = SCREEN_PLAY;
    announce('Bermain. Layani pesanan sebelum waktunya habis.');
  }

  function endGame() {
    screen = SCREEN_OVER;
    if (world.state.score > best) {
      best = world.state.score;
      saveBest(best);
    }
    announce(`Shift selesai. Skor ${world.state.score}. Terbaik ${best}.`);
  }

  function handleActions() {
    const actions = input.takeActions();
    const point = input.takeClick();
    const number = input.takeNumber();
    if (actions & ACTION_PAUSE && (screen === SCREEN_PLAY || screen === SCREEN_PAUSED)) {
      screen = screen === SCREEN_PLAY ? SCREEN_PAUSED : SCREEN_PLAY;
      announce(screen === SCREEN_PAUSED ? 'Jeda.' : 'Bermain.');
      return;
    }
    if (screen === SCREEN_TITLE || screen === SCREEN_OVER) {
      if (actions & ACTION_CONFIRM) startGame();
      return;
    }
    if (screen !== SCREEN_PLAY) return;
    if (number >= 1 && number <= 6) {
      const bins = STATIONS.filter((s) => s.kind === 'bin');
      const bin = bins[number - 1];
      if (bin) held = { interact: bin.id };
      return;
    }
    if (point) {
      const station = stationAt(point);
      if (station) held = { interact: station.id };
      else held = { tx: point.x, ty: point.y };
      return;
    }
    if (actions & ACTION_CONFIRM) {
      const near = nearestStation(world.state.chef, 90);
      if (near) held = { interact: near.id };
      return;
    }
    const dir = input.direction();
    if (dir.x !== 0 || dir.y !== 0) {
      const chef = world.state.chef;
      held = { tx: chef.x + dir.x * 90, ty: chef.y + dir.y * 90 };
    }
  }

  function step() {
    if (screen === SCREEN_TITLE) {
      world.step(STEP, null, true);
      return;
    }
    const events = world.step(STEP, held, false);
    if (events & (EVENT_ACT | EVENT_DENY)) held = null;
    if (events & EVENT_OVER) endGame();
  }

  function frame(now) {
    requestAnimationFrame(frame);
    accumulator += Math.min((now - last) / 1000, MAX_FRAME);
    last = now;
    handleActions();
    if (screen === SCREEN_TITLE || screen === SCREEN_PLAY) {
      while (accumulator >= STEP && (screen === SCREEN_TITLE || screen === SCREEN_PLAY)) {
        step();
        accumulator -= STEP;
      }
    } else {
      accumulator = 0;
    }
    renderer.draw(world.state, screen, best);
  }

  // Leaving the tab pauses a running game rather than letting orders burn unseen.
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && screen === SCREEN_PLAY) {
      screen = SCREEN_PAUSED;
      announce('Jeda.');
    }
  });

  announce('Dapur Kilat. Tekan Spasi atau klik untuk mulai.');
  requestAnimationFrame(frame);
}

if (selftest) runSelftestMode();
else if (shot) runShot(shot);
else runGame();
