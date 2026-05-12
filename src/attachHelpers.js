// ─────────────────────────────────────────────────────────────
//  habibi-baileys · attachHelpers.js
//  Attach semua helper ke instance socket Baileys
// ─────────────────────────────────────────────────────────────
import { attachSendButton } from './helpers/buttons.js';
import { attachMessage }    from './helpers/message.js';
import { attachMedia }      from './helpers/media.js';
import { attachList }       from './helpers/list.js';

/**
 * Attach semua helper habibi-baileys ke socket.
 * Dipanggil otomatis oleh makeHabibiSocket.
 * Bisa juga dipanggil manual ke socket yang sudah ada.
 *
 * Method yang ditambahkan:
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
 * @param {import('@whiskeysockets/baileys').WASocket} sock
 * @returns {import('@whiskeysockets/baileys').WASocket} sock (same reference)
 *
 * @example
 * import makeWASocket from '@whiskeysockets/baileys'
 * import { attachHelpers } from 'habibi-baileys/helpers'
 *
 * const sock = makeWASocket({ ... })
 * attachHelpers(sock)
 * // sekarang sock.sendButton, sock.reply, dll sudah tersedia
 */
export function attachHelpers(sock) {
  attachSendButton(sock);
  attachMessage(sock);
  attachMedia(sock);
  attachList(sock);
  return sock;
}
