const patientService = require('../services/patientService');
const {
  sendSuccess,
  sendCreated,
  sendPaginated,
} = require('../utils/response');

/**
 * Patient Controller
 * Menangani HTTP request dan response untuk manajemen pasien.
 * Business logic ada di patientService.
 */

/**
 * GET /api/patients
 * Ambil daftar pasien dengan pencarian dan pagination.
 * Query: ?page=1&limit=10&search=keyword
 */
const getAllPatients = async (req, res, next) => {
  try {
    const { items, pagination } = await patientService.getAllPatients(req.query);
    return sendPaginated(res, 'Patients retrieved successfully', items, pagination);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/patients/:id
 * Ambil detail satu pasien.
 */
const getPatientById = async (req, res, next) => {
  try {
    const patient = await patientService.getPatientById(req.params.id);
    return sendSuccess(res, 'Patient retrieved successfully', patient);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/patients
 * Buat pasien baru. Nomor rekam medis di-generate otomatis.
 * Body: { nik, name, gender, birth_date, phone, address }
 */
const createPatient = async (req, res, next) => {
  try {
    const patient = await patientService.createPatient(req.body);
    return sendCreated(res, 'Patient created successfully', patient);
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/patients/:id
 * Update data pasien (NIK tidak bisa diubah).
 * Body: { name?, gender?, birth_date?, phone?, address? }
 */
const updatePatient = async (req, res, next) => {
  try {
    const patient = await patientService.updatePatient(req.params.id, req.body);
    return sendSuccess(res, 'Patient updated successfully', patient);
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/patients/:id
 * Hapus pasien (hanya jika tidak memiliki riwayat pendaftaran).
 */
const deletePatient = async (req, res, next) => {
  try {
    await patientService.deletePatient(req.params.id);
    return sendSuccess(res, 'Patient deleted successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/patients/:id/history
 * Ambil riwayat pemeriksaan pasien (rekam medis + tindakan + resep).
 * Query: ?page=1&limit=10
 */
const getPatientHistory = async (req, res, next) => {
  try {
    const { patient, items, pagination } = await patientService.getPatientHistory(
      req.params.id,
      req.query
    );

    return sendPaginated(
      res,
      'Patient medical history retrieved successfully',
      items,
      pagination
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient,
  getPatientHistory,
};
