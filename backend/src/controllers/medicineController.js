const medicineService = require('../services/medicineService');
const { sendSuccess, sendCreated, sendPaginated } = require('../utils/response');

const getAllMedicines = async (req, res, next) => {
  try {
    const { items, pagination } = await medicineService.getAllMedicines(req.query);
    return sendPaginated(res, 'Medicines retrieved successfully', items, pagination);
  } catch (error) { next(error); }
};

const getActiveMedicines = async (req, res, next) => {
  try {
    const items = await medicineService.getActiveMedicines();
    return sendSuccess(res, 'Active medicines retrieved successfully', items);
  } catch (error) { next(error); }
};

const getMedicineById = async (req, res, next) => {
  try {
    const medicine = await medicineService.getMedicineById(req.params.id);
    return sendSuccess(res, 'Medicine retrieved successfully', medicine);
  } catch (error) { next(error); }
};

const createMedicine = async (req, res, next) => {
  try {
    const medicine = await medicineService.createMedicine(req.body);
    return sendCreated(res, 'Medicine created successfully', medicine);
  } catch (error) { next(error); }
};

const updateMedicine = async (req, res, next) => {
  try {
    const medicine = await medicineService.updateMedicine(req.params.id, req.body);
    return sendSuccess(res, 'Medicine updated successfully', medicine);
  } catch (error) { next(error); }
};

const adjustStock = async (req, res, next) => {
  try {
    const medicine = await medicineService.adjustStock(req.params.id, req.body);
    return sendSuccess(
      res,
      `Stock ${req.body.type === 'ADD' ? 'added' : 'subtracted'} successfully`,
      { id: medicine.id, name: medicine.name, stock: medicine.stock }
    );
  } catch (error) { next(error); }
};

const deleteMedicine = async (req, res, next) => {
  try {
    await medicineService.deleteMedicine(req.params.id);
    return sendSuccess(res, 'Medicine deleted successfully');
  } catch (error) { next(error); }
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
