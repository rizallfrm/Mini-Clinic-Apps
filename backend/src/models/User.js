'use strict';

const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      // User memiliki satu profil dokter
      User.hasOne(models.Doctor, {
        foreignKey: 'user_id',
        as: 'doctorProfile',
      });

      // User (petugas) dapat membuat banyak pendaftaran
      User.hasMany(models.Registration, {
        foreignKey: 'created_by',
        as: 'createdRegistrations',
      });
    }
  }

  User.init(
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
          notEmpty: { msg: 'Name is required' },
          len: { args: [2, 100], msg: 'Name must be between 2 and 100 characters' },
        },
      },
      email: {
        type: DataTypes.STRING(150),
        allowNull: false,
        unique: { msg: 'Email already in use' },
        validate: {
          notEmpty: { msg: 'Email is required' },
          isEmail: { msg: 'Must be a valid email address' },
        },
      },
      password: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
          notEmpty: { msg: 'Password is required' },
          len: { args: [6, 255], msg: 'Password must be at least 6 characters' },
        },
      },
      role: {
        type: DataTypes.ENUM('ADMIN', 'DOCTOR', 'REGISTRATION_OFFICER'),
        allowNull: false,
        validate: {
          notEmpty: { msg: 'Role is required' },
          isIn: {
            args: [['ADMIN', 'DOCTOR', 'REGISTRATION_OFFICER']],
            msg: 'Role must be ADMIN, DOCTOR, or REGISTRATION_OFFICER',
          },
        },
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    },
    {
      sequelize,
      modelName: 'User',
      tableName: 'users',
      underscored: true,
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  return User;
};
