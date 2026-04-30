import mongoose, { Document, Schema } from 'mongoose';

export interface IPaper extends Document {
  userId: mongoose.Types.ObjectId;
  topicId: mongoose.Types.ObjectId;
  title: string;
  questions: Array<{
    question: string;
    options: string[];
    correctAnswerIndex: number;
    explanation?: string;
  }>;
  createdAt: Date;
}

const paperSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  topicId: { type: Schema.Types.ObjectId, ref: 'Topic', required: true },
  title: { type: String, required: true },
  questions: [{
    question: { type: String, required: true },
    options: [{ type: String, required: true }],
    correctAnswerIndex: { type: Number, required: true },
    explanation: { type: String }
  }],
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IPaper>('Paper', paperSchema);