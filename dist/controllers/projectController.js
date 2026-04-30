"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEnrolledProjects = exports.getHostedProjects = exports.createProject = exports.getProjectById = exports.getAllProjects = void 0;
const Project_1 = __importDefault(require("../models/Project"));
const getAllProjects = async (req, res) => {
    try {
        const { cohortId } = req.query;
        const filter = cohortId ? { cohortId } : {};
        const projects = await Project_1.default.find(filter)
            .populate('hostId', 'name avatar')
            .populate('cohortId', 'name')
            .sort({ createdAt: -1 });
        res.json({ success: true, data: projects });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getAllProjects = getAllProjects;
const getProjectById = async (req, res) => {
    try {
        const project = await Project_1.default.findById(req.params.id)
            .populate('hostId', 'name avatar')
            .populate('cohortId', 'name')
            .populate('roles.assignedUserId', 'name avatar');
        if (!project) {
            res.status(404).json({ success: false, message: 'Project not found' });
            return;
        }
        res.json({ success: true, data: project });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getProjectById = getProjectById;
const createProject = async (req, res) => {
    try {
        // Ideally, req.user would be populated by the auth middleware
        const hostId = req.user?._id || req.body.hostId;
        const project = await Project_1.default.create({
            ...req.body,
            hostId
        });
        res.status(201).json({ success: true, data: project });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
exports.createProject = createProject;
const getHostedProjects = async (req, res) => {
    try {
        const { userId } = req.params;
        const projects = await Project_1.default.find({ hostId: userId })
            .populate('cohortId', 'name')
            .sort({ createdAt: -1 });
        res.json({ success: true, data: projects });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getHostedProjects = getHostedProjects;
const getEnrolledProjects = async (req, res) => {
    try {
        const { userId } = req.params;
        // Find projects where the user is assigned to at least one role
        const projects = await Project_1.default.find({ 'roles.assignedUserId': userId })
            .populate('hostId', 'name avatar')
            .populate('cohortId', 'name')
            .sort({ createdAt: -1 });
        res.json({ success: true, data: projects });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getEnrolledProjects = getEnrolledProjects;
