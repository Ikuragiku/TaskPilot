/**
 * AI Service
 *
 * Provides AI-powered features using OpenAI's GPT models.
 * Currently supports intelligent mapping of recipe ingredients to grocery categories.
 */
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface IngredientMapping {
  ingredientName: string;
  suggestedCategoryId: string | null;
  confidence: 'high' | 'medium' | 'low';
}

/**
 * Map recipe ingredients to grocery categories using AI.
 *
 * @param ingredients - Array of ingredient names from a recipe
 * @param categories - Available grocery categories with their IDs and names
 * @returns Array of mappings with suggested category IDs for each ingredient
 *
 * @example
 * const mappings = await mapIngredientsToCategories(
 *   ['beef 300g', 'tomatoes 2pcs'],
 *   [{ id: '1', value: 'Meat' }, { id: '2', value: 'Vegetables' }]
 * );
 */
export const mapIngredientsToCategories = async (
  ingredients: string[],
  categories: { id: string; value: string }[]
): Promise<IngredientMapping[]> => {
  if (!process.env.OPENAI_API_KEY) {
    // Fallback: return all ingredients without category mapping
    return ingredients.map(ing => ({
      ingredientName: ing,
      suggestedCategoryId: null,
      confidence: 'low' as const,
    }));
  }

  const systemPrompt = `You are a grocery categorization assistant. Given a list of recipe ingredients and AVAILABLE GROCERY CATEGORIES, map each ingredient to the MOST GENERAL MATCH that a supermarket would use.

AVAILABLE CATEGORIES (use ONLY these, do NOT invent new names):
${categories.map(c => `- ${c.id}: ${c.value}`).join('\n')}

STRICT OUTPUT: Return a JSON array of objects with keys exactly:
[
  {
    "ingredientName": "string (original)",
    "suggestedCategoryId": "string (one of the provided IDs)",
    "confidence": "high|medium|low"
  }
]

RULES:
- Choose GENERAL categories (e.g., cheese, meat, dairy, vegetables) over specific subtypes.
- If no suitable category exists, set suggestedCategoryId to null.
- Do NOT propose or name new categories.
- Keep ingredientName exactly as provided.`;

  const userPrompt = `Map these ingredients to categories:\n${ingredients.map((ing, i) => `${i + 1}. ${ing}`).join('\n')}`;

  try {
    console.log('[AI Service] Mapping ingredients:', ingredients);
    console.log('[AI Service] Available categories:', categories);

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error('No response from OpenAI');

    console.log('[AI Service] Raw GPT response:', content);

    const parsed = JSON.parse(content);
    // Handle both { mappings: [...] } and direct array responses
    const mappings = Array.isArray(parsed) ? parsed : (parsed.mappings || parsed.ingredients || []);

    console.log('[AI Service] Parsed mappings:', JSON.stringify(mappings, null, 2));

    // Ensure all mappings have the correct structure
    const validatedMappings = mappings.map((m: any) => ({
      ingredientName: m.ingredientName || m.ingredient || '',
      // GPT might return a category name instead of ID; pass it along as "categoryName"
      suggestedCategoryId: m.suggestedCategoryId || m.categoryId || null,
      categoryName: m.categoryName || m.category || undefined,
      confidence: (m.confidence || 'low') as 'high' | 'medium' | 'low',
    }));

    console.log('[AI Service] Validated mappings:', JSON.stringify(validatedMappings, null, 2));

    return validatedMappings;
  } catch (error) {
    console.error('AI mapping error:', error);
    // Fallback: return ingredients without mappings
    return ingredients.map(ing => ({
      ingredientName: ing,
      suggestedCategoryId: null,
      confidence: 'low' as const,
    }));
  }
};

export default {
  mapIngredientsToCategories,
};
