import mongoose, { Document, Schema } from 'mongoose';

export interface IRole {
  title: string;
  description: string;
  skillsRequired: string[];
  filled: boolean;
  assignedUserId?: mongoose.Types.ObjectId;
}

export interface IMilestone {
  name: string;
  description: string;
  status: 'completed' | 'in-progress' | 'pending';
  assigneeId?: mongoose.Types.ObjectId;
  progress: number;
}

export interface IProject extends Document {
  title: string;
  pitch: string;
  description: string;
  problemStatement: string;
  techStack: string[];
  cohortId: mongoose.Types.ObjectId;
  hostId: mongoose.Types.ObjectId;
  roles: IRole[];
  status: 'hiring' | 'in-progress' | 'completed' | 'archived';
  progress: number;
  milestones: IMilestone[];
  deadline: Date;
  maxParticipants: number;
  currentParticipants: number;
  createdAt: Date;
}

const RoleSchema = new Schema<IRole>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  skillsRequired: [{ type: String }],
  filled: { type: Boolean, default: false },
  assignedUserId: { type: Schema.Types.ObjectId, ref: 'User' },
});

const MilestoneSchema = new Schema<IMilestone>({
  name: { type: String, required: true },
  description: { type: String, required: true },
  status: { type: String, enum: ['completed', 'in-progress', 'pending'], default: 'pending' },
  assigneeId: { type: Schema.Types.ObjectId, ref: 'User' },
  progress: { type: Number, default: 0 },
});

const ProjectSchema = new Schema<IProject>(
  {
    title: { type: String, required: true, trim: true },
    pitch: { type: String, required: true },
    description: { type: String, required: true },
    problemStatement: { type: String, required: true },
    techStack: [{ type: String }],
    cohortId: { type: Schema.Types.ObjectId, ref: 'Cohort', required: true },
    hostId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    roles: [RoleSchema],
    status: { type: String, enum: ['hiring', 'in-progress', 'completed', 'archived'], default: 'hiring' },
    progress: { type: Number, default: 0 },
    milestones: [MilestoneSchema],
    deadline: { type: Date, required: true },
    maxParticipants: { type: Number, default: 5 },
    currentParticipants: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

export default mongoose.model<IProject>('Project', ProjectSchema);
