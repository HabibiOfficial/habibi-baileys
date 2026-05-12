// ─────────────────────────────────────────────────────────────
//  habibi-baileys · helpers/message.js
//  sock.reply, sock.replyMention, sock.react, sock.sendText
// ─────────────────────────────────────────────────────────────

/**
 * Attach helper pesan teks ke socket.
 *
 * @param {import('@whiskeysockets/baileys').WASocket} sock
 */
export function attachMessage(sock) {

  /**
   * Balas pesan dengan teks.
   *
   * @param {string} jid
   * @param {string} text
   * @param {object} [quoted] - msg.raw untuk quote
   * @param {object} [opts]   - field tambahan untuk sendMessage content
   *
   * @example
   * await sock.reply(chat, 'Halo!', msg.raw)
   */
  sock.reply = async function (jid, text, quoted, opts = {}) {
    return sock.sendMessage(jid, { text: String(text), ...opts }, { quoted });
  };

  /**
   * Balas dengan mention (tag user).
   *
   * @param {string}   jid
   * @param {string}   text
   * @param {string[]} mentions  - Array JID yang di-mention
   * @param {object}   [quoted]
   *
   * @example
   * await sock.replyMention(chat, 'Halo @user!', ['628xxx@s.whatsapp.net'], msg.raw)
   */
  sock.replyMention = async function (jid, text, mentions = [], quoted) {
    return sock.sendMessage(
      jid,
      { text: String(text), mentions: Array.isArray(mentions) ? mentions : [] },
      { quoted },
    );
  };

  /**
   * Kirim teks tanpa quote.
   *
   * @param {string} jid
   * @param {string} text
   * @param {object} [opts]
   */
  sock.sendText = async function (jid, text, opts = {}) {
    return sock.sendMessage(jid, { text: String(text), ...opts });
  };

  /**
   * React ke pesan dengan emoji.
   *
   * @param {string} jid
   * @param {object} rawMsg  - msg.raw (harus punya .key)
   * @param {string} emoji   - Emoji reaksi, contoh "✅" / "❌" / ""
   *
   * @example
   * await sock.react(chat, msg.raw, '⏳')
   */
  sock.react = async function (jid, rawMsg, emoji) {
    return sock.sendMessage(jid, { react: { text: emoji, key: rawMsg.key } });
  };

  return sock;
}
