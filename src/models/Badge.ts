import mongoose, { Document, Schema } from 'mongoose'

export interface IBadge extends Document {
  name: string
  icon: string
  description: string
  color: string
  trigger: string
}

const BadgeSchema = new Schema<IBadge>({
  name:        { type: String, required: true, unique: true },
  icon:        { type: String, required: true },
  description: { type: String, required: true },
  color:       { type: String, default: '#6366f1' },
  trigger:     { type: String, required: true }, // e.g. 'first_enroll', 'complete_3', etc.
})

export default mongoose.model<IBadge>('Badge', BadgeSchema)
