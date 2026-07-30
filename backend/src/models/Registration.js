'use strict';

module.exports = (sequelize, DataTypes) => {
  const { Model } = require('sequelize');

  class Registration extends Model {
    static associate(models) {
      // Pendaftaran terhubung ke pasien
      Registration.belongsTo(models.Patient, {
        foreignKey: 'patient_id',
        as: 'patient',
      });

      // Pendaftaran terhubung ke dokter
      Registration.belongsTo(models.Doctor, {
        foreignKey: 'doctor_id',
        as: 'doctor',
      });

      // Pendaftaran terhubung ke poli
      Registration.belongsTo(models.Policlinic, {
        foreignKey: 'policlinic_id',
        as: 'policlinic',
      });

      // Pendaftaran dibuat oleh satu user (petugas)
      Registration.belongsTo(models.User, {
        foreignKey: 'created_by',
        as: 'createdByUser',
      });

      // Satu pendaftaran memiliki satu antrean
      Registration.hasOne(models.Queue, {
        foreignKey: 'registration_id',
        as: 'queue',
      });

      // Satu pendaftaran memiliki satu rekam medis
      Registration.hasOne(models.MedicalRecord, {
        foreignKey: 'registration_id',
        as: 'medicalRecord',
      });
    }
  }

  Registration.init(
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      registration_number: {
        type: DataTypes.STRING(30),
        allowNull: false,
        unique: { msg: 'Registration number already exists' },
        validate: {
          notEmpty: { msg: 'Registration number is required' },
        },
      },
      patient_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        validate: {
          notNull: { msg: 'Patient is required' },
        },
      },
      doctor_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        validate: {
          notNull: { msg: 'Doctor is required' },
        },
      },
      policlinic_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        validate: {
          notNull: { msg: 'Policlinic is required' },
        },
      },
      created_by: {
        type: DataTypes.BIGINT,
        allowNull: false,
        validate: {
          notNull: { msg: 'Created by (user) is required' },
        },
      },
      visit_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        validate: {
          notEmpty: { msg: 'Visit date is required' },
          isDate: { msg: 'Visit date must be a valid date' },
        },
      },
      payment_type: {
        type: DataTypes.ENUM('CASH', 'INSURANCE', 'BPJS', 'OTHER'),
        allowNull: false,
        validate: {
          isIn: {
            args: [['CASH', 'INSURANCE', 'BPJS', 'OTHER']],
            msg: 'Payment type must be CASH, INSURANCE, BPJS, or OTHER',
          },
        },
      },
      initial_complaint: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          notEmpty: { msg: 'Initial complaint is required' },
        },
      },
      status: {
        type: DataTypes.ENUM('WAITING', 'CHECKED_IN', 'EXAMINATION', 'COMPLETED', 'CANCELLED'),
        allowNull: false,
        defaultValue: 'WAITING',
        validate: {
          isIn: {
            args: [['WAITING', 'CHECKED_IN', 'EXAMINATION', 'COMPLETED', 'CANCELLED']],
            msg: 'Status must be WAITING, CHECKED_IN, EXAMINATION, COMPLETED, or CANCELLED',
          },
        },
      },
    },
    {
      sequelize,
      modelName: 'Registration',
      tableName: 'registrations',
      underscored: true,
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  return Registration;
};
