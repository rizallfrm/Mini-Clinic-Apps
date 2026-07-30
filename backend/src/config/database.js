const { Sequelize } = require('sequelize');

/**
 * Membuat koneksi Sequelize berdasarkan environment.
 * - Production: Menggunakan DATABASE_URL jika tersedia (Railway).
 * - Development/Test: Menggunakan konfigurasi individual dari .env.
 */

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
      logging: process.env.NODE_ENV === 'development' ? console.log : false,
      pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000,
      },
    }
  );
}

module.exports = sequelize;
