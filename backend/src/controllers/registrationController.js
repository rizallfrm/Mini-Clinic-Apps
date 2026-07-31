const registrationService = require('../services/registrationService');
const { sendSuccess, sendCreated, sendPaginated } = require('../utils/response');

/**
 * GET /api/registrations
 * Daftar semua pendaftaran dengan filter & pagination.
 * Query: ?page=1&limit=10&status=WAITING&doctor_id=1&policlinic_id=1&visit_date=2024-07-30
 */
const getAllRegistrations = async (req, res, next) => {
  try {
    const { items, pagination } = await registrationService.getAllRegistrations(req.query, req.user);
    return sendPaginated(res, 'Registrations retrieved successfully', items, pagination);
  } catch (error) { next(error); }
};

/**
 * GET /api/registrations/today
 * Daftar pendaftaran hari ini, diurutkan nomor antrean.
 * Query: ?status=WAITING&policlinic_id=1&doctor_id=1
 */
const getTodayRegistrations = async (req, res, next) => {
  try {
    const items = await registrationService.getTodayRegistrations(req.query, req.user);
    return sendSuccess(res, "Today's registrations retrieved successfully", items);
  } catch (error) { next(error); }
};

/**
 * GET /api/registrations/:id
 * Detail satu pendaftaran (pasien, dokter, poli, antrean, rekam medis).
 */
const getRegistrationById = async (req, res, next) => {
  try {
    const registration = await registrationService.getRegistrationById(req.params.id);
    return sendSuccess(res, 'Registration retrieved successfully', registration);
  } catch (error) { next(error); }
};

/**
 * POST /api/registrations
 * Buat pendaftaran baru + antrean otomatis.
 * Body: { patient_id, doctor_id, policlinic_id, visit_date, payment_type, initial_complaint }
 */
const createRegistration = async (req, res, next) => {
  try {
    const result = await registrationService.createRegistration(req.body, req.user.id);
    return sendCreated(res, 'Registration created successfully. Queue number has been assigned.', result);
  } catch (error) { next(error); }
};

/**
 * PUT /api/registrations/:id
 * Edit pendaftaran (hanya saat status WAITING).
 */
const updateRegistration = async (req, res, next) => {
  try {
    const registration = await registrationService.updateRegistration(req.params.id, req.body);
    return sendSuccess(res, 'Registration updated successfully', registration);
  } catch (error) { next(error); }
};

/**
 * PATCH /api/registrations/:id/status
 * Update status pendaftaran sesuai state machine.
 * Body: { status: "CHECKED_IN" | "EXAMINATION" | "COMPLETED" | "CANCELLED" }
 *
 * Status Flow:
 *   WAITING → CHECKED_IN → EXAMINATION → COMPLETED
 *   Setiap status bisa → CANCELLED
 */
const updateRegistrationStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const registration = await registrationService.updateRegistrationStatus(req.params.id, status);
    return sendSuccess(res, `Registration status updated to "${status}"`, registration);
  } catch (error) { next(error); }
};

/**
 * DELETE /api/registrations/:id
 * Hapus pendaftaran (hanya status WAITING atau CANCELLED).
 */
const deleteRegistration = async (req, res, next) => {
  try {
    await registrationService.deleteRegistration(req.params.id);
    return sendSuccess(res, 'Registration deleted successfully');
  } catch (error) { next(error); }
};

module.exports = {
  getAllRegistrations,
  getTodayRegistrations,
  getRegistrationById,
  createRegistration,
  updateRegistration,
  updateRegistrationStatus,
  deleteRegistration,
};
