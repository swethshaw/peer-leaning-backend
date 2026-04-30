"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const UserSchema = new mongoose_1.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String },
    avatar: { type: String },
    avatarColor: { type: String, default: 'bg-violet-500' },
    role: { type: String, enum: ['student', 'mentor', 'admin'], default: 'student' },
    points: { type: Number, default: 0 },
    badges: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'Badge' }],
    enrolledCourses: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'Course' }],
    enrolledCohorts: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'Cohort' }],
    bookmarks: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'Course' }],
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
}, { timestamps: true });
// Hash password before save
UserSchema.pre('save', async function () {
    if (!this.isModified('password') || !this.password)
        return;
    this.password = await bcryptjs_1.default.hash(this.password, 12);
});
UserSchema.methods.comparePassword = async function (candidate) {
    if (!this.password)
        return false;
    return bcryptjs_1.default.compare(candidate, this.password);
};
// Remove password from JSON
UserSchema.set('toJSON', {
    transform: (_doc, ret) => { delete ret.password; return ret; }
});
exports.default = mongoose_1.default.model('User', UserSchema);
