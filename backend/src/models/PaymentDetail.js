'use strict';

module.exports = (sequelize, DataTypes) => {
  const { Model } = require('sequelize');

  class PaymentDetail extends Model {
    static associate(models) {
      PaymentDetail.belongsTo(models.Payment, { foreignKey: 'payment_id', as: 'payment' });
    }
  }

  PaymentDetail.init(
    {
      id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
      payment_id: { type: DataTypes.BIGINT, allowNull: false },
      item_type: { type: DataTypes.ENUM('CONSULTATION', 'MEDICINE', 'OTHER'), allowNull: false },
      item_name: { type: DataTypes.STRING(255), allowNull: false },
      quantity: { type: DataTypes.INTEGER, defaultValue: 1 },
      unit_price: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
      subtotal: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
    },
    {
      sequelize,
      modelName: 'PaymentDetail',
      tableName: 'payment_details',
      underscored: true,
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  return PaymentDetail;
};
