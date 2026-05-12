// ─────────────────────────────────────────────────────────────
//  habibi-baileys
//  Drop-in enhanced Baileys wrapper — for any WhatsApp bot.
//  https://github.com/HabibiOfficial/habibi-baileys
//  https://www.npmjs.com/package/habibi-baileys
// ─────────────────────────────────────────────────────────────

// ── Fungsi utama ─────────────────────────────────────────────
export { makeHabibiSocket }                  from './makeHabibiSocket.js';
export { default }                           from './makeHabibiSocket.js';

// ── Helper individual (bisa dipakai manual) ───────────────────
export { attachHelpers }                     from './attachHelpers.js';
export { makeButtons, attachSendButton }     from './helpers/buttons.js';
export { attachMessage }                     from './helpers/message.js';
export { attachMedia }                       from './helpers/media.js';
export { attachList }                        from './helpers/list.js';
export { makeNewsletterCtx, makeAdReplyCtx } from './helpers/newsletter.js';
export { normalizePhone, toJid, attachPhone } from './helpers/phone.js';

// ── Re-export semua dari Baileys resmi ────────────────────────
// Cukup import dari 1 package saja: habibi-baileys
export * from '@whiskeysockets/baileys';
