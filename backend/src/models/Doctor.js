'use strict';

module.exports = (sequelize, DataTypes) => {
  const { Model } = require('sequelize');

  class Doctor extends Model {
    static associate(models) {
      // Dokter terhubung ke satu akun user
      Doctor.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user',
      });

      // Dokter terhubung ke satu poli
      Doctor.belongsTo(models.Policlinic, {
        foreignKey: 'policlinic_id',
        as: 'policlinic',
      });

      // Dokter dapat menangani banyak pendaftaran
      Doctor.hasMany(models.Registration, {
        foreignKey: 'doctor_id',
        as: 'registrations',
      });

      // Dokter dapat membuat banyak rekam medis
      Doctor.hasMany(models.MedicalRecord, {
        foreignKey: 'doctor_id',
        as: 'medicalRecords',
      });

      // Dokter dapat membuat banyak resep
      Doctor.hasMany(models.Prescription, {
        foreignKey: 'doctor_id',
        as: 'prescriptions',
      });
    }
  }

  Doctor.init(
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      user_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        unique: { msg: 'This user already has a doctor profile' },
        validate: {
          notNull: { msg: 'User ID is required' },
        },
      },
      policlinic_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        validate: {
          notNull: { msg: 'Policlinic ID is required' },
        },
      },
      doctor_code: {
        type: DataTypes.STRING(30),
        allowNull: false,
        unique: { msg: 'Doctor code already exists' },
        validate: {
          notEmpty: { msg: 'Doctor code is required' },
        },
      },
      name: {
        type: DataTypes.STRING(150),
        allowNull: false,
        validate: {
          notEmpty: { msg: 'Doctor name is required' },
          len: { args: [2, 150], msg: 'Name must be between 2 and 150 characters' },
        },
      },
      specialization: {
        type: DataTypes.STRING(150),
        allowNull: true,
      },
      phone: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    },
    {
      sequelize,
      modelName: 'Doctor',
      tableName: 'doctors',
      underscored: true,
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  return Doctor;
};
