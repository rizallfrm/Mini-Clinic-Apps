const express = require('express');
const doctorController = require('../controllers/doctorController');
const authenticate = require('../middlewares/authenticate');
const { authorize } = require('../middlewares/authorize');
const { createDoctorRules, updateDoctorRules } = require('../validators/doctorValidator');
const validate = require('../validators/validate');

const router = express.Router();
router.use(authenticate);

// GET /api/doctors/active → untuk dropdown (bisa filter ?policlinic_id=1)
router.get('/active', authorize('ADMIN', 'DOCTOR', 'REGISTRATION_OFFICER'), doctorController.getActiveDoctors);

// GET /api/doctors
router.get('/', authorize('ADMIN', 'DOCTOR', 'REGISTRATION_OFFICER'), doctorController.getAllDoctors);

// GET /api/doctors/:id
router.get('/:id', authorize('ADMIN', 'DOCTOR', 'REGISTRATION_OFFICER'), doctorController.getDoctorById);

// POST /api/doctors → Admin only (buat user + profil dokter sekaligus)
router.post('/', authorize('ADMIN'), createDoctorRules, validate, doctorController.createDoctor);

// PUT /api/doctors/:id → Admin only
router.put('/:id', authorize('ADMIN'), updateDoctorRules, validate, doctorController.updateDoctor);

// DELETE /api/doctors/:id → Admin only
router.delete('/:id', authorize('ADMIN'), doctorController.deleteDoctor);

module.exports = router;
