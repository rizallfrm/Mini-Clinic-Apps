const express = require('express');
const medicalRecordController = require('../controllers/medicalRecordController');
const authenticate = require('../middlewares/authenticate');
const { authorize } = require('../middlewares/authorize');
const { createPrescriptionRules } = require('../validators/medicalRecordValidator');
const validate = require('../validators/validate');

const router = express.Router();
router.use(authenticate);

// POST /api/prescriptions — Buat resep obat lengkap (dengan details & potong stok)
router.post('/', authorize('ADMIN', 'DOCTOR'), createPrescriptionRules, validate, medicalRecordController.createPrescriptionWithDetails);

module.exports = router;
