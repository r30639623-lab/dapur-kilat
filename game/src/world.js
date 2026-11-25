// The kitchen itself: orders, the cook, the hand, the plate and the two timed jobs.
// Pure simulation — no drawing, no input — stepped in fixed 1/60 s slices by main.js.
// A command is { tx, ty } (walk to a floor point) or { interact: stationId } (walk to
// that station's anchor and use it on arrival). Every step returns an event bitmask.

import {
  FIELD, SHIFT_SECONDS, CHEF_SPEED, CHOP_SECONDS, COOK_SECONDS, BURN_SECONDS,
  PLATE_MAX, HEARTS, INGREDIENTS, RECIPES, STATIONS,
} from './config.js';
import { createRandom } from './random.js';

/** The cook used a station as asked. */
export const EVENT_ACT = 1;
/** The cook could not use the station (wrong item, full hands, nothing to take). */
export const EVENT_DENY = 2;
/** A plate was served to a waiting order. */
export const EVENT_SERVED = 4;
/** An order's patience ran out and it left. */
export const EVENT_LOST = 8;
/** The shift ended, or the last heart was lost. */
export const EVENT_OVER = 16;

function clamp(value, low, high) {
  return Math.min(high, Math.max(low, value));
}

export function stationById(id) {
  for (const station of STATIONS) if (station.id === id) return station;
  return null;
}

/** A part is ready for the plate once chopped, cooked, or (sambal) as it comes. */
export function isPrepared(item) {
  if (!item) return false;
  if (item.state === 'chopped' || item.state === 'cooked') return true;
  return item.kind === 'sambal' && item.state === 'raw';
}

function sameNeed(a, b) {
  return a.kind === b.kind && a.state === b.state;
}

/** The waiting order the plate on the plating station completes, or null. */
export function plateMatchesOrder(state) {
  if (state.plate.length === 0) return null;
  for (const order of state.orders) {
    const needs = order.recipe.needs;
    if (needs.length !== state.plate.length) continue;
    const used = new Array(needs.length).fill(false);
    let ok = true;
    for (const item of state.plate) {
      let found = false;
      for (let i = 0; i < needs.length; i += 1) {
        if (!used[i] && sameNeed(item, needs[i])) {
          used[i] = true;
          found = true;
          break;
        }
      }
      if (!found) {
        ok = false;
        break;
      }
    }
    if (ok) return order;
  }
  return null;
}

function freshState() {
  return {
    time: 0,
    timeLeft: SHIFT_SECONDS,
    level: 1,
    score: 0,
    coins: 0,
    combo: 0,
    bestCombo: 0,
    served: 0,
    lost: 0,
    hearts: HEARTS,
    chef: { x: 640, y: 560, tx: 640, ty: 560, moving: false, face: 1 },
    hand: null,
    plate: [],
    jobs: { talenan: null, wajan: null },
    orders: [],
    spawnTimer: 2.5,
    nextOrderId: 1,
    over: false,
    flash: null,
    popups: [],
  };
}

export function createWorld(seed) {
  let random = createRandom(seed);
  const state = freshState();
  let pendingInteract = null;

  function reset() {
    random = createRandom(seed);
    const fresh = freshState();
    for (const key of Object.keys(fresh)) state[key] = fresh[key];
    pendingInteract = null;
  }

  function setFlash(text, color) {
    state.flash = { text, color, t: 1.6 };
  }

  function spawnOrder() {
    const recipe = random.pick(RECIPES);
    const patience = Math.max(30, 58 - state.level * 4);
    state.orders.push({
      id: state.nextOrderId,
      recipe,
      patience,
      maxPatience: patience,
    });
    state.nextOrderId += 1;
  }

  /** Use one station, the cook already standing at its anchor. Returns events. */
  function doInteract(station) {
    const hand = state.hand;
    if (station.kind === 'bin') {
      if (hand) return EVENT_DENY;
      state.hand = { kind: station.ingredient, state: 'raw' };
      return EVENT_ACT;
    }
    if (station.kind === 'talenan') {
      const job = state.jobs.talenan;
      if (job) {
        if (!job.done || hand) return EVENT_DENY;
        state.hand = { kind: job.kind, state: job.result };
        state.jobs.talenan = null;
        return EVENT_ACT;
      }
      if (!hand || !INGREDIENTS[hand.kind].chop || hand.state !== 'raw') return EVENT_DENY;
      state.jobs.talenan = {
        kind: hand.kind, progress: 0, duration: CHOP_SECONDS, result: 'chopped', done: false,
      };
      state.hand = null;
      return EVENT_ACT;
    }
    if (station.kind === 'wajan') {
      const job = state.jobs.wajan;
      if (job) {
        if (!job.done || hand) return EVENT_DENY;
        state.hand = { kind: job.kind, state: job.burned ? 'burned' : job.result };
        state.jobs.wajan = null;
        return EVENT_ACT;
      }
      if (!hand) return EVENT_DENY;
      const spec = INGREDIENTS[hand.kind];
      if (!spec.cookFrom.includes(hand.state)) return EVENT_DENY;
      state.jobs.wajan = {
        kind: hand.kind, progress: 0, duration: COOK_SECONDS, result: 'cooked',
        done: false, burnLeft: 0, burned: false,
      };
      state.hand = null;
      return EVENT_ACT;
    }
    if (station.kind === 'piring') {
      if (hand && isPrepared(hand) && state.plate.length < PLATE_MAX) {
        state.plate.push(hand);
        state.hand = null;
        return EVENT_ACT;
      }
      if (!hand && state.plate.length > 0) {
        state.hand = state.plate.pop();
        return EVENT_ACT;
      }
      return EVENT_DENY;
    }
    if (station.kind === 'saji') {
      const order = plateMatchesOrder(state);
      if (!order) return EVENT_DENY;
      const index = state.orders.indexOf(order);
      state.orders.splice(index, 1);
      const timeBonus = Math.round(50 * (order.patience / order.maxPatience));
      const comboBonus = state.combo * 10;
      const total = order.recipe.price + timeBonus + comboBonus;
      state.score += total;
      state.coins += order.recipe.price;
      state.combo += 1;
      state.bestCombo = Math.max(state.bestCombo, state.combo);
      state.served += 1;
      state.plate = [];
      state.popups.push({ x: 1150, y: 300, text: `+${total}`, color: '#58b368', t: 1.2 });
      setFlash(`Disajikan: ${order.recipe.name}! +${total}`, '#58b368');
      return EVENT_SERVED | EVENT_ACT;
    }
    if (station.kind === 'sampah') {
      if (hand) {
        state.hand = null;
        return EVENT_ACT;
      }
      if (state.plate.length > 0) {
        state.plate = [];
        return EVENT_ACT;
      }
      return EVENT_DENY;
    }
    return EVENT_DENY;
  }

  /**
   * Advance the kitchen one fixed step. `attract` freezes the shift clock and the
   * orders' patience, so the title screen can show a living kitchen that never ends.
   */
  function step(dt, cmd, attract) {
    let events = 0;
    if (state.over) return events;
    state.time += dt;
    if (!attract) {
      state.timeLeft -= dt;
      if (state.timeLeft <= 0) {
        state.timeLeft = 0;
        state.over = true;
        return events | EVENT_OVER;
      }
    }
    state.level = Math.min(5, 1 + Math.floor(state.time / 30));

    if (cmd) {
      if (cmd.interact) {
        const station = stationById(cmd.interact);
        if (station) {
          state.chef.tx = station.anchor.x;
          state.chef.ty = station.anchor.y;
          pendingInteract = station.id;
        }
      } else if (typeof cmd.tx === 'number' && typeof cmd.ty === 'number') {
        state.chef.tx = clamp(cmd.tx, 24, FIELD.width - 24);
        state.chef.ty = clamp(cmd.ty, 170, FIELD.height - 24);
        pendingInteract = null;
      }
    }

    const chef = state.chef;
    const dx = chef.tx - chef.x;
    const dy = chef.ty - chef.y;
    const dist = Math.hypot(dx, dy);
    if (dist > 4) {
      const stride = Math.min(CHEF_SPEED * dt, dist);
      chef.x = clamp(chef.x + (dx / dist) * stride, 24, FIELD.width - 24);
      chef.y = clamp(chef.y + (dy / dist) * stride, 170, FIELD.height - 24);
      chef.moving = true;
      if (dx !== 0) chef.face = dx > 0 ? 1 : -1;
    } else {
      chef.moving = false;
    }

    if (pendingInteract) {
      const station = stationById(pendingInteract);
      if (station && Math.hypot(station.anchor.x - chef.x, station.anchor.y - chef.y) < 42) {
        events |= doInteract(station);
        pendingInteract = null;
      }
    }

    for (const key of ['talenan', 'wajan']) {
      const job = state.jobs[key];
      if (!job) continue;
      if (!job.done) {
        job.progress += dt;
        if (job.progress >= job.duration) {
          job.done = true;
          job.progress = job.duration;
          if (key === 'wajan') job.burnLeft = BURN_SECONDS;
        }
      } else if (key === 'wajan' && !job.burned) {
        job.burnLeft -= dt;
        if (job.burnLeft <= 0) job.burned = true;
      }
    }

    state.spawnTimer -= dt;
    if (state.spawnTimer <= 0 && state.orders.length < 4) {
      spawnOrder();
      state.spawnTimer = Math.max(5.5, 11 - state.level) + random.next() * 2;
    }

    if (!attract) {
      for (let i = state.orders.length - 1; i >= 0; i -= 1) {
        const order = state.orders[i];
        order.patience -= dt;
        if (order.patience <= 0) {
          state.orders.splice(i, 1);
          state.hearts -= 1;
          state.lost += 1;
          state.combo = 0;
          setFlash(`Pesanan hangus: ${order.recipe.name}!`, '#e5534b');
          events |= EVENT_LOST;
          if (state.hearts <= 0) {
            state.over = true;
            events |= EVENT_OVER;
          }
        }
      }
    }

    if (state.flash) {
      state.flash.t -= dt;
      if (state.flash.t <= 0) state.flash = null;
    }
    for (let i = state.popups.length - 1; i >= 0; i -= 1) {
      const popup = state.popups[i];
      popup.t -= dt;
      popup.y -= 24 * dt;
      if (popup.t <= 0) state.popups.splice(i, 1);
    }
    return events;
  }

  return { state, step, reset };
}
