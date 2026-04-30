import { Router } from 'express'
import {
  getCourses, getCourseById, getMyCourses,
  enrollCourse, completeLesson, getCourseProgress
} from '../controllers/courseController'
import { protect } from '../middleware/auth'

const router = Router()

router.get('/',                          protect, getCourses)
router.get('/me/enrolled',               protect, getMyCourses)
router.get('/:id',                       protect, getCourseById)
router.post('/:id/enroll',               protect, enrollCourse)
router.get('/:id/progress',              protect, getCourseProgress)
router.patch('/:id/lessons/:lessonId/complete', protect, completeLesson)

export default router
