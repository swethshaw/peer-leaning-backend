"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCourseProgress = exports.completeLesson = exports.enrollCourse = exports.getCourseById = exports.getMyCourses = exports.getCourses = void 0;
const Course_1 = __importDefault(require("../models/Course"));
const Progress_1 = __importDefault(require("../models/Progress"));
const User_1 = __importDefault(require("../models/User"));
const mongoose_1 = __importDefault(require("mongoose"));
// GET /api/courses
const getCourses = async (req, res) => {
    try {
        const { page = 1, limit = 20, category, search, difficulty } = req.query;
        const filter = {};
        if (category)
            filter.category = category;
        if (difficulty)
            filter.difficulty = difficulty;
        if (search)
            filter.title = { $regex: search, $options: 'i' };
        const courses = await Course_1.default.find(filter)
            .select('-modules.lessons.url')
            .skip((+page - 1) * +limit)
            .limit(+limit)
            .lean();
        const total = await Course_1.default.countDocuments(filter);
        res.json({ success: true, data: courses, total, page: +page, pages: Math.ceil(total / +limit) });
    }
    catch {
        res.status(500).json({ success: false, message: 'Failed to fetch courses' });
    }
};
exports.getCourses = getCourses;
// GET /api/courses/me/enrolled
const getMyCourses = async (req, res) => {
    try {
        const user = await User_1.default.findById(req.user?._id).populate('enrolledCourses').lean();
        const courseIds = user?.enrolledCourses ?? [];
        const courses = await Course_1.default.find({ _id: { $in: courseIds } })
            .select('title description difficulty category thumbnail tags totalModules totalLessons')
            .lean();
        // Attach progress
        const progresses = await Progress_1.default.find({
            user: req.user?._id,
            course: { $in: courseIds },
        }).lean();
        const progMap = Object.fromEntries(progresses.map(p => [p.course.toString(), p]));
        const enriched = courses.map(c => ({
            ...c,
            isEnrolled: true,
            progressPercent: progMap[c._id.toString()]?.progressPercent ?? 0,
            completedLessons: progMap[c._id.toString()]?.completedLessons.length ?? 0,
        }));
        res.json({ success: true, data: enriched });
    }
    catch {
        res.status(500).json({ success: false, message: 'Failed to fetch enrolled courses' });
    }
};
exports.getMyCourses = getMyCourses;
// GET /api/courses/:id
const getCourseById = async (req, res) => {
    try {
        const course = await Course_1.default.findById(req.params.id).lean();
        if (!course)
            return res.status(404).json({ success: false, message: 'Course not found' });
        const isEnrolled = course.enrolledStudents
            .map(id => id.toString())
            .includes(req.user?._id ?? '');
        let progressPercent = 0;
        let completedLessons = [];
        if (isEnrolled) {
            const prog = await Progress_1.default.findOne({ user: req.user?._id, course: course._id }).lean();
            progressPercent = prog?.progressPercent ?? 0;
            completedLessons = prog?.completedLessons ?? [];
        }
        // Mark completed lessons
        const enrichedModules = course.modules.map(m => ({
            ...m,
            lessons: m.lessons.map(l => ({
                ...l,
                isCompleted: completedLessons.includes(l._id.toString()),
            }))
        }));
        res.json({
            success: true,
            data: { ...course, modules: enrichedModules, isEnrolled, progressPercent, completedLessons: completedLessons.length }
        });
    }
    catch {
        res.status(500).json({ success: false, message: 'Failed to fetch course' });
    }
};
exports.getCourseById = getCourseById;
// POST /api/courses/:id/enroll
const enrollCourse = async (req, res) => {
    try {
        const course = await Course_1.default.findById(req.params.id);
        if (!course)
            return res.status(404).json({ success: false, message: 'Course not found' });
        const userId = new mongoose_1.default.Types.ObjectId(req.user?._id);
        if (course.enrolledStudents.some(id => id.equals(userId))) {
            return res.status(400).json({ success: false, message: 'Already enrolled' });
        }
        course.enrolledStudents.push(userId);
        await course.save();
        await User_1.default.findByIdAndUpdate(req.user?._id, {
            $addToSet: { enrolledCourses: course._id },
            $inc: { points: 10 },
        });
        await Progress_1.default.create({ user: req.user?._id, course: course._id });
        res.json({ success: true, message: 'Enrolled successfully', data: { enrolled: true } });
    }
    catch {
        res.status(500).json({ success: false, message: 'Enrollment failed' });
    }
};
exports.enrollCourse = enrollCourse;
// PATCH /api/courses/:id/lessons/:lessonId/complete
const completeLesson = async (req, res) => {
    try {
        const { id: courseId, lessonId } = req.params;
        const course = await Course_1.default.findById(courseId).lean();
        if (!course)
            return res.status(404).json({ success: false, message: 'Course not found' });
        const prog = await Progress_1.default.findOneAndUpdate({ user: req.user?._id, course: courseId }, { $addToSet: { completedLessons: lessonId }, lastAccessedAt: new Date() }, { new: true, upsert: true });
        const totalLessons = course.totalLessons || 1;
        const progressPercent = Math.round((prog.completedLessons.length / totalLessons) * 100);
        prog.progressPercent = progressPercent;
        await prog.save();
        // Award points per lesson
        await User_1.default.findByIdAndUpdate(req.user?._id, { $inc: { points: 5 } });
        res.json({ success: true, data: { progressPercent, completedLessons: prog.completedLessons.length } });
    }
    catch {
        res.status(500).json({ success: false, message: 'Failed to mark lesson complete' });
    }
};
exports.completeLesson = completeLesson;
// GET /api/courses/:id/progress
const getCourseProgress = async (req, res) => {
    try {
        const prog = await Progress_1.default.findOne({ user: req.user?._id, course: req.params.id }).lean();
        res.json({ success: true, data: prog ?? { progressPercent: 0, completedLessons: [] } });
    }
    catch {
        res.status(500).json({ success: false, message: 'Failed to fetch progress' });
    }
};
exports.getCourseProgress = getCourseProgress;
