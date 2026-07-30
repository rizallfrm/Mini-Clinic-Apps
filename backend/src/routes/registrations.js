const express = require('express');
const registrationController = require('../controllers/registrationController');
const authenticate = require('../middlewares/authenticate');
const { authorize } = require('../middlewares/authorize');
const {
  createRegistrationRules,
  updateRegistrationRules,
  updateStatusRules,
} = require('../validators/registrationValidator');
const validate = require('../validators/validate');

const router = express.Router();
router.use(authenticate);

/**
 * GET /api/registrations/today
 * Daftar pendaftaran hari ini (diurutkan nomor antrean).
 * PENTING: route /today harus didefinisikan SEBELUM /:id agar tidak ditangkap sebagai param.
 * Query: ?status=WAITING&policlinic_id=1&doctor_id=1
 */
router.get(
  '/today',
  authorize('ADMIN', 'DOCTOR', 'REGISTRATION_OFFICER'),
  registrationController.getTodayRegistrations
);

/**
 * GET /api/registrations
 * Daftar registrasi dengan filter dan pagination.
 * Query: ?page=1&limit=10&status=WAITING&doctor_id=1&policlinic_id=1&visit_date=YYYY-MM-DD&patient_id=1
 */
router.get(
  '/',
  authorize('ADMIN', 'DOCTOR', 'REGISTRATION_OFFICER'),
  registrationController.getAllRegistrations
);

/**
 * GET /api/registrations/:id
 * Detail registrasi lengkap.
 */
router.get(
  '/:id',
  authorize('ADMIN', 'DOCTOR', 'REGISTRATION_OFFICER'),
  registrationController.getRegistrationById
);

/**
 * POST /api/registrations
 * Buat pendaftaran baru + antrean otomatis.
 * Body: { patient_id, doctor_id, policlinic_id, visit_date, payment_type, initial_complaint }
 */
router.post(
  '/',
  authorize('ADMIN', 'REGISTRATION_OFFICER'),
  createRegistrationRules,
  validate,
  registrationController.createRegistration
);

/**
 * PUT /api/registrations/:id
 * Edit pendaftaran (hanya jika status WAITING).
 */
router.put(
  '/:id',
  authorize('ADMIN', 'REGISTRATION_OFFICER'),
  updateRegistrationRules,
  validate,
  registrationController.updateRegistration
);

/**
 * PATCH /api/registrations/:id/status
 * Update status sesuai state machine.
 * Body: { status: "CHECKED_IN" | "EXAMINATION" | "COMPLETED" | "CANCELLED" }
 * State Machine:
 *   WAITING → CHECKED_IN → EXAMINATION → COMPLETED
 *   Any (non-final) → CANCELLED
 */
router.patch(
  '/:id/status',
  authorize('ADMIN', 'REGISTRATION_OFFICER', 'DOCTOR'),
  updateStatusRules,
  validate,
  registrationController.updateRegistrationStatus
);

/**
 * DELETE /api/registrations/:id
 * Hapus pendaftaran (hanya WAITING atau CANCELLED).
 */
router.delete(
  '/:id',
  authorize('ADMIN'),
  registrationController.deleteRegistration
);

module.exports = router;
