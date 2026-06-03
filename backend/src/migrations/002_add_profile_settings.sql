-- Create profile settings table
CREATE TABLE IF NOT EXISTS profile_settings (
    id SERIAL PRIMARY KEY,
    key VARCHAR(100) NOT NULL UNIQUE,
    value TEXT,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_profile_settings_key ON profile_settings(key);

-- Insert initial profile data
INSERT INTO profile_settings (key, value, description) VALUES
    ('name', 'Tem', 'Display name shown in header'),
    ('intro', 'I make apps and based in Chicago, IL.', 'Introduction text shown in header'),
    ('twitter_url', 'https://x.com/@tuna_maker', 'Twitter/X profile URL'),
    ('twitter_label', 'Twitter/X', 'Label for Twitter link');

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profile_settings_updated_at 
    BEFORE UPDATE ON profile_settings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Also add the same trigger to projects table if it doesn't exist
CREATE TRIGGER update_projects_updated_at 
    BEFORE UPDATE ON projects 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();