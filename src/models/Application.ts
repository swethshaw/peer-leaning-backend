import mongoose, { Document, Schema } from 'mongoose';

export interface IApplication extends Document {
  userId: mongoose.Types.ObjectId;
  projectId: mongoose.Types.ObjectId;
  roleId: mongoose.Types.ObjectId;
  status: 'pending' | 'reviewing' | 'shortlisted' | 'hired' | 'rejected';
  resumeUrl: string;
  portfolioUrl?: string;
  coverNote: string;
  appliedAt: Date;
}

const ApplicationSchema = new Schema<IApplication>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
    roleId: { type: Schema.Types.ObjectId, required: true }, // Points to a sub-document in Project.roles
    status: { 
      type: String, 
      enum: ['pending', 'reviewing', 'shortlisted', 'hired', 'rejected'], 
      default: 'pending' 
    },
    resumeUrl: { type: String, required: true },
    portfolioUrl: { type: String },
    coverNote: { type: String, required: true },
    appliedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IApplication>('Application', ApplicationSchema);
