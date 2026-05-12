// ─────────────────────────────────────────────────────────────
//  habibi-baileys · helpers/phone.js
//  Normalisasi nomor HP ke format WhatsApp yang valid
// ─────────────────────────────────────────────────────────────

/**
 * Daftar kode negara yang dikenal.
 * Dipakai untuk deteksi otomatis saat nomor tidak ada kode negara.
 * Tambah sesuai kebutuhan.
 */
const COUNTRY_CODES = [
  '62',  // Indonesia
  '60',  // Malaysia
  '65',  // Singapura
  '63',  // Filipina
  '66',  // Thailand
  '84',  // Vietnam
  '855', // Kamboja
  '856', // Laos
  '95',  // Myanmar
  '673', // Brunei
  '1',   // US/Canada
  '44',  // UK
  '91',  // India
  '81',  // Jepang
  '82',  // Korea
  '86',  // China
  '49',  // Jerman
  '33',  // Prancis
  '55',  // Brazil
  '7',   // Rusia
];

/**
 * Normalisasi nomor telepon ke format internasional bersih
 * yang diterima oleh WhatsApp / Baileys.
 *
 * Handles:
 *  - "0812xxxxxxxx"       → "62812xxxxxxxx"  (awalan 0 → kode negara)
 *  - "+62 812-xxx-xxxx"   → "62812xxxxxxxx"  (hapus +, spasi, strip)
 *  - "62812xxxxxxxx"      → "62812xxxxxxxx"  (sudah benar)
 *  - "812xxxxxxxx"        → "62812xxxxxxxx"  (tidak ada kode negara, default ID)
 *
 * @param {string|number} raw           - Nomor dalam format apapun
 * @param {string}        [defaultCode] - Kode negara default jika tidak terdeteksi (default: '62')
 * @returns {string} Nomor bersih format internasional tanpa + (contoh: "62812xxxxxxxx")
 *
 * @example
 * normalizePhone('0812-3456-7890')       // "628123456789"
 * normalizePhone('+62 812 3456 7890')    // "628123456789"
 * normalizePhone('812 3456 7890')        // "628123456789"
 * normalizePhone('628123456789')         // "628123456789"
 * normalizePhone('+1 650 555 0100', '1') // "16505550100"
 */
export function normalizePhone(raw, defaultCode = '62') {
  if (!raw) throw new Error('normalizePhone: nomor tidak boleh kosong');

  // Bersihkan: hapus +, spasi, -, (, ), .
  let num = String(raw).replace(/[\s\+\-\.\(\)]/g, '');

  // Pastikan hanya angka
  if (!/^\d+$/.test(num)) {
    throw new Error(`normalizePhone: karakter tidak valid dalam nomor "${raw}"`);
  }

  // Awalan 0 → ganti dengan kode negara default
  if (num.startsWith('0')) {
    num = defaultCode + num.slice(1);
    return num;
  }

  // Sudah punya kode negara yang dikenal?
  const hasCode = COUNTRY_CODES.some(cc => num.startsWith(cc));
  if (hasCode) return num;

  // Tidak ada kode negara → tambah default
  return defaultCode + num;
}

/**
 * Konversi nomor telepon ke WhatsApp JID (format: "628xxx@s.whatsapp.net").
 *
 * @param {string|number} raw           - Nomor dalam format apapun
 * @param {string}        [defaultCode] - Kode negara default (default: '62')
 * @returns {string} JID WhatsApp (contoh: "628123456789@s.whatsapp.net")
 *
 * @example
 * toJid('0812-3456-7890')  // "628123456789@s.whatsapp.net"
 * toJid('+1 650 555 0100', '1')  // "16505550100@s.whatsapp.net"
 */
export function toJid(raw, defaultCode = '62') {
  return `${normalizePhone(raw, defaultCode)}@s.whatsapp.net`;
}

/**
 * Attach sock.normalizePhone dan sock.toJid ke socket.
 * Keduanya juga tersedia sebagai named export standalone.
 *
 * @param {import('@whiskeysockets/baileys').WASocket} sock
 */
export function attachPhone(sock) {
  sock.normalizePhone = normalizePhone;
  sock.toJid          = toJid;
  return sock;
}
