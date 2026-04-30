import mongoose, { Document, Schema } from 'mongoose';

export interface IRoom extends Document {
  code: string;
  hostId: mongoose.Types.ObjectId;
  topicId: mongoose.Types.ObjectId;
  status: 'waiting' | 'playing' | 'finished';
  participants: Array<{
    userId: mongoose.Types.ObjectId;
    name: string;
    status: 'Joined' | 'Playing' | 'Submitted' | 'Blocked';
    score: number;
    timeSpentSeconds: number;
    warnings: number;
  }>;
  questions: any[]; 
  createdAt: Date;
}

const roomSchema: Schema = new Schema({
  code: { type: String, required: true, unique: true },
  hostId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  topicId: { type: Schema.Types.ObjectId, ref: 'Topic', required: true },
  status: { type: String, enum: ['waiting', 'playing', 'finished'], default: 'waiting' },
  participants: [{
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    name: { type: String },
    status: { type: String, enum: ['Joined', 'Playing', 'Submitted', 'Blocked'], default: 'Joined' },
    score: { type: Number, default: 0 },
    timeSpentSeconds: { type: Number, default: 0 },
    warnings: { type: Number, default: 0 }
  }],
  questions: { type: Array, required: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IRoom>('Room', roomSchema);