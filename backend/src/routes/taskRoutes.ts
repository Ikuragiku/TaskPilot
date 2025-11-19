/**
 * Task Routes
 *
 * Defines API endpoints for task CRUD operations.
 * All routes require authentication.
 */
import { Router } from 'express';
import * as taskController from '../controllers/taskController';
import { authenticate } from '../middleware/auth';

const router = Router();

// All task routes require authentication (JWT)
router.use(authenticate);

router.get('/', taskController.getTasks);
router.get('/:id', taskController.getTask);
router.post('/', taskController.createTask);
router.put('/:id', taskController.updateTask);
router.delete('/:id', taskController.deleteTask);

export default router;
