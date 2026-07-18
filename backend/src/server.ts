import cors from 'cors';
import 'dotenv/config';
import express from 'express';
import OpenAI from 'openai';
import { z } from 'zod';
import { scaleNutrition, sumNutrition } from './nutrition.js';
import { productDb } from './product-db.js';

const app = express();
const port = Number(process.env.PORT || 3000);
const sharedSecret = process.env.VISION_SHARED_SECRET || '';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.use(cors());
app.use(express.json({ limit: '15mb' }));

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

const requestSchema = z.object({
  image: z.string().min(20),
});

app.post('/api/analyze-meal', async (req, res) => {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.replace('Bearer ', '').trim();

    if (!sharedSecret || token !== sharedSecret) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const parsed = requestSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid request body' });
    }

    const { image } = parsed.data;

    const productNames = productDb.map((p) => p.name).join(', ');

    const prompt = `
Przeanalizuj zdjęcie posiłku i zwróć WYŁĄCZNIE poprawny JSON w formacie:
{
  "detectedMeal": "nazwa posiłku",
  "confidence": 0.0,
  "ingredients": [
    {
      "name": "nazwa składnika",
      "estimatedWeight": 120
    }
  ]
}

Ważne zasady:
- "confidence" ma być liczbą od 0 do 1
- "estimatedWeight" ma być w gramach jako liczba
- używaj możliwie nazw zgodnych z tą bazą produktów:
${productNames}
- jeśli nie masz pewności, użyj najbliższej sensownej nazwy produktu z listy
- nie dodawaj komentarzy, markdownu ani nic poza JSON-em
`;

    const response = await openai.responses.create({
      model: 'gpt-4.1-mini',
      input: [
        {
          role: 'user',
          content: [
            { type: 'input_text', text: prompt },
            {
              type: 'input_image',
              image_url: `data:image/jpeg;base64,${image}`,
            },
          ],
        },
      ],
    });

    const rawText = response.output_text || '{}';

    let parsedModel: {
      detectedMeal?: string;
      confidence?: number;
      ingredients?: Array<{ name: string; estimatedWeight: number }>;
    };

    try {
      parsedModel = JSON.parse(rawText);
    } catch {
      return res.status(422).json({
        error: 'Model returned invalid JSON',
        rawText,
      });
    }

    const normalizedIngredients = (parsedModel.ingredients || []).map((ingredient) => {
      const matched = productDb.find(
        (p) => p.name.toLowerCase() === ingredient.name.toLowerCase()
      );

      if (!matched) {
        return {
          ...ingredient,
          matched: false,
          nutrition: null,
        };
      }

      return {
        ...ingredient,
        matched: true,
        nutrition: scaleNutrition(matched.per100g, ingredient.estimatedWeight),
      };
    });

    const totals = sumNutrition(
      normalizedIngredients
        .filter((item) => item.matched && item.nutrition)
        .map((item) => item.nutrition!)
    );

    return res.json({
      detectedMeal: parsedModel.detectedMeal || 'Nieznany posiłek',
      confidence: parsedModel.confidence || 0,
      ingredients: normalizedIngredients,
      totals,
      note: 'Wynik ma charakter szacunkowy i nie stanowi porady medycznej ani dietetycznej.',
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Analysis failed' });
  }
});

app.listen(port, () => {
  console.log(`NutriMiner backend listening on port ${port}`);
});