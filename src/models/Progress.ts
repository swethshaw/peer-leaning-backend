import mongoose, { Document, Schema } from 'mongoose'

export interface IProgress extends Document {
  user: mongoose.Types.ObjectId
  course: mongoose.Types.ObjectId
  completedLessons: string[]
  progressPercent: number
  lastAccessedAt: Date
  createdAt: Date
  updatedAt: Date
}

const ProgressSchema = new Schema<IProgress>(
  {
    user:             { type: Schema.Types.ObjectId, ref: 'User',   required: true },
    course:           { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    completedLessons: [{ type: String }],
    progressPercent:  { type: Number, default: 0 },
    lastAccessedAt:   { type: Date, default: Date.now },
  },
  { timestamps: true }
)

ProgressSchema.index({ user: 1, course: 1 }, { unique: true })

export default mongoose.model<IProgress>('Progress', ProgressSchema)
