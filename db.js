require('dotenv').config();
const { Pool } = require('pg');

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.warn('ADVERTENCIA: La variable de entorno DATABASE_URL no está definida.');
}

const pool = new Pool({
  connectionString: databaseUrl,
});

pool.on('error', (err) => {
  console.error('Error inesperado en el cliente inactivo de PostgreSQL:', err);
});

async function query(text, params) {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  return res;
}

async function testConnection() {
  try {
    const res = await pool.query('SELECT NOW() as current_time, version() as pg_version');
    console.log('Conexión exitosa a PostgreSQL:', res.rows[0]);
    return true;
  } catch (error) {
    const errorDetails = error.code || error.message || error;
    console.error('Error al conectar a PostgreSQL:', errorDetails);
    return false;
  }
}

if (require.main === module) {
  testConnection().then((success) => {
    pool.end();
    process.exit(success ? 0 : 1);
  });
}

module.exports = {
  pool,
  query,
  testConnection,
};
