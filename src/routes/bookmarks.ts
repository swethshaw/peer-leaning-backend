import { Router } from 'express'
import { getBookmarks, addBookmark, removeBookmark } from '../controllers/miscControllers'
import { protect } from '../middleware/auth'

const router = Router()

router.get('/',               protect, getBookmarks)
router.post('/',              protect, addBookmark)
router.delete('/:courseId',   protect, removeBookmark)

export default router
