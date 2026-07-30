/**
 * Utility untuk menghitung pagination.
 */

/**
 * Mengambil dan memvalidasi parameter pagination dari query string.
 * @param {object} query - Express request.query
 * @returns {{ page: number, limit: number, offset: number }}
 */
const getPagination = (query) => {
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || 10, 1), 100);
  const offset = (page - 1) * limit;

  return { page, limit, offset };
};

/**
 * Menghitung metadata pagination dari total data.
 * @param {number} totalItems - Total jumlah data
 * @param {number} page - Halaman saat ini
 * @param {number} limit - Jumlah data per halaman
 * @returns {{ page, limit, totalItems, totalPages }}
 */
const getPaginationMeta = (totalItems, page, limit) => {
  const totalPages = Math.ceil(totalItems / limit);

  return {
    page,
    limit,
    totalItems,
    totalPages,
  };
};

module.exports = {
  getPagination,
  getPaginationMeta,
};
