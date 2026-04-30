"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateApplicationStatus = exports.getProjectApplications = exports.getUserApplications = exports.applyToProject = void 0;
const Application_1 = __importDefault(require("../models/Application"));
const Project_1 = __importDefault(require("../models/Project"));
const applyToProject = async (req, res) => {
    try {
        const { projectId } = req.params;
        const userId = req.user?._id || req.body.userId;
        // Check if application already exists
        const existingApp = await Application_1.default.findOne({ projectId, userId });
        if (existingApp) {
            res.status(400).json({ success: false, message: 'You have already applied to this project' });
            return;
        }
        const application = await Application_1.default.create({
            ...req.body,
            projectId,
            userId
        });
        res.status(201).json({ success: true, data: application });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
exports.applyToProject = applyToProject;
const getUserApplications = async (req, res) => {
    try {
        const { userId } = req.params;
        const applications = await Application_1.default.find({ userId })
            .populate('projectId', 'title status cohortId hostId')
            .sort({ appliedAt: -1 });
        res.json({ success: true, data: applications });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getUserApplications = getUserApplications;
const getProjectApplications = async (req, res) => {
    try {
        const { projectId } = req.params;
        const applications = await Application_1.default.find({ projectId })
            .populate('userId', 'name avatar skills')
            .sort({ appliedAt: -1 });
        res.json({ success: true, data: applications });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getProjectApplications = getProjectApplications;
const updateApplicationStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const application = await Application_1.default.findByIdAndUpdate(id, { status }, { new: true, runValidators: true });
        if (!application) {
            res.status(404).json({ success: false, message: 'Application not found' });
            return;
        }
        // If status is 'hired', we should ideally update the Project's role filled status
        if (status === 'hired') {
            await Project_1.default.updateOne({ _id: application.projectId, 'roles._id': application.roleId }, {
                $set: {
                    'roles.$.filled': true,
                    'roles.$.assignedUserId': application.userId
                },
                $inc: { currentParticipants: 1 }
            });
        }
        res.json({ success: true, data: application });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
exports.updateApplicationStatus = updateApplicationStatus;
