require('dotenv').config({ path: '/home/ubuntu/unigest/.env' });
const express   = require('express');
const cors      = require('cors');
const helmet      = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const fs        = require('fs');
const path      = require('path');
const { Pool }  = require('pg');

const app  = express();
const PORT = process.env.PORT || 4000;

// Compression gzip
app.use(compression({ level: 6, threshold: 1024 }));

app.use(helmet({ crossOriginEmbedderPolicy:false, contentSecurityPolicy:false }));
app.use(cors({
  origin: function(origin, callback) {
    const allowed = [
      'http://13.38.166.249:5173',
      'http://13.38.166.249',
      'http://localhost:5173',
      'http://localhost:3000',
    ];
    if (!origin || allowed.includes(origin)) return callback(null, true);
    callback(null, true); // Autoriser pour mobile — changer en production
  },
  credentials: false,
}));
app.use(express.json({ limit:'6mb' })); // 5MB logo + overhead
const { validateBody } = require('./middleware/validation');
app.use(validateBody);

const limiterGlobal = rateLimit({ windowMs:15*60*1000, max:1000, standardHeaders:true, legacyHeaders:false });
const limiterLogin  = rateLimit({ windowMs:15*60*1000, max:100 });
// ── Logs d'accès ────────────────────────────
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    const log = `[${new Date().toISOString()}] ${req.method} ${req.path} ${res.statusCode} ${duration}ms`;
    if (res.statusCode >= 400) console.error('ACCESS LOG:', log);
    else if (req.path !== '/api/health') console.log('ACCESS LOG:', log);
  });
  next();
});

app.use(limiterGlobal);
app.use('/api/auth/login', limiterLogin);

async function initDB() {
  const pool = new Pool({
    host:     process.env.DB_HOST     || 'localhost',
    port:     process.env.DB_PORT     || 5432,
    database: process.env.DB_NAME     || 'unigest',
    user:     process.env.DB_USER     || 'unigest',
    password: process.env.DB_PASSWORD || 'unigest_secret',
  });
  let retries = 10;
  while (retries > 0) {
    try { await pool.query('SELECT 1'); console.log('PostgreSQL connecte'); break; }
    catch(e) { retries--; console.log('Attente PostgreSQL...', retries); await new Promise(r=>setTimeout(r,3000)); }
  }
  if (retries === 0) { console.error('Impossible de joindre PostgreSQL'); process.exit(1); }
  const schema = fs.readFileSync(path.join(__dirname, 'init/schema.sql'), 'utf8');
  await pool.query(schema);
  console.log('Tables creees/verifiees');
  const count = await pool.query('SELECT COUNT(*) FROM users');
  if (parseInt(count.rows[0].count) === 0) {
    console.log('Base vide — lancement du seed...');
    const { execSync } = require('child_process');
    execSync('node /home/ubuntu/unigest/backend/init/seed.js', { stdio:'inherit' });
  }
  await pool.end();
}

// ── Routes publiques ────────────────────────
app.use('/api/deliberations', require('./routes/deliberations'));
app.use('/api/audit',      require('./routes/audit'));
app.use('/api/auth', require('./routes/auth'));
app.get('/api/health', (req, res) => {
  res.setHeader('Cache-Control', 'no-cache');
  res.json({ status:'ok', version:'2.0' });
});
let parametresCache = null;
let parametresCacheTime = 0;
app.get('/api/parametres/public', async (req, res) => {
  const pool = require('./db');
  try {
    // Cache 30 secondes
    if (parametresCache && Date.now() - parametresCacheTime < 30000) {
      return res.setHeader('X-Cache','HIT').json(parametresCache);
    }
    const r = await pool.query('SELECT nom_etablissement, logo, annee_active, couleur_principale FROM parametres LIMIT 1');
    parametresCache = r.rows[0] || {};
    parametresCacheTime = Date.now();
    res.setHeader('X-Cache','MISS').json(parametresCache);
  } catch(e){ res.status(500).json({error:e.message}); }
});

// ── Middleware JWT ──────────────────────────
const authMiddleware = require('./middleware/auth');
app.use('/api', authMiddleware);

// ── Routes protégées ────────────────────────
app.use('/api/etudiants',   require('./routes/etudiants'));
app.use('/api/notes',       require('./routes/notes'));
app.use('/api/filieres',    require('./routes/filieres'));
app.use('/api/ues',         require('./routes/ues'));
app.use('/api/edt',         require('./routes/edt'));
app.use('/api/users',       require('./routes/users'));
app.use('/api/groupes',     require('./routes/groupes'));
app.use('/api/professeurs', require('./routes/professeurs'));
app.use('/api/parametres',  require('./routes/parametres'));

app.use((err, req, res, next) => {
  console.error(err.message);
  res.status(500).json({ error:'Erreur serveur interne' });
});

initDB().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log('UniGest API sur le port ' + PORT);
  });
});
