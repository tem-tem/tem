import pg from 'pg';

const { Pool } = pg;

class Profile {
  constructor() {
    this.pool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME || 'tem_portfolio',
      user: process.env.DB_USER || 'tem',
      password: process.env.DB_PASSWORD || 'password',
    });
  }

  async getAllSettings() {
    const query = 'SELECT * FROM profile_settings ORDER BY key';
    const result = await this.pool.query(query);
    
    // Convert to key-value object for easier use
    const settings = {};
    result.rows.forEach(row => {
      settings[row.key] = {
        value: row.value,
        description: row.description,
        updated_at: row.updated_at
      };
    });
    
    return settings;
  }

  async getSetting(key) {
    const query = 'SELECT * FROM profile_settings WHERE key = $1';
    const result = await this.pool.query(query, [key]);
    return result.rows[0];
  }

  async updateSetting(key, value) {
    const query = `
      UPDATE profile_settings 
      SET value = $2, updated_at = CURRENT_TIMESTAMP
      WHERE key = $1 
      RETURNING *
    `;
    const result = await this.pool.query(query, [key, value]);
    return result.rows[0];
  }

  async createSetting(key, value, description = null) {
    const query = `
      INSERT INTO profile_settings (key, value, description)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const result = await this.pool.query(query, [key, value, description]);
    return result.rows[0];
  }

  async upsertSetting(key, value, description = null) {
    const query = `
      INSERT INTO profile_settings (key, value, description)
      VALUES ($1, $2, $3)
      ON CONFLICT (key) 
      DO UPDATE SET 
        value = EXCLUDED.value,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `;
    const result = await this.pool.query(query, [key, value, description]);
    return result.rows[0];
  }

  async deleteSetting(key) {
    const query = 'DELETE FROM profile_settings WHERE key = $1 RETURNING *';
    const result = await this.pool.query(query, [key]);
    return result.rows[0];
  }

  // Helper method to get profile data in a frontend-friendly format
  async getProfile() {
    const settings = await this.getAllSettings();
    
    return {
      name: settings.name?.value || 'Tem',
      intro: settings.intro?.value || 'I make apps and based in Chicago, IL.',
      twitter_url: settings.twitter_url?.value || 'https://x.com/@tuna_maker',
      twitter_label: settings.twitter_label?.value || 'Twitter/X'
    };
  }
}

export default Profile;