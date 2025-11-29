/**
 * Recipe Category Routes
 *
 * Defines HTTP routes for recipe category CRUD operations.
 * All routes require authentication.
 *
 * Routes:
 * - GET    /api/recipe-categories      - List all recipe categories
 * - POST   /api/recipe-categories      - Create a new category
 * - PUT    /api/recipe-categories/:id  - Update a category
 * - DELETE /api/recipe-categories/:id  - Delete a category
 */
import { Router } from 'express';
import * as recipeController from '../controllers/recipeController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', recipeController.getCategories);
router.post('/', recipeController.createCategory);
router.put('/:id', recipeController.updateCategory);
router.delete('/:id', recipeController.deleteCategory);

export default router;
