/**
 * Option Routes
 *
 * Defines API endpoints for status and project options (CRUD).
 * All routes require authentication.
 */
import { Router } from 'express';
import * as optionController from '../controllers/optionController';
import { authenticate } from '../middleware/auth';

const router = Router();

// All option routes require authentication (JWT)
router.use(authenticate);

// Status option endpoints
router.get('/status', optionController.getStatusOptions);
router.post('/status', optionController.createStatusOption);
router.put('/status/:id', optionController.updateStatusOption);
router.delete('/status/:id', optionController.deleteStatusOption);

// Project option endpoints
router.get('/project', optionController.getProjectOptions);
router.post('/project', optionController.createProjectOption);
router.put('/project/:id', optionController.updateProjectOption);
router.delete('/project/:id', optionController.deleteProjectOption);

export default router;
