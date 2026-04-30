"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.submitTaskWork = exports.updateTaskStatus = exports.getUserTasks = exports.getProjectTasks = void 0;
const Task_1 = __importDefault(require("../models/Task"));
const getProjectTasks = async (req, res) => {
    try {
        const { projectId } = req.params;
        const tasks = await Task_1.default.find({ projectId })
            .populate('assigneeId', 'name avatar')
            .sort({ dueDate: 1 });
        res.json({ success: true, data: tasks });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getProjectTasks = getProjectTasks;
const getUserTasks = async (req, res) => {
    try {
        const { userId } = req.params;
        const tasks = await Task_1.default.find({ assigneeId: userId })
            .populate('projectId', 'title status')
            .sort({ dueDate: 1 });
        res.json({ success: true, data: tasks });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getUserTasks = getUserTasks;
const updateTaskStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const task = await Task_1.default.findByIdAndUpdate(id, { status }, { new: true, runValidators: true });
        if (!task) {
            res.status(404).json({ success: false, message: 'Task not found' });
            return;
        }
        res.json({ success: true, data: task });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
exports.updateTaskStatus = updateTaskStatus;
const submitTaskWork = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?._id || req.body.userId;
        const task = await Task_1.default.findById(id);
        if (!task) {
            res.status(404).json({ success: false, message: 'Task not found' });
            return;
        }
        const newSubmission = {
            ...req.body,
            userId,
            version: task.submissions.length + 1
        };
        task.submissions.push(newSubmission);
        // Automatically move task to in-review status when submitted
        task.status = 'in-review';
        await task.save();
        res.status(201).json({ success: true, data: task });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
exports.submitTaskWork = submitTaskWork;
