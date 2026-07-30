/**
 * In-memory token blacklist untuk handle logout.
 * Token yang di-logout disimpan sampai expire agar tidak bisa digunakan lagi.
 *
 * Catatan: Untuk production skala besar, gunakan Redis.
 * Untuk Mini Clinic (single-server), in-memory sudah cukup.
 */

const blacklistedTokens = new Map();

/**
 * Tambahkan token ke blacklist.
 * @param {string} token - JWT token yang akan di-blacklist
 * @param {number} expiresAt - Unix timestamp kapan token expire (dalam ms)
 */
const addToBlacklist = (token, expiresAt) => {
  blacklistedTokens.set(token, expiresAt);

  // Auto-cleanup: hapus token yang sudah expired agar memori tidak membengkak
  const now = Date.now();
  for (const [t, exp] of blacklistedTokens.entries()) {
    if (exp < now) {
      blacklistedTokens.delete(t);
    }
  }
};

/**
 * Cek apakah token ada di blacklist.
 * @param {string} token - JWT token yang akan dicek
 * @returns {boolean} true jika token ada di blacklist
 */
const isBlacklisted = (token) => {
  if (!blacklistedTokens.has(token)) return false;

  // Jika token sudah expired, hapus dari blacklist dan anggap tidak ada
  const expiresAt = blacklistedTokens.get(token);
  if (expiresAt < Date.now()) {
    blacklistedTokens.delete(token);
    return false;
  }

  return true;
};

/**
 * Dapatkan jumlah token yang ada di blacklist (untuk monitoring).
 * @returns {number}
 */
const getBlacklistSize = () => blacklistedTokens.size;

module.exports = { addToBlacklist, isBlacklisted, getBlacklistSize };
