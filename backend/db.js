
const { Pool } = require('pg');

const pool = new Pool({
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  host:     process.env.DB_HOST     || 'localhost',
  port:     process.env.DB_PORT     || 5432,
  database: process.env.DB_NAME     || 'unigest',
  user:     process.env.DB_USER     || 'unigest',
  password: process.env.DB_PASSWORD || 'unigest_secret',
});

pool.on('error', (err) => {
  console.error('PostgreSQL error:', err.message);
});

module.exports = pool;
