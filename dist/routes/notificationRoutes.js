"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const notification_1 = __importDefault(require("../models/notification"));
const router = express_1.default.Router();
router.get('/user/:userId', async (req, res) => {
    try {
        const notifications = await notification_1.default.find({ userId: req.params.userId })
            .sort({ createdAt: -1 });
        res.json({ success: true, data: notifications });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
router.post('/', async (req, res) => {
    try {
        const { userId, cohort, type, title, message } = req.body;
        if (!userId || !cohort || !type || !title || !message) {
            res.status(400).json({ success: false, message: 'Missing required fields' });
            return;
        }
        const newNotification = new notification_1.default({
            userId,
            cohort,
            type,
            title,
            message
        });
        await newNotification.save();
        res.status(201).json({ success: true, data: newNotification });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
router.patch('/:id/read', async (req, res) => {
    try {
        const notification = await notification_1.default.findByIdAndUpdate(req.params.id, { isRead: true }, { new: true });
        if (!notification) {
            res.status(404).json({ success: false, message: 'Notification not found' });
            return;
        }
        res.json({ success: true, data: notification });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
router.patch('/user/:userId/read-all', async (req, res) => {
    try {
        await notification_1.default.updateMany({ userId: req.params.userId, isRead: false }, { $set: { isRead: true } });
        res.json({ success: true, message: 'All notifications marked as read' });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
router.delete('/:id', async (req, res) => {
    try {
        const notification = await notification_1.default.findByIdAndDelete(req.params.id);
        if (!notification) {
            res.status(404).json({ success: false, message: 'Notification not found' });
            return;
        }
        res.json({ success: true, message: 'Notification deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
exports.default = router;
