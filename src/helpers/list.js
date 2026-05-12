// ─────────────────────────────────────────────────────────────
//  habibi-baileys · helpers/list.js
//  sock.sendList — kirim list message WA
// ─────────────────────────────────────────────────────────────

/**
 * Attach sock.sendList ke socket.
 *
 * @param {import('@whiskeysockets/baileys').WASocket} sock
 */
export function attachList(sock) {

  /**
   * Kirim list message interaktif.
   *
   * @param {string} jid
   * @param {object} opts
   * @param {string} opts.title       - Judul pesan (header)
   * @param {string} opts.text        - Isi pesan (body)
   * @param {string} opts.footer      - Footer kecil di bawah
   * @param {string} opts.buttonText  - Teks tombol buka list
   * @param {Array}  opts.sections    - Array section: [{ title, rows: [{ title, description?, rowId }] }]
   * @param {object} [quoted]
   *
   * @example
   * await sock.sendList(chat, {
   *   title: 'Menu Pilihan',
   *   text: 'Silakan pilih kategori:',
   *   footer: 'HABIBI BOT',
   *   buttonText: '📋 Lihat Menu',
   *   sections: [
   *     {
   *       title: 'Kategori',
   *       rows: [
   *         { title: '🤖 AI', description: 'Fitur AI', rowId: '.menu ai' },
   *         { title: '📥 Downloader', rowId: '.menu downloader' },
   *       ],
   *     },
   *   ],
   * }, msg.raw)
   */
  sock.sendList = async function (jid, opts = {}, quoted) {
    const {
      title = '',
      text = '',
      footer = '',
      buttonText = 'Pilih',
      sections = [],
    } = opts;

    return sock.sendMessage(
      jid,
      {
        listMessage: {
          title,
          description: text,
          footerText: footer,
          buttonText,
          listType: 1,
          sections,
        },
      },
      { quoted },
    );
  };

  return sock;
}
