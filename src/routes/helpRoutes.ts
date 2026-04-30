import express, { Request, Response, Router } from 'express';
import HelpTicket from '../models/HelpTicket';

const router: Router = express.Router();

router.post('/ticket', async (req: Request, res: Response): Promise<void> => {
  try {
    const ticket = await HelpTicket.create(req.body);
    res.status(201).json({ success: true, data: ticket });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/tickets', async (req: Request, res: Response) => {
  try {
    const tickets = await HelpTicket.find().sort({ createdAt: -1 });
    res.json({ success: true, data: tickets });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/tickets/:id/like', async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;
    const ticket = await HelpTicket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });

    const index = ticket.likes.indexOf(userId);
    if (index === -1) ticket.likes.push(userId); 
    else ticket.likes.splice(index, 1); 

    await ticket.save();
    res.json({ success: true, data: ticket });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/tickets/:id/comment', async (req: Request, res: Response) => {
  try {
    const { userId, userName, text } = req.body;
    const ticket = await HelpTicket.findByIdAndUpdate(
      req.params.id,
      { $push: { comments: { userId, userName, text } } },
      { new: true }
    );
    res.json({ success: true, data: ticket });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;