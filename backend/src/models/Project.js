import pg from 'pg';

const { Pool } = pg;

class Project {
  constructor() {
    this.pool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME || 'tem_portfolio',
      user: process.env.DB_USER || 'tem',
      password: process.env.DB_PASSWORD || 'password',
    });
  }

  async getAllProjects() {
    const query = `
      SELECT 
        p.id, p.name, p.description, p.icon, p.href, p.status,
        p.display_order, p.created_at, p.updated_at,
        (p.logo IS NOT NULL) AS has_logo,
        (p.bg_image IS NOT NULL) AS has_bg_image,
        (p.bg_video IS NOT NULL) AS has_bg_video,
        COALESCE(
          JSON_AGG(
            CASE WHEN pt.tag IS NOT NULL THEN pt.tag ELSE NULL END
          ) FILTER (WHERE pt.tag IS NOT NULL), 
          '[]'::json
        ) as tags
      FROM projects p
      LEFT JOIN project_tags pt ON p.id = pt.project_id
      GROUP BY p.id
      ORDER BY p.display_order ASC NULLS LAST, p.created_at DESC
    `;
    
    const result = await this.pool.query(query);
    return result.rows;
  }

  async getProjectById(id) {
    const query = `
      SELECT 
        p.id, p.name, p.description, p.icon, p.href, p.status,
        p.display_order, p.created_at, p.updated_at,
        (p.logo IS NOT NULL) AS has_logo,
        (p.bg_image IS NOT NULL) AS has_bg_image,
        (p.bg_video IS NOT NULL) AS has_bg_video,
        COALESCE(
          JSON_AGG(
            CASE WHEN pt.tag IS NOT NULL THEN pt.tag ELSE NULL END
          ) FILTER (WHERE pt.tag IS NOT NULL), 
          '[]'::json
        ) as tags
      FROM projects p
      LEFT JOIN project_tags pt ON p.id = pt.project_id
      WHERE p.id = $1
      GROUP BY p.id
    `;
    
    const result = await this.pool.query(query, [id]);
    return result.rows[0];
  }

  async createProject(project) {
    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Insert project
      const projectQuery = `
        INSERT INTO projects (name, description, icon, href, status, bg_image, bg_image_mime)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `;
      
      const projectResult = await client.query(projectQuery, [
        project.name,
        project.description,
        project.icon,
        project.href,
        project.status || 'current',
        project.bg_image || null,
        project.bg_image_mime || null
      ]);
      
      const newProject = projectResult.rows[0];
      
      // Insert tags if provided
      if (project.tags && project.tags.length > 0) {
        const tagQuery = 'INSERT INTO project_tags (project_id, tag) VALUES ($1, $2)';
        
        for (const tag of project.tags) {
          await client.query(tagQuery, [newProject.id, tag]);
        }
      }
      
      await client.query('COMMIT');
      
      // Return the complete project with tags
      return await this.getProjectById(newProject.id);
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async updateProject(id, updates) {
    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Build dynamic update query
      const fields = [];
      const values = [];
      let paramCount = 1;
      
      if (updates.name !== undefined) {
        fields.push(`name = $${paramCount++}`);
        values.push(updates.name);
      }
      if (updates.description !== undefined) {
        fields.push(`description = $${paramCount++}`);
        values.push(updates.description);
      }
      if (updates.icon !== undefined) {
        fields.push(`icon = $${paramCount++}`);
        values.push(updates.icon);
      }
      if (updates.href !== undefined) {
        fields.push(`href = $${paramCount++}`);
        values.push(updates.href);
      }
      if (updates.status !== undefined) {
        fields.push(`status = $${paramCount++}`);
        values.push(updates.status);
      }
      if (updates.display_order !== undefined) {
        fields.push(`display_order = $${paramCount++}`);
        values.push(updates.display_order);
      }
      if (updates.bg_image !== undefined) {
        fields.push(`bg_image = $${paramCount++}`);
        values.push(updates.bg_image);
        fields.push(`bg_image_mime = $${paramCount++}`);
        values.push(updates.bg_image_mime || null);
      }
      if (updates.bg_video !== undefined) {
        fields.push(`bg_video = $${paramCount++}`);
        values.push(updates.bg_video);
        fields.push(`bg_video_mime = $${paramCount++}`);
        values.push(updates.bg_video_mime || null);
      }
      if (updates.logo !== undefined) {
        fields.push(`logo = $${paramCount++}`);
        values.push(updates.logo);
        fields.push(`logo_mime = $${paramCount++}`);
        values.push(updates.logo_mime || null);
      }
      
      fields.push(`updated_at = $${paramCount++}`);
      values.push(new Date());
      values.push(id);
      
      // Update project
      if (fields.length > 1) { // More than just updated_at
        const updateQuery = `
          UPDATE projects 
          SET ${fields.join(', ')}
          WHERE id = $${paramCount}
          RETURNING *
        `;
        
        await client.query(updateQuery, values);
      }
      
      // Update tags if provided
      if (updates.tags !== undefined) {
        // Remove existing tags
        await client.query('DELETE FROM project_tags WHERE project_id = $1', [id]);
        
        // Add new tags
        if (updates.tags.length > 0) {
          const tagQuery = 'INSERT INTO project_tags (project_id, tag) VALUES ($1, $2)';
          
          for (const tag of updates.tags) {
            await client.query(tagQuery, [id, tag]);
          }
        }
      }
      
      await client.query('COMMIT');
      
      return await this.getProjectById(id);
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async getBgVideo(id) {
    const query = 'SELECT bg_video, bg_video_mime FROM projects WHERE id = $1';
    const result = await this.pool.query(query, [id]);
    const row = result.rows[0];
    if (!row || !row.bg_video) return null;
    return { data: row.bg_video, mime: row.bg_video_mime || 'video/mp4' };
  }

  async deleteBgVideo(id) {
    await this.pool.query(
      'UPDATE projects SET bg_video = NULL, bg_video_mime = NULL, updated_at = $1 WHERE id = $2',
      [new Date(), id]
    );
  }

  async getLogo(id) {
    const query = 'SELECT logo, logo_mime FROM projects WHERE id = $1';
    const result = await this.pool.query(query, [id]);
    const row = result.rows[0];
    if (!row || !row.logo) return null;
    return { data: row.logo, mime: row.logo_mime || 'image/png' };
  }

  async deleteLogo(id) {
    await this.pool.query(
      'UPDATE projects SET logo = NULL, logo_mime = NULL, updated_at = $1 WHERE id = $2',
      [new Date(), id]
    );
  }

  async getBgImage(id) {
    const query = 'SELECT bg_image, bg_image_mime FROM projects WHERE id = $1';
    const result = await this.pool.query(query, [id]);
    const row = result.rows[0];
    if (!row || !row.bg_image) return null;
    return { data: row.bg_image, mime: row.bg_image_mime || 'image/jpeg' };
  }

  async deleteBgImage(id) {
    await this.pool.query(
      'UPDATE projects SET bg_image = NULL, bg_image_mime = NULL, updated_at = $1 WHERE id = $2',
      [new Date(), id]
    );
  }

  async deleteProject(id) {
    const query = 'DELETE FROM projects WHERE id = $1 RETURNING *';
    const result = await this.pool.query(query, [id]);
    return result.rows[0];
  }

  async getProjectsByStatus(status) {
    const query = `
      SELECT 
        p.*,
        COALESCE(
          JSON_AGG(
            CASE WHEN pt.tag IS NOT NULL THEN pt.tag ELSE NULL END
          ) FILTER (WHERE pt.tag IS NOT NULL), 
          '[]'::json
        ) as tags
      FROM projects p
      LEFT JOIN project_tags pt ON p.id = pt.project_id
      WHERE p.status = $1
      GROUP BY p.id
      ORDER BY p.display_order ASC NULLS LAST, p.created_at DESC
    `;
    
    const result = await this.pool.query(query, [status]);
    return result.rows;
  }
}

export default Project;