import mongoose, { Document, Schema } from 'mongoose';

export interface IResult extends Document {
  userId: mongoose.Types.ObjectId;
  topicId: mongoose.Types.ObjectId;
  customPaperId?: mongoose.Types.ObjectId | null;
  cohort: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  timeSpentSeconds: number;
  playMode: 'individual' | 'multi';
  createdAt: Date;
  review: Array<{
    question: string;
    options: string[];
    correctAnswerIndex: number;
    userAnswerIndex: number | null;
    explanation?: string;
  }>;
}

const resultSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  topicId: { type: Schema.Types.ObjectId, ref: 'Topic', required: true },
  customPaperId: { type: Schema.Types.ObjectId, ref: 'Paper', default: null },
  cohort: { type: String, required: true },
  score: { type: Number, required: true },
  totalQuestions: { type: Number, required: true },
  percentage: { type: Number, required: true },
  timeSpentSeconds: { type: Number, required: true },
  playMode: { type: String, enum: ['individual', 'multi'], default: 'individual' },
  roomCode: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
  review: [{
    question: { type: String },
    options: [{ type: String }],
    correctAnswerIndex: { type: Number },
    userAnswerIndex: { type: Number, default: null },
    explanation: { type: String }
  }]
});

export default mongoose.model<IResult>('Result', resultSchema);