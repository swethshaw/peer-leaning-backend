import { Router } from 'express'
import {
  getDiscussions, getDiscussionById, createDiscussion,
  replyToDiscussion, likeDiscussion, deleteDiscussion
} from '../controllers/discussionController'
import { protect } from '../middleware/auth'

const router = Router()

router.get('/',              protect, getDiscussions)
router.get('/:id',           protect, getDiscussionById)
router.post('/',             protect, createDiscussion)
router.post('/:id/replies',  protect, replyToDiscussion)
router.patch('/:id/like',    protect, likeDiscussion)
router.delete('/:id',        protect, deleteDiscussion)

export default router
