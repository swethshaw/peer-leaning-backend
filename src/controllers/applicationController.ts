import { Request, Response } from 'express';
import Application from '../models/Application';
import Project from '../models/Project';

export const applyToProject = async (req: Request, res: Response): Promise<void> => {
  try {
    const { projectId } = req.params;
    const userId = (req as any).user?._id || req.body.userId;
    
    // Check if application already exists
    const existingApp = await Application.findOne({ projectId, userId });
    if (existingApp) {
      res.status(400).json({ success: false, message: 'You have already applied to this project' });
      return;
    }

    const application = await Application.create({
      ...req.body,
      projectId,
      userId
    });
    
    res.status(201).json({ success: true, data: application });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getUserApplications = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const applications = await Application.find({ userId })
      .populate('projectId', 'title status cohortId hostId')
      .sort({ appliedAt: -1 });
      
    res.json({ success: true, data: applications });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getProjectApplications = async (req: Request, res: Response): Promise<void> => {
  try {
    const { projectId } = req.params;
    const applications = await Application.find({ projectId })
      .populate('userId', 'name avatar skills')
      .sort({ appliedAt: -1 });
      
    res.json({ success: true, data: applications });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateApplicationStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const application = await Application.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );
    
    if (!application) {
      res.status(404).json({ success: false, message: 'Application not found' });
      return;
    }

    // If status is 'hired', we should ideally update the Project's role filled status
    if (status === 'hired') {
      await Project.updateOne(
        { _id: application.projectId, 'roles._id': application.roleId },
        { 
          $set: { 
            'roles.$.filled': true,
            'roles.$.assignedUserId': application.userId 
          },
          $inc: { currentParticipants: 1 }
        }
      );
    }
    
    res.json({ success: true, data: application });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};
