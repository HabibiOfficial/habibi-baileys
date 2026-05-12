// ─────────────────────────────────────────────────────────────
//  habibi-baileys · makeHabibiSocket.js
//  Drop-in replacement untuk makeWASocket dari Baileys resmi.
//  Semua helper langsung aktif tanpa setup tambahan.
// ─────────────────────────────────────────────────────────────
import makeWASocket from '@whiskeysockets/baileys';
import { attachHelpers } from './attachHelpers.js';

/**
 * Buat socket WhatsApp dengan semua habibi-baileys helper sudah terpasang.
 * Ini drop-in replacement untuk makeWASocket — semua opsi Baileys tetap
 * bisa dipakai seperti biasa.
 *
 * Helper yang otomatis tersedia di socket hasil fungsi ini:
 * - sock.sendButton(jid, source, text, quoted, opts)
 * - sock.makeButtons  → { quickReply, ctaUrl, ctaCopy, ctaCall }
 * - sock.reply(jid, text, quoted, opts)
 * - sock.replyMention(jid, text, mentions, quoted)
 * - sock.sendText(jid, text, opts)
 * - sock.react(jid, rawMsg, emoji)
 * - sock.sendImage(jid, image, caption, quoted, opts)
 * - sock.sendVideo(jid, video, caption, quoted, opts)
 * - sock.sendAudio(jid, audio, opts, quoted)
 * - sock.sendDocument(jid, doc, fileName, mimetype, quoted, opts)
 * - sock.sendSticker(jid, sticker, quoted)
 * - sock.sendList(jid, opts, quoted)
 *
 * @param {import('@whiskeysockets/baileys').UserFacingSocketConfig} options
 * Semua opsi makeWASocket standar diterima tanpa perubahan.
 *
 * @returns {import('@whiskeysockets/baileys').WASocket & HabibiHelpers}
 *
 * @example
 * import { makeHabibiSocket, useMultiFileAuthState } from 'habibi-baileys'
 *
 * const { state, saveCreds } = await useMultiFileAuthState('./session')
 * const sock = makeHabibiSocket({ auth: state, printQRInTerminal: true })
 * sock.ev.on('creds.update', saveCreds)
 *
 * // Langsung bisa pakai semua helper
 * sock.ev.on('messages.upsert', async ({ messages }) => {
 *   const msg = messages[0]
 *   if (!msg.message || msg.key.fromMe) return
 *   await sock.reply(msg.key.remoteJid, 'Halo!', msg)
 * })
 */
export function makeHabibiSocket(options = {}) {
  const sock = makeWASocket(options);
  attachHelpers(sock);
  return sock;
}

export default makeHabibiSocket;
