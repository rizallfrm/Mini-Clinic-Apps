const authService = require('../services/authService');
const { sendSuccess, sendCreated } = require('../utils/response');

/**
 * Auth Controller
 * Hanya menangani HTTP request dan response.
 * Business logic ada di authService.
 */

/**
 * POST /api/auth/login
 * Login pengguna dan kembalikan JWT token.
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const result = await authService.login(email, password);

    return sendSuccess(res, 'Login successful', result);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/logout
 * Logout pengguna dengan memasukkan token ke blacklist.
 * Membutuhkan token valid (authenticate middleware sudah berjalan).
 */
const logout = async (req, res, next) => {
  try {
    // Token dan expiry sudah di-attach oleh authenticate middleware
    authService.logout(req.token, req.tokenExp);

    return sendSuccess(res, 'Logout successful. Please remove the token from client storage.');
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/auth/me
 * Ambil data user yang sedang login.
 * Membutuhkan token valid (authenticate middleware sudah berjalan).
 */
const getMe = async (req, res, next) => {
  try {
    // req.user sudah diisi oleh authenticate middleware
    // Kita ambil data terbaru dari database untuk memastikan data up-to-date
    const userData = await authService.getCurrentUser(req.user.id);

    return sendSuccess(res, 'User data retrieved successfully', userData);
  } catch (error) {
    next(error);
  }
};

module.exports = { login, logout, getMe };
