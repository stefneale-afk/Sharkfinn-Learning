import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Pool } from 'pg';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
// Use Railway's injected port; fall back to 8080 locally
const PORT = Number(process.env.PORT) || 8080;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// --- DB ---
const hasDb = !!process.env.DATABASE_URL;
let pool = null;
if (hasDb) {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL.includes('sslmode=require')
      ? { rejectUnauthorized: false }
      : undefined,
  });

  const bootstrap = async () => {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS children (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        age INT NOT NULL DEFAULT 5,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS sessions (
        id SERIAL PRIMARY KEY,
        child_id INT REFERENCES children(id) ON DELETE CASCADE,
        status TEXT DEFAULT 'open',
        notes TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS activity_blocks (
        id SERIAL PRIMARY KEY,
        session_id INT REFERENCES sessions(id) ON DELETE CASCADE,
        type TEXT NOT NULL,
        payload JSONB DEFAULT '{}'::jsonb,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS social_stories (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        body TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS visual_schedules (
        id SERIAL PRIMARY KEY,
        child_id INT REFERENCES children(id) ON DELETE CASCADE,
        items JSONB NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS rewards (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        cost INT NOT NULL DEFAULT 5,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS reward_redemptions (
        id SERIAL PRIMARY KEY,
        child_id INT REFERENCES children(id) ON DELETE CASCADE,
        reward_id INT REFERENCES rewards(id) ON DELETE SET NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    // Seed a couple of rewards if empty
    await pool.query(`
      INSERT INTO rewards(name, cost)
      SELECT x.name, x.cost
      FROM (VALUES ('Sticker Pack', 5), ('Extra Screen Time', 10)) AS x(name, cost)
      WHERE NOT EXISTS (SELECT 1 FROM rewards);
    `);
  };
  bootstrap().catch(err => console.error('DB bootstrap error:', err));
}

const notImplemented = (req, res) =>
  res.status(501).json({ ok: false, error: 'Not implemented (no DB configured).' });

// --- Health ---
app.get('/api/health', async (req, res) => {
  try {
    if (!hasDb) return res.json({ ok: true, db: false, status: 'healthy (no DB configured)' });
    const r = await pool.query('SELECT NOW() now');
    res.json({ ok: true, db: true, now: r.rows[0].now });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// --- Children ---
app.get('/api/children', async (req, res) => {
  try {
    if (!hasDb) return res.json([{ id: 1, name: 'Sample Child', age: 6 }]);
    const r = await pool.query('SELECT id, name, age, created_at FROM children ORDER BY id ASC');
    res.json(r.rows);
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

app.get('/api/children/:id', async (req, res) => {
  try {
    if (!hasDb) return res.json({ id: Number(req.params.id), name: 'Sample Child', age: 6 });
    const r = await pool.query('SELECT id, name, age, created_at FROM children WHERE id=$1', [req.params.id]);
    if (!r.rows.length) return res.status(404).json({ ok: false, error: 'Not found' });
    res.json(r.rows[0]);
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

app.post('/api/children', async (req, res) => {
  try {
    const { name, age } = req.body || {};
    if (!name) return res.status(400).json({ ok: false, error: 'name is required' });
    if (!hasDb) return res.json({ id: 2, name, age: age ?? 5, note: 'Starter (no DB)' });
    const r = await pool.query(
      'INSERT INTO children(name, age) VALUES($1, $2) RETURNING id, name, age, created_at',
      [name, age ?? 5]
    );
    res.status(201).json(r.rows[0]);
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// --- Sessions ---
app.post('/api/sessions', async (req, res) => {
  if (!hasDb) return notImplemented(req, res);
  try {
    const { child_id, notes } = req.body || {};
    if (!child_id) return res.status(400).json({ ok: false, error: 'child_id required' });
    const r = await pool.query(
      'INSERT INTO sessions(child_id, notes) VALUES($1,$2) RETURNING *',
      [child_id, notes ?? null]
    );
    res.status(201).json(r.rows[0]);
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

app.patch('/api/sessions/:id', async (req, res) => {
  if (!hasDb) return notImplemented(req, res);
  try {
    const { status, notes } = req.body || {};
    const r = await pool.query(
      'UPDATE sessions SET status=COALESCE($1,status), notes=COALESCE($2,notes), updated_at=NOW() WHERE id=$3 RETURNING *',
      [status ?? null, notes ?? null, req.params.id]
    );
    if (!r.rows.length) return res.status(404).json({ ok: false, error: 'Not found' });
    res.json(r.rows[0]);
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// --- Activity Blocks ---
app.post('/api/activity-blocks', async (req, res) => {
  if (!hasDb) return notImplemented(req, res);
  try {
    const { session_id, type, payload } = req.body || {};
    if (!session_id || !type) return res.status(400).json({ ok: false, error: 'session_id and type required' });
    const r = await pool.query(
      'INSERT INTO activity_blocks(session_id, type, payload) VALUES($1,$2,$3) RETURNING *',
      [session_id, type, payload ?? {}]
    );
    res.status(201).json(r.rows[0]);
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// --- Social Stories ---
app.get('/api/social-stories', async (req, res) => {
  if (!hasDb) return res.json([{ id: 1, title: 'Welcome', body: 'Be kind and brave.' }]);
  try {
    const r = await pool.query('SELECT * FROM social_stories ORDER BY id ASC');
    res.json(r.rows);
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

app.post('/api/social-stories', async (req, res) => {
  if (!hasDb) return notImplemented(req, res);
  try {
    const { title, body } = req.body || {};
    if (!title || !body) return res.status(400).json({ ok: false, error: 'title and body required' });
    const r = await pool.query('INSERT INTO social_stories(title, body) VALUES($1,$2) RETURNING *', [title, body]);
    res.status(201).json(r.rows[0]);
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// --- Visual Schedules ---
app.get('/api/visual-schedules', async (req, res) => {
  if (!hasDb) return res.json([{ id: 1, child_id: 1, items: [{ time: '08:00', label: 'Breakfast' }] }]);
  try {
    const r = await pool.query('SELECT * FROM visual_schedules ORDER BY id ASC');
    res.json(r.rows);
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// --- Rewards ---
app.get('/api/rewards', async (req, res) => {
  if (!hasDb) return res.json([{ id: 1, name: 'Sticker Pack', cost: 5 }]);
  try {
    const r = await pool.query('SELECT * FROM rewards ORDER BY id ASC');
    res.json(r.rows);
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

app.post('/api/rewards/redeem', async (req, res) => {
  if (!hasDb) return notImplemented(req, res);
  try {
    const { child_id, reward_id } = req.body || {};
    if (!child_id || !reward_id) return res.status(400).json({ ok: false, error: 'child_id and reward_id required' });
    const r = await pool.query(
      'INSERT INTO reward_redemptions(child_id, reward_id) VALUES($1,$2) RETURNING *',
      [child_id, reward_id]
    );
    res.status(201).json(r.rows[0]);
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// SPA fallback (serves index.html for non-API routes)
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`SharkFinn Learning server running on http://localhost:${PORT}`);
});
