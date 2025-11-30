/**
 * Recipe Service
 *
 * Business logic for recipe and recipe category management.
 * Handles CRUD operations for recipes with their items (ingredients/steps) and category assignments.
 * Uses Prisma transactions to ensure data consistency when updating related entities.
 *
 * Key operations:
 * - Recipe CRUD with user scoping
 * - Recipe item management (ingredients/instructions)
 * - Recipe category assignments (many-to-many)
 * - Global recipe category CRUD
 * - AI-powered recipe-to-grocery conversion
 */
import prisma from '../prismaClient';
import { CreateRecipeDto, UpdateRecipeDto } from '../types';
import * as aiService from './aiService';
import * as groceryService from './groceryService';

/**
 * Retrieves all recipes for a user with their items and categories.
 * @param userId - The ID of the user
 * @returns Array of recipes with nested items and categories
 */
export const getRecipes = async (userId: string) => {
  const recipes = await prisma.recipe.findMany({
    where: { userId },
    include: {
      items: true,
      categories: {
        include: { recipeCategory: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return recipes.map((r: any) => ({
    id: r.id,
    title: r.title,
    description: r.description,
    portions: r.portions,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
    items: r.items.map((it: any) => ({ id: it.id, name: it.name, order: it.order, type: it.type })),
    categories: r.categories.map((a: any) => a.recipeCategory),
  }));
};

/**
 * Retrieves a single recipe by ID with items and categories.
 * @param id - Recipe ID
 * @param userId - User ID (for ownership verification)
 * @returns Recipe with nested items and categories
 * @throws Error if recipe not found or doesn't belong to user
 */
export const getRecipeById = async (id: string, userId: string) => {
  const r = await prisma.recipe.findFirst({
    where: { id, userId },
    include: { items: true, categories: { include: { recipeCategory: true } } },
  });
  if (!r) throw new Error('Recipe not found');
  return {
    id: r.id,
    title: r.title,
    description: r.description,
    portions: r.portions,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
    items: r.items.map((it: any) => ({ id: it.id, name: it.name, order: it.order, type: it.type })),
    categories: r.categories.map((a: any) => a.recipeCategory),
  };
};

/**
 * Creates a new recipe with optional items and category assignments.
 * Uses a transaction to ensure all related entities are created atomically.
 * @param userId - The owner of the recipe
 * @param data - Recipe creation data
 * @returns Newly created recipe with items and categories
 */
export const createRecipe = async (userId: string, data: CreateRecipeDto) => {
  const recipe = await prisma.$transaction(async (tx) => {
    const created = await tx.recipe.create({
      data: { title: data.title, description: data.description, portions: data.portions ?? null, userId },
    });

    const items = [];
    if (data.ingredientNames && data.ingredientNames.length > 0) {
      items.push(...data.ingredientNames.map((name, idx) => ({ 
        recipeId: created.id, 
        name, 
        order: idx, 
        type: 'ingredient' as const 
      })));
    }
    if (data.stepNames && data.stepNames.length > 0) {
      const offset = items.length;
      items.push(...data.stepNames.map((name, idx) => ({ 
        recipeId: created.id, 
        name, 
        order: offset + idx, 
        type: 'step' as const 
      })));
    }
    if (items.length > 0) {
      await tx.recipeItem.createMany({ data: items });
    }

    if (data.categoryIds && data.categoryIds.length > 0) {
      await tx.recipeCategoryAssignment.createMany({
        data: data.categoryIds.map((cid) => ({ recipeId: created.id, recipeCategoryId: cid })),
      });
    }

    return created;
  });

  return getRecipeById(recipe.id, userId);
};

/**
 * Updates an existing recipe.
 * Can update basic fields, replace items entirely, or replace category assignments.
 * Uses a transaction to ensure consistency.
 * @param id - Recipe ID
 * @param userId - User ID (for ownership verification)
 * @param data - Partial update data
 * @returns Updated recipe with items and categories
 * @throws Error if recipe not found or doesn't belong to user
 */
export const updateRecipe = async (id: string, userId: string, data: UpdateRecipeDto) => {
  const existing = await prisma.recipe.findFirst({ where: { id, userId } });
  if (!existing) throw new Error('Recipe not found');

  const result = await prisma.$transaction(async (tx) => {
    await tx.recipe.update({ where: { id }, data: { title: data.title ?? existing.title, description: data.description ?? existing.description, portions: data.portions === undefined ? existing.portions : data.portions } });

    if (data.ingredientNames !== undefined || data.stepNames !== undefined) {
      // If either is updated, replace items by type
      if (data.ingredientNames !== undefined) {
        await tx.recipeItem.deleteMany({ where: { recipeId: id, type: 'ingredient' } });
        if (data.ingredientNames && data.ingredientNames.length > 0) {
          await tx.recipeItem.createMany({ 
            data: data.ingredientNames.map((name, idx) => ({ 
              recipeId: id, 
              name, 
              order: idx, 
              type: 'ingredient' as const 
            })) 
          });
        }
      }
      if (data.stepNames !== undefined) {
        await tx.recipeItem.deleteMany({ where: { recipeId: id, type: 'step' } });
        if (data.stepNames && data.stepNames.length > 0) {
          // Get current max order from ingredients to append steps after
          const maxOrder = data.ingredientNames ? data.ingredientNames.length : 
            (await tx.recipeItem.count({ where: { recipeId: id, type: 'ingredient' } }));
          await tx.recipeItem.createMany({ 
            data: data.stepNames.map((name, idx) => ({ 
              recipeId: id, 
              name, 
              order: maxOrder + idx, 
              type: 'step' as const 
            })) 
          });
        }
      }
    }

    if (data.categoryIds !== undefined) {
      await tx.recipeCategoryAssignment.deleteMany({ where: { recipeId: id } });
      if (data.categoryIds && data.categoryIds.length > 0) {
        await tx.recipeCategoryAssignment.createMany({ data: data.categoryIds.map(cid => ({ recipeId: id, recipeCategoryId: cid })) });
      }
    }

    return tx.recipe.findUnique({ where: { id }, include: { items: true, categories: { include: { recipeCategory: true } } } });
  });

  if (!result) throw new Error('Failed to update recipe');
  return getRecipeById(result.id, userId);
};

/**
 * Deletes a recipe and all its related items and category assignments (cascade).
 * @param id - Recipe ID
 * @param userId - User ID (for ownership verification)
 * @returns Object with deleted recipe ID
 * @throws Error if recipe not found or doesn't belong to user
 */
export const deleteRecipe = async (id: string, userId: string) => {
  const existing = await prisma.recipe.findFirst({ where: { id, userId } });
  if (!existing) throw new Error('Recipe not found');
  await prisma.recipe.delete({ where: { id } });
  return { id };
};

// Recipe category operations

/**
 * Retrieves all recipe categories ordered by display order.
 * Categories are global (not user-specific).
 * @returns Array of recipe categories
 */
export const getRecipeCategories = async () => {
  const cats = await prisma.recipeCategory.findMany({ orderBy: { order: 'asc' } });
  return cats;
};

/**
 * Creates a new recipe category.
 * @param data - Category data with value and optional color
 * @returns Newly created category
 */
export const createRecipeCategory = async (data: { value: string; color?: string }) => {
  const created = await prisma.recipeCategory.create({ data: { value: data.value, color: data.color ?? '#cccccc' } });
  return created;
};

/**
 * Updates a recipe category's value, color, or display order.
 * @param id - Category ID
 * @param data - Partial update data
 * @returns Updated category
 */
export const updateRecipeCategory = async (id: string, data: { value?: string; color?: string; order?: number }) => {
  const updated = await prisma.recipeCategory.update({ where: { id }, data });
  return updated;
};

/**
 * Deletes a recipe category and removes it from all recipe assignments.
 * @param id - Category ID
 * @returns Object with deleted category ID
 */
export const deleteRecipeCategory = async (id: string) => {
  // remove assignments first
  await prisma.recipeCategoryAssignment.deleteMany({ where: { recipeCategoryId: id } });
  await prisma.recipeCategory.delete({ where: { id } });
  return { id };
};

/**
 * Adds all ingredients from a recipe to the user's grocery list.
 * Uses AI to intelligently map ingredients to grocery categories.
 * Merges quantities if items already exist in the grocery list.
 *
 * @param recipeId - The ID of the recipe to convert
 * @param userId - The user ID (for ownership verification)
 * @returns Summary of added/updated groceries
 * @throws Error if recipe not found or doesn't belong to user
 *
 * @example
 * const result = await addRecipeToGroceryList('recipe-123', 'user-456');
 * // Returns: { added: 3, updated: 2, failed: 0 }
 */
export const addRecipeToGroceryList = async (recipeId: string, userId: string) => {
  // Get recipe with items
  const recipe = await getRecipeById(recipeId, userId);
  if (!recipe.items || recipe.items.length === 0) {
    return { added: 0, updated: 0, failed: 0, message: 'Recipe has no ingredients' };
  }

  // Filter only ingredients (not recipe steps)
  const ingredients = recipe.items.filter((item: any) => !item.type || item.type === 'ingredient');
  
  if (ingredients.length === 0) {
    return { added: 0, updated: 0, failed: 0, message: 'Recipe has no ingredients' };
  }

  // Get all grocery categories
  const groceryCategories = await prisma.groceryCategory.findMany({ orderBy: { order: 'asc' } });

  // Get existing groceries for the user
  const existingGroceries = await groceryService.getGroceries(userId, {});

  // Use AI to map ingredients to categories
  const ingredientNames = ingredients.map(item => item.name);
  console.log('[Recipe Service] Processing recipe:', recipe.title);
  console.log('[Recipe Service] Ingredients:', ingredientNames);
  console.log('[Recipe Service] Available grocery categories:', groceryCategories.map(c => `${c.id}: ${c.value}`));

  const mappings = await aiService.mapIngredientsToCategories(
    ingredientNames,
    groceryCategories.map(c => ({ id: c.id, value: c.value }))
  );

  console.log('[Recipe Service] Received mappings from AI:', JSON.stringify(mappings, null, 2));

  let added = 0;
  let updated = 0;
  let failed = 0;
  let skipped = 0;

  // Process each ingredient
  for (const mapping of mappings) {
    try {
      const ingredientName = mapping.ingredientName;
      
      // Parse quantity from ingredient name (e.g., "beef 300g" -> "beef", "300g")
      const { name, quantity } = parseIngredient(ingredientName);

      // Skip pantry staples (oils, pasta, seasonings)
      if (shouldSkipIngredient(name)) {
        console.log(`[Recipe Service] Skipping pantry staple: "${name}"`);
        skipped++;
        continue;
      }

      console.log(`[Recipe Service] Processing: "${ingredientName}" -> name: "${name}", quantity: "${quantity}", categoryId: ${mapping.suggestedCategoryId}`);

      // Check if item already exists in grocery list (case-insensitive)
      const existingItem = existingGroceries.find(
        g => g.title.toLowerCase().trim() === name.toLowerCase().trim()
      );

      if (existingItem) {
        // Merge quantities
        const mergedQuantity = mergeQuantities(existingItem.menge || '', quantity);
        console.log(`[Recipe Service] Updating existing item "${name}": ${existingItem.menge} + ${quantity} = ${mergedQuantity}`);
        await groceryService.updateGrocery(existingItem.id, userId, {
          title: existingItem.title,
          menge: mergedQuantity,
          done: existingItem.done,
        });
        updated++;
      } else {
        // Create new grocery item
        // Prefer AI-suggested ID; if missing, try to resolve by categoryName or ingredient keywords
        let categoryIds: string[] = [];
        if (mapping.suggestedCategoryId) {
          categoryIds = [mapping.suggestedCategoryId];
        } else {
          const resolvedId = resolveCategoryId(name, mapping as any, groceryCategories);
          if (resolvedId) categoryIds = [resolvedId];
        }
        console.log(`[Recipe Service] Creating new item "${name}" with categories:`, categoryIds);
        await groceryService.createGrocery(userId, {
          title: name,
          menge: quantity,
          done: false,
          categoryIds,
        });
        added++;
      }
    } catch (error) {
      console.error(`[Recipe Service] Failed to process ingredient: ${mapping.ingredientName}`, error);
      failed++;
    }
  }

  console.log(`[Recipe Service] Summary: added=${added}, updated=${updated}, skipped=${skipped}, failed=${failed}`);

  return {
    added,
    updated,
    failed,
    message: `Successfully added ${added} new items and updated ${updated} existing items${skipped > 0 ? ` (skipped ${skipped} pantry staples)` : ''}${failed > 0 ? ` (${failed} failed)` : ''}`
  };
};

/**
 * Checks if an ingredient should be skipped (pantry staples).
 * Skips oils, pasta, and common seasonings.
 */
function shouldSkipIngredient(name: string): boolean {
  const lowerName = name.toLowerCase().trim();
  
  // Oils (German and English)
  const oils = ['öl', 'oil', 'olivenöl', 'olive oil', 'sonnenblumenöl', 'sunflower oil', 
                'rapsöl', 'canola oil', 'sesamöl', 'sesame oil', 'kokosöl', 'coconut oil',
                'erdnussöl', 'peanut oil', 'pflanzenöl', 'vegetable oil'];
  
  // Pasta types (German and English)
  const pasta = ['nudeln', 'pasta', 'spaghetti', 'penne', 'fusilli', 'rigatoni', 'tagliatelle',
                 'fettuccine', 'macaroni', 'linguine', 'farfalle', 'makkaroni'];
  
  // Seasonings (German and English)
  const seasonings = ['salz', 'salt', 'pfeffer', 'pepper', 'paprika', 'paprikapulver', 
                      'chili', 'chilipulver', 'chili powder', 'knoblauchpulver', 'garlic powder',
                      'zwiebelpulver', 'onion powder', 'oregano', 'basilikum', 'basil',
                      'thymian', 'thyme', 'rosmarin', 'rosemary', 'majoran', 'marjoram',
                      'kümmel', 'cumin', 'kurkuma', 'turmeric', 'curry', 'currypulver',
                      'zimt', 'cinnamon', 'muskatnuss', 'nutmeg', 'lorbeer', 'bay leaf',
                      'petersilie', 'parsley', 'schnittlauch', 'chives', 'dill', 'koriander',
                      'cayenne', 'cayennepfeffer', 'paprikapulver edelsüß', 'paprikapulver rosenscharf'];
  
  // Check for exact matches or if ingredient contains these terms
  const allSkipTerms = [...oils, ...pasta, ...seasonings];
  
  return allSkipTerms.some(term => 
    lowerName === term || 
    lowerName.startsWith(term + ' ') || 
    lowerName.endsWith(' ' + term) ||
    lowerName.includes(' ' + term + ' ')
  );
}

/**
 * Parses an ingredient string into name and quantity.
 * Supports both formats:
 * - "300g Hähnchenbrust" -> { name: "Hähnchenbrust", quantity: "300g" }
 * - "beef 300g" -> { name: "beef", quantity: "300g" }
 * - "2 Zwiebeln" -> { name: "Zwiebeln", quantity: "2" }
 * - "salt" -> { name: "salt", quantity: "" }
 */
function parseIngredient(ingredient: string): { name: string; quantity: string } {
  const trimmed = ingredient.trim();
  
  // Try to match quantity at the beginning (German format: "300g Hähnchenbrust", "2EL Öl", "1TL Salz")
  const startPattern = /^(\d+(?:[.,]\d+)?\s*(?:g|kg|mg|ml|l|cl|EL|TL|Stück|Zehe|Prise|Messerspitze)?)\s+(.+)$/i;
  const startMatch = trimmed.match(startPattern);
  
  if (startMatch) {
    const quantity = startMatch[1].trim();
    const name = startMatch[2].trim();
    return { name, quantity };
  }
  
  // Try to match quantity at the end (English format: "beef 300g", "tomatoes 2pcs")
  const endPattern = /^(.+?)\s+(\d+(?:[.,]\d+)?\s*(?:g|kg|mg|ml|l|oz|lb|pcs?|pieces?|cups?|tbsp|tsp|pinch)?)$/i;
  const endMatch = trimmed.match(endPattern);
  
  if (endMatch) {
    const name = endMatch[1].trim();
    const quantity = endMatch[2].trim();
    return { name, quantity };
  }

  // No quantity found, return entire string as name
  return { name: trimmed, quantity: '' };
}

/**
 * Merges two quantity strings intelligently.
 * Examples:
 * - mergeQuantities("500g", "300g") -> "800g"
 * - mergeQuantities("2pcs", "3pcs") -> "5pcs"
 * - mergeQuantities("500ml", "1l") -> "1500ml"
 * - mergeQuantities("some", "more") -> "some + more"
 */
function mergeQuantities(existing: string, additional: string): string {
  if (!existing) return additional;
  if (!additional) return existing;

  // Extract numbers and units
  const parseQty = (str: string) => {
    const match = str.match(/^(\d+(?:[.,]\d+)?)\s*([a-zA-Z]+)?$/);
    if (!match) return null;
    return {
      value: parseFloat(match[1].replace(',', '.')),
      unit: match[2]?.toLowerCase() || '',
    };
  };

  const existingParsed = parseQty(existing.trim());
  const additionalParsed = parseQty(additional.trim());

  // If both can be parsed and have compatible units
  if (existingParsed && additionalParsed) {
    // Convert liters to ml for compatibility
    let existingValue = existingParsed.value;
    let existingUnit = existingParsed.unit;
    let additionalValue = additionalParsed.value;
    let additionalUnit = additionalParsed.unit;

    // Normalize units
    if (existingUnit === 'l' && additionalUnit === 'ml') {
      existingValue *= 1000;
      existingUnit = 'ml';
    } else if (existingUnit === 'ml' && additionalUnit === 'l') {
      additionalValue *= 1000;
      additionalUnit = 'ml';
    } else if (existingUnit === 'kg' && additionalUnit === 'g') {
      existingValue *= 1000;
      existingUnit = 'g';
    } else if (existingUnit === 'g' && additionalUnit === 'kg') {
      additionalValue *= 1000;
      additionalUnit = 'g';
    }

    // If units match now, add them
    if (existingUnit === additionalUnit) {
      const total = existingValue + additionalValue;
      return `${total}${existingUnit}`;
    }
  }

  // Fallback: just concatenate
  return `${existing} + ${additional}`;
}

/**
 * Attempts to resolve a grocery category ID by AI-provided name or ingredient keywords.
 */
function resolveCategoryId(ingredientName: string, mapping: { categoryName?: string }, categories: Array<{ id: string; value: string }>): string | null {
  // 1) If GPT provided a categoryName, try exact and loose matching
  const catName = (mapping.categoryName || '').trim().toLowerCase();
  if (catName) {
    const exact = categories.find(c => c.value.trim().toLowerCase() === catName);
    if (exact) return exact.id;
    // Try partial match (e.g., "gemüse" matches "Obst / Gemüse")
    const loose = categories.find(c => {
      const catLabel = c.value.trim().toLowerCase();
      return catName.includes(catLabel) || catLabel.includes(catName) || catLabel.split(/[/\s]+/).some(part => part && catName.includes(part));
    });
    if (loose) return loose.id;
  }

  // 2) Heuristic keyword-based mapping from ingredient name (favor general categories)
  const ing = ingredientName.toLowerCase();
  const heuristics: Array<{ keywords: string[]; generalLabels: RegExp[] }> = [
    { keywords: ['hähnchen', 'hühnchen', 'pute', 'rind', 'steak', 'hack', 'fleisch', 'beef', 'pork', 'chicken', 'turkey', 'meat'], generalLabels: [/^fleisch$/i] },
    { keywords: ['kartoffel', 'karotte', 'paprika', 'zwiebel', 'tomate', 'brokkoli', 'gurke', 'sellerie', 'salat', 'zucchini', 'gemüse', 'vegetable'], generalLabels: [/obst.*gemüse|gemüse/i] },
    { keywords: ['käse', 'cheese', 'milch', 'butter', 'sahne', 'joghurt'], generalLabels: [/^käse$/i] },
    { keywords: ['reis', 'nudel', 'pasta', 'mehl', 'brot', 'wrap', 'dinkel', 'quinoa', 'vollkorn'], generalLabels: [/getreide.*backwaren|backwaren/i] },
    { keywords: ['olivenöl', 'öl', 'oil'], generalLabels: [/^öl$/i] },
    { keywords: ['zucker', 'honig', 'süß', 'sugar'], generalLabels: [/zucker.*süß/i] },
    { keywords: ['bohnen', 'linse', 'dose', 'konserve', 'passiert'], generalLabels: [/^konserven$/i] },
    { keywords: ['tk', 'tiefkühl', 'frozen'], generalLabels: [/^tk$/i] },
  ];

  for (const h of heuristics) {
    if (h.keywords.some(k => ing.includes(k))) {
      const matched = categories.find(c => h.generalLabels.some(r => r.test(c.value)));
      if (matched) return matched.id;
    }
  }

  // 3) Token-based fuzzy matching: try to find a category whose label appears in the ingredient
  for (const c of categories) {
    const label = c.value.trim().toLowerCase();
    if (!label) continue;
    if (ing.includes(label)) return c.id;
  }

  return null;
}

/**
 * Determines a reasonable category name for a given ingredient when no ID is provided.
 * Prefers AI-provided categoryName; otherwise derives from keyword heuristics.
 */
// determineCategoryName no longer used; keep as reference for future taxonomy tuning
