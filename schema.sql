-- CODEV2E D1 schema
CREATE TABLE IF NOT EXISTS projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'UPCOMING' CHECK(status IN ('RELEASED','UPCOMING')),
  year TEXT NOT NULL DEFAULT 'TBA',
  genre TEXT NOT NULL DEFAULT 'Original',
  description TEXT NOT NULL DEFAULT '',
  image TEXT NOT NULL DEFAULT '',
  page_url TEXT NOT NULL DEFAULT '',
  published INTEGER NOT NULL DEFAULT 1 CHECK(published IN (0,1)),
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_projects_public ON projects(published, sort_order, id);

CREATE TABLE IF NOT EXISTS announcements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'ANNOUNCEMENT',
  body TEXT NOT NULL,
  published_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_announcements_date ON announcements(published_at DESC);

-- Optional starter data. Leave commented if you want a completely empty admin.
-- INSERT INTO projects(title,status,year,genre,description,image,page_url)
-- VALUES ('Your first project','UPCOMING','2026','Animation','Add your description here.','/assets/project.png','/pj1.html');
