// ─────────────────────────────────────────────────────────────
//  habibi-baileys · helpers/newsletter.js
//  Helper untuk context info newsletter (saluran/channel WA)
// ─────────────────────────────────────────────────────────────

/**
 * Buat contextInfo "diteruskan dari saluran".
 * Dipakai di sendButton / sendMessage untuk efek "forwarded from channel".
 *
 * @param {object} opts
 * @param {string} opts.jid            - JID saluran (format: 123456@newsletter)
 * @param {string} opts.name           - Nama saluran
 * @param {number} [opts.serverMsgId]  - ID pesan server (default 127)
 * @returns {object} contextInfo
 *
 * @example
 * import { makeNewsletterCtx } from 'habibi-baileys'
 *
 * await sock.sendButton(chat, null, 'Halo!', msg.raw, {
 *   contextInfo: makeNewsletterCtx({ jid: '120363xxx@newsletter', name: 'Bot Ku' }),
 * })
 */
export function makeNewsletterCtx({ jid, name, serverMsgId = 127 } = {}) {
  if (!jid) return {};
  return {
    forwardingScore: 9999,
    isForwarded: true,
    forwardedNewsletterMessageInfo: {
      newsletterJid: jid,
      newsletterName: name || jid,
      serverMessageId: serverMsgId,
    },
  };
}

/**
 * Buat contextInfo externalAdReply (link preview dengan thumbnail).
 * Thumbnail tampil sebagai preview kecil, TIDAK disimpan ke galeri.
 *
 * @param {object} opts
 * @param {string} opts.title         - Judul preview
 * @param {string} [opts.body]        - Subjudul / deskripsi
 * @param {string} [opts.thumbnailUrl]- URL gambar thumbnail
 * @param {string} [opts.sourceUrl]   - URL sumber (link yang dibuka)
 * @param {number} [opts.mediaType]   - 1 = image, 2 = video
 * @returns {object} contextInfo
 *
 * @example
 * await sock.reply(chat, 'Info bot', msg.raw, {
 *   contextInfo: makeAdReplyCtx({
 *     title: 'HABIBI BOT',
 *     body: 'WhatsApp Bot',
 *     thumbnailUrl: 'https://example.com/logo.jpg',
 *     sourceUrl: 'https://example.com',
 *   }),
 * })
 */
export function makeAdReplyCtx({ title = '', body = '', thumbnailUrl, sourceUrl, mediaType = 1 } = {}) {
  return {
    externalAdReply: {
      title,
      body,
      thumbnailUrl: thumbnailUrl || '',
      sourceUrl: sourceUrl || '',
      mediaType,
      renderLargerThumbnail: false,
      showAdAttribution: false,
    },
  };
}
