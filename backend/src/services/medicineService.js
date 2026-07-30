const { Op } = require('sequelize');
const { Medicine, PrescriptionDetail } = require('../models');
const { AppError } = require('../middlewares/errorHandler');
const { getPagination, getPaginationMeta } = require('../utils/pagination');

/**
 * Ambil daftar obat dengan pagination & pencarian.
 */
const getAllMedicines = async (query) => {
  const { page, limit, offset } = getPagination(query);
  const { search, is_active, low_stock } = query;

  const whereClause = {};

  if (search && search.trim()) {
    whereClause[Op.or] = [
      { name: { [Op.iLike]: `%${search.trim()}%` } },
      { medicine_code: { [Op.iLike]: `%${search.trim()}%` } },
    ];
  }

  if (is_active !== undefined) {
    whereClause.is_active = is_active === 'true';
  }

  // Filter stok menipis (di bawah 20)
  if (low_stock === 'true') {
    whereClause.stock = { [Op.lt]: 20 };
  }

  const { count, rows } = await Medicine.findAndCountAll({
    where: whereClause,
    order: [['name', 'ASC']],
    limit,
    offset,
  });

  const pagination = getPaginationMeta(count, page, limit);
  return { items: rows, pagination };
};

/**
 * Ambil daftar obat aktif untuk dropdown resep.
 */
const getActiveMedicines = async () => {
  return Medicine.findAll({
    where: { is_active: true },
    attributes: ['id', 'medicine_code', 'name', 'unit', 'stock'],
    order: [['name', 'ASC']],
  });
};

/**
 * Ambil detail satu obat.
 */
const getMedicineById = async (id) => {
  const medicine = await Medicine.findByPk(id);
  if (!medicine) throw new AppError('Medicine not found.', 404);
  return medicine;
};

/**
 * Buat obat baru.
 */
const createMedicine = async (data) => {
  const { medicine_code, name, unit, stock, description, is_active } = data;

  const existing = await Medicine.findOne({
    where: { medicine_code: medicine_code.toUpperCase() },
  });
  if (existing) throw new AppError(`Medicine with code "${medicine_code}" already exists.`, 409);

  return Medicine.create({
    medicine_code: medicine_code.toUpperCase(),
    name,
    unit,
    stock: stock !== undefined ? stock : 0,
    description,
    is_active: is_active !== undefined ? is_active : true,
  });
};

/**
 * Update data obat (medicine_code tidak bisa diubah).
 */
const updateMedicine = async (id, data) => {
  const medicine = await Medicine.findByPk(id);
  if (!medicine) throw new AppError('Medicine not found.', 404);

  const { name, unit, stock, description, is_active } = data;

  await medicine.update({
    ...(name !== undefined && { name }),
    ...(unit !== undefined && { unit }),
    ...(stock !== undefined && { stock }),
    ...(description !== undefined && { description }),
    ...(is_active !== undefined && { is_active }),
  });

  return medicine;
};

/**
 * Tambah atau kurangi stok obat.
 * @param {number} id - Medicine ID
 * @param {{ quantity: number, type: 'ADD'|'SUBTRACT', notes?: string }} data
 */
const adjustStock = async (id, data) => {
  const { quantity, type } = data;

  const medicine = await Medicine.findByPk(id);
  if (!medicine) throw new AppError('Medicine not found.', 404);
  if (!medicine.is_active) throw new AppError('Cannot adjust stock for inactive medicine.', 400);

  let newStock;
  if (type === 'ADD') {
    newStock = medicine.stock + quantity;
  } else {
    newStock = medicine.stock - quantity;
    if (newStock < 0) {
      throw new AppError(
        `Insufficient stock. Current: ${medicine.stock}, requested: ${quantity}.`,
        400
      );
    }
  }

  await medicine.update({ stock: newStock });
  return medicine;
};

/**
 * Hapus obat (tidak bisa jika digunakan di resep).
 */
const deleteMedicine = async (id) => {
  const medicine = await Medicine.findByPk(id);
  if (!medicine) throw new AppError('Medicine not found.', 404);

  const usageCount = await PrescriptionDetail.count({ where: { medicine_id: id } });
  if (usageCount > 0) {
    throw new AppError(
      `Cannot delete medicine. Used in ${usageCount} prescription detail(s). Deactivate instead.`,
      409
    );
  }

  await medicine.destroy();
};

module.exports = {
  getAllMedicines,
  getActiveMedicines,
  getMedicineById,
  createMedicine,
  updateMedicine,
  adjustStock,
  deleteMedicine,
};
