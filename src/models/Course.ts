import mongoose, { Document, Schema } from 'mongoose'

export interface ILesson {
  _id: mongoose.Types.ObjectId
  title: string
  type: 'video' | 'article' | 'resource'
  duration?: string
  url?: string
  order: number
}

export interface IModule {
  _id: mongoose.Types.ObjectId
  title: string
  order: number
  lessons: ILesson[]
}

export interface ICourse extends Document {
  title: string
  description: string
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  category: string
  thumbnail?: string
  tags: string[]
  modules: IModule[]
  totalModules: number
  totalLessons: number
  cohortId?: mongoose.Types.ObjectId
  enrolledStudents: mongoose.Types.ObjectId[]
  createdBy: mongoose.Types.ObjectId
  createdAt: Date
}

const LessonSchema = new Schema<ILesson>({
  title:    { type: String, required: true },
  type:     { type: String, enum: ['video', 'article', 'resource'], default: 'video' },
  duration: { type: String },
  url:      { type: String },
  order:    { type: Number, default: 0 },
})

const ModuleSchema = new Schema<IModule>({
  title:   { type: String, required: true },
  order:   { type: Number, default: 0 },
  lessons: [LessonSchema],
})

const CourseSchema = new Schema<ICourse>(
  {
    title:       { type: String, required: true, trim: true },
    description: { type: String, required: true },
    difficulty:  { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Beginner' },
    category:    { type: String, required: true },
    thumbnail:   { type: String },
    tags:        [{ type: String }],
    modules:     [ModuleSchema],
    totalModules:{ type: Number, default: 0 },
    totalLessons:{ type: Number, default: 0 },
    cohortId:    { type: Schema.Types.ObjectId, ref: 'Cohort' },
    enrolledStudents: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    createdBy:   { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
)

// Auto-compute totals
CourseSchema.pre('save', function () {
  this.totalModules = this.modules.length
  this.totalLessons = this.modules.reduce((s, m) => s + m.lessons.length, 0)
})

export default mongoose.model<ICourse>('Course', CourseSchema)
