"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const Topic_1 = __importDefault(require("../models/Topic"));
const Question_1 = __importDefault(require("../models/Question"));
const router = express_1.default.Router();
router.get('/fix-db', async (req, res) => {
    try {
        const allQuestions = await Question_1.default.find().lean();
        let updatedCount = 0;
        for (const q of allQuestions) {
            if (typeof q.topicId === 'string') {
                await Question_1.default.updateOne({ _id: q._id }, { $set: { topicId: new mongoose_1.default.Types.ObjectId(q.topicId) } });
                updatedCount++;
            }
        }
        res.json({
            success: true,
            message: `Successfully fixed ${updatedCount} questions! Your database is now perfectly formatted.`
        });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
router.get('/fix-topics-db', async (req, res) => {
    try {
        const allTopics = await Topic_1.default.find().lean();
        let updatedCount = 0;
        for (const t of allTopics) {
            if (typeof t.cohortId === 'string') {
                await Topic_1.default.updateOne({ _id: t._id }, { $set: { cohortId: new mongoose_1.default.Types.ObjectId(t.cohortId) } });
                updatedCount++;
            }
        }
        res.json({
            success: true,
            message: `Successfully fixed ${updatedCount} topics! Your database is now perfectly relational.`
        });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
exports.default = router;
