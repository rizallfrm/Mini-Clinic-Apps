const express = require('express');
const patientController = require('../controllers/patientController');
const authenticate = require('../middlewares/authenticate');
const { authorize } = require('../middlewares/authorize');
const { createPatientRules, updatePatientRules } = require('../validators/patientValidator');
const validate = require('../validators/validate');

const router = express.Router();

// Semua route patient membutuhkan autentikasi
router.use(authenticate);

/**
 * GET /api/patients
 * Daftar pasien dengan search dan pagination.
 * Query: ?page=1&limit=10&search=keyword
 *
 * Akses: ADMIN, REGISTRATION_OFFICER, DOCTOR
 */
router.get(
  '/',
  authorize('ADMIN', 'REGISTRATION_OFFICER', 'DOCTOR'),
  patientController.getAllPatients
);

/**
 * GET /api/patients/:id
 * Detail pasien.
 *
 * Akses: ADMIN, REGISTRATION_OFFICER, DOCTOR
 */
router.get(
  '/:id',
  authorize('ADMIN', 'REGISTRATION_OFFICER', 'DOCTOR'),
  patientController.getPatientById
);

/**
 * POST /api/patients
 * Buat pasien baru (MRN otomatis).
 * Body: { nik, name, gender, birth_date, phone, address }
 *
 * Akses: ADMIN, REGISTRATION_OFFICER
 */
router.post(
  '/',
  authorize('ADMIN', 'REGISTRATION_OFFICER'),
  createPatientRules,
  validate,
  patientController.createPatient
);

/**
 * PUT /api/patients/:id
 * Update data pasien (NIK tidak bisa diubah).
 *
 * Akses: ADMIN, REGISTRATION_OFFICER
 */
router.put(
  '/:id',
  authorize('ADMIN', 'REGISTRATION_OFFICER'),
  updatePatientRules,
  validate,
  patientController.updatePatient
);

/**
 * DELETE /api/patients/:id
 * Hapus pasien (hanya jika tidak ada riwayat pendaftaran).
 *
 * Akses: ADMIN
 */
router.delete(
  '/:id',
  authorize('ADMIN'),
  patientController.deletePatient
);

/**
 * GET /api/patients/:id/history
 * Riwayat pemeriksaan pasien (rekam medis + tindakan + resep).
 * Query: ?page=1&limit=10
 *
 * Akses: ADMIN, REGISTRATION_OFFICER, DOCTOR
 */
router.get(
  '/:id/history',
  authorize('ADMIN', 'REGISTRATION_OFFICER', 'DOCTOR'),
  patientController.getPatientHistory
);

module.exports = router;
