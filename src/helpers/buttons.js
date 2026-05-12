// ─────────────────────────────────────────────────────────────
//  habibi-baileys · helpers/buttons.js
//  sock.sendButton — kirim pesan interaktif dengan tombol WA
//  sock.makeButtons — builder untuk semua tipe tombol
// ─────────────────────────────────────────────────────────────

/**
 * Builder untuk berbagai tipe tombol WhatsApp interaktif.
 *
 * @example
 * import { makeButtons } from 'habibi-baileys'
 * makeButtons.quickReply('Pilih A', 'pilih_a')
 * makeButtons.ctaUrl('Website', 'https://example.com')
 */
export const makeButtons = {
  /** Tombol quick reply — user klik, bot terima teks */
  quickReply: (display_text, id) => ({
    name: 'quick_reply',
    buttonParamsJson: JSON.stringify({ display_text, id }),
  }),

  /** Tombol buka URL di browser */
  ctaUrl: (display_text, url) => ({
    name: 'cta_url',
    buttonParamsJson: JSON.stringify({ display_text, url, merchant_url: url }),
  }),

  /** Tombol salin teks ke clipboard */
  ctaCopy: (display_text, copy_code) => ({
    name: 'cta_copy',
    buttonParamsJson: JSON.stringify({ display_text, copy_code }),
  }),

  /** Tombol telepon langsung */
  ctaCall: (display_text, phone_number) => ({
    name: 'cta_call',
    buttonParamsJson: JSON.stringify({ display_text, phone_number }),
  }),
};

/**
 * Resolve source media ke format yang diterima Baileys.
 * - Buffer        → pass-through
 * - "https://..." → { url: source }
 * - "/path/file"  → baca dari disk (lazy import fs)
 * - null          → null
 *
 * @param {Buffer|string|null} source
 * @returns {Buffer|{url:string}|null}
 */
async function resolveSource(source) {
  if (!source) return null;
  if (Buffer.isBuffer(source)) return source;
  if (typeof source === 'string' && /^https?:\/\//i.test(source)) {
    return { url: source };
  }
  if (typeof source === 'string') {
    const fs = await import('node:fs');
    if (fs.existsSync(source)) return fs.readFileSync(source);
  }
  return null;
}

/**
 * Attach sock.sendButton ke instance socket Baileys.
 * Aman dipanggil berkali-kali (idempotent).
 *
 * @param {import('@whiskeysockets/baileys').WASocket} sock
 */
export function attachSendButton(sock) {
  if (typeof sock.sendButton === 'function') return sock;

  /**
   * Kirim pesan interaktif dengan tombol.
   *
   * @param {string}              jid      - Target JID (grup / private)
   * @param {Buffer|string|null}  source   - Gambar/video header. null = text only
   * @param {string|null}         text     - Isi pesan (caption / body)
   * @param {object}              quoted   - Pesan yang di-quote (msg.raw)
   * @param {object}              options
   * @param {Array}               options.buttons      - Array dari makeButtons.*
   * @param {string}              options.footer       - Footer teks kecil di bawah
   * @param {object}              options.contextInfo  - contextInfo tambahan (newsletter dll)
   * @param {'image'|'video'|'audio'|'document'} options.type - Tipe media header
   * @param {string}              options.mimetype     - Untuk video/audio/document
   * @param {string}              options.fileName     - Untuk document
   *
   * @example
   * await sock.sendButton(chat, null, 'Pilih menu:', msg.raw, {
   *   buttons: [
   *     sock.makeButtons.quickReply('🤖 AI', '.menu ai'),
   *     sock.makeButtons.ctaUrl('🔗 Website', 'https://example.com'),
   *   ],
   *   footer: 'HABIBI BOT',
   * })
   */
  sock.sendButton = async function (jid, source, text = null, quoted, options = {}) {
    const { buttons = [], footer, contextInfo, type, mediaType, mimetype, fileName } = options;

    const msg = {};
    if (contextInfo) msg.contextInfo = contextInfo;
    if (text !== null) msg.caption = text;
    if (footer) msg.footer = footer;
    if (buttons.length) msg.interactiveButtons = buttons;

    const data = await resolveSource(source);
    if (data) {
      const mtype = type || mediaType || 'image';
      if (mtype === 'image')    { msg.image    = data; }
      else if (mtype === 'video')    { msg.video    = data; msg.mimetype = mimetype || 'video/mp4'; }
      else if (mtype === 'audio')    { msg.audio    = data; msg.mimetype = mimetype || 'audio/mpeg'; }
      else if (mtype === 'document') { msg.document = data; msg.mimetype = mimetype || 'application/octet-stream'; if (fileName) msg.fileName = fileName; }
    }

    return sock.sendMessage(jid, msg, { quoted });
  };

  sock.makeButtons = makeButtons;

  return sock;
}
