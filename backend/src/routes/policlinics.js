const express = require('express');
const policlinicController = require('../controllers/policlinicController');
const authenticate = require('../middlewares/authenticate');
const { authorize } = require('../middlewares/authorize');
const { createPoliclinicRules, updatePoliclinicRules } = require('../validators/policlinicValidator');
const validate = require('../validators/validate');

const router = express.Router();
router.use(authenticate);

// GET /api/policlinics/active → untuk dropdown form (semua role)
router.get('/active', authorize('ADMIN', 'DOCTOR', 'REGISTRATION_OFFICER'), policlinicController.getActivePoliclinics);

// GET /api/policlinics → semua role
router.get('/', authorize('ADMIN', 'DOCTOR', 'REGISTRATION_OFFICER'), policlinicController.getAllPoliclinics);

// GET /api/policlinics/:id → semua role
router.get('/:id', authorize('ADMIN', 'DOCTOR', 'REGISTRATION_OFFICER'), policlinicController.getPoliclinicById);

// POST /api/policlinics → Admin only
router.post('/', authorize('ADMIN'), createPoliclinicRules, validate, policlinicController.createPoliclinic);

// PUT /api/policlinics/:id → Admin only
router.put('/:id', authorize('ADMIN'), updatePoliclinicRules, validate, policlinicController.updatePoliclinic);

// DELETE /api/policlinics/:id → Admin only
router.delete('/:id', authorize('ADMIN'), policlinicController.deletePoliclinic);

module.exports = router;
