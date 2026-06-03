import express from 'express';
import Profile from '../models/Profile.js';

const router = express.Router();
const profileModel = new Profile();

// GET /api/profile - Get profile data
router.get('/', async (req, res) => {
  try {
    const profile = await profileModel.getProfile();
    res.json(profile);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/profile/settings - Get all settings (admin)
router.get('/settings', async (req, res) => {
  try {
    const settings = await profileModel.getAllSettings();
    res.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/profile/settings/:key - Get specific setting
router.get('/settings/:key', async (req, res) => {
  try {
    const setting = await profileModel.getSetting(req.params.key);
    if (!setting) {
      return res.status(404).json({ error: 'Setting not found' });
    }
    res.json(setting);
  } catch (error) {
    console.error('Error fetching setting:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/profile/settings/:key - Update setting
router.put('/settings/:key', async (req, res) => {
  try {
    const { value } = req.body;
    
    if (value === undefined) {
      return res.status(400).json({ error: 'Value is required' });
    }
    
    const setting = await profileModel.updateSetting(req.params.key, value);
    
    if (!setting) {
      return res.status(404).json({ error: 'Setting not found' });
    }
    
    res.json(setting);
  } catch (error) {
    console.error('Error updating setting:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/profile/settings - Create new setting
router.post('/settings', async (req, res) => {
  try {
    const { key, value, description } = req.body;
    
    if (!key || value === undefined) {
      return res.status(400).json({ error: 'Key and value are required' });
    }
    
    const setting = await profileModel.upsertSetting(key, value, description);
    res.status(201).json(setting);
  } catch (error) {
    console.error('Error creating setting:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/profile/settings/:key - Delete setting
router.delete('/settings/:key', async (req, res) => {
  try {
    const setting = await profileModel.deleteSetting(req.params.key);
    
    if (!setting) {
      return res.status(404).json({ error: 'Setting not found' });
    }
    
    res.json({ message: 'Setting deleted successfully' });
  } catch (error) {
    console.error('Error deleting setting:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;