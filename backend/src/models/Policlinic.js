'use strict';

module.exports = (sequelize, DataTypes) => {
  const { Model } = require('sequelize');

  class Policlinic extends Model {
    static associate(models) {
      // Satu poli memiliki banyak dokter
      Policlinic.hasMany(models.Doctor, {
        foreignKey: 'policlinic_id',
        as: 'doctors',
      });

      // Satu poli memiliki banyak pendaftaran
      Policlinic.hasMany(models.Registration, {
        foreignKey: 'policlinic_id',
        as: 'registrations',
      });
    }
  }

  Policlinic.init(
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      code: {
        type: DataTypes.STRING(30),
        allowNull: false,
        unique: { msg: 'Policlinic code already exists' },
        validate: {
          notEmpty: { msg: 'Policlinic code is required' },
          len: { args: [2, 30], msg: 'Code must be between 2 and 30 characters' },
        },
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
          notEmpty: { msg: 'Policlinic name is required' },
          len: { args: [2, 100], msg: 'Name must be between 2 and 100 characters' },
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
      modelName: 'Policlinic',
      tableName: 'policlinics',
      underscored: true,
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  return Policlinic;
};
