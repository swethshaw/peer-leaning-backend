import { Router } from 'express'
import { getDashboardSummary } from '../controllers/miscControllers'
import { protect } from '../middleware/auth'

const router = Router()

router.get('/summary', protect, getDashboardSummary)

export default router
