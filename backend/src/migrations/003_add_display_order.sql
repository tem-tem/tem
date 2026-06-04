ALTER TABLE projects ADD COLUMN IF NOT EXISTS display_order INTEGER;

CREATE INDEX IF NOT EXISTS idx_projects_display_order ON projects(display_order);
