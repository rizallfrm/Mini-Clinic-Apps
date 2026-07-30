const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, Doctor, Policlinic } = require('../models');
const { AppError } = require('../middlewares/errorHandler');
const { addToBlacklist } = require('../utils/tokenBlacklist');

/**
 * Menghasilkan JWT token untuk user.
 * @param {object} user - Instance Sequelize User
 * @returns {string} JWT token
 */
const generateToken = (user) => {
  const payload = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '8h',
  });

  return token;
};

/**
 * Format data user untuk response (hilangkan password).
 * Sertakan data dokter jika role adalah DOCTOR.
 * @param {object} user - Instance Sequelize User dengan doctorProfile
 * @returns {object} Data user yang aman untuk dikirim ke client
 */
const formatUserResponse = (user) => {
  const userData = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    is_active: user.is_active,
  };

  // Jika dokter, sertakan data profil dokter
  if (user.role === 'DOCTOR' && user.doctorProfile) {
    userData.doctor = {
      id: user.doctorProfile.id,
      doctor_code: user.doctorProfile.doctor_code,
      name: user.doctorProfile.name,
      specialization: user.doctorProfile.specialization,
      policlinic_id: user.doctorProfile.policlinic_id,
      is_active: user.doctorProfile.is_active,
    };

    // Sertakan data poli jika ada
    if (user.doctorProfile.policlinic) {
      userData.doctor.policlinic = {
        id: user.doctorProfile.policlinic.id,
        code: user.doctorProfile.policlinic.code,
        name: user.doctorProfile.policlinic.name,
      };
    }
  }

  return userData;
};

// =====================================================
// AUTH SERVICES
// =====================================================

/**
 * Login service.
 * Verifikasi email, password, status akun.
 * Generate dan kembalikan JWT token.
 *
 * @param {string} email
 * @param {string} password
 * @returns {{ token: string, user: object }}
 */
const login = async (email, password) => {
  // Cari user berdasarkan email
  const user = await User.findOne({
    where: { email: email.toLowerCase().trim() },
    attributes: ['id', 'name', 'email', 'password', 'role', 'is_active'],
    include: [
      {
        model: Doctor,
        as: 'doctorProfile',
        attributes: ['id', 'doctor_code', 'name', 'specialization', 'policlinic_id', 'is_active'],
        required: false,
        include: [
          {
            model: Policlinic,
            as: 'policlinic',
            attributes: ['id', 'code', 'name'],
            required: false,
          },
        ],
      },
    ],
  });

  // User tidak ditemukan
  if (!user) {
    throw new AppError('Invalid email or password.', 401);
  }

  // Akun tidak aktif
  if (!user.is_active) {
    throw new AppError('Your account has been deactivated. Please contact the administrator.', 401);
  }

  // Verifikasi password dengan bcrypt
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new AppError('Invalid email or password.', 401);
  }

  // Generate JWT token
  const token = generateToken(user);

  // Format response user (tanpa password)
  const userData = formatUserResponse(user);

  return { token, user: userData };
};

/**
 * Logout service.
 * Masukkan token ke blacklist agar tidak bisa digunakan lagi.
 *
 * @param {string} token - JWT token dari request
 * @param {number} tokenExp - Waktu expire token (unix timestamp dalam detik)
 */
const logout = (token, tokenExp) => {
  // Konversi dari seconds ke milliseconds untuk Date.now() comparison
  const expiresAtMs = tokenExp * 1000;
  addToBlacklist(token, expiresAtMs);
};

/**
 * Get current user.
 * Ambil data user terbaru dari database.
 *
 * @param {number} userId
 * @returns {object} Data user
 */
const getCurrentUser = async (userId) => {
  const user = await User.findOne({
    where: { id: userId, is_active: true },
    attributes: ['id', 'name', 'email', 'role', 'is_active'],
    include: [
      {
        model: Doctor,
        as: 'doctorProfile',
        attributes: ['id', 'doctor_code', 'name', 'specialization', 'policlinic_id', 'is_active'],
        required: false,
        include: [
          {
            model: Policlinic,
            as: 'policlinic',
            attributes: ['id', 'code', 'name'],
            required: false,
          },
        ],
      },
    ],
  });

  if (!user) {
    throw new AppError('User not found.', 404);
  }

  return formatUserResponse(user);
};

module.exports = { login, logout, getCurrentUser };
