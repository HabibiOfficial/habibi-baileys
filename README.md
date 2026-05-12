# habibi-baileys

> Drop-in enhanced [Baileys](https://github.com/WhiskeySockets/Baileys) wrapper untuk **semua bot WhatsApp**. Tinggal ganti `makeWASocket` → `makeHabibiSocket`, semua helper langsung aktif.

[![npm version](https://img.shields.io/npm/v/habibi-baileys.svg)](https://www.npmjs.com/package/habibi-baileys)
[![npm downloads](https://img.shields.io/npm/dm/habibi-baileys.svg)](https://www.npmjs.com/package/habibi-baileys)
[![license](https://img.shields.io/npm/l/habibi-baileys.svg)](LICENSE)
[![GitHub](https://img.shields.io/badge/GitHub-HabibiOfficial-181717?logo=github)](https://github.com/HabibiOfficial/habibi-baileys)

---

## Kenapa habibi-baileys?

Baileys resmi hanya menyediakan `sendMessage` yang sangat low-level. Setiap bot harus menulis ulang helper yang sama — kirim gambar, tombol, list, react, dll. Library ini menyatukan semua itu menjadi API yang bersih dan siap pakai untuk **bot apapun**.

| Fitur | Baileys biasa | habibi-baileys |
|---|:---:|:---:|
| Login QR Code | ✅ | ✅ |
| Login Pairing Code | ✅ | ✅ |
| sendButton + tombol interaktif | ❌ | ✅ |
| sendImage / sendVideo | Manual | ✅ |
| sendList | Manual | ✅ |
| reply / react | Manual | ✅ |
| Newsletter context | Manual | ✅ |
| Drop-in replacement | — | ✅ |
| Re-export Baileys lengkap | — | ✅ |

---

## Instalasi

```bash
npm install habibi-baileys @whiskeysockets/baileys
```

> **Kompatibilitas Baileys:**  
> Tested dengan `@whiskeysockets/baileys` **v7.0.0-rc10** (terbaru) dan v6.x.  
> Node.js **>=20.0.0** direkomendasikan (sesuai requirement Baileys v7).

---

## Quick Start — Drop-in Replacement

Cukup **ganti satu baris**: `makeWASocket` → `makeHabibiSocket`.  
Semua opsi Baileys tetap berjalan normal, helper langsung aktif.

```js
// SEBELUM (Baileys biasa)
import makeWASocket from '@whiskeysockets/baileys'
const sock = makeWASocket({ auth: state })

// SESUDAH (habibi-baileys) — semua helper langsung aktif
import { makeHabibiSocket } from 'habibi-baileys'
const sock = makeHabibiSocket({ auth: state })

// atau sebagai default import:
import makeHabibiSocket from 'habibi-baileys'
const sock = makeHabibiSocket({ auth: state })
```

Karena `habibi-baileys` juga meng-export ulang semua dari Baileys resmi, import lain cukup dari satu package:

```js
// Sebelum — 2 import
import makeWASocket, { useMultiFileAuthState, DisconnectReason } from '@whiskeysockets/baileys'
import { makeHabibiSocket, makeButtons } from 'habibi-baileys'

// Sesudah — 1 import saja
import makeHabibiSocket, { useMultiFileAuthState, DisconnectReason, makeButtons } from 'habibi-baileys'
```

---

## Login — QR Code & Pairing Code

`makeHabibiSocket` support kedua cara login bawaan Baileys tanpa konfigurasi tambahan.

### Cara 1 — QR Code (scan dari WA)

```js
import makeHabibiSocket, { useMultiFileAuthState } from 'habibi-baileys'

const { state, saveCreds } = await useMultiFileAuthState('./session')

const sock = makeHabibiSocket({
  auth: state,
  printQRInTerminal: true,   // QR langsung tampil di terminal
})

sock.ev.on('creds.update', saveCreds)
```

### Cara 2 — Pairing Code (masukkan kode di WA)

Tidak perlu scan QR — cukup masukkan 8-digit kode di  
**WA → Perangkat Tertaut → Tautkan Perangkat → Tautkan dengan nomor telepon**.

```js
import makeHabibiSocket, { useMultiFileAuthState } from 'habibi-baileys'
import readline from 'node:readline'

const { state, saveCreds } = await useMultiFileAuthState('./session')

const sock = makeHabibiSocket({
  auth: state,
  printQRInTerminal: false,  // matikan QR, pakai pairing code
})

sock.ev.on('creds.update', saveCreds)

// Minta pairing code saat pertama kali login
sock.ev.on('connection.update', async ({ connection, isNewLogin }) => {
  if (connection === 'open' && isNewLogin) {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
    const phone = await new Promise(resolve => rl.question('Nomor HP (contoh 628xxx): ', resolve))
    rl.close()

    // Nomor harus format internasional tanpa + (628xxx...)
    const code = await sock.requestPairingCode(phone.trim())
    console.log('Kode pairing kamu:', code)
    // Masukkan kode ini di WA → Perangkat Tertaut → Tautkan dengan nomor telepon
  }
})
```

> **Catatan:**  
> - Pairing code berlaku **60 detik**, request ulang jika expired  
> - `requestPairingCode` adalah method native Baileys, langsung tersedia di socket  
> - Gunakan `normalizePhone()` dari library ini untuk membersihkan nomor sebelum dipakai

**Pakai `normalizePhone` agar nomor apapun bisa diterima:**

```js
import { normalizePhone } from 'habibi-baileys'

// Sebelum requestPairingCode — normalisasi dulu
const phone = normalizePhone(inputNomor)  // handles 0812x / +62 812 / 62812 / dll
const code  = await sock.requestPairingCode(phone)
console.log('Kode:', code)
```

---

## Contoh Bot Lengkap

```js
import makeHabibiSocket, {
  useMultiFileAuthState,
  DisconnectReason,
  makeButtons,
  makeNewsletterCtx,
} from 'habibi-baileys'

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState('./session')

  // Ganti printQRInTerminal: false + requestPairingCode() untuk pairing code
  const sock = makeHabibiSocket({
    auth: state,
    printQRInTerminal: true,
  })

  sock.ev.on('creds.update', saveCreds)

  // Auto reconnect
  sock.ev.on('connection.update', ({ connection, lastDisconnect }) => {
    if (connection === 'close') {
      const shouldReconnect =
        lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut
      if (shouldReconnect) startBot()
    }
  })

  sock.ev.on('messages.upsert', async ({ messages }) => {
    const msg  = messages[0]
    if (!msg.message || msg.key.fromMe) return

    const chat = msg.key.remoteJid
    const body = msg.message?.conversation
              || msg.message?.extendedTextMessage?.text
              || ''

    if (body === '.ping') {
      await sock.react(chat, msg, '⚡')
      return sock.reply(chat, 'Pong! Bot aktif 🟢', msg)
    }

    if (body === '.menu') {
      return sock.sendButton(chat, null, '📋 *Menu Bot*\nPilih salah satu:', msg, {
        buttons: [
          makeButtons.quickReply('🤖 Fitur AI', '.ai'),
          makeButtons.quickReply('📥 Download', '.downloader'),
          makeButtons.ctaUrl('🌐 GitHub', 'https://github.com/HabibiOfficial/habibi-baileys'),
        ],
        footer: 'habibi-baileys',
      })
    }

    if (body === '.list') {
      return sock.sendList(chat, {
        title: 'Menu Bot',
        text: 'Pilih kategori yang kamu inginkan:',
        footer: 'habibi-baileys',
        buttonText: '📋 Buka Menu',
        sections: [
          {
            title: 'Fitur Utama',
            rows: [
              { title: '🤖 AI',          description: 'ChatGPT, Gemini, dll', rowId: '.ai' },
              { title: '📥 Downloader',  description: 'YouTube, TikTok, dll', rowId: '.dl' },
              { title: '🛠 Tools',        description: 'Berbagai alat bantu',  rowId: '.tools' },
            ],
          },
        ],
      }, msg)
    }
  })
}

startBot()
```

---

## API Reference

### `makeHabibiSocket(options)`

Drop-in replacement untuk `makeWASocket`. Semua opsi Baileys diterima.

```js
import makeHabibiSocket from 'habibi-baileys'
const sock = makeHabibiSocket({ auth: state, printQRInTerminal: true })
```

---

### `attachHelpers(sock)`

Untuk yang sudah punya socket existing dan ingin menambah helper secara manual.

```js
import makeWASocket from '@whiskeysockets/baileys'
import { attachHelpers } from 'habibi-baileys'

const sock = makeWASocket({ auth: state })
attachHelpers(sock)  // sekarang sock.reply, sock.sendButton, dll tersedia
```

---

### `sock.reply(jid, text, quoted?, opts?)`

Balas pesan dengan teks.

```js
await sock.reply(chat, 'Halo! 👋', msg)
await sock.reply(chat, 'Dengan mention', msg, { mentions: [sender] })
```

---

### `sock.sendText(jid, text, opts?)`

Kirim teks tanpa quote.

```js
await sock.sendText(chat, 'Pesan baru tanpa quote')
```

---

### `sock.replyMention(jid, text, mentions, quoted?)`

Balas dengan tag / mention user.

```js
await sock.replyMention(chat, 'Halo @kamu!', ['628xxx@s.whatsapp.net'], msg)
```

---

### `sock.react(jid, rawMsg, emoji)`

React ke pesan dengan emoji.

```js
await sock.react(chat, msg, '⏳')  // loading
await sock.react(chat, msg, '✅')  // selesai
await sock.react(chat, msg, '❌')  // error
await sock.react(chat, msg, '')    // hapus react
```

---

### `sock.sendButton(jid, source, text, quoted?, opts?)`

Kirim pesan interaktif dengan tombol.

| Parameter | Tipe | Keterangan |
|---|---|---|
| `jid` | `string` | Target JID (grup / private) |
| `source` | `Buffer \| string \| null` | Gambar/video header — Buffer, path lokal, URL, atau `null` untuk text-only |
| `text` | `string \| null` | Isi teks pesan |
| `quoted` | `object` | Pesan yang di-quote |
| `opts.buttons` | `Array` | Tombol dari `makeButtons.*` (maks 3) |
| `opts.footer` | `string` | Teks footer kecil di bawah |
| `opts.type` | `'image' \| 'video'` | Tipe media header (default: `'image'`) |
| `opts.contextInfo` | `object` | contextInfo tambahan (newsletter dll) |

```js
// Text only
await sock.sendButton(chat, null, 'Pilih opsi:', msg, {
  buttons: [
    makeButtons.quickReply('Opsi A', 'opsi_a'),
    makeButtons.quickReply('Opsi B', 'opsi_b'),
  ],
  footer: 'Bot saya',
})

// Dengan gambar (URL)
await sock.sendButton(chat, 'https://example.com/img.jpg', 'Halo!', msg, {
  buttons: [makeButtons.ctaUrl('Kunjungi', 'https://example.com')],
})

// Dengan gambar (Buffer atau path lokal)
await sock.sendButton(chat, './assets/banner.jpg', 'Selamat datang!', msg, {
  buttons: [makeButtons.quickReply('📋 Menu', '.menu')],
})
```

---

### `makeButtons`

Builder untuk semua tipe tombol interaktif WhatsApp.

```js
import { makeButtons } from 'habibi-baileys'

// Quick Reply — user klik, bot menerima teks sebagai pesan
makeButtons.quickReply('Teks Tombol', 'id_atau_teks')

// CTA URL — buka link di browser
makeButtons.ctaUrl('Buka Website', 'https://example.com')

// CTA Copy — salin teks ke clipboard
makeButtons.ctaCopy('Salin Kode', 'KODE123')

// CTA Call — buka dialer telepon
makeButtons.ctaCall('Hubungi Kami', '6281234567890')
```

---

### `sock.sendList(jid, opts, quoted?)`

Kirim list message dengan banyak pilihan.

```js
await sock.sendList(chat, {
  title: 'Judul Pesan',
  text: 'Pilih salah satu opsi berikut:',
  footer: 'Footer kecil',
  buttonText: '📋 Lihat Pilihan',
  sections: [
    {
      title: 'Kategori 1',
      rows: [
        { title: 'Opsi A', description: 'Deskripsi opsional', rowId: '.cmdA' },
        { title: 'Opsi B', rowId: '.cmdB' },
      ],
    },
    {
      title: 'Kategori 2',
      rows: [
        { title: 'Opsi C', rowId: '.cmdC' },
      ],
    },
  ],
}, msg)
```

---

### `sock.sendImage(jid, image, caption?, quoted?, opts?)`

```js
await sock.sendImage(chat, './banner.jpg', 'Caption gambar', msg)
await sock.sendImage(chat, 'https://example.com/img.jpg', 'Dari URL', msg)
await sock.sendImage(chat, imageBuffer, '', msg)
```

---

### `sock.sendVideo(jid, video, caption?, quoted?, opts?)`

```js
await sock.sendVideo(chat, './video.mp4', 'Caption video', msg)
await sock.sendVideo(chat, videoBuffer, '', msg, { gifPlayback: true })
```

---

### `sock.sendAudio(jid, audio, opts?, quoted?)`

```js
await sock.sendAudio(chat, './lagu.mp3', { ptt: false }, msg)  // audio biasa
await sock.sendAudio(chat, audioBuffer, { ptt: true }, msg)    // voice note
```

---

### `sock.sendDocument(jid, doc, fileName, mimetype, quoted?, opts?)`

```js
await sock.sendDocument(chat, pdfBuffer, 'laporan.pdf', 'application/pdf', msg)
await sock.sendDocument(chat, './data.xlsx', 'data.xlsx',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', msg)
```

---

### `sock.sendSticker(jid, sticker, quoted?)`

```js
await sock.sendSticker(chat, stickerBuffer, msg)  // harus format WebP
```

---

### `normalizePhone(raw, defaultCode?)` — Normalisasi Nomor HP

Bersihkan nomor HP dari format apapun ke format internasional bersih yang diterima WhatsApp.

| Input | Output |
|---|---|
| `'0812-3456-7890'` | `'628123456789'` |
| `'+62 812 3456 7890'` | `'628123456789'` |
| `'812 3456 7890'` | `'628123456789'` |
| `'628123456789'` | `'628123456789'` |
| `'+1 650 555 0100'` | `'16505550100'` |

```js
import { normalizePhone, toJid } from 'habibi-baileys'

// Normalisasi saja
normalizePhone('0812-3456-7890')         // "628123456789"
normalizePhone('+62 812 3456 7890')      // "628123456789"
normalizePhone('812xxx', '62')           // "62812xxx"

// Konversi langsung ke JID WhatsApp
toJid('0812-3456-7890')                  // "628123456789@s.whatsapp.net"

// Pakai saat requestPairingCode agar nomor apapun bisa masuk
const phone = normalizePhone(inputUser)
const code  = await sock.requestPairingCode(phone)

// Pakai sebagai method di socket (sudah di-attach otomatis)
const jid = sock.toJid('0812-3456-7890') // "628123456789@s.whatsapp.net"
```

> Default kode negara: `'62'` (Indonesia). Ubah parameter kedua untuk negara lain, contoh `normalizePhone('07911123456', '44')` untuk UK.

---

### `makeNewsletterCtx(opts)` — Efek "Diteruskan dari Saluran"

Tambahkan konteks newsletter/saluran ke pesan apapun.

```js
import { makeNewsletterCtx } from 'habibi-baileys'

await sock.sendButton(chat, null, 'Halo!', msg, {
  buttons: [makeButtons.quickReply('Menu', '.menu')],
  contextInfo: makeNewsletterCtx({
    jid: '120363xxxxxxxxxx@newsletter',
    name: 'Nama Saluran',
  }),
})
```

---

### `makeAdReplyCtx(opts)` — Thumbnail Preview di Header

Tampilkan thumbnail di atas pesan tanpa menyimpan ke galeri.

```js
import { makeAdReplyCtx } from 'habibi-baileys'

await sock.reply(chat, 'Info bot', msg, {
  contextInfo: makeAdReplyCtx({
    title: 'Judul Preview',
    body: 'Subjudul',
    thumbnailUrl: 'https://example.com/thumbnail.jpg',
    sourceUrl: 'https://github.com/HabibiOfficial/habibi-baileys',
  }),
})
```

---

## Struktur Package

```
habibi-baileys/
├── src/
│   ├── index.js                 ← entry point, semua export ada di sini
│   ├── makeHabibiSocket.js      ← makeHabibiSocket() — wrapper utama
│   ├── attachHelpers.js         ← attach semua helper ke socket existing
│   └── helpers/
│       ├── buttons.js           ← sendButton + makeButtons
│       ├── message.js           ← reply, react, sendText, replyMention
│       ├── media.js             ← sendImage, sendVideo, sendAudio, sendDocument, sendSticker
│       ├── list.js              ← sendList
│       └── newsletter.js        ← makeNewsletterCtx, makeAdReplyCtx
├── package.json
├── .gitignore
├── .npmignore
└── README.md
```

---

## Cara Upload ke GitHub

```bash
git init
git add .
git commit -m "feat: initial release habibi-baileys v1.0.0"
git remote add origin https://github.com/HabibiOfficial/habibi-baileys.git
git push -u origin main
```

## Cara Publish ke npm

```bash
npm login
npm publish
```

---

## Perbedaan dengan Baileys Resmi

habibi-baileys **tidak** memodifikasi Baileys di dalam, hanya menambah method ke atas socket yang sudah ada. Ini artinya:

- ✅ Update Baileys resmi bisa langsung dipakai
- ✅ Semua fitur Baileys tetap berfungsi normal
- ✅ Tidak ada breaking change dari sisi Baileys
- ✅ Kompatibel dengan semua Baileys fork (ganti peer dependency)

---

## License

MIT © [HabibiOfficial](https://github.com/HabibiOfficial)
