import express, { Request, Response, Router } from 'express';
import Room from '../models/Room';

const router: Router = express.Router();

router.post('/create', async (req: Request, res: Response) => {
  try {
    const { hostId, topicId, questions } = req.body;
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    const newRoom = await Room.create({ code, hostId, topicId, questions, participants: [] });
    res.json({ success: true, data: newRoom });
  } catch (error: any) { res.status(500).json({ success: false, error: error.message }); }
});

router.get('/active', async (req: Request, res: Response) => {
  try {
    const activeRooms = await Room.find({ status: 'waiting' }).populate('hostId', 'name avatarColor').populate('topicId', 'title').sort({ createdAt: -1 });
    res.json({ success: true, data: activeRooms });
  } catch (error: any) { res.status(500).json({ success: false, error: error.message }); }
});

router.post('/join/:code', async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, name } = req.body;
    const room = await Room.findOne({ code: (req.params.code as string).toUpperCase() }).populate('topicId', 'title');

    if (!room) { 
      res.status(404).json({ success: false, message: 'Room not found. Check your code.' }); 
      return; 
    }
    
    const exists = room.participants.find(p => p.userId.toString() === userId);
    if (!exists && room.status !== 'waiting') {
      res.status(400).json({ success: false, message: 'This room is closed. The quiz has already started.' });
      return;
    }
    if (!exists && room.status === 'waiting') {
      room.participants.push({ 
        userId, 
        name, 
        status: 'Joined', 
        score: 0, 
        timeSpentSeconds: 0,
        warnings: 0 
      } as any);
      await room.save();
    }

    res.json({ success: true, data: room });
  } catch (error: any) { 
    res.status(500).json({ success: false, error: error.message }); 
  }
});

router.post('/host-action/:code', async (req: Request, res: Response) => {
  try {
    const { action, targetUserId } = req.body;
    const room = await Room.findOne({ code: (req.params.code as string).toUpperCase() });
    
    if (!room) {
      throw new Error("Room not found");
    }

    if (action === 'start') {
      room.status = 'playing';
      room.participants.forEach(p => {
        if (p.status === 'Joined') {
          p.status = 'Playing';
        }
      });
    } 
    else if (action === 'kick') {
      room.participants = room.participants.filter(
        p => p.userId.toString() !== targetUserId
      ) as any; 
    } 
    else if (action === 'block') {
      const p = room.participants.find(p => p.userId.toString() === targetUserId);
      if (p) p.status = 'Blocked';
    } 
    else if (action === 'end') {
      room.status = 'finished';
    }

    await room.save();
    res.json({ success: true, data: room });
    
  } catch (error: any) { 
    res.status(500).json({ success: false, error: error.message }); 
  }
});

router.post('/submit/:code', async (req: Request, res: Response) => {
  try {
    const { userId, score, timeSpentSeconds } = req.body;
    const room = await Room.findOne({ code: (req.params.code as string).toUpperCase() });
    
    if (!room) {
      throw new Error("Room not found");
    }
    const p = room.participants.find(p => p.userId.toString() === userId);
    if (p) {
      p.status = 'Submitted';
      p.score = score;
      p.timeSpentSeconds = timeSpentSeconds;
    }
    const stillActive = room.participants.filter(
      participant => participant.status === 'Joined' || participant.status === 'Playing'
    );
    if (stillActive.length === 0 && room.participants.length > 0) {
      room.status = 'finished';
    }

    await room.save();
    res.json({ success: true, data: room });
  } catch (error: any) { 
    res.status(500).json({ success: false, error: error.message }); 
  }
});

router.get('/:code', async (req: Request, res: Response) => {
  try {
    const room = await Room.findOne({ code: (req.params.code as string).toUpperCase() });
    if (!room) throw new Error("Room not found");
    res.json({ success: true, data: room });
  } catch (error: any) { res.status(500).json({ success: false, error: error.message }); }
});

router.get('/hosted/:userId', async (req: Request, res: Response) => {
  try {
    const rooms = await Room.find({ hostId: req.params.userId })
      .populate('topicId', 'title')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: rooms });
  } catch (error: any) { 
    res.status(500).json({ success: false, error: error.message }); 
  }
});

router.post('/warning/:code', async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;
    const room = await Room.findOne({ code: (req.params.code as string).toUpperCase() });
    if (!room) throw new Error("Room not found");

    const p = room.participants.find(p => p.userId.toString() === userId);
    if (p) p.warnings = (p.warnings || 0) + 1;

    await room.save();
    
    res.json({ success: true });
  } catch (error: any) { 
    res.status(500).json({ success: false, error: error.message }); 
  }
});

router.delete('/:code', async (req: Request, res: Response): Promise<void> => {
  try {
    const code = (req.params.code as string).toUpperCase();
    const deletedRoom = await Room.findOneAndDelete({ code });
    
    if (!deletedRoom) {
      res.status(404).json({ success: false, message: 'Room not found' });
      return;
    }
    
    res.json({ success: true, message: 'Room deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/:code/delete', async (req: Request, res: Response): Promise<void> => {
  try {
    const code = (req.params.code as string).toUpperCase();
    await Room.findOneAndDelete({ code });
    
    res.json({ success: true, message: 'Room deleted successfully via beacon' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/leave/:code', async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;
    const room = await Room.findOne({ code: (req.params.code as string).toUpperCase() });
    
    if (!room) {
      res.status(404).json({ success: false, message: 'Room not found' });
      return;
    }

    room.participants = room.participants.filter(
      p => p.userId.toString() !== userId
    ) as any;
    
    await room.save();
    res.json({ success: true, data: room });
  } catch (error: any) { 
    res.status(500).json({ success: false, error: error.message }); 
  }
});

router.post('/:code/host-offline', async (req: Request, res: Response) => {
  try {
    const code = (req.params.code as string).toUpperCase();
    setTimeout(async () => {
      const room = await Room.findOne({ code });
      if (room && room.status === 'waiting') {
        await Room.findOneAndDelete({ code });
        console.log(`Room ${code} deleted after 15 mins of host inactivity.`);
      }
    }, 15 * 60 * 1000); 

    res.json({ success: true, message: '15-minute disconnect timer started' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;