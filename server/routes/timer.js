import { Router } from 'express';
import supabase from '../lib/supabase.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// GET /api/timer – get current timer
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const { data: timer, error } = await supabase
      .from('sugar_timer')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error || !timer) {
      return res.json({ timer: null });
    }

    res.json({ timer });
  } catch (err) {
    console.error('Get timer error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/timer/start – start sugar-free period
router.post('/start', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const now = new Date().toISOString();

    // Upsert timer
    const { data: existing } = await supabase
      .from('sugar_timer')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (existing) {
      const { data: timer, error } = await supabase
        .from('sugar_timer')
        .update({ start_time: now })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      return res.json({ timer });
    }

    const { data: timer, error } = await supabase
      .from('sugar_timer')
      .insert({ user_id: userId, start_time: now })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ timer });
  } catch (err) {
    console.error('Start timer error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/timer/reset – reset timer
router.post('/reset', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const { error } = await supabase
      .from('sugar_timer')
      .delete()
      .eq('user_id', userId);

    if (error) throw error;
    res.json({ message: 'Timer reset successfully' });
  } catch (err) {
    console.error('Reset timer error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
