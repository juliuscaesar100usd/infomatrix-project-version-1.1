import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { fileURLToPath } from 'url';
import { authenticateToken } from '../middleware/auth.js';
import { analyzeFridge } from '../services/fridgeAnalysis.js';

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
    cb(null, `fridge-${uuidv4()}${ext}`);
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

// POST /api/fridge/scan – scan a fridge photo and get recipe suggestions
router.post('/scan', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Please upload a fridge photo' });
    }

    const imagePath = req.file.path;

    // Analyze fridge contents and search for recipes
    const result = await analyzeFridge(imagePath);

    // Clean up the uploaded file (ephemeral — no DB storage)
    try {
      fs.unlinkSync(imagePath);
    } catch (cleanupErr) {
      console.warn('Could not clean up fridge image:', cleanupErr.message);
    }

    if (result.error && result.ingredients.length === 0) {
      return res.status(422).json({
        error: result.error,
        ingredients: [],
        recipes: [],
      });
    }

    res.json({
      ingredients: result.ingredients,
      recipes: result.recipes,
      warning: result.error || null,
    });
  } catch (err) {
    console.error('Fridge scan error:', err);
    res.status(500).json({ error: 'Failed to analyze fridge photo. Please try again.' });
  }
});

export default router;
