"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeBookmark = exports.addBookmark = exports.getBookmarks = exports.getCohortLeaderboard = exports.getGlobalLeaderboard = void 0;
const User_1 = __importDefault(require("../models/User"));
const Course_1 = __importDefault(require("../models/Course"));
// ─── Leaderboard ─────────────────────────────────────────────────────────────
// GET /api/leaderboard
const getGlobalLeaderboard = async (_req, res) => {
    try {
        const users = await User_1.default.find({ role: 'student' })
            .select('name avatar points badges enrolledCourses')
            .sort({ points: -1 })
            .limit(50)
            .lean();
        const entries = users.map((u, i) => ({
            rank: i + 1,
            user: { _id: u._id, name: u.name, avatar: u.avatar },
            points: u.points,
            coursesCompleted: 0, // could be enriched from Progress
            badges: u.badges.length,
        }));
        res.json({ success: true, data: entries });
    }
    catch {
        res.status(500).json({ success: false, message: 'Failed to fetch leaderboard' });
    }
};
exports.getGlobalLeaderboard = getGlobalLeaderboard;
// GET /api/leaderboard/cohort/:cohortId
const getCohortLeaderboard = async (req, res) => {
    try {
        const users = await User_1.default.find({ enrolledCohorts: req.params.cohortId, role: 'student' })
            .select('name avatar points badges')
            .sort({ points: -1 })
            .lean();
        const entries = users.map((u, i) => ({
            rank: i + 1,
            user: { _id: u._id, name: u.name, avatar: u.avatar },
            points: u.points,
            badges: u.badges.length,
        }));
        res.json({ success: true, data: entries });
    }
    catch {
        res.status(500).json({ success: false, message: 'Failed to fetch cohort leaderboard' });
    }
};
exports.getCohortLeaderboard = getCohortLeaderboard;
// ─── Bookmarks ────────────────────────────────────────────────────────────────
// GET /api/bookmarks
const getBookmarks = async (req, res) => {
    try {
        const user = await User_1.default.findById(req.user?._id).populate({
            path: 'bookmarks',
            select: 'title description difficulty category thumbnail tags totalModules totalLessons',
        }).lean();
        res.json({ success: true, data: user?.bookmarks ?? [] });
    }
    catch {
        res.status(500).json({ success: false, message: 'Failed to fetch bookmarks' });
    }
};
exports.getBookmarks = getBookmarks;
// POST /api/bookmarks
const addBookmark = async (req, res) => {
    try {
        const { courseId } = req.body;
        if (!courseId)
            return res.status(400).json({ success: false, message: 'courseId required' });
        const course = await Course_1.default.findById(courseId);
        if (!course)
            return res.status(404).json({ success: false, message: 'Course not found' });
        await User_1.default.findByIdAndUpdate(req.user?._id, { $addToSet: { bookmarks: courseId } });
        res.json({ success: true, message: 'Bookmarked' });
    }
    catch {
        res.status(500).json({ success: false, message: 'Failed to add bookmark' });
    }
};
exports.addBookmark = addBookmark;
// DELETE /api/bookmarks/:courseId
const removeBookmark = async (req, res) => {
    try {
        await User_1.default.findByIdAndUpdate(req.user?._id, { $pull: { bookmarks: req.params.courseId } });
        res.json({ success: true, message: 'Bookmark removed' });
    }
    catch {
        res.status(500).json({ success: false, message: 'Failed to remove bookmark' });
    }
};
exports.removeBookmark = removeBookmark;
