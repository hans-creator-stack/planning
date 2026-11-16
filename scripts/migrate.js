const fs = require('fs');
const path = require('path');
const { pool } = require('../db');

async function runMigrations() {
  const client = await pool.connect();
  try {
    console.log('Iniciando ejecución de migraciones SQL...');
    const migrationFile = path.join(__dirname, '..', 'migrations', '001_initial_schema.sql');
    const sql = fs.readFileSync(migrationFile, 'utf8');

    await client.query('BEGIN');
    await client.query(sql);
    await client.query('COMMIT');
    console.log('Migración 001_initial_schema.sql aplicada exitosamente.');

    // Validar existencia de tablas en information_schema
    const checkQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_name IN ('usuarios', 'pendientes', 'sugerencias')
      ORDER BY table_name;
    `;
    const res = await client.query(checkQuery);
    console.log('Tablas verificadas en la base de datos:', res.rows.map(r => r.table_name));
    return true;
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    const errDetails = error.code || error.message || error;
    console.error('Error durante la ejecución de migraciones:', errDetails);
    return false;
  } finally {
    client.release();
    await pool.end();
  }
}

if (require.main === module) {
  runMigrations().then((success) => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = {
  runMigrations,
};

