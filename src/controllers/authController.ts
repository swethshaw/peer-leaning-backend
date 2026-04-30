import { Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import User from '../models/User'
import { AuthRequest } from '../middleware/auth'

const signToken = (id: string) =>
  jwt.sign({ id }, process.env.JWT_SECRET ?? 'secret', {
    expiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
  } as jwt.SignOptions)

// POST /api/auth/register
export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'All fields are required' })
    }

    const existing = await User.findOne({ email })
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email already registered' })
    }

    const user = await User.create({ name, email, password })
    const token = signToken(user._id.toString())

    res.status(201).json({ success: true, data: { token, user } })
  } catch (err) {
    console.error('register error:', err)
    res.status(500).json({ success: false, message: 'Registration failed' })
  }
}

// POST /api/auth/login
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password required' })
    }

    const user = await User.findOne({ email }).select('+password')
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' })
    }

    const token = signToken(user._id.toString())
    const userObj = user.toJSON()

    res.json({ success: true, data: { token, user: userObj } })
  } catch (err) {
    console.error('login error:', err)
    res.status(500).json({ success: false, message: 'Login failed' })
  }
}

// GET /api/auth/me
export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user?._id).populate('badges').lean()
    if (!user) return res.status(404).json({ success: false, message: 'User not found' })
    res.json({ success: true, data: user })
  } catch {
    res.status(500).json({ success: false, message: 'Server error' })
  }
}

// PATCH /api/auth/me
export const updateMe = async (req: AuthRequest, res: Response) => {
  try {
    const { name, email } = req.body
    const user = await User.findByIdAndUpdate(
      req.user?._id,
      { name, email },
      { new: true, runValidators: true }
    )
    res.json({ success: true, data: user })
  } catch {
    res.status(500).json({ success: false, message: 'Update failed' })
  }
}

// PATCH /api/auth/password
export const changePassword = async (req: AuthRequest, res: Response) => {
  try {
    const { oldPassword, newPassword } = req.body
    const user = await User.findById(req.user?._id).select('+password')
    if (!user) return res.status(404).json({ success: false, message: 'User not found' })

    const valid = await user.comparePassword(oldPassword)
    if (!valid) return res.status(401).json({ success: false, message: 'Incorrect current password' })

    user.password = newPassword
    await user.save()
    res.json({ success: true, message: 'Password updated successfully' })
  } catch {
    res.status(500).json({ success: false, message: 'Password change failed' })
  }
}
