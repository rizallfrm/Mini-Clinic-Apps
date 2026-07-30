require('dotenv').config();

const app = require('./app');
const { sequelize } = require('./models');

const PORT = process.env.PORT || 5000;

/**
 * Fungsi utama untuk menjalankan server.
 * Melakukan tes koneksi database sebelum menjalankan server.
 */
const startServer = async () => {
  try {
    // Tes koneksi ke database
    console.log('🔌 Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Database connected successfully.');

    // Jalankan server
    app.listen(PORT, () => {
      console.log('');
      console.log('================================================');
      console.log('  🏥 Mini Clinic Information System - Backend   ');
      console.log('================================================');
      console.log(`  Environment : ${process.env.NODE_ENV || 'development'}`);
      console.log(`  Server URL  : http://localhost:${PORT}`);
      console.log(`  API Base    : http://localhost:${PORT}/api`);
      console.log(`  Health Check: http://localhost:${PORT}/api/health`);
      console.log('================================================');
      console.log('');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);

    if (
      error.name === 'SequelizeConnectionRefusedError' ||
      error.name === 'SequelizeConnectionError'
    ) {
      console.error('');
      console.error('💡 Troubleshooting:');
      console.error('   1. Pastikan PostgreSQL sudah berjalan');
      console.error('   2. Cek konfigurasi DB_HOST, DB_PORT di file .env');
      console.error('   3. Cek username dan password database di .env');
      console.error('   4. Pastikan database sudah dibuat:');
      console.error('      psql -U postgres -c "CREATE DATABASE mini_clinic_db;"');
      console.error('   5. Atau jalankan: npx sequelize-cli db:create');
    }

    process.exit(1);
  }
};

startServer();
