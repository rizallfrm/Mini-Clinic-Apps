'use strict';

module.exports = (sequelize, DataTypes) => {
  const { Model } = require('sequelize');

  class Payment extends Model {
    static associate(models) {
      Payment.belongsTo(models.Registration, { foreignKey: 'registration_id', as: 'registration' });
      Payment.belongsTo(models.Patient, { foreignKey: 'patient_id', as: 'patient' });
      Payment.hasMany(models.PaymentDetail, { foreignKey: 'payment_id', as: 'details' });
    }
  }

  Payment.init(
    {
      id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
      registration_id: { type: DataTypes.BIGINT, allowNull: false },
      patient_id: { type: DataTypes.BIGINT, allowNull: false },
      payment_number: { type: DataTypes.STRING(30), allowNull: false },
      consultation_fee: { type: DataTypes.DECIMAL(12, 2), defaultValue: 50000 },
      medicine_fee: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
      total_amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
      payment_method: { type: DataTypes.ENUM('CASH', 'CARD', 'INSURANCE', 'BPJS'), defaultValue: 'CASH' },
      payment_status: { type: DataTypes.ENUM('PENDING', 'PAID', 'CANCELLED'), defaultValue: 'PENDING' },
      paid_at: { type: DataTypes.DATE, allowNull: true },
      notes: { type: DataTypes.TEXT, allowNull: true },
    },
    {
      sequelize,
      modelName: 'Payment',
      tableName: 'payments',
      underscored: true,
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  return Payment;
};
