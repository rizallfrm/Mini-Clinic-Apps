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

// GET /api/medical-records/:id
router.get('/:id', authorize('ADMIN', 'DOCTOR', 'REGISTRATION_OFFICER'), medicalRecordController.getMedicalRecordById);

// POST /api/medical-records
router.post('/', authorize('DOCTOR'), createMedicalRecordRules, validate, medicalRecordController.createMedicalRecord);

// PUT /api/medical-records/:id
router.put('/:id', authorize('DOCTOR'), updateMedicalRecordRules, validate, medicalRecordController.updateMedicalRecord);

// PATCH /api/medical-records/:id/complete
router.patch('/:id/complete', authorize('DOCTOR'), medicalRecordController.completeMedicalRecord);

// =====================================================
// MEDICAL ACTIONS
// =====================================================

// POST /api/medical-records/:id/actions
router.post('/:id/actions', authorize('DOCTOR'), createActionRules, validate, medicalRecordController.addMedicalAction);

// PUT /api/medical-records/:id/actions/:actionId
router.put('/:id/actions/:actionId', authorize('DOCTOR'), updateActionRules, validate, medicalRecordController.updateMedicalAction);

// DELETE /api/medical-records/:id/actions/:actionId
router.delete('/:id/actions/:actionId', authorize('DOCTOR'), medicalRecordController.deleteMedicalAction);

// =====================================================
// PRESCRIPTIONS
// =====================================================

// GET /api/medical-records/:id/prescription
router.get('/:id/prescription', authorize('ADMIN', 'DOCTOR', 'REGISTRATION_OFFICER'), medicalRecordController.getPrescription);

// POST /api/medical-records/:id/prescription
router.post('/:id/prescription', authorize('DOCTOR'), createPrescriptionRules, validate, medicalRecordController.createPrescription);

// PUT /api/medical-records/:id/prescription
router.put('/:id/prescription', authorize('DOCTOR'), createPrescriptionRules, validate, medicalRecordController.updatePrescription);

// =====================================================
// PRESCRIPTION DETAILS (Obat)
// =====================================================

// POST /api/medical-records/:id/prescription/details
router.post('/:id/prescription/details', authorize('DOCTOR'), createPrescriptionDetailRules, validate, medicalRecordController.addPrescriptionDetail);

// PUT /api/medical-records/:id/prescription/details/:detailId
router.put('/:id/prescription/details/:detailId', authorize('DOCTOR'), updatePrescriptionDetailRules, validate, medicalRecordController.updatePrescriptionDetail);

// DELETE /api/medical-records/:id/prescription/details/:detailId
router.delete('/:id/prescription/details/:detailId', authorize('DOCTOR'), medicalRecordController.deletePrescriptionDetail);

module.exports = router;
