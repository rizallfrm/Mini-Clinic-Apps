/**
 * Script untuk menguji koneksi ke database PostgreSQL.
 * Jalankan dengan: node scripts/testConnection.js
 */

require('dotenv').config();
const { Sequelize } = require('sequelize');

const runTest = async () => {
  console.log('');
  console.log('================================================');
  console.log('   Database Connection Test                     ');
  console.log('================================================');
  console.log('');
  console.log('📋 Konfigurasi:');
  console.log(`   HOST     : ${process.env.DB_HOST || 'localhost'}`);
  console.log(`   PORT     : ${process.env.DB_PORT || 5432}`);
  console.log(`   DATABASE : ${process.env.DB_NAME || 'mini_clinic_db'}`);
  console.log(`   USER     : ${process.env.DB_USER || 'postgres'}`);
  console.log(`   PASSWORD : ${'*'.repeat((process.env.DB_PASSWORD || '').length) || '(empty)'}`);
  console.log('');

  let sequelize;

  if (process.env.NODE_ENV === 'production' && process.env.DATABASE_URL) {
    console.log('🔗 Mode: Production (DATABASE_URL)');
    sequelize = new Sequelize(process.env.DATABASE_URL, {
      dialect: 'postgres',
      logging: false,
      dialectOptions: {
        ssl: { require: true, rejectUnauthorized: false },
      },
    });
  } else {
    console.log('🔗 Mode: Development (individual config)');
    sequelize = new Sequelize(
      process.env.DB_NAME || 'mini_clinic_db',
      process.env.DB_USER || 'postgres',
      process.env.DB_PASSWORD || '',
      {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT, 10) || 5432,
        dialect: 'postgres',
        logging: false,
      }
    );
  }

  try {
    console.log('🔌 Mencoba koneksi...');
    await sequelize.authenticate();

    // Ambil versi PostgreSQL
    const [results] = await sequelize.query('SELECT version(), current_database() as db_name, current_user as db_user');
    const info = results[0];

    console.log('');
    console.log('✅ KONEKSI BERHASIL!');
    console.log('');
    console.log('📊 Informasi Database:');
    console.log(`   Database  : ${info.db_name}`);
    console.log(`   User      : ${info.db_user}`);
    console.log(`   PostgreSQL: ${info.version.split(',')[0]}`);
    console.log('');
    console.log('================================================');
    console.log('✅ Database siap digunakan.');
    console.log('================================================');
    console.log('');
  } catch (error) {
    console.log('');
    console.error('❌ KONEKSI GAGAL!');
    console.error('');
    console.error('🔍 Detail Error:', error.message);
    console.error('');
    console.error('💡 Solusi:');

    if (error.message.includes('ECONNREFUSED')) {
      console.error('   → PostgreSQL tidak berjalan. Jalankan PostgreSQL service.');
      console.error('   → Windows: Services → postgresql → Start');
      console.error('   → Atau: net start postgresql-x64-14');
    } else if (error.message.includes('password authentication failed')) {
      console.error('   → Password salah. Periksa DB_PASSWORD di file .env');
    } else if (error.message.includes('database') && error.message.includes('does not exist')) {
      console.error('   → Database belum dibuat. Jalankan:');
      console.error('     psql -U postgres -c "CREATE DATABASE mini_clinic_db;"');
      console.error('     Atau: npx sequelize-cli db:create');
    } else if (error.message.includes('role') && error.message.includes('does not exist')) {
      console.error('   → User database tidak ditemukan. Periksa DB_USER di file .env');
    }

    console.error('');
    process.exit(1);
  } finally {
    await sequelize.close();
  }
};

runTest();
