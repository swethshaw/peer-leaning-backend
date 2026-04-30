import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  avatar?: string;
  avatarColor: string;
  role: 'student' | 'mentor' | 'admin';
  points: number;
  badges: mongoose.Types.ObjectId[];
  enrolledCourses: mongoose.Types.ObjectId[];
  enrolledCohorts: mongoose.Types.ObjectId[];
  bookmarks: mongoose.Types.ObjectId[];
  gender?: string;
  birthday?: Date;
  work?: string;
  education?: string;
  experience?: string;
  skills?: string[];
  socialLinks?: {
    github?: string;
    linkedin?: string;
    twitter?: string;
  };
  createdAt: Date;
  comparePassword(candidate: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String },
    avatar: { type: String },
    avatarColor: { type: String, default: 'bg-violet-500' },
    role: { type: String, enum: ['student', 'mentor', 'admin'], default: 'student' },
    points: { type: Number, default: 0 },
    badges: [{ type: Schema.Types.ObjectId, ref: 'Badge' }],
    enrolledCourses: [{ type: Schema.Types.ObjectId, ref: 'Course' }],
    enrolledCohorts: [{ type: Schema.Types.ObjectId, ref: 'Cohort' }],
    bookmarks: [{ type: Schema.Types.ObjectId, ref: 'Course' }],
    gender: { type: String },
    birthday: { type: Date },
    work: { type: String },
    education: { type: String },
    experience: { type: String },
    skills: [{ type: String }],
    socialLinks: {
      github: { type: String },
      linkedin: { type: String },
      twitter: { type: String }
    }
  },
  { timestamps: true }
);

// Hash password before save
UserSchema.pre('save', async function () {
  if (!this.isModified('password') || !this.password) return;
  this.password = await bcrypt.hash(this.password, 12);
});

UserSchema.methods.comparePassword = async function (candidate: string) {
  if (!this.password) return false;
  return bcrypt.compare(candidate, this.password);
};

// Remove password from JSON
UserSchema.set('toJSON', {
  transform: (_doc, ret) => { delete ret.password; return ret }
});

export default mongoose.model<IUser>('User', UserSchema);