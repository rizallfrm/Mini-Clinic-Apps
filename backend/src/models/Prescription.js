'use strict';

module.exports = (sequelize, DataTypes) => {
  const { Model } = require('sequelize');

  class Prescription extends Model {
    static associate(models) {
      // Resep terhubung ke satu rekam medis
      Prescription.belongsTo(models.MedicalRecord, {
        foreignKey: 'medical_record_id',
        as: 'medicalRecord',
      });

      // Resep terhubung ke satu pasien
      Prescription.belongsTo(models.Patient, {
        foreignKey: 'patient_id',
        as: 'patient',
      });

      // Resep terhubung ke satu dokter
      Prescription.belongsTo(models.Doctor, {
        foreignKey: 'doctor_id',
        as: 'doctor',
      });

      // Satu resep memiliki banyak detail obat
      Prescription.hasMany(models.PrescriptionDetail, {
        foreignKey: 'prescription_id',
        as: 'details',
      });
    }
  }

  Prescription.init(
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      medical_record_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        unique: { msg: 'This medical record already has a prescription' },
        validate: {
          notNull: { msg: 'Medical record ID is required' },
        },
      },
      patient_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        validate: {
          notNull: { msg: 'Patient ID is required' },
        },
      },
      doctor_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        validate: {
          notNull: { msg: 'Doctor ID is required' },
        },
      },
      prescription_number: {
        type: DataTypes.STRING(30),
        allowNull: false,
        unique: { msg: 'Prescription number already exists' },
        validate: {
          notEmpty: { msg: 'Prescription number is required' },
        },
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'Prescription',
      tableName: 'prescriptions',
      underscored: true,
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  return Prescription;
};
