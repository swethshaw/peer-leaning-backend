import { Response } from 'express'
import User from '../models/User'
import Course from '../models/Course'
import Progress from '../models/Progress'
import { AuthRequest } from '../middleware/auth'

// ─── Leaderboard ─────────────────────────────────────────────────────────────

// GET /api/leaderboard
export const getGlobalLeaderboard = async (_req: AuthRequest, res: Response) => {
  try {
    const users = await User.find({ role: 'student' })
      .select('name avatar points badges enrolledCourses')
      .sort({ points: -1 })
      .limit(50)
      .lean()

    const entries = users.map((u, i) => ({
      rank: i + 1,
      user: { _id: u._id, name: u.name, avatar: u.avatar },
      points: u.points,
      coursesCompleted: 0, // could be enriched from Progress
      badges: u.badges.length,
    }))

    res.json({ success: true, data: entries })
  } catch {
    res.status(500).json({ success: false, message: 'Failed to fetch leaderboard' })
  }
}

// GET /api/leaderboard/cohort/:cohortId
export const getCohortLeaderboard = async (req: AuthRequest, res: Response) => {
  try {
    const users = await User.find({ enrolledCohorts: req.params.cohortId, role: 'student' })
      .select('name avatar points badges')
      .sort({ points: -1 })
      .lean()

    const entries = users.map((u, i) => ({
      rank: i + 1,
      user: { _id: u._id, name: u.name, avatar: u.avatar },
      points: u.points,
      badges: u.badges.length,
    }))

    res.json({ success: true, data: entries })
  } catch {
    res.status(500).json({ success: false, message: 'Failed to fetch cohort leaderboard' })
  }
}

// ─── Bookmarks ────────────────────────────────────────────────────────────────

// GET /api/bookmarks
export const getBookmarks = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user?._id).populate({
      path: 'bookmarks',
      select: 'title description difficulty category thumbnail tags totalModules totalLessons',
    }).lean()

    res.json({ success: true, data: user?.bookmarks ?? [] })
  } catch {
    res.status(500).json({ success: false, message: 'Failed to fetch bookmarks' })
  }
}

// POST /api/bookmarks
export const addBookmark = async (req: AuthRequest, res: Response) => {
  try {
    const { courseId } = req.body
    if (!courseId) return res.status(400).json({ success: false, message: 'courseId required' })

    const course = await Course.findById(courseId)
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' })

    await User.findByIdAndUpdate(req.user?._id, { $addToSet: { bookmarks: courseId } })
    res.json({ success: true, message: 'Bookmarked' })
  } catch {
    res.status(500).json({ success: false, message: 'Failed to add bookmark' })
  }
}

// DELETE /api/bookmarks/:courseId
export const removeBookmark = async (req: AuthRequest, res: Response) => {
  try {
    await User.findByIdAndUpdate(req.user?._id, { $pull: { bookmarks: req.params.courseId } })
    res.json({ success: true, message: 'Bookmark removed' })
  } catch {
    res.status(500).json({ success: false, message: 'Failed to remove bookmark' })
  }
}
