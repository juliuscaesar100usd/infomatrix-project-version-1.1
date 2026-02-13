import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';

/**
 * Analyze food using Gemini 2.0 Flash Vision + LLM
 * @param {string|null} imageUrl - The URL path to the image
 * @param {string|null} description - Text description of the meal
 * @param {string|null} imagePath - Local file path for the image
 * @returns {Object} Analysis result
 */
export async function analyzeFood(imageUrl, description, imagePath) {
  if (!process.env.GEMINI_API_KEY) {
    // Fallback analysis when no API key is configured
    return fallbackAnalysis(description);
  }

  const systemInstruction = `You are a nutrition expert AI. Analyze the food described or shown and provide:
1. The dish name
2. Estimated sugar content in grams (be as accurate as possible)
3. A risk level: "low" (0-5g), "medium" (5-15g), or "high" (>15g)
4. A list of detected/likely ingredients

Respond ONLY with valid JSON in this exact format:
{
  "dishName": "string",
  "sugarGrams": number,
  "riskLevel": "low" | "medium" | "high",
  "ingredients": ["string", "string"]
}

Be conservative but realistic with sugar estimates. Consider added sugars, natural sugars in fruits, sauces, etc.
Do NOT wrap your response in markdown code blocks.`;

  const contentParts = [];

  // Add image if available
  if (imagePath && fs.existsSync(imagePath)) {
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString('base64');
    const ext = imagePath.split('.').pop().toLowerCase();
    const mimeMap = { png: 'image/png', webp: 'image/webp', gif: 'image/gif', jpg: 'image/jpeg', jpeg: 'image/jpeg' };
    const mimeType = mimeMap[ext] || 'image/jpeg';

    contentParts.push({
      inlineData: {
        data: base64Image,
        mimeType,
      },
    });
  }

  // Add text description
  const textPrompt = description
    ? `Analyze this food: "${description}"`
    : 'Analyze the food shown in this image.';

  contentParts.push(textPrompt);

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      systemInstruction,
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 600,
        responseMimeType: 'application/json',
      },
    });

    const result = await model.generateContent(contentParts);
    const response = result.response;
    const content = response.text().trim();

    // Parse JSON from response (handle markdown code blocks)
    let jsonStr = content;
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1].trim();
    }

    const parsed = JSON.parse(jsonStr);

    return {
      dishName: parsed.dishName || 'Unknown dish',
      sugarGrams: Math.round((parsed.sugarGrams || 0) * 10) / 10,
      riskLevel: parsed.riskLevel || 'low',
      ingredients: parsed.ingredients || [],
    };
  } catch (error) {
    console.error('Gemini API error:', error);
    return fallbackAnalysis(description);
  }
}

/**
 * Fallback analysis when AI is not available
 */
function fallbackAnalysis(description) {
  const desc = (description || '').toLowerCase();

  // Simple keyword-based estimation
  const sugarKeywords = {
    high: ['cake', 'candy', 'chocolate', 'cookie', 'donut', 'ice cream', 'soda', 'juice', 'syrup', 'honey', 'jam', 'pastry', 'pie', 'brownie', 'muffin', 'fudge', 'caramel'],
    medium: ['bread', 'pasta', 'rice', 'cereal', 'yogurt', 'fruit', 'banana', 'apple', 'grape', 'mango', 'smoothie', 'granola', 'oatmeal', 'pancake', 'waffle', 'ketchup', 'sauce'],
    low: ['salad', 'chicken', 'fish', 'egg', 'meat', 'vegetable', 'broccoli', 'spinach', 'water', 'cheese', 'nuts', 'steak', 'tofu', 'avocado'],
  };

  let riskLevel = 'medium';
  let sugarGrams = 8;
  let detectedIngredients = [];

  for (const [level, keywords] of Object.entries(sugarKeywords)) {
    for (const keyword of keywords) {
      if (desc.includes(keyword)) {
        riskLevel = level;
        sugarGrams = level === 'high' ? 22 : level === 'medium' ? 10 : 3;
        detectedIngredients.push(keyword.charAt(0).toUpperCase() + keyword.slice(1));
      }
    }
  }

  if (detectedIngredients.length === 0) {
    detectedIngredients = ['Not detected'];
  }

  return {
    dishName: description || 'Unknown dish',
    sugarGrams,
    riskLevel,
    ingredients: detectedIngredients.slice(0, 6),
    warning: 'Analysis performed using basic estimation (AI service not configured)',
  };
}
