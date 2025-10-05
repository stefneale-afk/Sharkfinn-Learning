-- Minimal schema for SharkFinn Learning
CREATE TABLE IF NOT EXISTS children (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  age INT NOT NULL DEFAULT 5,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sessions (
  id SERIAL PRIMARY KEY,
  child_id INT REFERENCES children(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'open',                  -- open | closed
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS activity_blocks (
  id SERIAL PRIMARY KEY,
  session_id INT REFERENCES sessions(id) ON DELETE CASCADE,
  type TEXT NOT NULL,                          -- e.g., math, reading
  payload JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS social_stories (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS visual_schedules (
  id SERIAL PRIMARY KEY,
  child_id INT REFERENCES children(id) ON DELETE CASCADE,
  items JSONB NOT NULL,                        -- [{time,label,icon?},...]
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS rewards (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  cost INT NOT NULL DEFAULT 5,                 -- points
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reward_redemptions (
  id SERIAL PRIMARY KEY,
  child_id INT REFERENCES children(id) ON DELETE CASCADE,
  reward_id INT REFERENCES rewards(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
