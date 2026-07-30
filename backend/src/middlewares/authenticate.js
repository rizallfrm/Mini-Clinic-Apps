const jwt = require('jsonwebtoken');
const { User, Doctor } = require('../models');
const { sendUnauthorized } = require('../utils/response');
const { isBlacklisted } = require('../utils/tokenBlacklist');

/**
 * Middleware autentikasi JWT.
 * Memverifikasi token dari header Authorization: Bearer <token>.
 * Jika valid, attach data user ke req.user.
 * Jika tidak valid / expired / blacklisted, kirim 401.
 */
const authenticate = async (req, res, next) => {
  try {
    // =====================================================
    // AMBIL TOKEN DARI HEADER
    // =====================================================
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendUnauthorized(res, 'Access token is required. Please login first.');
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return sendUnauthorized(res, 'Access token is missing.');
    }

    // =====================================================
    // CEK TOKEN BLACKLIST (sudah logout)
    // =====================================================
    if (isBlacklisted(token)) {
      return sendUnauthorized(res, 'Token has been invalidated. Please login again.');
    }

    // =====================================================
    // VERIFIKASI JWT
    // =====================================================
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // =====================================================
    // AMBIL DATA USER DARI DATABASE
    // =====================================================
    const includeOptions = [
      {
        model: Doctor,
        as: 'doctorProfile',
        attributes: ['id', 'doctor_code', 'name', 'specialization', 'policlinic_id', 'is_active'],
        required: false,
      },
    ];

    const user = await User.findOne({
      where: { id: decoded.userId, is_active: true },
      attributes: ['id', 'name', 'email', 'role', 'is_active'],
      include: includeOptions,
    });

    if (!user) {
      return sendUnauthorized(res, 'User not found or account has been deactivated.');
    }

    // Attach user dan token ke request
    req.user = user;
    req.token = token;
    req.tokenExp = decoded.exp; // unix timestamp (seconds)

    next();
  } catch (error) {
    // JWT error sudah di-handle oleh global errorHandler
    // Tapi kita handle di sini juga untuk kejelasan
    if (error.name === 'TokenExpiredError') {
      return sendUnauthorized(res, 'Token has expired. Please login again.');
    }
    if (error.name === 'JsonWebTokenError') {
      return sendUnauthorized(res, 'Invalid token. Please login again.');
    }
    next(error);
  }
};

module.exports = authenticate;
