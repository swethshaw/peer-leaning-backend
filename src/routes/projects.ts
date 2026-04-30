import { Router } from 'express';
import { 
  getAllProjects, 
  getProjectById, 
  createProject, 
  getHostedProjects, 
  getEnrolledProjects,
  getProjectActivities
} from '../controllers/projectController';
import { applyToProject } from '../controllers/applicationController';

const router = Router();

router.get('/', getAllProjects);
router.get('/:id', getProjectById);
router.post('/', createProject);
router.get('/user/:userId/activities', getProjectActivities);
router.get('/user/:userId/hosted', getHostedProjects);
router.get('/user/:userId/enrolled', getEnrolledProjects);
router.post('/:projectId/apply', applyToProject);

export default router;
