const medicalRecordService = require('../services/medicalRecordService');
const { sendSuccess, sendCreated, sendPaginated } = require('../utils/response');

// =====================================================
// MEDICAL RECORDS
// =====================================================

const getAllMedicalRecords = async (req, res, next) => {
  try {
    const { items, pagination } = await medicalRecordService.getAllMedicalRecords(req.query);
    return sendPaginated(res, 'Medical records retrieved successfully', items, pagination);
  } catch (error) { next(error); }
};

const getMedicalRecordById = async (req, res, next) => {
  try {
    const record = await medicalRecordService.getMedicalRecordById(req.params.id);
    return sendSuccess(res, 'Medical record retrieved successfully', record);
  } catch (error) { next(error); }
};

const createMedicalRecord = async (req, res, next) => {
  try {
    const record = await medicalRecordService.createMedicalRecord(req.body, req.user);
    return sendCreated(res, 'Medical record created successfully', record);
  } catch (error) { next(error); }
};

const updateMedicalRecord = async (req, res, next) => {
  try {
    const record = await medicalRecordService.updateMedicalRecord(req.params.id, req.body, req.user);
    return sendSuccess(res, 'Medical record updated successfully', record);
  } catch (error) { next(error); }
};

const completeMedicalRecord = async (req, res, next) => {
  try {
    const record = await medicalRecordService.completeMedicalRecord(req.params.id, req.user);
    return sendSuccess(res, 'Medical record completed successfully', record);
  } catch (error) { next(error); }
};

// =====================================================
// MEDICAL ACTIONS
// =====================================================

const addMedicalAction = async (req, res, next) => {
  try {
    const action = await medicalRecordService.addMedicalAction(req.params.id, req.body, req.user);
    return sendCreated(res, 'Medical action added successfully', action);
  } catch (error) { next(error); }
};

const updateMedicalAction = async (req, res, next) => {
  try {
    const action = await medicalRecordService.updateMedicalAction(req.params.id, req.params.actionId, req.body, req.user);
    return sendSuccess(res, 'Medical action updated successfully', action);
  } catch (error) { next(error); }
};

const deleteMedicalAction = async (req, res, next) => {
  try {
    await medicalRecordService.deleteMedicalAction(req.params.id, req.params.actionId, req.user);
    return sendSuccess(res, 'Medical action deleted successfully');
  } catch (error) { next(error); }
};

// =====================================================
// PRESCRIPTIONS
// =====================================================

const getPrescription = async (req, res, next) => {
  try {
    const prescription = await medicalRecordService.getPrescription(req.params.id);
    return sendSuccess(res, 'Prescription retrieved successfully', prescription || {});
  } catch (error) { next(error); }
};

const createPrescription = async (req, res, next) => {
  try {
    const prescription = await medicalRecordService.createPrescription(req.params.id, req.body, req.user);
    return sendCreated(res, 'Prescription created successfully', prescription);
  } catch (error) { next(error); }
};

const updatePrescription = async (req, res, next) => {
  try {
    const prescription = await medicalRecordService.updatePrescription(req.params.id, req.body, req.user);
    return sendSuccess(res, 'Prescription updated successfully', prescription);
  } catch (error) { next(error); }
};

// =====================================================
// PRESCRIPTION DETAILS
// =====================================================

const addPrescriptionDetail = async (req, res, next) => {
  try {
    const detail = await medicalRecordService.addPrescriptionDetail(req.params.id, req.body, req.user);
    return sendCreated(res, 'Medicine added to prescription successfully', detail);
  } catch (error) { next(error); }
};

const updatePrescriptionDetail = async (req, res, next) => {
  try {
    const detail = await medicalRecordService.updatePrescriptionDetail(req.params.id, req.params.detailId, req.body, req.user);
    return sendSuccess(res, 'Prescription detail updated successfully', detail);
  } catch (error) { next(error); }
};

const deletePrescriptionDetail = async (req, res, next) => {
  try {
    await medicalRecordService.deletePrescriptionDetail(req.params.id, req.params.detailId, req.user);
    return sendSuccess(res, 'Medicine removed from prescription successfully');
  } catch (error) { next(error); }
};

module.exports = {
  getAllMedicalRecords,
  getMedicalRecordById,
  createMedicalRecord,
  updateMedicalRecord,
  completeMedicalRecord,
  addMedicalAction,
  updateMedicalAction,
  deleteMedicalAction,
  getPrescription,
  createPrescription,
  updatePrescription,
  addPrescriptionDetail,
  updatePrescriptionDetail,
  deletePrescriptionDetail,
};
