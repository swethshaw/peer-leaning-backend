import { Router } from 'express';
import { 
  getProjectTasks, 
  getUserTasks, 
  updateTaskStatus, 
  submitTaskWork 
} from '../controllers/taskController';

const router = Router();

router.get('/project/:projectId', getProjectTasks);
router.get('/user/:userId', getUserTasks);
router.patch('/:id/status', updateTaskStatus);
router.post('/:id/submit', submitTaskWork);

export default router;
