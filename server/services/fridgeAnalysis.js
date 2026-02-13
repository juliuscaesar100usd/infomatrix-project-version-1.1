import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';

/**
 * Analyze a fridge photo to detect ingredients, then generate healthy recipes.
 * Uses Gemini 2.0 Flash for both ingredient detection and recipe suggestions.
 * @param {string|null} imagePath - Local file path for the fridge image
 * @returns {Object} { ingredients: string[], recipes: { title, url, source, description }[] }
 */
export async function analyzeFridge(imagePath) {
  let ingredients = [];

  if (!process.env.GEMINI_API_KEY) {
    console.error('❌ GEMINI_API_KEY is not set');
    return {
      ingredients: [],
      recipes: [],
      error: 'Gemini API key is not configured. Please set GEMINI_API_KEY in your .env file.',
    };
  }

  if (!imagePath || !fs.existsSync(imagePath)) {
    console.error('❌ Image file not found:', imagePath);
    return {
      ingredients: [],
      recipes: [],
      error: 'Image file not found. Please try uploading again.',
    };
  }

  ingredients = await detectIngredients(imagePath);

  if (ingredients.length === 0) {
    return {
      ingredients: [],
      recipes: [],
      error: 'Could not detect ingredients. Make sure the image clearly shows food items in your fridge. Try a well-lit photo with the fridge door open.',
    };
  }

  let recipes = [];
  try {
    recipes = await generateRecipes(ingredients);
  } catch (err) {
    console.error('Recipe generation error:', err);
    recipes = buildFallbackRecipes(ingredients);
  }

  return { ingredients, recipes };
}

/**
 * Use Gemini 2.0 Flash Vision to identify food items visible in a fridge photo.
 * Includes retry logic for robustness.
 */
async function detectIngredients(imagePath) {
  let imageBuffer;
  try {
    imageBuffer = fs.readFileSync(imagePath);
  } catch (err) {
    console.error('❌ Failed to read image file:', err.message);
    return [];
  }

  const base64Image = imageBuffer.toString('base64');
  const ext = imagePath.split('.').pop().toLowerCase();
  const mimeMap = { png: 'image/png', webp: 'image/webp', gif: 'image/gif', jpg: 'image/jpeg', jpeg: 'image/jpeg' };
  const mimeType = mimeMap[ext] || 'image/jpeg';

  if (imageBuffer.length < 5000) {
    console.warn('⚠️  Image file is very small (', imageBuffer.length, 'bytes) — may be corrupt');
  }

  const systemInstruction = `You are an elite food and ingredient identification AI with superhuman visual perception. The user will show you a photo that may contain:
- The inside of an open refrigerator
- Food items on a counter or table
- Groceries in bags or on shelves
- Any arrangement of food/cooking ingredients

Your job is to perform an EXHAUSTIVE pixel-by-pixel examination of the image and identify every visible food item and ingredient, including those that are barely visible, partially hidden, or in dark/blurry areas.

You MUST respond ONLY with valid JSON in this exact format:
{
  "ingredients": ["ingredient1", "ingredient2", "ingredient3"]
}

CRITICAL DETECTION RULES — follow every single one:
- Scan EVERY shelf, drawer, door compartment, and visible area systematically from top to bottom, left to right
- Zoom into dark corners and shadows — items may be hidden there
- Look BEHIND other items — if you can see even a small edge, corner, or partial label of a product, identify it
- Examine partially occluded objects: infer what they are by visible shape, color, size, and packaging
- Read ALL labels, logos, and brand markings — even if only partially visible, use the visible letters/colors to identify the product
- If an area is dark, blurry, or low-contrast, STILL attempt identification based on shape silhouettes and context clues
- Identify items by their packaging type (bottles, jars, cartons, bags, plastic containers, cling wrap, foil)
- Look for items that blend into the background (e.g., clear containers, white items on white shelves)
- Check the door shelves carefully — condiments, sauces, and bottles are often missed
- Check the bottom drawers — produce and vegetables are typically stored there
- Use common English names (e.g. "chicken breast" not "poultry")
- Be specific but practical (e.g. "cheddar cheese" not just "dairy product")
- Include ALL categories: vegetables, fruits, meats, dairy, condiments, sauces, drinks, eggs, bread, leftovers, etc.
- If you see a container with food but can't identify it precisely, give your best guess based on color/texture (e.g. "leftover soup", "marinated meat")
- Return between 5 and 30 ingredients — aim for completeness
- Do NOT include non-food items (containers themselves, shelves, shelf liners, etc.)
- Do NOT wrap your response in markdown code blocks
- When uncertain about an item, include it anyway — false positives are better than missed ingredients`;

  const userPrompt = `Carefully examine this fridge/food image with extreme attention to detail. Identify EVERY food item and ingredient visible, including those that are:
- Partially hidden behind other items
- In dark or shadowy areas
- Blurry or out of focus
- Small or in the background
- In transparent or hard-to-see containers

List ALL food items as JSON. Be thorough — check every shelf, drawer, and door compartment.`;

  // Attempt 1
  let ingredients = await callGeminiForIngredients(base64Image, mimeType, systemInstruction, userPrompt);

  // Retry with a simpler prompt if first attempt failed
  if (ingredients.length === 0) {
    console.log('🔄 Retrying ingredient detection with simplified prompt...');
    const retryPrompt = 'List all food items visible in this image as a JSON object: {"ingredients": ["item1", "item2", ...]}. Look very carefully at every part of the image, including dark areas and behind other items. Only output JSON, nothing else.';
    ingredients = await callGeminiForIngredients(base64Image, mimeType, systemInstruction, retryPrompt);
  }

  return ingredients;
}

/**
 * Helper: Make a Gemini API call and parse the JSON response for ingredients.
 */
async function callGeminiForIngredients(base64Image, mimeType, systemInstruction, userPrompt) {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      systemInstruction,
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 1024,
        responseMimeType: 'application/json',
      },
    });

    const imagePart = {
      inlineData: {
        data: base64Image,
        mimeType,
      },
    };

    const result = await model.generateContent([userPrompt, imagePart]);
    const response = result.response;
    const content = response.text().trim();

    if (!content) {
      console.error('❌ Gemini returned empty content');
      return [];
    }

    console.log('📝 Raw AI response:', content.substring(0, 300));

    let jsonStr = content;
    // Handle markdown code blocks just in case
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) jsonStr = jsonMatch[1].trim();

    const objectMatch = jsonStr.match(/\{[\s\S]*\}/);
    if (objectMatch) jsonStr = objectMatch[0];

    const parsed = JSON.parse(jsonStr);
    const ingredients = Array.isArray(parsed.ingredients) ? parsed.ingredients : [];

    console.log(`✅ Detected ${ingredients.length} ingredients:`, ingredients.slice(0, 5).join(', '), '...');
    return ingredients.slice(0, 30);
  } catch (err) {
    console.error('❌ Ingredient detection API/parse error:', err.message);
    return [];
  }
}

/**
 * Use Gemini 2.0 Flash to generate 3 healthy recipes from detected ingredients,
 * with Google Search URLs for each (no external API key needed).
 */
async function generateRecipes(ingredients) {
  const topIngredients = ingredients.slice(0, 8).join(', ');

  const systemInstruction = `You are a healthy recipe suggestion AI. Given a list of available ingredients, suggest exactly 3 healthy, low-sugar recipes that can be made using those ingredients.

You MUST respond ONLY with valid JSON in this exact format:
{
  "recipes": [
    {
      "title": "Recipe Name",
      "description": "A brief 1-2 sentence description of the dish and why it's healthy.",
      "searchQuery": "exact search query to find this recipe online"
    }
  ]
}

Rules:
- Suggest exactly 3 recipes
- Focus on healthy, low-sugar options
- Use common recipe names that would return good search results
- Make descriptions appetizing and mention health benefits
- The searchQuery should be specific enough to find actual recipes (e.g. "grilled chicken breast with roasted vegetables recipe")
- Do NOT wrap your response in markdown code blocks`;

  const userPrompt = `I have these ingredients available: ${topIngredients}. Please suggest 3 healthy recipes I can make with these ingredients.`;

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      systemInstruction,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 800,
        responseMimeType: 'application/json',
      },
    });

    const result = await model.generateContent(userPrompt);
    const response = result.response;
    const content = response.text().trim();

    if (!content) return buildFallbackRecipes(ingredients);

    let jsonStr = content;
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) jsonStr = jsonMatch[1].trim();

    const objectMatch = jsonStr.match(/\{[\s\S]*\}/);
    if (objectMatch) jsonStr = objectMatch[0];

    const parsed = JSON.parse(jsonStr);

    if (!Array.isArray(parsed.recipes)) return buildFallbackRecipes(ingredients);

    return parsed.recipes.slice(0, 3).map((recipe) => ({
      title: recipe.title,
      url: `https://www.google.com/search?q=${encodeURIComponent(recipe.searchQuery || recipe.title + ' recipe')}`,
      source: 'Google Search',
      description: recipe.description || '',
    }));
  } catch (err) {
    console.error('❌ Recipe generation error:', err.message);
    return buildFallbackRecipes(ingredients);
  }
}

/**
 * Fallback: generate Google Search links when AI recipe generation fails.
 */
function buildFallbackRecipes(ingredients) {
  const topIngredients = ingredients.slice(0, 5);

  const queries = [
    `healthy recipe with ${topIngredients.join(' ')}`,
    `easy low sugar meal ${topIngredients.slice(0, 3).join(' ')}`,
    `quick healthy dinner ${topIngredients.slice(0, 2).join(' ')}`,
  ];

  return queries.map((q, i) => ({
    title: `Healthy Recipe Idea ${i + 1}: ${topIngredients.slice(0, 3).join(', ')}`,
    url: `https://www.google.com/search?q=${encodeURIComponent(q)}`,
    source: 'Google Search',
    description: `Search for healthy recipes using your ingredients: ${topIngredients.join(', ')}`,
  }));
}
