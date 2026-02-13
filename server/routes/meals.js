import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import supabase from '../lib/supabase.js';
import { authenticateToken } from '../middleware/auth.js';
import { analyzeFood } from '../services/aiAnalysis.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp|gif/;
    const extValid = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimeValid = allowedTypes.test(file.mimetype.split('/')[1]);
    if (extValid && mimeValid) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

const router = Router();

// POST /api/meals – upload and analyze a meal
router.post('/', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    const { description } = req.body;
    const userId = req.user.id;

    if (!req.file && !description) {
      return res.status(400).json({ error: 'Please provide an image or description' });
    }

    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    // AI analysis
    let analysisResult;
    try {
      analysisResult = await analyzeFood(imageUrl, description, req.file?.path);
    } catch (aiError) {
      console.error('AI analysis error:', aiError);
      analysisResult = {
        dishName: description || 'Unknown dish',
        sugarGrams: 0,
        riskLevel: 'low',
        ingredients: [],
        error: 'AI analysis could not be completed. Results set to 0g sugar.',
      };
    }

    const mealId = uuidv4();
    const now = new Date().toISOString();

    const { data: meal, error } = await supabase
      .from('meals')
      .insert({
        id: mealId,
        user_id: userId,
        image_url: imageUrl,
        description: description || analysisResult.dishName,
        dish_name: analysisResult.dishName,
        sugar_grams: analysisResult.sugarGrams,
        risk_level: analysisResult.riskLevel,
        ingredients: analysisResult.ingredients,
        created_at: now,
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase meal insert error:', error);
      return res.status(500).json({ error: 'Failed to save meal' });
    }

    res.status(201).json({
      meal,
      analysis: analysisResult,
    });
  } catch (err) {
    console.error('Add meal error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/meals – get meals for current user (today by default, or by date)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { date } = req.query;

    // Default to today
    const targetDate = date || new Date().toISOString().split('T')[0];
    const startOfDay = `${targetDate}T00:00:00.000Z`;
    const endOfDay = `${targetDate}T23:59:59.999Z`;

    const { data: meals, error } = await supabase
      .from('meals')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', startOfDay)
      .lte('created_at', endOfDay)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Fetch meals error:', error);
      return res.status(500).json({ error: 'Failed to fetch meals' });
    }

    const totalSugar = meals.reduce((sum, m) => sum + (m.sugar_grams || 0), 0);

    res.json({ meals, totalSugar, date: targetDate });
  } catch (err) {
    console.error('Get meals error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/meals/latest – get the most recent meal analysis
router.get('/latest', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const { data: meal, error } = await supabase
      .from('meals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error || !meal) {
      return res.json({ meal: null });
    }

    res.json({ meal });
  } catch (err) {
    console.error('Get latest meal error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/meals/:id
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const mealId = req.params.id;

    // Verify ownership
    const { data: meal } = await supabase
      .from('meals')
      .select('*')
      .eq('id', mealId)
      .eq('user_id', userId)
      .single();

    if (!meal) {
      return res.status(404).json({ error: 'Meal not found' });
    }

    // Delete image file if exists
    if (meal.image_url) {
      const filePath = path.join(__dirname, '..', '..', meal.image_url);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    const { error } = await supabase
      .from('meals')
      .delete()
      .eq('id', mealId)
      .eq('user_id', userId);

    if (error) {
      return res.status(500).json({ error: 'Failed to delete meal' });
    }

    res.json({ message: 'Meal deleted successfully' });
  } catch (err) {
    console.error('Delete meal error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
