const express = require('express');
const medicalRecordController = require('../controllers/medicalRecordController');
const authenticate = require('../middlewares/authenticate');
const { authorize } = require('../middlewares/authorize');
const {
  createMedicalRecordRules,
  updateMedicalRecordRules,
  createActionRules,
  updateActionRules,
  createPrescriptionRules,
  createPrescriptionDetailRules,
  updatePrescriptionDetailRules,
} = require('../validators/medicalRecordValidator');
const validate = require('../validators/validate');

const router = express.Router();
router.use(authenticate);

// =====================================================
// MEDICAL RECORDS (SOAP)
// =====================================================

// GET /api/medical-records
router.get('/', authorize('ADMIN', 'DOCTOR', 'REGISTRATION_OFFICER'), medicalRecordController.getAllMedicalRecords);

// GET /api/medical-records/by-registration/:registrationId
router.get('/by-registration/:registrationId', authorize('ADMIN', 'DOCTOR', 'REGISTRATION_OFFICER'), medicalRecordController.getMedicalRecordByRegistrationId);

// GET /api/medical-records/:id
router.get('/:id', authorize('ADMIN', 'DOCTOR', 'REGISTRATION_OFFICER'), medicalRecordController.getMedicalRecordById);

// POST /api/medical-records
router.post('/', authorize('ADMIN', 'DOCTOR'), createMedicalRecordRules, validate, medicalRecordController.createMedicalRecord);

// PUT /api/medical-records/:id
router.put('/:id', authorize('ADMIN', 'DOCTOR'), updateMedicalRecordRules, validate, medicalRecordController.updateMedicalRecord);

// PATCH /api/medical-records/:id/complete
router.put('/:id/complete', authorize('ADMIN', 'DOCTOR'), medicalRecordController.completeMedicalRecord);

// =====================================================
// MEDICAL ACTIONS
// =====================================================

// POST /api/medical-records/:id/actions
router.post('/:id/actions', authorize('ADMIN', 'DOCTOR'), createActionRules, validate, medicalRecordController.addMedicalAction);

// PUT /api/medical-records/:id/actions/:actionId
router.put('/:id/actions/:actionId', authorize('ADMIN', 'DOCTOR'), updateActionRules, validate, medicalRecordController.updateMedicalAction);

// DELETE /api/medical-records/:id/actions/:actionId
router.delete('/:id/actions/:actionId', authorize('ADMIN', 'DOCTOR'), medicalRecordController.deleteMedicalAction);

// =====================================================
// PRESCRIPTIONS
// =====================================================

// GET /api/medical-records/:id/prescription
router.get('/:id/prescription', authorize('ADMIN', 'DOCTOR', 'REGISTRATION_OFFICER'), medicalRecordController.getPrescription);

// POST /api/medical-records/:id/prescription
router.post('/:id/prescription', authorize('ADMIN', 'DOCTOR'), createPrescriptionRules, validate, medicalRecordController.createPrescription);

// POST /api/medical-records/:id/prescription/details
router.post('/:id/prescription/details', authorize('ADMIN', 'DOCTOR'), createPrescriptionDetailRules, validate, medicalRecordController.addPrescriptionDetail);

// PUT /api/medical-records/:id/prescription/details/:detailId
router.put('/:id/prescription/details/:detailId', authorize('ADMIN', 'DOCTOR'), updatePrescriptionDetailRules, validate, medicalRecordController.updatePrescriptionDetail);

// DELETE /api/medical-records/:id/prescription/details/:detailId
router.delete('/:id/prescription/details/:detailId', authorize('ADMIN', 'DOCTOR'), medicalRecordController.deletePrescriptionDetail);

module.exports = router;
