'use strict';

const userService = require('../services/userService');
const { sendSuccess, sendCreated } = require('../utils/response');

const getAllUsers = async (req, res, next) => {
  try {
    const data = await userService.getAllUsers(req.query);
    return sendSuccess(res, 'Users fetched successfully', data);
  } catch (error) { next(error); }
};

const getUserById = async (req, res, next) => {
  try {
    const user = await userService.getUserById(req.params.id);
    return sendSuccess(res, 'User fetched successfully', user);
  } catch (error) { next(error); }
};

const createUser = async (req, res, next) => {
  try {
    const user = await userService.createUser(req.body);
    return sendCreated(res, 'User created successfully', user);
  } catch (error) { next(error); }
};

const updateUser = async (req, res, next) => {
  try {
    const user = await userService.updateUser(req.params.id, req.body);
    return sendSuccess(res, 'User updated successfully', user);
  } catch (error) { next(error); }
};

const deleteUser = async (req, res, next) => {
  try {
    await userService.deleteUser(req.params.id);
    return sendSuccess(res, 'User deactivated successfully');
  } catch (error) { next(error); }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};
