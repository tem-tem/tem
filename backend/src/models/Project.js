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
        p.*,
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
        p.*,
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
        INSERT INTO projects (name, description, icon, href, status)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `;
      
      const projectResult = await client.query(projectQuery, [
        project.name,
        project.description,
        project.icon,
        project.href,
        project.status || 'current'
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