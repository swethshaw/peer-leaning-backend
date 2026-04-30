import mongoose, { Document, Schema } from 'mongoose';

export interface ICohort extends Document {
  name: string;
  description?: string;
  mentor?: mongoose.Types.ObjectId;
  activeMembers: number;
  startDate?: Date;
  endDate?: Date;
  banner?: string;
  tags: string[];
  members: mongoose.Types.ObjectId[];
  courses: mongoose.Types.ObjectId[];
  createdAt: Date;
}

const CohortSchema = new Schema<ICohort>(
  {
    name:        { type: String, required: true, trim: true },
    description: { type: String },
    mentor:      { type: Schema.Types.ObjectId, ref: 'User' },
    startDate:   { type: Date },
    endDate:     { type: Date },
    banner:      { type: String },
    tags:        [{ type: String }],
    members:     [{ type: Schema.Types.ObjectId, ref: 'User' }],
    courses:     [{ type: Schema.Types.ObjectId, ref: 'Course' }],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

CohortSchema.virtual('activeMembers').get(function () {
  return this.members ? this.members.length : 0;
});

export default mongoose.model<ICohort>('Cohort', CohortSchema);