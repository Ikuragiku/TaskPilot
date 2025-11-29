/**
 * Recipe Routes
 *
 * Defines HTTP routes for recipe CRUD operations.
 * All routes require authentication.
 *
 * Routes:
 * - GET    /api/recipes      - List all recipes for the authenticated user
 * - GET    /api/recipes/:id  - Get a single recipe by ID
 * - POST   /api/recipes      - Create a new recipe
 * - PUT    /api/recipes/:id  - Update a recipe
 * - DELETE /api/recipes/:id  - Delete a recipe
 */
import { Router } from 'express';
import * as recipeController from '../controllers/recipeController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', recipeController.getRecipes);
router.get('/:id', recipeController.getRecipe);
router.post('/', recipeController.createRecipe);
router.put('/:id', recipeController.updateRecipe);
router.delete('/:id', recipeController.deleteRecipe);

export default router;
