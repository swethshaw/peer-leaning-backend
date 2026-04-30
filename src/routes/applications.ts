import { Router } from 'express';
import { 
  getUserApplications, 
  getProjectApplications, 
  updateApplicationStatus 
} from '../controllers/applicationController';

const router = Router();

router.get('/user/:userId', getUserApplications);
router.get('/project/:projectId', getProjectApplications);
router.patch('/:id/status', updateApplicationStatus);

export default router;
