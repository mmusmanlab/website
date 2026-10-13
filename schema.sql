-- Cloudflare D1 Migration Schema for mmusmanlab-db
-- Database: mmusmanlab-db
-- Repeatable and safe schema definition

CREATE TABLE IF NOT EXISTS articles (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  published_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  category TEXT NOT NULL,
  tags TEXT NOT NULL, -- JSON array of strings
  content TEXT NOT NULL, -- JSON array of section objects
  related_projects TEXT NOT NULL, -- JSON array of project IDs
  sources TEXT, -- JSON array of source objects
  status TEXT NOT NULL DEFAULT 'draft',
  word_count INTEGER DEFAULT 0,
  difficulty TEXT DEFAULT 'Intermediate',
  readingTime TEXT DEFAULT '5 min read',
  is_automated INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  short_description TEXT NOT NULL,
  full_description TEXT NOT NULL,
  overview TEXT,
  features TEXT, -- JSON array of strings
  image TEXT NOT NULL,
  image_alt TEXT,
  technologies TEXT NOT NULL, -- JSON array of strings
  category TEXT NOT NULL,
  last_modified TEXT,
  demo_url TEXT,
  repo_url TEXT
);

CREATE TABLE IF NOT EXISTS contact_inquiries (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  project_type TEXT,
  company TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS article_topics (
  id TEXT PRIMARY KEY,
  topic TEXT NOT NULL,
  category TEXT NOT NULL,
  priority INTEGER DEFAULT 8,
  used INTEGER DEFAULT 0,
  used_at TEXT
);

CREATE TABLE IF NOT EXISTS article_runs (
  id TEXT PRIMARY KEY,
  topic TEXT NOT NULL,
  started_at TEXT NOT NULL,
  model TEXT NOT NULL,
  status TEXT NOT NULL,
  score INTEGER DEFAULT 0,
  summary TEXT
);

CREATE TABLE IF NOT EXISTS approval_audit_logs (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL,
  action TEXT NOT NULL,
  performed_at TEXT NOT NULL,
  performed_by TEXT NOT NULL,
  notes TEXT
);

-- Indexes for optimal querying on edge
CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug);
CREATE INDEX IF NOT EXISTS idx_articles_status ON articles(status);
CREATE INDEX IF NOT EXISTS idx_articles_published ON articles(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_projects_category ON projects(category);
CREATE INDEX IF NOT EXISTS idx_contact_created ON contact_inquiries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_topics_used ON article_topics(used, priority DESC);
CREATE INDEX IF NOT EXISTS idx_runs_started ON article_runs(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_slug ON approval_audit_logs(slug);
