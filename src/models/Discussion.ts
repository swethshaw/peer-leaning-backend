import mongoose, { Document, Schema } from 'mongoose'

export interface IReply {
  _id: mongoose.Types.ObjectId
  content: string
  author: mongoose.Types.ObjectId
  likes: number
  createdAt: Date
}

export interface IDiscussion extends Document {
  title: string
  content: string
  author: mongoose.Types.ObjectId
  cohortId?: mongoose.Types.ObjectId
  courseId?: mongoose.Types.ObjectId
  tags: string[]
  replies: IReply[]
  likes: number
  views: number
  createdAt: Date
}

const ReplySchema = new Schema<IReply>(
  {
    content: { type: String, required: true },
    author:  { type: Schema.Types.ObjectId, ref: 'User', required: true },
    likes:   { type: Number, default: 0 },
  },
  { timestamps: true }
)

const DiscussionSchema = new Schema<IDiscussion>(
  {
    title:    { type: String, required: true, trim: true },
    content:  { type: String, required: true },
    author:   { type: Schema.Types.ObjectId, ref: 'User', required: true },
    cohortId: { type: Schema.Types.ObjectId, ref: 'Cohort' },
    courseId: { type: Schema.Types.ObjectId, ref: 'Course' },
    tags:     [{ type: String }],
    replies:  [ReplySchema],
    likes:    { type: Number, default: 0 },
    views:    { type: Number, default: 0 },
  },
  { timestamps: true }
)

export default mongoose.model<IDiscussion>('Discussion', DiscussionSchema)
