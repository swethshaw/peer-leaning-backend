import { Request, Response } from 'express'
import Course from '../models/Course'
import Progress from '../models/Progress'
import User from '../models/User'
import { AuthRequest } from '../middleware/auth'
import mongoose from 'mongoose'

// GET /api/courses
export const getCourses = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, category, search, difficulty } = req.query
    const filter: Record<string, unknown> = {}

    if (category)   filter.category   = category
    if (difficulty) filter.difficulty = difficulty
    if (search)     filter.title      = { $regex: search, $options: 'i' }

    const courses = await Course.find(filter)
      .select('-modules.lessons.url')
      .skip((+page - 1) * +limit)
      .limit(+limit)
      .lean()

    const total = await Course.countDocuments(filter)
    res.json({ success: true, data: courses, total, page: +page, pages: Math.ceil(total / +limit) })
  } catch {
    res.status(500).json({ success: false, message: 'Failed to fetch courses' })
  }
}

// GET /api/courses/me/enrolled
export const getMyCourses = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user?._id).populate('enrolledCourses').lean()
    const courseIds = user?.enrolledCourses ?? []

    const courses = await Course.find({ _id: { $in: courseIds } })
      .select('title description difficulty category thumbnail tags totalModules totalLessons')
      .lean()

    // Attach progress
    const progresses = await Progress.find({
      user: req.user?._id,
      course: { $in: courseIds },
    }).lean()

    const progMap = Object.fromEntries(progresses.map(p => [p.course.toString(), p]))

    const enriched = courses.map(c => ({
      ...c,
      isEnrolled: true,
      progressPercent:  progMap[c._id.toString()]?.progressPercent  ?? 0,
      completedLessons: progMap[c._id.toString()]?.completedLessons.length ?? 0,
    }))

    res.json({ success: true, data: enriched })
  } catch {
    res.status(500).json({ success: false, message: 'Failed to fetch enrolled courses' })
  }
}

// GET /api/courses/:id
export const getCourseById = async (req: AuthRequest, res: Response) => {
  try {
    const course = await Course.findById(req.params.id).lean()
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' })

    const isEnrolled = course.enrolledStudents
      .map(id => id.toString())
      .includes(req.user?._id ?? '')

    let progressPercent = 0
    let completedLessons: string[] = []

    if (isEnrolled) {
      const prog = await Progress.findOne({ user: req.user?._id, course: course._id }).lean()
      progressPercent  = prog?.progressPercent  ?? 0
      completedLessons = prog?.completedLessons ?? []
    }

    // Mark completed lessons
    const enrichedModules = course.modules.map(m => ({
      ...m,
      lessons: m.lessons.map(l => ({
        ...l,
        isCompleted: completedLessons.includes(l._id.toString()),
      }))
    }))

    res.json({
      success: true,
      data: { ...course, modules: enrichedModules, isEnrolled, progressPercent, completedLessons: completedLessons.length }
    })
  } catch {
    res.status(500).json({ success: false, message: 'Failed to fetch course' })
  }
}

// POST /api/courses/:id/enroll
export const enrollCourse = async (req: AuthRequest, res: Response) => {
  try {
    const course = await Course.findById(req.params.id)
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' })

    const userId = new mongoose.Types.ObjectId(req.user?._id)
    if (course.enrolledStudents.some(id => id.equals(userId))) {
      return res.status(400).json({ success: false, message: 'Already enrolled' })
    }

    course.enrolledStudents.push(userId)
    await course.save()

    await User.findByIdAndUpdate(req.user?._id, {
      $addToSet: { enrolledCourses: course._id },
      $inc: { points: 10 },
    })

    await Progress.create({ user: req.user?._id, course: course._id })

    res.json({ success: true, message: 'Enrolled successfully', data: { enrolled: true } })
  } catch {
    res.status(500).json({ success: false, message: 'Enrollment failed' })
  }
}

// PATCH /api/courses/:id/lessons/:lessonId/complete
export const completeLesson = async (req: AuthRequest, res: Response) => {
  try {
    const { id: courseId, lessonId } = req.params

    const course = await Course.findById(courseId).lean()
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' })

    const prog = await Progress.findOneAndUpdate(
      { user: req.user?._id, course: courseId },
      { $addToSet: { completedLessons: lessonId }, lastAccessedAt: new Date() },
      { new: true, upsert: true }
    )

    const totalLessons = course.totalLessons || 1
    const progressPercent = Math.round((prog.completedLessons.length / totalLessons) * 100)
    prog.progressPercent = progressPercent
    await prog.save()

    // Award points per lesson
    await User.findByIdAndUpdate(req.user?._id, { $inc: { points: 5 } })

    res.json({ success: true, data: { progressPercent, completedLessons: prog.completedLessons.length } })
  } catch {
    res.status(500).json({ success: false, message: 'Failed to mark lesson complete' })
  }
}

// GET /api/courses/:id/progress
export const getCourseProgress = async (req: AuthRequest, res: Response) => {
  try {
    const prog = await Progress.findOne({ user: req.user?._id, course: req.params.id }).lean()
    res.json({ success: true, data: prog ?? { progressPercent: 0, completedLessons: [] } })
  } catch {
    res.status(500).json({ success: false, message: 'Failed to fetch progress' })
  }
}
