// Every tuning number, recipe and colour for Dapur Kilat in one place.
// The playfield is a fixed 1280x720 logical area; the renderer scales it to the window,
// so no rule below depends on the screen size.

export const FIELD = { width: 1280, height: 720 };

/** The simulation's fixed step, in seconds: 60 updates a second whatever the display's rate. */
export const STEP = 1 / 60;

/** One work shift lasts this long; when it hits zero the shift ends. */
export const SHIFT_SECONDS = 150;

export const CHEF_SPEED = 360;
export const CHEF_RADIUS = 22;

/** Seconds to chop one item on the board, and to cook one item in the wok. */
export const CHOP_SECONDS = 2.0;
export const COOK_SECONDS = 3.0;

/** Seconds a finished dish waits in the wok before it burns. */
export const BURN_SECONDS = 5.0;

/** How many prepared parts fit on the plating station at once. */
export const PLATE_MAX = 3;

export const HEARTS = 3;

export const BEST_KEY = 'dapur-kilat.best';

export const FONT = 'system-ui, -apple-system, "Segoe UI", sans-serif';

export const PALETTE = {
  floorA: '#c98f5f',
  floorB: '#bd8252',
  wall: '#8a5a3b',
  wallTop: '#6e4529',
  counter: '#e8dcc8',
  counterEdge: '#b09a7a',
  board: '#2e3a4d',
  boardEdge: '#1d2735',
  text: '#fff7e8',
  muted: '#d8c9ae',
  dark: '#3a2a1c',
  hud: '#26221e',
  good: '#58b368',
  warn: '#f2c94c',
  bad: '#e5534b',
};

/**
 * Every ingredient: chop says it can be chopped from raw, cookFrom lists the states
 * the wok accepts (sambal needs no prep at all, sayur is never cooked).
 */
export const INGREDIENTS = {
  nasi: { name: 'Nasi', color: '#f5efdc', chop: false, cookFrom: ['raw'] },
  mie: { name: 'Mie', color: '#f2c94c', chop: false, cookFrom: ['raw'] },
  ayam: { name: 'Ayam', color: '#d98a4b', chop: true, cookFrom: ['chopped'] },
  telur: { name: 'Telur', color: '#fff6d8', chop: false, cookFrom: ['raw'] },
  sayur: { name: 'Sayur', color: '#58b368', chop: true, cookFrom: [] },
  sambal: { name: 'Sambal', color: '#e5534b', chop: false, cookFrom: [] },
};

/** The menu: each dish is three prepared parts, served together for its price. */
export const RECIPES = [
  {
    id: 'nasi-goreng', name: 'Nasi Goreng', price: 120,
    needs: [
      { kind: 'nasi', state: 'cooked' },
      { kind: 'ayam', state: 'cooked' },
      { kind: 'sambal', state: 'raw' },
    ],
  },
  {
    id: 'mie-ayam', name: 'Mie Ayam', price: 110,
    needs: [
      { kind: 'mie', state: 'cooked' },
      { kind: 'sayur', state: 'chopped' },
      { kind: 'telur', state: 'cooked' },
    ],
  },
  {
    id: 'sate-kilat', name: 'Sate Kilat', price: 130,
    needs: [
      { kind: 'ayam', state: 'cooked' },
      { kind: 'sambal', state: 'raw' },
      { kind: 'sayur', state: 'chopped' },
    ],
  },
  {
    id: 'gado-gado', name: 'Gado-Gado', price: 100,
    needs: [
      { kind: 'sayur', state: 'chopped' },
      { kind: 'telur', state: 'cooked' },
      { kind: 'sambal', state: 'raw' },
    ],
  },
];

/**
 * Every station in the kitchen: bins along the top wall, the work row below them,
 * and the trash bin. The anchor is where the cook stands to use the station.
 */
export const STATIONS = [
  { id: 'bin-nasi', kind: 'bin', ingredient: 'nasi', label: 'Nasi', key: '1', x: 300, y: 84, w: 104, h: 68, anchor: { x: 352, y: 180 } },
  { id: 'bin-mie', kind: 'bin', ingredient: 'mie', label: 'Mie', key: '2', x: 418, y: 84, w: 104, h: 68, anchor: { x: 470, y: 180 } },
  { id: 'bin-ayam', kind: 'bin', ingredient: 'ayam', label: 'Ayam', key: '3', x: 536, y: 84, w: 104, h: 68, anchor: { x: 588, y: 180 } },
  { id: 'bin-telur', kind: 'bin', ingredient: 'telur', label: 'Telur', key: '4', x: 654, y: 84, w: 104, h: 68, anchor: { x: 706, y: 180 } },
  { id: 'bin-sayur', kind: 'bin', ingredient: 'sayur', label: 'Sayur', key: '5', x: 772, y: 84, w: 104, h: 68, anchor: { x: 824, y: 180 } },
  { id: 'bin-sambal', kind: 'bin', ingredient: 'sambal', label: 'Sambal', key: '6', x: 890, y: 84, w: 104, h: 68, anchor: { x: 942, y: 180 } },
  { id: 'talenan', kind: 'talenan', label: 'Talenan', sub: 'Potong', x: 300, y: 200, w: 180, h: 120, anchor: { x: 390, y: 348 } },
  { id: 'wajan', kind: 'wajan', label: 'Wajan', sub: 'Masak', x: 520, y: 200, w: 220, h: 120, anchor: { x: 630, y: 348 } },
  { id: 'piring', kind: 'piring', label: 'Piring', sub: 'Rakit', x: 780, y: 200, w: 220, h: 120, anchor: { x: 890, y: 348 } },
  { id: 'saji', kind: 'saji', label: 'Jendela Saji', sub: 'Antar', x: 1040, y: 200, w: 224, h: 120, anchor: { x: 1152, y: 348 } },
  { id: 'sampah', kind: 'sampah', label: 'Sampah', sub: 'Buang', x: 300, y: 360, w: 120, h: 64, anchor: { x: 360, y: 452 } },
];
