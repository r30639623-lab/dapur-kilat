// The screenshot scenes behind ?shot=cover|assembly|cooking|serve.
// Each one plays the real rules forward from a fresh world for a fixed script:
// the cook walks, takes, chops, cooks and plates with the same step() the live
// game uses, so every frame is what a short game really looks like, and the same
// seed always gives the same frame. A helper also runs the full serve loop for the
// headless self-test.

import { STEP, INGREDIENTS, STATIONS } from './config.js';
import { EVENT_ACT, EVENT_DENY, createWorld, plateMatchesOrder, stationById } from './world.js';
import { SCREEN_PLAY } from './render.js';

const MAX_WAIT = 14;

/** Hold { interact: id } until the cook uses the station or the wait runs out. */
export function doInteract(world, id, maxSeconds) {
  const limit = maxSeconds === undefined ? MAX_WAIT : maxSeconds;
  let t = 0;
  while (t < limit) {
    const events = world.step(STEP, { interact: id });
    t += STEP;
    if (events & EVENT_ACT) return true;
    if (events & EVENT_DENY) {
      // A deny while a job is still running just means "not yet": keep trying
      // until the job finishes; a real failure times out instead.
      let waited = 0;
      let done = false;
      while (waited < 0.4 && t < limit) {
        world.step(STEP, null);
        waited += STEP;
        t += STEP;
        if (world.state.jobs.talenan && world.state.jobs.talenan.done) done = true;
        if (world.state.jobs.wajan && world.state.jobs.wajan.done) done = true;
      }
      if (!done) return false;
    }
  }
  return false;
}

/** Step the world with no command until a condition holds or the wait runs out. */
export function waitUntil(world, predicate, maxSeconds) {
  const limit = maxSeconds === undefined ? MAX_WAIT : maxSeconds;
  let t = 0;
  while (t < limit) {
    world.step(STEP, null);
    t += STEP;
    if (predicate(world.state)) return true;
  }
  return false;
}

export function waitSeconds(world, seconds) {
  const steps = Math.round(seconds / STEP);
  for (let i = 0; i < steps; i += 1) world.step(STEP, null);
}

/** Walk toward a point for a fixed time (used to catch the cook mid-route). */
export function walkToward(world, x, y, seconds) {
  const steps = Math.round(seconds / STEP);
  for (let i = 0; i < steps; i += 1) world.step(STEP, { tx: x, ty: y });
}

/**
 * Fetch one recipe part and put it on the plate: bin, then chop and/or cook as the
 * part needs, then plate. Returns false when any step fails.
 */
export function gatherNeed(world, need) {
  const spec = INGREDIENTS[need.kind];
  if (!doInteract(world, `bin-${need.kind}`)) return false;
  if (need.state === 'chopped' || (need.state === 'cooked' && spec.chop)) {
    if (!doInteract(world, 'talenan')) return false;
    if (!waitUntil(world, (s) => s.jobs.talenan && s.jobs.talenan.done)) return false;
    if (!doInteract(world, 'talenan')) return false;
  }
  if (need.state === 'cooked') {
    if (!doInteract(world, 'wajan')) return false;
    if (!waitUntil(world, (s) => s.jobs.wajan && s.jobs.wajan.done)) return false;
    if (!doInteract(world, 'wajan')) return false;
  }
  return doInteract(world, 'piring');
}

/**
 * Set `world` to the named scene and return the screen to draw over it.
 * cover: the full kitchen with orders on the board, cook holding rice.
 * assembly: two parts plated, cook on the way to fetch the third.
 * cooking: a part halfway through the wok, one order running low on patience.
 * serve: a finished plate, cook on the way to the serve window.
 */
export function stageShot(name, world) {
  world.reset();
  if (name === 'assembly' || name === 'cooking' || name === 'serve') {
    waitSeconds(world, 3);
    const order = world.state.orders[0];
    if (!order) return { screen: SCREEN_PLAY, best: 0 };
    if (name === 'assembly') {
      gatherNeed(world, order.recipe.needs[0]);
      gatherNeed(world, order.recipe.needs[1]);
      const third = stationById(`bin-${order.recipe.needs[2].kind}`);
      if (third) walkToward(world, third.anchor.x, third.anchor.y, 1.0);
      return { screen: SCREEN_PLAY, best: world.state.score };
    }
    if (name === 'cooking') {
      waitSeconds(world, 22);
      const need = order.recipe.needs[0];
      const spec = INGREDIENTS[need.kind];
      doInteract(world, `bin-${need.kind}`);
      if (need.state === 'chopped' || (need.state === 'cooked' && spec.chop)) {
        doInteract(world, 'talenan');
        waitUntil(world, (s) => s.jobs.talenan && s.jobs.talenan.done);
        doInteract(world, 'talenan');
      }
      if (need.state === 'cooked') {
        doInteract(world, 'wajan');
        waitUntil(world, (s) => {
          const job = s.jobs.wajan;
          return job && job.progress >= job.duration * 0.45;
        });
      }
      return { screen: SCREEN_PLAY, best: world.state.score };
    }
    for (const need of order.recipe.needs) gatherNeed(world, need);
    const saji = stationById('saji');
    if (saji) walkToward(world, saji.anchor.x, saji.anchor.y, 0.9);
    return { screen: SCREEN_PLAY, best: world.state.score };
  }
  doInteract(world, 'bin-nasi');
  walkToward(world, 640, 560, 1.2);
  waitSeconds(world, 20);
  return { screen: SCREEN_PLAY, best: 0 };
}

/** The headless self-test: serve one full order through the real rules. */
export function runSelfTest(world) {
  const checks = [];
  function check(name, ok, info) {
    checks.push({ name, ok: !!ok, info: info || '' });
  }
  world.reset();
  waitSeconds(world, 3.5);
  check('orders-spawn', world.state.orders.length >= 1, `orders=${world.state.orders.length}`);
  const order = world.state.orders[0];
  let gathered = false;
  if (order) {
    gathered = true;
    for (const need of order.recipe.needs) {
      if (!gatherNeed(world, need)) {
        gathered = false;
        break;
      }
    }
  }
  check('gather-plate', gathered, `plate=${world.state.plate.length}`);
  check('plate-matches', plateMatchesOrder(world.state) !== null, `plate=${world.state.plate.length}`);
  const before = world.state.score;
  const served = doInteract(world, 'saji');
  check('serve', served && world.state.served === 1, `served=${world.state.served} score=${world.state.score}`);
  check('score-grew', world.state.score > before, `score=${world.state.score}`);
  check('timer-ran', world.state.timeLeft < 150, `left=${Math.round(world.state.timeLeft)}`);
  check('deny-empty-serve', doInteract(world, 'saji') === false, 'empty plate refused');
  return { pass: checks.every((c) => c.ok), checks };
}
