const { sendForbidden } = require('../utils/response');

/**
 * Middleware role-based authorization.
 * Harus digunakan SETELAH middleware authenticate.
 *
 * Contoh penggunaan:
 *   // Hanya ADMIN yang boleh akses
 *   router.get('/users', authenticate, authorize('ADMIN'), userController.getAll);
 *
 *   // ADMIN dan REGISTRATION_OFFICER boleh akses
 *   router.post('/patients', authenticate, authorize('ADMIN', 'REGISTRATION_OFFICER'), patientController.create);
 *
 * @param {...string} roles - Role yang diizinkan mengakses route ini
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    // Pastikan authenticate sudah dijalankan sebelumnya
    if (!req.user) {
      return sendForbidden(res, 'Authentication required before authorization.');
    }

    // Cek apakah role user ada dalam daftar role yang diizinkan
    if (!roles.includes(req.user.role)) {
      return sendForbidden(
        res,
        `Access denied. This resource requires one of the following roles: ${roles.join(', ')}. Your role: ${req.user.role}`
      );
    }

    next();
  };
};

/**
 * Shortcut authorizer untuk role yang umum digunakan.
 */
const authorizeAdmin = authorize('ADMIN');
const authorizeDoctor = authorize('DOCTOR');
const authorizeOfficer = authorize('REGISTRATION_OFFICER');
const authorizeAdminOrOfficer = authorize('ADMIN', 'REGISTRATION_OFFICER');
const authorizeAll = authorize('ADMIN', 'DOCTOR', 'REGISTRATION_OFFICER');

module.exports = {
  authorize,
  authorizeAdmin,
  authorizeDoctor,
  authorizeOfficer,
  authorizeAdminOrOfficer,
  authorizeAll,
};
