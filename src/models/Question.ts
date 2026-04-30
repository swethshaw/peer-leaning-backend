import mongoose, { Document, Schema } from 'mongoose';

export interface IQuestion extends Document {
  topicId: mongoose.Types.ObjectId;
  subTopic: string;
  difficulty: 'Easy' | 'Intermediate' | 'Hard';
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation?: string;
}

const questionSchema: Schema = new Schema({
  topicId: { type: Schema.Types.ObjectId, ref: 'Topic', required: true },
  subTopic: { type: String, required: true },
  difficulty: { type: String, enum: ['Easy', 'Intermediate', 'Hard'], required: true },
  question: { type: String, required: true },
  options: { type: [String], required: true }, 
  
  correctAnswerIndex: { type: Number, required: true },
  explanation: { type: String }
});
export default mongoose.model<IQuestion>('Question', questionSchema);