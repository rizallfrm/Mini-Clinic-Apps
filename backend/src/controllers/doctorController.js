const doctorService = require('../services/doctorService');
const { sendSuccess, sendCreated, sendPaginated } = require('../utils/response');

const getAllDoctors = async (req, res, next) => {
  try {
    const { items, pagination } = await doctorService.getAllDoctors(req.query);
    return sendPaginated(res, 'Doctors retrieved successfully', items, pagination);
  } catch (error) { next(error); }
};

const getActiveDoctors = async (req, res, next) => {
  try {
    const { policlinic_id } = req.query;
    const items = await doctorService.getActiveDoctors(policlinic_id);
    return sendSuccess(res, 'Active doctors retrieved successfully', items);
  } catch (error) { next(error); }
};

const getDoctorById = async (req, res, next) => {
  try {
    const doctor = await doctorService.getDoctorById(req.params.id);
    return sendSuccess(res, 'Doctor retrieved successfully', doctor);
  } catch (error) { next(error); }
};

const createDoctor = async (req, res, next) => {
  try {
    const doctor = await doctorService.createDoctor(req.body);
    return sendCreated(res, 'Doctor created successfully', doctor);
  } catch (error) { next(error); }
};

const updateDoctor = async (req, res, next) => {
  try {
    const doctor = await doctorService.updateDoctor(req.params.id, req.body);
    return sendSuccess(res, 'Doctor updated successfully', doctor);
  } catch (error) { next(error); }
};

const deleteDoctor = async (req, res, next) => {
  try {
    await doctorService.deleteDoctor(req.params.id);
    return sendSuccess(res, 'Doctor deleted successfully');
  } catch (error) { next(error); }
};

module.exports = {
  getAllDoctors,
  getActiveDoctors,
  getDoctorById,
  createDoctor,
  updateDoctor,
  deleteDoctor,
};
