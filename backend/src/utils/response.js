/**
 * Utility functions untuk format response API yang KONSISTEN di seluruh aplikasi.
 *
 * FORMAT BAKU:
 *
 * ✅ Success Response:
 * {
 *   "success": true,
 *   "message": "...",
 *   "data": {}  ← selalu ada, tidak pernah null
 * }
 *
 * ✅ Paginated Success Response:
 * {
 *   "success": true,
 *   "message": "...",
 *   "data": {
 *     "items": [],
 *     "pagination": {
 *       "page": 1,
 *       "limit": 10,
 *       "totalItems": 0,
 *       "totalPages": 0
 *     }
 *   }
 * }
 *
 * ❌ Error Response:
 * {
 *   "success": false,
 *   "message": "...",
 *   "errors": {}  ← selalu ada, minimal {}
 * }
 */

// =====================================================
// SUCCESS RESPONSES
// =====================================================

/**
 * Kirim response sukses (200).
 * Field `data` selalu ada (default: {}).
 *
 * @param {object} res - Express response object
 * @param {string} message - Pesan sukses
 * @param {*} data - Data payload (default: {})
 * @param {number} statusCode - HTTP status code (default 200)
 */
const sendSuccess = (res, message = 'Success', data = {}, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data: data !== null && data !== undefined ? data : {},
  });
};

/**
 * Kirim response sukses untuk data yang baru dibuat (201).
 *
 * @param {object} res - Express response object
 * @param {string} message - Pesan sukses
 * @param {*} data - Data yang baru dibuat
 */
const sendCreated = (res, message = 'Created successfully', data = {}) => {
  return sendSuccess(res, message, data, 201);
};

/**
 * Kirim response sukses dengan pagination.
 * Selalu mengembalikan struktur data.items dan data.pagination.
 *
 * @param {object} res - Express response object
 * @param {string} message - Pesan sukses
 * @param {Array} items - Array data items
 * @param {object} pagination - Info pagination
 */
const sendPaginated = (res, message = 'Data retrieved successfully', items = [], pagination = {}) => {
  return res.status(200).json({
    success: true,
    message,
    data: {
      items: Array.isArray(items) ? items : [],
      pagination: {
        page: pagination.page || 1,
        limit: pagination.limit || 10,
        totalItems: pagination.totalItems || 0,
        totalPages: pagination.totalPages || 0,
      },
    },
  });
};

// =====================================================
// ERROR RESPONSES
// =====================================================

/**
 * Kirim response error.
 * Field `errors` selalu ada (default: {}).
 *
 * @param {object} res - Express response object
 * @param {string} message - Pesan error
 * @param {number} statusCode - HTTP status code (default 400)
 * @param {object|null} errors - Detail error per field (default: {})
 */
const sendError = (res, message = 'An error occurred', statusCode = 400, errors = null) => {
  return res.status(statusCode).json({
    success: false,
    message,
    errors: errors !== null && errors !== undefined ? errors : {},
  });
};

/**
 * 400 Bad Request.
 */
const sendBadRequest = (res, message = 'Bad request') => {
  return sendError(res, message, 400);
};

/**
 * 401 Unauthorized — token tidak ada atau tidak valid.
 */
const sendUnauthorized = (res, message = 'Unauthorized. Please login first.') => {
  return sendError(res, message, 401);
};

/**
 * 403 Forbidden — tidak punya izin akses.
 */
const sendForbidden = (res, message = 'Forbidden. You do not have access to this resource.') => {
  return sendError(res, message, 403);
};

/**
 * 404 Not Found.
 */
const sendNotFound = (res, message = 'Resource not found') => {
  return sendError(res, message, 404);
};

/**
 * 409 Conflict — data duplikat atau constraint violation.
 */
const sendConflict = (res, message = 'Data conflict') => {
  return sendError(res, message, 409);
};

/**
 * 422 Unprocessable Entity — validasi input gagal.
 * Field `errors` berisi detail error per field:
 * { "field_name": "error message" }
 *
 * @param {object} res - Express response object
 * @param {string} message - Pesan error
 * @param {object} errors - Detail error per field
 */
const sendValidationError = (res, message = 'Validation Error', errors = {}) => {
  return sendError(res, message, 422, errors);
};

/**
 * 500 Internal Server Error.
 */
const sendServerError = (res, message = 'Internal Server Error') => {
  return sendError(res, message, 500);
};

module.exports = {
  sendSuccess,
  sendCreated,
  sendPaginated,
  sendError,
  sendBadRequest,
  sendNotFound,
  sendUnauthorized,
  sendForbidden,
  sendConflict,
  sendValidationError,
  sendServerError,
};
