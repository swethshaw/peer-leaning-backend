import mongoose, { Document, Schema } from 'mongoose';

export interface IFeedback {
  authorId: mongoose.Types.ObjectId;
  comment: string;
  type: 'approval' | 'revision' | 'general';
  createdAt: Date;
}

export interface ISubmission {
  userId: mongoose.Types.ObjectId;
  fileUrl: string;
  fileName: string;
  description: string;
  submittedAt: Date;
  reviewStatus: 'pending' | 'approved' | 'needs-revision';
  feedback: IFeedback[];
  version: number;
}

export interface ITask extends Document {
  projectId: mongoose.Types.ObjectId;
  assigneeId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'in-review' | 'revision' | 'done';
  submissions: ISubmission[];
  dueDate: Date;
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
}

const FeedbackSchema = new Schema<IFeedback>({
  authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  comment: { type: String, required: true },
  type: { type: String, enum: ['approval', 'revision', 'general'], default: 'general' },
  createdAt: { type: Date, default: Date.now },
});

const SubmissionSchema = new Schema<ISubmission>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  fileUrl: { type: String, required: true },
  fileName: { type: String, required: true },
  description: { type: String, required: true },
  submittedAt: { type: Date, default: Date.now },
  reviewStatus: { type: String, enum: ['pending', 'approved', 'needs-revision'], default: 'pending' },
  feedback: [FeedbackSchema],
  version: { type: Number, default: 1 },
});

const TaskSchema = new Schema<ITask>(
  {
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
    assigneeId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    status: { 
      type: String, 
      enum: ['todo', 'in-progress', 'in-review', 'revision', 'done'], 
      default: 'todo' 
    },
    submissions: [SubmissionSchema],
    dueDate: { type: Date, required: true },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<ITask>('Task', TaskSchema);
