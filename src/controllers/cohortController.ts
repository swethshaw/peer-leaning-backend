import { Request, Response } from 'express'
import Cohort from '../models/Cohort'
import User from '../models/User'
import { AuthRequest } from '../middleware/auth'
import mongoose from 'mongoose'

// GET /api/cohorts
export const getCohorts = async (req: AuthRequest, res: Response) => {
  try {
    const cohorts = await Cohort.find()
      .populate('mentor', 'name avatar')
      .lean()

    const userId = req.user?._id
    const enriched = cohorts.map(c => ({
      ...c,
      activeMembers: c.members.length,
      isEnrolled: userId ? c.members.map(id => id.toString()).includes(userId) : false,
    }))

    res.json({ success: true, data: enriched })
  } catch {
    res.status(500).json({ success: false, message: 'Failed to fetch cohorts' })
  }
}

// GET /api/cohorts/me/enrolled
export const getMyCohorts = async (req: AuthRequest, res: Response) => {
  try {
    const cohorts = await Cohort.find({ members: req.user?._id })
      .populate('mentor', 'name avatar')
      .lean()

    const enriched = cohorts.map(c => ({
      ...c,
      activeMembers: c.members.length,
      isEnrolled: true,
    }))

    res.json({ success: true, data: enriched })
  } catch {
    res.status(500).json({ success: false, message: 'Failed to fetch your cohorts' })
  }
}

// GET /api/cohorts/:id
export const getCohortById = async (req: AuthRequest, res: Response) => {
  try {
    const cohort = await Cohort.findById(req.params.id)
      .populate('mentor', 'name avatar')
      .populate('courses', 'title description difficulty thumbnail')
      .lean()

    if (!cohort) return res.status(404).json({ success: false, message: 'Cohort not found' })

    const isEnrolled = req.user
      ? cohort.members.map(id => id.toString()).includes(req.user._id)
      : false

    res.json({ success: true, data: { ...cohort, activeMembers: cohort.members.length, isEnrolled } })
  } catch {
    res.status(500).json({ success: false, message: 'Failed to fetch cohort' })
  }
}

// POST /api/cohorts/:id/join
export const joinCohort = async (req: AuthRequest, res: Response) => {
  try {
    const cohort = await Cohort.findById(req.params.id)
    if (!cohort) return res.status(404).json({ success: false, message: 'Cohort not found' })

    const userId = new mongoose.Types.ObjectId(req.user?._id)
    if (cohort.members.some(id => id.equals(userId))) {
      return res.status(400).json({ success: false, message: 'Already a member' })
    }

    cohort.members.push(userId)
    await cohort.save()

    await User.findByIdAndUpdate(req.user?._id, {
      $addToSet: { enrolledCohorts: cohort._id },
      $inc: { points: 20 },
    })

    res.json({ success: true, message: 'Joined cohort!', data: { enrolled: true, activeMembers: cohort.members.length } })
  } catch {
    res.status(500).json({ success: false, message: 'Failed to join cohort' })
  }
}

// POST /api/cohorts/:id/leave
export const leaveCohort = async (req: AuthRequest, res: Response) => {
  try {
    const cohort = await Cohort.findById(req.params.id)
    if (!cohort) return res.status(404).json({ success: false, message: 'Cohort not found' })

    cohort.members = cohort.members.filter(id => id.toString() !== req.user?._id)
    await cohort.save()

    await User.findByIdAndUpdate(req.user?._id, {
      $pull: { enrolledCohorts: cohort._id },
    })

    res.json({ success: true, message: 'Left cohort', data: { enrolled: false } })
  } catch {
    res.status(500).json({ success: false, message: 'Failed to leave cohort' })
  }
}
