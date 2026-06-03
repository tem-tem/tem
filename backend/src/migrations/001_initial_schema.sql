-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    icon VARCHAR(500),
    href VARCHAR(500),
    status VARCHAR(50) DEFAULT 'current',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create project_tags table for many-to-many relationship
CREATE TABLE IF NOT EXISTS project_tags (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    tag VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_project_tags_project_id ON project_tags(project_id);
CREATE INDEX IF NOT EXISTS idx_project_tags_tag ON project_tags(tag);

-- Insert initial data from the existing projects
INSERT INTO projects (name, description, icon, href, status) VALUES
    ('DAY100', 'Rep counter with a private leaderboard.', 'https://day100.app/favicon.ico', 'https://apps.apple.com/us/app/day100-exercise-with-friends/id6744286523', 'current'),
    ('Walk Flower', 'Pedometer with flowers.', 'https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/4b/2a/1d/4b2a1d53-cafe-aced-7157-c0f8932c73e7/AppIcon-0-0-1x_U007ephone-0-0-0-1-0-85-220.png/230x0w.webp', 'https://apps.apple.com/us/app/walk-flower/id6532313329', 'current'),
    ('Stop Working', 'A break reminder for macOS.', 'https://is1-ssl.mzstatic.com/image/thumb/Purple126/v4/90/ef/19/90ef1971-e7a0-8b46-4065-a2dcb3284298/AppIcon-85-220-4-2x.png/460x0w.webp', 'https://apps.apple.com/us/app/stop-working-break-reminder/id6446755293', 'current'),
    ('Runway', 'Manual Expense Tracker.', 'https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/5b/d6/ca/5bd6cad8-5938-b125-3889-13283aa153bc/AppIcon-0-0-1x_U007ephone-0-1-85-220.png/230x0w.webp', 'https://apps.apple.com/us/app/ease-expense-tracker/id6445955890', 'current'),
    ('Timezones', 'Timezone viewer for web.', 'https://time.tem.dev/favicon.png', 'https://time.tem.dev', 'current');

-- Insert initial tags
INSERT INTO project_tags (project_id, tag) VALUES
    (1, 'swift'), (1, 'ios'), (1, 'core data'),
    (2, 'swift'), (2, 'ios'), (2, 'core data'),
    (3, 'swift'), (3, 'macos'),
    (4, 'swift'), (4, 'ios'), (4, 'core data'),
    (5, 'svelte');