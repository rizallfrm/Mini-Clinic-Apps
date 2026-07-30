const policlinicService = require('../services/policlinicService');
const { sendSuccess, sendCreated, sendPaginated } = require('../utils/response');

const getAllPoliclinics = async (req, res, next) => {
  try {
    const { items, pagination } = await policlinicService.getAllPoliclinics(req.query);
    return sendPaginated(res, 'Policlinics retrieved successfully', items, pagination);
  } catch (error) { next(error); }
};

const getActivePoliclinics = async (req, res, next) => {
  try {
    const items = await policlinicService.getActivePoliclinics();
    return sendSuccess(res, 'Active policlinics retrieved successfully', items);
  } catch (error) { next(error); }
};

const getPoliclinicById = async (req, res, next) => {
  try {
    const policlinic = await policlinicService.getPoliclinicById(req.params.id);
    return sendSuccess(res, 'Policlinic retrieved successfully', policlinic);
  } catch (error) { next(error); }
};

const createPoliclinic = async (req, res, next) => {
  try {
    const policlinic = await policlinicService.createPoliclinic(req.body);
    return sendCreated(res, 'Policlinic created successfully', policlinic);
  } catch (error) { next(error); }
};

const updatePoliclinic = async (req, res, next) => {
  try {
    const policlinic = await policlinicService.updatePoliclinic(req.params.id, req.body);
    return sendSuccess(res, 'Policlinic updated successfully', policlinic);
  } catch (error) { next(error); }
};

const deletePoliclinic = async (req, res, next) => {
  try {
    await policlinicService.deletePoliclinic(req.params.id);
    return sendSuccess(res, 'Policlinic deleted successfully');
  } catch (error) { next(error); }
};

module.exports = {
  getAllPoliclinics,
  getActivePoliclinics,
  getPoliclinicById,
  createPoliclinic,
  updatePoliclinic,
  deletePoliclinic,
};
