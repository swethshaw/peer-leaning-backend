import { Request, Response } from 'express';
import Task from '../models/Task';

export const getProjectTasks = async (req: Request, res: Response): Promise<void> => {
  try {
    const { projectId } = req.params;
    const tasks = await Task.find({ projectId })
      .populate('assigneeId', 'name avatar')
      .sort({ dueDate: 1 });
      
    res.json({ success: true, data: tasks });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getUserTasks = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const tasks = await Task.find({ assigneeId: userId })
      .populate('projectId', 'title status')
      .sort({ dueDate: 1 });
      
    res.json({ success: true, data: tasks });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateTaskStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const task = await Task.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );
    
    if (!task) {
      res.status(404).json({ success: false, message: 'Task not found' });
      return;
    }
    
    res.json({ success: true, data: task });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const submitTaskWork = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?._id || req.body.userId;
    
    const task = await Task.findById(id);
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
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};
