require('dotenv').config();

/**
 * Sequelize CLI database configuration.
 * Mendukung DATABASE_URL (Railway) atau konfigurasi individual.
 */

const baseConfig = {
  dialect: 'postgres',
  logging: false,
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
};

// Jika DATABASE_URL tersedia (Railway production), gunakan URL tersebut
const productionConfig = process.env.DATABASE_URL
  ? {
      ...baseConfig,
      url: process.env.DATABASE_URL,
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false,
        },
      },
    }
  : {
      ...baseConfig,
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT, 10) || 5432,
      database: process.env.DB_NAME,
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    };

module.exports = {
  development: {
    ...baseConfig,
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    database: process.env.DB_NAME || 'mini_clinic_db',
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    logging: console.log,
  },
  test: {
    ...baseConfig,
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    database: process.env.DB_NAME || 'mini_clinic_test_db',
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
  },
  production: productionConfig,
};
