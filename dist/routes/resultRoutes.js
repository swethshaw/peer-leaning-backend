"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const Result_1 = __importDefault(require("../models/Result"));
const notification_1 = __importDefault(require("../models/notification"));
const router = express_1.default.Router();
router.post('/', async (req, res) => {
    try {
        const newResult = await Result_1.default.create(req.body);
        try {
            await notification_1.default.create({
                userId: req.body.userId,
                cohort: req.body.cohort,
                type: 'result',
                title: 'Quiz Result Saved!',
                message: 'Your recent quiz attempt has been evaluated and saved successfully.',
            });
        }
        catch (notifError) {
            console.error('Failed to create result notification:', notifError);
        }
        try {
            if (req.body.cohort) {
                const newRankings = await Result_1.default.aggregate([
                    { $match: { cohort: req.body.cohort } },
                    { $group: { _id: '$userId', totalPoints: { $sum: '$score' } } },
                    { $sort: { totalPoints: -1 } },
                    { $limit: 3 }
                ]);
                const isTop3 = newRankings.some(user => user._id.toString() === req.body.userId);
                if (isTop3) {
                    await notification_1.default.create({
                        userId: req.body.userId,
                        cohort: req.body.cohort,
                        type: 'achievement',
                        title: 'Top 3 Leaderboard!',
                        message: 'Incredible! Your recent score just bumped you into the top 3 of your cohort!',
                    });
                }
            }
        }
        catch (achievementError) {
            console.error('Failed to process achievement notification:', achievementError);
        }
        res.status(201).json({ success: true, data: newResult });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
router.get('/user/:userId', async (req, res) => {
    try {
        const results = await Result_1.default.find({ userId: req.params.userId })
            .populate('topicId', 'title category')
            .sort({ createdAt: -1 });
        res.json({ success: true, data: results });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
router.get('/activity/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const daysAgo = new Date();
        daysAgo.setDate(daysAgo.getDate() - 36);
        const activity = await Result_1.default.aggregate([
            {
                $match: {
                    userId: new mongoose_1.default.Types.ObjectId(userId),
                    createdAt: { $gte: daysAgo }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    totalScore: { $sum: "$score" },
                    quizzesTaken: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);
        res.json({ success: true, data: activity });
    }
    catch (error) {
        console.error("Activity Heatmap Error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});
exports.default = router;
