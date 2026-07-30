/**
 * Utility functions untuk format response API yang konsisten.
 */

/**
 * Kirim response sukses.
 * @param {object} res - Express response object
 * @param {string} message - Pesan sukses
 * @param {*} data - Data yang dikirim
 * @param {number} statusCode - HTTP status code (default 200)
 */
const sendSuccess = (res, message = 'Success', data = null, statusCode = 200) => {
  const response = {
    success: true,
    message,
  };

  if (data !== null) {
    response.data = data;
  }

  return res.status(statusCode).json(response);
};

/**
 * Kirim response sukses dengan data created (201).
 * @param {object} res - Express response object
 * @param {string} message - Pesan sukses
 * @param {*} data - Data yang dikirim
 */
const sendCreated = (res, message = 'Created successfully', data = null) => {
  return sendSuccess(res, message, data, 201);
};

/**
 * Kirim response sukses dengan pagination.
 * @param {object} res - Express response object
 * @param {string} message - Pesan sukses
 * @param {Array} items - Array data
 * @param {object} pagination - Info pagination
 */
const sendPaginated = (res, message = 'Data retrieved successfully', items = [], pagination = {}) => {
  return res.status(200).json({
    success: true,
    message,
    data: {
      items,
      pagination: {
        page: pagination.page || 1,
        limit: pagination.limit || 10,
        totalItems: pagination.totalItems || 0,
        totalPages: pagination.totalPages || 0,
      },
    },
  });
};

/**
 * Kirim response error.
 * @param {object} res - Express response object
 * @param {string} message - Pesan error
 * @param {number} statusCode - HTTP status code (default 400)
 * @param {*} errors - Detail error (opsional)
 */
const sendError = (res, message = 'An error occurred', statusCode = 400, errors = null) => {
  const response = {
    success: false,
    message,
  };

  if (errors !== null) {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
};

/**
 * Kirim response 404 Not Found.
 */
const sendNotFound = (res, message = 'Resource not found') => {
  return sendError(res, message, 404);
};

/**
 * Kirim response 401 Unauthorized.
 */
const sendUnauthorized = (res, message = 'Unauthorized') => {
  return sendError(res, message, 401);
};

/**
 * Kirim response 403 Forbidden.
 */
const sendForbidden = (res, message = 'Forbidden. You do not have access to this resource.') => {
  return sendError(res, message, 403);
};

/**
 * Kirim response 409 Conflict.
 */
const sendConflict = (res, message = 'Data already exists') => {
  return sendError(res, message, 409);
};

/**
 * Kirim response 422 Unprocessable Entity (Validation Error).
 */
const sendValidationError = (res, message = 'Validation Error', errors = null) => {
  return sendError(res, message, 422, errors);
};

/**
 * Kirim response 500 Internal Server Error.
 */
const sendServerError = (res, message = 'Internal Server Error') => {
  return sendError(res, message, 500);
};

module.exports = {
  sendSuccess,
  sendCreated,
  sendPaginated,
  sendError,
  sendNotFound,
  sendUnauthorized,
  sendForbidden,
  sendConflict,
  sendValidationError,
  sendServerError,
};
