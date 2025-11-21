import { Router } from 'express';
import * as ctrl from '../controllers/groceryController';
import { authenticate } from '../middleware/auth';

const router = Router();

/**
 * Grocery Routes (authenticated)
 * Mounted at `/api/groceries`. All routes require authentication via `authenticate` middleware.
 * - GET `/` -> list groceries (supports `search` and `categoryIds` query params)
 * - GET `/:id` -> get single grocery
 * - POST `/` -> create grocery
 * - PUT `/:id` -> update grocery
 * - DELETE `/:id` -> delete grocery
 */
router.use(authenticate);

router.get('/', ctrl.getGroceries);
router.get('/:id', ctrl.getGrocery);
router.post('/', ctrl.createGrocery);
router.put('/:id', ctrl.updateGrocery);
router.delete('/:id', ctrl.deleteGrocery);

export default router;
