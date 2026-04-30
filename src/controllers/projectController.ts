import { Request, Response } from 'express';
import Project from '../models/Project';

export const getAllProjects = async (req: Request, res: Response): Promise<void> => {
  try {
    const { cohortId } = req.query;
    const filter = cohortId ? { cohortId } : {};
    
    const projects = await Project.find(filter)
      .populate('hostId', 'name avatar')
      .populate('cohortId', 'name')
      .sort({ createdAt: -1 });
      
    res.json({ success: true, data: projects });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getProjectById = async (req: Request, res: Response): Promise<void> => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('hostId', 'name avatar')
      .populate('cohortId', 'name')
      .populate('roles.assignedUserId', 'name avatar');
      
    if (!project) {
      res.status(404).json({ success: false, message: 'Project not found' });
      return;
    }
    
    res.json({ success: true, data: project });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createProject = async (req: Request, res: Response): Promise<void> => {
  try {
    // Ideally, req.user would be populated by the auth middleware
    const hostId = (req as any).user?._id || req.body.hostId; 
    
    const project = await Project.create({
      ...req.body,
      hostId
    });
    
    res.status(201).json({ success: true, data: project });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getHostedProjects = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const projects = await Project.find({ hostId: userId })
      .populate('cohortId', 'name')
      .sort({ createdAt: -1 });
      
    res.json({ success: true, data: projects });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getEnrolledProjects = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    // Find projects where the user is assigned to at least one role
    const projects = await Project.find({ 'roles.assignedUserId': userId })
      .populate('hostId', 'name avatar')
      .populate('cohortId', 'name')
      .sort({ createdAt: -1 });
      
    res.json({ success: true, data: projects });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
export const getProjectActivities = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?._id || req.params.userId;
    
    // 1. Find all projects user is involved in
    const userProjects = await Project.find({
      $or: [
        { hostId: userId },
        { 'roles.assignedUserId': userId }
      ]
    }).select('_id');
    
    const projectIds = userProjects.map(p => p._id);
    
    // 2. Fetch activities for these projects
    const ProjectActivity = (await import('../models/ProjectActivity')).default;
    const activities = await ProjectActivity.find({ projectId: { $in: projectIds } })
      .sort({ timestamp: -1 })
      .limit(50)
      .lean();
      
    // Transform read status based on current user
    const transformed = activities.map(a => ({
      ...a,
      id: a._id,
      read: a.readBy.some((id: any) => id.toString() === userId.toString())
    }));
      
    res.json({ success: true, data: transformed });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
