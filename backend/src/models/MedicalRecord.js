'use strict';

module.exports = (sequelize, DataTypes) => {
  const { Model } = require('sequelize');

  class MedicalRecord extends Model {
    static associate(models) {
      // Rekam medis terhubung ke satu pendaftaran
      MedicalRecord.belongsTo(models.Registration, {
        foreignKey: 'registration_id',
        as: 'registration',
      });

      // Rekam medis terhubung ke satu pasien
      MedicalRecord.belongsTo(models.Patient, {
        foreignKey: 'patient_id',
        as: 'patient',
      });

      // Rekam medis terhubung ke satu dokter
      MedicalRecord.belongsTo(models.Doctor, {
        foreignKey: 'doctor_id',
        as: 'doctor',
      });

      // Satu rekam medis memiliki banyak tindakan medis
      MedicalRecord.hasMany(models.MedicalAction, {
        foreignKey: 'medical_record_id',
        as: 'medicalActions',
      });

      // Satu rekam medis memiliki satu resep
      MedicalRecord.hasOne(models.Prescription, {
        foreignKey: 'medical_record_id',
        as: 'prescription',
      });
    }
  }

  MedicalRecord.init(
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      registration_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        unique: { msg: 'This registration already has a medical record' },
        validate: {
          notNull: { msg: 'Registration ID is required' },
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
      // SOAP — Subjective: keluhan pasien
      subjective: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          notEmpty: { msg: 'Subjective (patient complaint) is required' },
        },
      },
      // SOAP — Objective: hasil pemeriksaan fisik (vital signs)
      objective: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      blood_pressure: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      body_temperature: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
        validate: {
          min: { args: [30], msg: 'Body temperature must be at least 30°C' },
          max: { args: [45], msg: 'Body temperature cannot exceed 45°C' },
        },
      },
      weight: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
        validate: {
          min: { args: [0], msg: 'Weight cannot be negative' },
        },
      },
      height: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
        validate: {
          min: { args: [0], msg: 'Height cannot be negative' },
        },
      },
      pulse: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      // SOAP — Assessment: diagnosa
      assessment: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          notEmpty: { msg: 'Assessment (diagnosis) is required' },
        },
      },
      // SOAP — Plan: rencana pengobatan
      plan: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          notEmpty: { msg: 'Plan (treatment plan) is required' },
        },
      },
      examination_date: {
        type: DataTypes.DATE,
        allowNull: false,
        validate: {
          notEmpty: { msg: 'Examination date is required' },
          isDate: { msg: 'Examination date must be a valid date' },
        },
      },
      status: {
        type: DataTypes.ENUM('DRAFT', 'COMPLETED'),
        allowNull: false,
        defaultValue: 'DRAFT',
        validate: {
          isIn: {
            args: [['DRAFT', 'COMPLETED']],
            msg: 'Status must be DRAFT or COMPLETED',
          },
        },
      },
    },
    {
      sequelize,
      modelName: 'MedicalRecord',
      tableName: 'medical_records',
      underscored: true,
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  return MedicalRecord;
};
