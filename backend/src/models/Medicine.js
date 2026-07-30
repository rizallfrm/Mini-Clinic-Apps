'use strict';

module.exports = (sequelize, DataTypes) => {
  const { Model } = require('sequelize');

  class Medicine extends Model {
    static associate(models) {
      // Satu obat dapat digunakan di banyak detail resep
      Medicine.hasMany(models.PrescriptionDetail, {
        foreignKey: 'medicine_id',
        as: 'prescriptionDetails',
      });
    }
  }

  Medicine.init(
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      medicine_code: {
        type: DataTypes.STRING(30),
        allowNull: false,
        unique: { msg: 'Medicine code already exists' },
        validate: {
          notEmpty: { msg: 'Medicine code is required' },
        },
      },
      name: {
        type: DataTypes.STRING(150),
        allowNull: false,
        validate: {
          notEmpty: { msg: 'Medicine name is required' },
          len: { args: [2, 150], msg: 'Name must be between 2 and 150 characters' },
        },
      },
      unit: {
        type: DataTypes.STRING(50),
        allowNull: false,
        validate: {
          notEmpty: { msg: 'Unit is required' },
        },
      },
      stock: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
          min: { args: [0], msg: 'Stock cannot be negative' },
          isInt: { msg: 'Stock must be an integer' },
        },
      },
      description: {
        type: DataTypes.TEXT,
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
      modelName: 'Medicine',
      tableName: 'medicines',
      underscored: true,
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  return Medicine;
};
