// ─────────────────────────────────────────────────────────────
//  habibi-baileys · helpers/media.js
//  sock.sendImage, sendVideo, sendAudio, sendDocument, sendSticker
// ─────────────────────────────────────────────────────────────

/**
 * Resolve media ke format Baileys.
 * - Buffer        → pass-through
 * - "https://..." → { url }
 * - path lokal    → fs.readFileSync
 */
async function resolveMedia(src) {
  if (!src) return null;
  if (Buffer.isBuffer(src)) return src;
  if (typeof src === 'string' && /^https?:\/\//i.test(src)) return { url: src };
  if (typeof src === 'string') {
    const fs = await import('node:fs');
    if (fs.existsSync(src)) return fs.readFileSync(src);
  }
  return src;
}

/**
 * Attach helper media ke socket.
 *
 * @param {import('@whiskeysockets/baileys').WASocket} sock
 */
export function attachMedia(sock) {

  /**
   * Kirim gambar.
   *
   * @param {string}              jid
   * @param {Buffer|string}       image    - Buffer, path lokal, atau URL
   * @param {string}              [caption]
   * @param {object}              [quoted]
   * @param {object}              [opts]   - Field tambahan (mentions, contextInfo, dll)
   *
   * @example
   * await sock.sendImage(chat, './assets/banner.jpg', 'Selamat datang!', msg.raw)
   * await sock.sendImage(chat, 'https://example.com/img.jpg', 'Caption', msg.raw)
   */
  sock.sendImage = async function (jid, image, caption = '', quoted, opts = {}) {
    const data = await resolveMedia(image);
    return sock.sendMessage(jid, { image: data, caption, ...opts }, { quoted });
  };

  /**
   * Kirim video.
   *
   * @param {string}        jid
   * @param {Buffer|string} video
   * @param {string}        [caption]
   * @param {object}        [quoted]
   * @param {object}        [opts]   - mimetype, gifPlayback, dll
   *
   * @example
   * await sock.sendVideo(chat, { url: 'https://example.com/vid.mp4' }, 'Video keren', msg.raw)
   */
  sock.sendVideo = async function (jid, video, caption = '', quoted, opts = {}) {
    const data = await resolveMedia(video);
    return sock.sendMessage(
      jid,
      { video: data, caption, mimetype: opts.mimetype || 'video/mp4', ...opts },
      { quoted },
    );
  };

  /**
   * Kirim audio / voice note.
   *
   * @param {string}        jid
   * @param {Buffer|string} audio
   * @param {object}        [opts]   - { ptt: true } untuk voice note, mimetype
   * @param {object}        [quoted]
   *
   * @example
   * await sock.sendAudio(chat, audioBuffer, { ptt: true }, msg.raw)  // voice note
   * await sock.sendAudio(chat, './song.mp3', { ptt: false }, msg.raw) // audio file
   */
  sock.sendAudio = async function (jid, audio, opts = {}, quoted) {
    const data = await resolveMedia(audio);
    return sock.sendMessage(
      jid,
      {
        audio: data,
        mimetype: opts.mimetype || 'audio/mpeg',
        ptt: opts.ptt || false,
        ...opts,
      },
      { quoted },
    );
  };

  /**
   * Kirim dokumen / file.
   *
   * @param {string}        jid
   * @param {Buffer|string} doc
   * @param {string}        fileName  - Nama file yang tampil di WA
   * @param {string}        mimetype  - Contoh: 'application/pdf'
   * @param {object}        [quoted]
   * @param {object}        [opts]
   *
   * @example
   * await sock.sendDocument(chat, pdfBuffer, 'laporan.pdf', 'application/pdf', msg.raw)
   */
  sock.sendDocument = async function (jid, doc, fileName, mimetype, quoted, opts = {}) {
    const data = await resolveMedia(doc);
    return sock.sendMessage(
      jid,
      { document: data, fileName, mimetype, ...opts },
      { quoted },
    );
  };

  /**
   * Kirim sticker.
   *
   * @param {string}        jid
   * @param {Buffer|string} sticker  - Harus format WebP
   * @param {object}        [quoted]
   *
   * @example
   * await sock.sendSticker(chat, stickerBuffer, msg.raw)
   */
  sock.sendSticker = async function (jid, sticker, quoted) {
    const data = await resolveMedia(sticker);
    return sock.sendMessage(jid, { sticker: data }, { quoted });
  };

  return sock;
}
