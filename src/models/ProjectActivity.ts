import mongoose, { Document, Schema } from 'mongoose';

export type ProjectActivityType = 
  | 'task_rejected' 
  | 'new_applicant' 
  | 'deadline' 
  | 'task_submitted' 
  | 'accepted' 
  | 'review_given' 
  | 'milestone_completed' 
  | 'general';

export interface IProjectActivity extends Document {
  projectId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId; // User who performed the action OR who is being notified?
  // Usually, it's a log of what happened in the project.
  type: ProjectActivityType;
  message: string;
  detail?: string;
  actionUrl?: string;
  timestamp: Date;
  readBy: mongoose.Types.ObjectId[]; // Who has seen this activity
}

const ProjectActivitySchema = new Schema<IProjectActivity>(
  {
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
    userId:    { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type:      { 
      type: String, 
      enum: ['task_rejected', 'new_applicant', 'deadline', 'task_submitted', 'accepted', 'review_given', 'milestone_completed', 'general'],
      default: 'general' 
    },
    message:   { type: String, required: true },
    detail:    { type: String },
    actionUrl: { type: String },
    readBy:    [{ type: Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: { createdAt: 'timestamp', updatedAt: false } }
);

// Index for fast lookup of project activity
ProjectActivitySchema.index({ projectId: 1, timestamp: -1 });

export default mongoose.model<IProjectActivity>('ProjectActivity', ProjectActivitySchema);
