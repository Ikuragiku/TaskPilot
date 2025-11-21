import { Router } from 'express';
import * as ctrl from '../controllers/groceryCategoryController';

const router = Router();

/**
 * Grocery Category Routes
 *
 * Routes mounted at `/api/grocery-categories`:
 * - GET `/` -> list categories
 * - POST `/` -> create category
 * - PUT `/:id` -> update category
 * - DELETE `/:id` -> remove category
 */
router.get('/', ctrl.getCategories);
router.post('/', ctrl.createCategory);
router.put('/:id', ctrl.updateCategory);
router.delete('/:id', ctrl.deleteCategory);

export default router;
