// Mouse and keyboard, translated into the world's commands.
// A click on a station walks the cook there and uses it; a click on the floor just
// walks. Arrow keys / WASD steer the cook, Space uses the nearest station, 1-6 grab
// from the ingredient bins, P pauses, Space / Enter confirms on the title screen.

import { FIELD } from './config.js';

export const ACTION_CONFIRM = 1;
export const ACTION_PAUSE = 2;

const KEYMAP = {
  ArrowLeft: 'left', KeyA: 'left',
  ArrowRight: 'right', KeyD: 'right',
  ArrowUp: 'up', KeyW: 'up',
  ArrowDown: 'down', KeyS: 'down',
};

export function createInput(canvas) {
  let clickPoint = null;
  let actions = 0;
  let numberQueue = [];
  const keys = new Set();

  function toLogical(event) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: (event.clientX - rect.left) * (FIELD.width / rect.width),
      y: (event.clientY - rect.top) * (FIELD.height / rect.height),
    };
  }

  canvas.addEventListener('pointerdown', (event) => {
    clickPoint = toLogical(event);
    actions |= ACTION_CONFIRM;
  });

  window.addEventListener('keydown', (event) => {
    if (event.code === 'Space' || event.code === 'Enter') {
      actions |= ACTION_CONFIRM;
      event.preventDefault();
    } else if (event.code === 'KeyP' || event.code === 'Escape') {
      actions |= ACTION_PAUSE;
    } else if (KEYMAP[event.code]) {
      keys.add(KEYMAP[event.code]);
    } else if (/^Digit[1-6]$/.test(event.code)) {
      numberQueue.push(Number(event.code.slice(5)));
    }
  });

  window.addEventListener('keyup', (event) => {
    if (KEYMAP[event.code]) keys.delete(KEYMAP[event.code]);
  });

  return {
    takeClick() {
      const point = clickPoint;
      clickPoint = null;
      return point;
    },
    takeActions() {
      const taken = actions;
      actions = 0;
      return taken;
    },
    takeNumber() {
      return numberQueue.length > 0 ? numberQueue.shift() : 0;
    },
    direction() {
      let x = 0;
      let y = 0;
      if (keys.has('left')) x -= 1;
      if (keys.has('right')) x += 1;
      if (keys.has('up')) y -= 1;
      if (keys.has('down')) y += 1;
      return { x, y };
    },
  };
}
