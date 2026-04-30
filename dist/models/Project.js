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
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const RoleSchema = new mongoose_1.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    skillsRequired: [{ type: String }],
    filled: { type: Boolean, default: false },
    assignedUserId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
});
const MilestoneSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    status: { type: String, enum: ['completed', 'in-progress', 'pending'], default: 'pending' },
    assigneeId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
    progress: { type: Number, default: 0 },
});
const ProjectSchema = new mongoose_1.Schema({
    title: { type: String, required: true, trim: true },
    pitch: { type: String, required: true },
    description: { type: String, required: true },
    problemStatement: { type: String, required: true },
    techStack: [{ type: String }],
    cohortId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Cohort', required: true },
    hostId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    roles: [RoleSchema],
    status: { type: String, enum: ['hiring', 'in-progress', 'completed', 'archived'], default: 'hiring' },
    progress: { type: Number, default: 0 },
    milestones: [MilestoneSchema],
    deadline: { type: Date, required: true },
    maxParticipants: { type: Number, default: 5 },
    currentParticipants: { type: Number, default: 0 },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});
exports.default = mongoose_1.default.model('Project', ProjectSchema);
