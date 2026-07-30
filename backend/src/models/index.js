'use strict';

const fs = require('fs');
const path = require('path');
const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

/**
 * File ini adalah pusat dari semua Sequelize model.
 * Secara otomatis memuat semua file model di folder ini,
 * mendaftarkan asosiasi antar model, dan mengekspor
 * instance Sequelize serta semua model.
 */

// =====================================================
// BUAT INSTANCE SEQUELIZE
// =====================================================

let sequelize;

if (process.env.NODE_ENV === 'production' && process.env.DATABASE_URL) {
  // Railway / Production dengan DATABASE_URL
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    logging: false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  });
} else {
  // Development / Local
  sequelize = new Sequelize(
    process.env.DB_NAME || 'mini_clinic_db',
    process.env.DB_USER || 'postgres',
    process.env.DB_PASSWORD || '',
    {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT, 10) || 5432,
      dialect: 'postgres',
      logging: process.env.NODE_ENV === 'development' ? false : false,
      pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000,
      },
    }
  );
}

// =====================================================
// LOAD SEMUA MODEL OTOMATIS
// =====================================================

const db = {};
const basename = path.basename(__filename);

fs.readdirSync(__dirname)
  .filter((file) => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js' &&
      file.indexOf('.test.js') === -1 &&
      file !== 'index.js'
    );
  })
  .forEach((file) => {
    const model = require(path.join(__dirname, file))(sequelize, DataTypes);
    db[model.name] = model;
  });

// =====================================================
// DAFTARKAN ASOSIASI ANTAR MODEL
// =====================================================

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

// =====================================================
// EXPORT
// =====================================================

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
