const express = require('express');
const medicineController = require('../controllers/medicineController');
const authenticate = require('../middlewares/authenticate');
const { authorize } = require('../middlewares/authorize');
const { createMedicineRules, updateMedicineRules, adjustStockRules } = require('../validators/medicineValidator');
const validate = require('../validators/validate');

const router = express.Router();
router.use(authenticate);

// GET /api/medicines/active → untuk dropdown resep (semua role)
router.get('/active', authorize('ADMIN', 'DOCTOR', 'REGISTRATION_OFFICER'), medicineController.getActiveMedicines);

// GET /api/medicines → semua role (support ?low_stock=true)
router.get('/', authorize('ADMIN', 'DOCTOR', 'REGISTRATION_OFFICER'), medicineController.getAllMedicines);

// GET /api/medicines/:id → semua role
router.get('/:id', authorize('ADMIN', 'DOCTOR', 'REGISTRATION_OFFICER'), medicineController.getMedicineById);

// POST /api/medicines → Admin only
router.post('/', authorize('ADMIN'), createMedicineRules, validate, medicineController.createMedicine);

// POST /api/medicines/:id/stock → Admin only (adjustStok ADD/SUBTRACT)
router.post('/:id/stock', authorize('ADMIN'), adjustStockRules, validate, medicineController.adjustStock);

// PUT /api/medicines/:id → Admin only
router.put('/:id', authorize('ADMIN'), updateMedicineRules, validate, medicineController.updateMedicine);

// DELETE /api/medicines/:id → Admin only
router.delete('/:id', authorize('ADMIN'), medicineController.deleteMedicine);

module.exports = router;
