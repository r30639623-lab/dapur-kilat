// A tiny seeded random source, so a fixed seed always deals the same orders.
// One generator per world; the world re-seeds it on reset, so screenshot scenes
// staged from a seed are the same frame every time.

export function createRandom(seed) {
  let s = (seed >>> 0) || 1;
  return {
    next() {
      s = (s * 1664525 + 1013904223) >>> 0;
      return s / 4294967296;
    },
    int(n) {
      return Math.floor(this.next() * n);
    },
    pick(list) {
      return list[this.int(list.length)];
    },
  };
}
