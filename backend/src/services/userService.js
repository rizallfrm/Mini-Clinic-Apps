'use strict';

const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');
const { User, Doctor } = require('../models');
const { AppError } = require('../middlewares/errorHandler');

const getAllUsers = async (query = {}) => {
  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 20;
  const offset = (page - 1) * limit;
  const { search, role } = query;

  const where = {};
  if (search) {
    where[Op.or] = [
      { username: { [Op.iLike]: `%${search}%` } },
      { full_name: { [Op.iLike]: `%${search}%` } },
    ];
  }
  if (role) {
    where.role = role;
  }

  const { count, rows } = await User.findAndCountAll({
    where,
    attributes: { exclude: ['password'] },
    include: [{ model: Doctor, as: 'doctorProfile', required: false }],
    order: [['id', 'DESC']],
    limit,
    offset,
  });

  return {
    items: rows,
    total: count,
    page,
    totalPages: Math.ceil(count / limit),
  };
};

const getUserById = async (id) => {
  const user = await User.findByPk(id, {
    attributes: { exclude: ['password'] },
    include: [{ model: Doctor, as: 'doctorProfile', required: false }],
  });
  if (!user) throw new AppError('User not found.', 404);
  return user;
};

const createUser = async (data) => {
  const { username, password, full_name, role, is_active } = data;

  const existing = await User.findOne({ where: { username } });
  if (existing) throw new AppError('Username already taken.', 409);

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    username,
    password: hashedPassword,
    full_name,
    role: role || 'ADMIN',
    is_active: is_active !== undefined ? is_active : true,
  });

  return getUserById(user.id);
};

const updateUser = async (id, data) => {
  const user = await User.findByPk(id);
  if (!user) throw new AppError('User not found.', 404);

  const { username, password, full_name, role, is_active } = data;

  if (username && username !== user.username) {
    const existing = await User.findOne({ where: { username } });
    if (existing) throw new AppError('Username already taken.', 409);
  }

  const updateData = {};
  if (username) updateData.username = username;
  if (full_name) updateData.full_name = full_name;
  if (role) updateData.role = role;
  if (is_active !== undefined) updateData.is_active = is_active;
  if (password && password.trim() !== '') {
    updateData.password = await bcrypt.hash(password, 10);
  }

  await user.update(updateData);
  return getUserById(user.id);
};

const deleteUser = async (id) => {
  const user = await User.findByPk(id);
  if (!user) throw new AppError('User not found.', 404);
  await user.update({ is_active: false });
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};
