"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Room_1 = __importDefault(require("../models/Room"));
const router = express_1.default.Router();
router.post('/create', async (req, res) => {
    try {
        const { hostId, topicId, questions } = req.body;
        const code = Math.random().toString(36).substring(2, 8).toUpperCase();
        const newRoom = await Room_1.default.create({ code, hostId, topicId, questions, participants: [] });
        res.json({ success: true, data: newRoom });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
router.get('/active', async (req, res) => {
    try {
        const activeRooms = await Room_1.default.find({ status: 'waiting' }).populate('hostId', 'name avatarColor').populate('topicId', 'title').sort({ createdAt: -1 });
        res.json({ success: true, data: activeRooms });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
router.post('/join/:code', async (req, res) => {
    try {
        const { userId, name } = req.body;
        const room = await Room_1.default.findOne({ code: req.params.code.toUpperCase() }).populate('topicId', 'title');
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
            });
            await room.save();
        }
        res.json({ success: true, data: room });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
router.post('/host-action/:code', async (req, res) => {
    try {
        const { action, targetUserId } = req.body;
        const room = await Room_1.default.findOne({ code: req.params.code.toUpperCase() });
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
            room.participants = room.participants.filter(p => p.userId.toString() !== targetUserId);
        }
        else if (action === 'block') {
            const p = room.participants.find(p => p.userId.toString() === targetUserId);
            if (p)
                p.status = 'Blocked';
        }
        else if (action === 'end') {
            room.status = 'finished';
        }
        await room.save();
        res.json({ success: true, data: room });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
router.post('/submit/:code', async (req, res) => {
    try {
        const { userId, score, timeSpentSeconds } = req.body;
        const room = await Room_1.default.findOne({ code: req.params.code.toUpperCase() });
        if (!room) {
            throw new Error("Room not found");
        }
        const p = room.participants.find(p => p.userId.toString() === userId);
        if (p) {
            p.status = 'Submitted';
            p.score = score;
            p.timeSpentSeconds = timeSpentSeconds;
        }
        const stillActive = room.participants.filter(participant => participant.status === 'Joined' || participant.status === 'Playing');
        if (stillActive.length === 0 && room.participants.length > 0) {
            room.status = 'finished';
        }
        await room.save();
        res.json({ success: true, data: room });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
router.get('/:code', async (req, res) => {
    try {
        const room = await Room_1.default.findOne({ code: req.params.code.toUpperCase() });
        if (!room)
            throw new Error("Room not found");
        res.json({ success: true, data: room });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
router.get('/hosted/:userId', async (req, res) => {
    try {
        const rooms = await Room_1.default.find({ hostId: req.params.userId })
            .populate('topicId', 'title')
            .sort({ createdAt: -1 });
        res.json({ success: true, data: rooms });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
router.post('/warning/:code', async (req, res) => {
    try {
        const { userId } = req.body;
        const room = await Room_1.default.findOne({ code: req.params.code.toUpperCase() });
        if (!room)
            throw new Error("Room not found");
        const p = room.participants.find(p => p.userId.toString() === userId);
        if (p)
            p.warnings = (p.warnings || 0) + 1;
        await room.save();
        res.json({ success: true });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
router.delete('/:code', async (req, res) => {
    try {
        const code = req.params.code.toUpperCase();
        const deletedRoom = await Room_1.default.findOneAndDelete({ code });
        if (!deletedRoom) {
            res.status(404).json({ success: false, message: 'Room not found' });
            return;
        }
        res.json({ success: true, message: 'Room deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
router.post('/:code/delete', async (req, res) => {
    try {
        const code = req.params.code.toUpperCase();
        await Room_1.default.findOneAndDelete({ code });
        res.json({ success: true, message: 'Room deleted successfully via beacon' });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
router.post('/leave/:code', async (req, res) => {
    try {
        const { userId } = req.body;
        const room = await Room_1.default.findOne({ code: req.params.code.toUpperCase() });
        if (!room) {
            res.status(404).json({ success: false, message: 'Room not found' });
            return;
        }
        room.participants = room.participants.filter(p => p.userId.toString() !== userId);
        await room.save();
        res.json({ success: true, data: room });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
router.post('/:code/host-offline', async (req, res) => {
    try {
        const code = req.params.code.toUpperCase();
        setTimeout(async () => {
            const room = await Room_1.default.findOne({ code });
            if (room && room.status === 'waiting') {
                await Room_1.default.findOneAndDelete({ code });
                console.log(`Room ${code} deleted after 15 mins of host inactivity.`);
            }
        }, 15 * 60 * 1000);
        res.json({ success: true, message: '15-minute disconnect timer started' });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
exports.default = router;
