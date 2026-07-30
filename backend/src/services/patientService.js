const { Op } = require('sequelize');
const {
  Patient,
  Registration,
  MedicalRecord,
  MedicalAction,
  Prescription,
  PrescriptionDetail,
  Doctor,
  Policlinic,
  Medicine,
  Queue,
} = require('../models');
const { AppError } = require('../middlewares/errorHandler');
const { getPagination, getPaginationMeta } = require('../utils/pagination');

// =====================================================
// GENERATE MEDICAL RECORD NUMBER
// =====================================================

/**
 * Generate nomor rekam medis otomatis.
 * Format: RM-YYYYMMDD-NNN (sequential per hari)
 * Contoh: RM-20240730-001
 *
 * @returns {Promise<string>} Medical record number
 */
const generateMedicalRecordNumber = async () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const dateStr = `${year}${month}${day}`;

  const prefix = `RM-${dateStr}-`;

  // Hitung berapa pasien yang sudah dibuat hari ini
  const count = await Patient.count({
    where: {
      medical_record_number: {
        [Op.like]: `${prefix}%`,
      },
    },
  });

  const sequence = String(count + 1).padStart(3, '0');
  return `${prefix}${sequence}`;
};

// =====================================================
// PATIENT SERVICES
// =====================================================

/**
 * Ambil daftar pasien dengan pencarian dan pagination.
 *
 * @param {object} query - Query params (page, limit, search)
 * @returns {{ items: Patient[], pagination: object }}
 */
const getAllPatients = async (query) => {
  const { page, limit, offset } = getPagination(query);
  const { search } = query;

  // Bangun kondisi WHERE untuk pencarian
  const whereClause = {};
  if (search && search.trim()) {
    const keyword = search.trim();
    whereClause[Op.or] = [
      { name: { [Op.iLike]: `%${keyword}%` } },
      { medical_record_number: { [Op.iLike]: `%${keyword}%` } },
      { nik: { [Op.like]: `%${keyword}%` } },
      { phone: { [Op.like]: `%${keyword}%` } },
    ];
  }

  const { count, rows } = await Patient.findAndCountAll({
    where: whereClause,
    attributes: [
      'id', 'medical_record_number', 'nik', 'name',
      'gender', 'birth_date', 'phone', 'address',
      'created_at', 'updated_at',
    ],
    order: [['created_at', 'DESC']],
    limit,
    offset,
  });

  const pagination = getPaginationMeta(count, page, limit);
  return { items: rows, pagination };
};

/**
 * Ambil detail satu pasien berdasarkan ID.
 *
 * @param {number} id - Patient ID
 * @returns {Patient}
 */
const getPatientById = async (id) => {
  const patient = await Patient.findByPk(id, {
    attributes: [
      'id', 'medical_record_number', 'nik', 'name',
      'gender', 'birth_date', 'phone', 'address',
      'created_at', 'updated_at',
    ],
  });

  if (!patient) {
    throw new AppError('Patient not found.', 404);
  }

  return patient;
};

/**
 * Buat pasien baru.
 * Nomor rekam medis di-generate otomatis.
 *
 * @param {object} data - Data pasien dari request body
 * @returns {Patient}
 */
const createPatient = async (data) => {
  const { nik, name, gender, birth_date, phone, address } = data;

  // Cek apakah NIK sudah terdaftar
  const existingNik = await Patient.findOne({ where: { nik } });
  if (existingNik) {
    throw new AppError(`NIK ${nik} is already registered.`, 409);
  }

  // Generate nomor rekam medis otomatis
  const medical_record_number = await generateMedicalRecordNumber();

  const patient = await Patient.create({
    medical_record_number,
    nik,
    name,
    gender,
    birth_date,
    phone,
    address,
  });

  return patient;
};

/**
 * Update data pasien.
 * NIK tidak bisa diubah.
 *
 * @param {number} id - Patient ID
 * @param {object} data - Data yang akan diupdate
 * @returns {Patient}
 */
const updatePatient = async (id, data) => {
  const patient = await Patient.findByPk(id);
  if (!patient) {
    throw new AppError('Patient not found.', 404);
  }

  const { name, gender, birth_date, phone, address } = data;

  await patient.update({
    ...(name !== undefined && { name }),
    ...(gender !== undefined && { gender }),
    ...(birth_date !== undefined && { birth_date }),
    ...(phone !== undefined && { phone }),
    ...(address !== undefined && { address }),
  });

  return patient;
};

/**
 * Hapus pasien.
 * Tidak bisa dihapus jika masih memiliki riwayat pendaftaran.
 *
 * @param {number} id - Patient ID
 */
const deletePatient = async (id) => {
  const patient = await Patient.findByPk(id);
  if (!patient) {
    throw new AppError('Patient not found.', 404);
  }

  // Cek apakah pasien masih memiliki riwayat registrasi
  const registrationCount = await Registration.count({
    where: { patient_id: id },
  });

  if (registrationCount > 0) {
    throw new AppError(
      `Cannot delete patient. Patient has ${registrationCount} registration record(s). Deactivate instead.`,
      409
    );
  }

  await patient.destroy();
};

/**
 * Ambil riwayat pemeriksaan pasien.
 * Berisi semua rekam medis lengkap dengan tindakan dan resep.
 *
 * @param {number} patientId - Patient ID
 * @param {object} query - Query params (page, limit)
 * @returns {{ patient: Patient, items: MedicalRecord[], pagination: object }}
 */
const getPatientHistory = async (patientId, query) => {
  // Verifikasi pasien ada
  const patient = await Patient.findByPk(patientId, {
    attributes: ['id', 'medical_record_number', 'nik', 'name', 'gender', 'birth_date', 'phone'],
  });

  if (!patient) {
    throw new AppError('Patient not found.', 404);
  }

  const { page, limit, offset } = getPagination(query);

  const { count, rows } = await MedicalRecord.findAndCountAll({
    where: { patient_id: patientId },
    include: [
      {
        model: Registration,
        as: 'registration',
        attributes: [
          'id', 'registration_number', 'visit_date',
          'payment_type', 'initial_complaint', 'status',
        ],
        include: [
          {
            model: Queue,
            as: 'queue',
            attributes: ['queue_number', 'queue_date', 'status'],
          },
          {
            model: Policlinic,
            as: 'policlinic',
            attributes: ['id', 'code', 'name'],
          },
        ],
      },
      {
        model: Doctor,
        as: 'doctor',
        attributes: ['id', 'doctor_code', 'name', 'specialization'],
      },
      {
        model: MedicalAction,
        as: 'medicalActions',
        attributes: ['id', 'action_name', 'description', 'notes'],
      },
      {
        model: Prescription,
        as: 'prescription',
        attributes: ['id', 'prescription_number', 'notes'],
        include: [
          {
            model: PrescriptionDetail,
            as: 'details',
            attributes: ['id', 'dosage', 'frequency', 'duration', 'quantity', 'instructions'],
            include: [
              {
                model: Medicine,
                as: 'medicine',
                attributes: ['id', 'medicine_code', 'name', 'unit'],
              },
            ],
          },
        ],
      },
    ],
    order: [['examination_date', 'DESC']],
    limit,
    offset,
    distinct: true,
  });

  const pagination = getPaginationMeta(count, page, limit);
  return { patient, items: rows, pagination };
};

module.exports = {
  getAllPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient,
  getPatientHistory,
  generateMedicalRecordNumber,
};
