[![make.fun · best-cooking-game-20261125-0137](https://make.fun/badge/best-cooking-game-20261125-0137.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![make.fun · best-cooking-game-20261125-0137 · rank](https://make.fun/badge/best-cooking-game-20261125-0137/r30639623-lab/dapur-kilat/rank.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![make.fun · best-cooking-game-20261125-0137 · reward](https://make.fun/badge/best-cooking-game-20261125-0137/r30639623-lab/dapur-kilat/reward.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)

# Dapur Kilat

Game masak cepat saji: terima pesanan, potong bahan, panggang roti,
rakit hidangan, dan sajikan sebelum timer habis. Makin cepat, makin
besar kombo dan skornya.

## Cara main

- **Klik bahan** di rak bawah: Roti masuk kompor (panggang), Tomat dan
  Selada masuk talenan (potong), Keju langsung ke piring.
- **POTONG** saat bahan ada di talenan; **SAJIKAN** saat piring berisi
  semua bahan yang diminta pesanan.
- Pesanan yang waktunya tinggal sedikit berubah merah dengan badge "!".
- Sajikan beruntun tanpa gagal untuk menaikkan kombo (skor x2, x3, ...).
- Game 120 detik; skor akhir dihitung dari semua hidangan yang tersaji.

## Struktur kode

- `game/index.html` — halaman + kanvas game
- `game/src/main.js` — loop game + state + input klik
- `game/src/kitchen.js` — gambar dapur: kompor, talenan, piring, koki, rak
- `game/src/orders.js` — resep + antrean pesanan + timer + skor
- `game/src/render.js` — gambar makanan + kartu pesanan + tombol
- `main.ts` — program penyerahan (stdlib Node 22 saja)

## Lisensi

MIT — lihat `LICENSE`.
