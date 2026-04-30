import { Router } from 'express'
import { getGlobalLeaderboard, getCohortLeaderboard } from '../controllers/miscControllers'
import { protect } from '../middleware/auth'

const router = Router()

router.get('/',                  protect, getGlobalLeaderboard)
router.get('/cohort/:cohortId',  protect, getCohortLeaderboard)

export default router
