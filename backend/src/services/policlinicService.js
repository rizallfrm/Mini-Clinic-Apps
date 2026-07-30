const { Op } = require('sequelize');
const { Policlinic, Doctor, Registration } = require('../models');
const { AppError } = require('../middlewares/errorHandler');
const { getPagination, getPaginationMeta } = require('../utils/pagination');

/**
 * Ambil daftar poli dengan pagination & pencarian.
 */
const getAllPoliclinics = async (query) => {
  const { page, limit, offset } = getPagination(query);
  const { search, is_active } = query;

  const whereClause = {};

  if (search && search.trim()) {
    whereClause[Op.or] = [
      { name: { [Op.iLike]: `%${search.trim()}%` } },
      { code: { [Op.iLike]: `%${search.trim()}%` } },
    ];
  }

  if (is_active !== undefined) {
    whereClause.is_active = is_active === 'true';
  }

  const { count, rows } = await Policlinic.findAndCountAll({
    where: whereClause,
    order: [['name', 'ASC']],
    limit,
    offset,
  });

  const pagination = getPaginationMeta(count, page, limit);
  return { items: rows, pagination };
};

/**
 * Ambil daftar poli aktif (untuk dropdown form).
 */
const getActivePoliclinics = async () => {
  return Policlinic.findAll({
    where: { is_active: true },
    attributes: ['id', 'code', 'name'],
    order: [['name', 'ASC']],
  });
};

/**
 * Ambil detail satu poli beserta daftar dokternya.
 */
const getPoliclinicById = async (id) => {
  const policlinic = await Policlinic.findByPk(id, {
    include: [
      {
        model: Doctor,
        as: 'doctors',
        attributes: ['id', 'doctor_code', 'name', 'specialization', 'phone', 'is_active'],
        where: { is_active: true },
        required: false,
      },
    ],
  });

  if (!policlinic) throw new AppError('Policlinic not found.', 404);
  return policlinic;
};

/**
 * Buat poli baru.
 */
const createPoliclinic = async (data) => {
  const { code, name, description, is_active } = data;

  const existing = await Policlinic.findOne({ where: { code: code.toUpperCase() } });
  if (existing) throw new AppError(`Policlinic with code "${code}" already exists.`, 409);

  return Policlinic.create({
    code: code.toUpperCase(),
    name,
    description,
    is_active: is_active !== undefined ? is_active : true,
  });
};

/**
 * Update poli (code tidak bisa diubah).
 */
const updatePoliclinic = async (id, data) => {
  const policlinic = await Policlinic.findByPk(id);
  if (!policlinic) throw new AppError('Policlinic not found.', 404);

  const { name, description, is_active } = data;

  await policlinic.update({
    ...(name !== undefined && { name }),
    ...(description !== undefined && { description }),
    ...(is_active !== undefined && { is_active }),
  });

  return policlinic;
};

/**
 * Hapus poli (tidak bisa jika masih punya dokter/registrasi aktif).
 */
const deletePoliclinic = async (id) => {
  const policlinic = await Policlinic.findByPk(id);
  if (!policlinic) throw new AppError('Policlinic not found.', 404);

  const doctorCount = await Doctor.count({ where: { policlinic_id: id } });
  if (doctorCount > 0) {
    throw new AppError(
      `Cannot delete policlinic. It has ${doctorCount} doctor(s) assigned. Deactivate instead.`,
      409
    );
  }

  const regCount = await Registration.count({ where: { policlinic_id: id } });
  if (regCount > 0) {
    throw new AppError(
      `Cannot delete policlinic. It has ${regCount} registration record(s).`,
      409
    );
  }

  await policlinic.destroy();
};

module.exports = {
  getAllPoliclinics,
  getActivePoliclinics,
  getPoliclinicById,
  createPoliclinic,
  updatePoliclinic,
  deletePoliclinic,
};
