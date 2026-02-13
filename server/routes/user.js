import { Router } from 'express';
import supabase from '../lib/supabase.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// GET /api/user/profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, language, created_at')
      .eq('id', userId)
      .single();

    if (error || !user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (err) {
    console.error('Get profile error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/user/language
router.put('/language', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { language } = req.body;

    if (!['en', 'ru', 'kz'].includes(language)) {
      return res.status(400).json({ error: 'Invalid language. Use en, ru, or kz' });
    }

    const { data: user, error } = await supabase
      .from('users')
      .update({ language })
      .eq('id', userId)
      .select('id, email, language, created_at')
      .single();

    if (error) throw error;
    res.json({ user });
  } catch (err) {
    console.error('Update language error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
