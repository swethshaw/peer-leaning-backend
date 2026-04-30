"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.leaveCohort = exports.joinCohort = exports.getCohortById = exports.getMyCohorts = exports.getCohorts = void 0;
const Cohort_1 = __importDefault(require("../models/Cohort"));
const User_1 = __importDefault(require("../models/User"));
const mongoose_1 = __importDefault(require("mongoose"));
// GET /api/cohorts
const getCohorts = async (req, res) => {
    try {
        const cohorts = await Cohort_1.default.find()
            .populate('mentor', 'name avatar')
            .lean();
        const userId = req.user?._id;
        const enriched = cohorts.map(c => ({
            ...c,
            activeMembers: c.members.length,
            isEnrolled: userId ? c.members.map(id => id.toString()).includes(userId) : false,
        }));
        res.json({ success: true, data: enriched });
    }
    catch {
        res.status(500).json({ success: false, message: 'Failed to fetch cohorts' });
    }
};
exports.getCohorts = getCohorts;
// GET /api/cohorts/me/enrolled
const getMyCohorts = async (req, res) => {
    try {
        const cohorts = await Cohort_1.default.find({ members: req.user?._id })
            .populate('mentor', 'name avatar')
            .lean();
        const enriched = cohorts.map(c => ({
            ...c,
            activeMembers: c.members.length,
            isEnrolled: true,
        }));
        res.json({ success: true, data: enriched });
    }
    catch {
        res.status(500).json({ success: false, message: 'Failed to fetch your cohorts' });
    }
};
exports.getMyCohorts = getMyCohorts;
// GET /api/cohorts/:id
const getCohortById = async (req, res) => {
    try {
        const cohort = await Cohort_1.default.findById(req.params.id)
            .populate('mentor', 'name avatar')
            .populate('courses', 'title description difficulty thumbnail')
            .lean();
        if (!cohort)
            return res.status(404).json({ success: false, message: 'Cohort not found' });
        const isEnrolled = req.user
            ? cohort.members.map(id => id.toString()).includes(req.user._id)
            : false;
        res.json({ success: true, data: { ...cohort, activeMembers: cohort.members.length, isEnrolled } });
    }
    catch {
        res.status(500).json({ success: false, message: 'Failed to fetch cohort' });
    }
};
exports.getCohortById = getCohortById;
// POST /api/cohorts/:id/join
const joinCohort = async (req, res) => {
    try {
        const cohort = await Cohort_1.default.findById(req.params.id);
        if (!cohort)
            return res.status(404).json({ success: false, message: 'Cohort not found' });
        const userId = new mongoose_1.default.Types.ObjectId(req.user?._id);
        if (cohort.members.some(id => id.equals(userId))) {
            return res.status(400).json({ success: false, message: 'Already a member' });
        }
        cohort.members.push(userId);
        await cohort.save();
        await User_1.default.findByIdAndUpdate(req.user?._id, {
            $addToSet: { enrolledCohorts: cohort._id },
            $inc: { points: 20 },
        });
        res.json({ success: true, message: 'Joined cohort!', data: { enrolled: true, activeMembers: cohort.members.length } });
    }
    catch {
        res.status(500).json({ success: false, message: 'Failed to join cohort' });
    }
};
exports.joinCohort = joinCohort;
// POST /api/cohorts/:id/leave
const leaveCohort = async (req, res) => {
    try {
        const cohort = await Cohort_1.default.findById(req.params.id);
        if (!cohort)
            return res.status(404).json({ success: false, message: 'Cohort not found' });
        cohort.members = cohort.members.filter(id => id.toString() !== req.user?._id);
        await cohort.save();
        await User_1.default.findByIdAndUpdate(req.user?._id, {
            $pull: { enrolledCohorts: cohort._id },
        });
        res.json({ success: true, message: 'Left cohort', data: { enrolled: false } });
    }
    catch {
        res.status(500).json({ success: false, message: 'Failed to leave cohort' });
    }
};
exports.leaveCohort = leaveCohort;
