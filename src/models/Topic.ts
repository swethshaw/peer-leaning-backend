import mongoose, { Document, Schema } from 'mongoose';

export interface ITopic extends Document {
  cohortId: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  category?: string;
  difficulty?: string;
  subTopics: string[];
}

const topicSchema: Schema = new Schema({
  cohortId: { type: Schema.Types.ObjectId, ref: 'Cohort', required: true },
  title: { type: String, required: true },
  description: { type: String },
  category: { type: String },
  difficulty: { type: String },
  subTopics: [{ type: String }]
});

export default mongoose.model<ITopic>('Topic', topicSchema);