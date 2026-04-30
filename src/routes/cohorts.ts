import { Router } from 'express'
import {
  getCohorts, getCohortById, getMyCohorts,
  joinCohort, leaveCohort
} from '../controllers/cohortController'
import { protect } from '../middleware/auth'

const router = Router()

router.get('/',              protect, getCohorts)
router.get('/me/enrolled',   protect, getMyCohorts)
router.get('/:id',           protect, getCohortById)
router.post('/:id/join',     protect, joinCohort)
router.post('/:id/leave',    protect, leaveCohort)

export default router
