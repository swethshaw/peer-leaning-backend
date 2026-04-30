import { Response } from 'express'
import Discussion from '../models/Discussion'
import { AuthRequest } from '../middleware/auth'
import mongoose from 'mongoose'

// GET /api/discussions
export const getDiscussions = async (req: AuthRequest, res: Response) => {
  try {
    const { cohortId, courseId, page = 1, limit = 20 } = req.query
    const filter: Record<string, unknown> = {}
    if (cohortId) filter.cohortId = cohortId
    if (courseId) filter.courseId = courseId

    const posts = await Discussion.find(filter)
      .populate('author', 'name avatar')
      .sort({ createdAt: -1 })
      .skip((+page - 1) * +limit)
      .limit(+limit)
      .lean()

    res.json({ success: true, data: posts })
  } catch {
    res.status(500).json({ success: false, message: 'Failed to fetch discussions' })
  }
}

// GET /api/discussions/:id
export const getDiscussionById = async (req: AuthRequest, res: Response) => {
  try {
    const post = await Discussion.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    )
      .populate('author', 'name avatar')
      .populate('replies.author', 'name avatar')
      .lean()

    if (!post) return res.status(404).json({ success: false, message: 'Post not found' })
    res.json({ success: true, data: post })
  } catch {
    res.status(500).json({ success: false, message: 'Failed to fetch discussion' })
  }
}

// POST /api/discussions
export const createDiscussion = async (req: AuthRequest, res: Response) => {
  try {
    const { title, content, tags, cohortId, courseId } = req.body
    if (!title || !content) {
      return res.status(400).json({ success: false, message: 'Title and content are required' })
    }

    const post = await Discussion.create({
      title, content, tags: tags ?? [],
      author: req.user?._id,
      cohortId, courseId,
    })

    const populated = await post.populate('author', 'name avatar')
    res.status(201).json({ success: true, data: populated })
  } catch {
    res.status(500).json({ success: false, message: 'Failed to create post' })
  }
}

// POST /api/discussions/:id/replies
export const replyToDiscussion = async (req: AuthRequest, res: Response) => {
  try {
    const { content } = req.body
    if (!content) return res.status(400).json({ success: false, message: 'Content required' })

    const post = await Discussion.findByIdAndUpdate(
      req.params.id,
      { $push: { replies: { content, author: req.user?._id, likes: 0 } } },
      { new: true }
    )
      .populate('author', 'name avatar')
      .populate('replies.author', 'name avatar')

    if (!post) return res.status(404).json({ success: false, message: 'Post not found' })
    res.json({ success: true, data: post })
  } catch {
    res.status(500).json({ success: false, message: 'Failed to add reply' })
  }
}

// PATCH /api/discussions/:id/like
export const likeDiscussion = async (req: AuthRequest, res: Response) => {
  try {
    const post = await Discussion.findByIdAndUpdate(
      req.params.id,
      { $inc: { likes: 1 } },
      { new: true }
    )
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' })
    res.json({ success: true, data: { likes: post.likes } })
  } catch {
    res.status(500).json({ success: false, message: 'Failed to like post' })
  }
}

// DELETE /api/discussions/:id
export const deleteDiscussion = async (req: AuthRequest, res: Response) => {
  try {
    const post = await Discussion.findById(req.params.id)
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' })

    if (post.author.toString() !== req.user?._id && req.user?.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' })
    }

    await post.deleteOne()
    res.json({ success: true, message: 'Post deleted' })
  } catch {
    res.status(500).json({ success: false, message: 'Failed to delete post' })
  }
}
