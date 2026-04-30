import mongoose, { Document, Schema } from 'mongoose';

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  cohort: string;
  type: 'theory' | 'quiz' | 'achievement' | 'result';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
}

const notificationSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  cohort: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['theory', 'quiz', 'achievement', 'result'], 
    required: true 
  },
  
  title: { type: String, required: true },
  message: { type: String, required: true },
  
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<INotification>('Notification', notificationSchema);