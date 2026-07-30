'use strict';

module.exports = (sequelize, DataTypes) => {
  const { Model } = require('sequelize');

  class Patient extends Model {
    static associate(models) {
      // Satu pasien memiliki banyak pendaftaran
      Patient.hasMany(models.Registration, {
        foreignKey: 'patient_id',
        as: 'registrations',
      });

      // Satu pasien memiliki banyak rekam medis
      Patient.hasMany(models.MedicalRecord, {
        foreignKey: 'patient_id',
        as: 'medicalRecords',
      });

      // Satu pasien memiliki banyak resep
      Patient.hasMany(models.Prescription, {
        foreignKey: 'patient_id',
        as: 'prescriptions',
      });
    }
  }

  Patient.init(
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      medical_record_number: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: { msg: 'Medical record number already exists' },
        validate: {
          notEmpty: { msg: 'Medical record number is required' },
        },
      },
      nik: {
        type: DataTypes.STRING(16),
        allowNull: false,
        unique: { msg: 'NIK already registered' },
        validate: {
          notEmpty: { msg: 'NIK is required' },
          len: { args: [16, 16], msg: 'NIK must be exactly 16 digits' },
          isNumeric: { msg: 'NIK must contain numbers only' },
        },
      },
      name: {
        type: DataTypes.STRING(150),
        allowNull: false,
        validate: {
          notEmpty: { msg: 'Patient name is required' },
          len: { args: [2, 150], msg: 'Name must be between 2 and 150 characters' },
        },
      },
      gender: {
        type: DataTypes.ENUM('MALE', 'FEMALE'),
        allowNull: false,
        validate: {
          notEmpty: { msg: 'Gender is required' },
          isIn: {
            args: [['MALE', 'FEMALE']],
            msg: 'Gender must be MALE or FEMALE',
          },
        },
      },
      birth_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        validate: {
          notEmpty: { msg: 'Birth date is required' },
          isDate: { msg: 'Birth date must be a valid date' },
        },
      },
      phone: {
        type: DataTypes.STRING(20),
        allowNull: false,
        validate: {
          notEmpty: { msg: 'Phone number is required' },
          len: { args: [8, 20], msg: 'Phone number must be between 8 and 20 characters' },
        },
      },
      address: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          notEmpty: { msg: 'Address is required' },
        },
      },
    },
    {
      sequelize,
      modelName: 'Patient',
      tableName: 'patients',
      underscored: true,
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  return Patient;
};
