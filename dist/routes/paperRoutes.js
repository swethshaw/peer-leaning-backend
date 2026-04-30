"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Paper_1 = __importDefault(require("../models/Paper"));
const notification_1 = __importDefault(require("../models/notification"));
const router = express_1.default.Router();
router.get('/user/:userId', async (req, res) => {
    try {
        const papers = await Paper_1.default.find({ userId: req.params.userId }).sort({ createdAt: -1 });
        res.json({ success: true, data: papers });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
router.post('/', async (req, res) => {
    try {
        const { userId, title, cohort } = req.body;
        const existingPaper = await Paper_1.default.findOne({ userId, title: title.trim() });
        if (existingPaper) {
            res.status(400).json({ success: false, message: 'You already have a paper with this name. Please choose a unique name.' });
            return;
        }
        const newPaper = await Paper_1.default.create(req.body);
        try {
            await notification_1.default.create({
                userId,
                cohort: cohort || 'General',
                type: 'quiz',
                title: 'New Quiz Paper Created!',
                message: `Your paper "${title}" has been successfully configured and is ready.`,
            });
        }
        catch (notifError) {
            console.error('Failed to create paper notification:', notifError);
        }
        res.status(201).json({ success: true, data: newPaper });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
router.get('/:id', async (req, res) => {
    try {
        const paper = await Paper_1.default.findById(req.params.id);
        if (!paper) {
            res.status(404).json({ success: false, message: 'Paper not found' });
            return;
        }
        res.json({ success: true, data: paper });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
exports.default = router;
