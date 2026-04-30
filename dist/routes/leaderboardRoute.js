"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Result_1 = __importDefault(require("../models/Result"));
const node_cache_1 = __importDefault(require("node-cache"));
const cache = new node_cache_1.default({ stdTTL: 300 });
const router = express_1.default.Router();
router.get('/global', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 50;
        const cacheKey = `leaderboard_global_${limit}`;
        const cachedData = cache.get(cacheKey);
        if (cachedData) {
            res.json({ success: true, data: cachedData });
            return;
        }
        const leaderboard = await Result_1.default.aggregate([
            {
                $match: {
                    $or: [
                        { customPaperId: { $exists: false } },
                        { customPaperId: null }
                    ]
                }
            },
            { $unwind: "$review" },
            {
                $match: {
                    "review.userAnswerIndex": { $ne: null },
                    $expr: { $eq: ["$review.userAnswerIndex", "$review.correctAnswerIndex"] }
                }
            },
            {
                $group: {
                    _id: { userId: "$userId", question: "$review.question" }
                }
            },
            {
                $lookup: {
                    from: "questions",
                    localField: "_id.question",
                    foreignField: "question",
                    as: "questionDetails"
                }
            },
            { $unwind: "$questionDetails" },
            {
                $addFields: {
                    points: {
                        $switch: {
                            branches: [
                                { case: { $eq: ["$questionDetails.difficulty", "Easy"] }, then: 1 },
                                { case: { $eq: ["$questionDetails.difficulty", "Medium"] }, then: 3 },
                                { case: { $eq: ["$questionDetails.difficulty", "Hard"] }, then: 5 }
                            ],
                            default: 1
                        }
                    }
                }
            },
            {
                $group: {
                    _id: "$_id.userId",
                    totalPoints: { $sum: "$points" }
                }
            },
            { $sort: { totalPoints: -1 } },
            {
                $setWindowFields: {
                    sortBy: { totalPoints: -1 },
                    output: { rank: { $documentNumber: {} } }
                }
            },
            { $limit: limit },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'userDetails'
                }
            },
            { $unwind: '$userDetails' },
            {
                $project: {
                    id: '$_id',
                    name: '$userDetails.name',
                    points: '$totalPoints',
                    rank: 1
                }
            }
        ]);
        cache.set(cacheKey, leaderboard);
        res.json({ success: true, data: leaderboard });
    }
    catch (error) {
        console.error("Global Leaderboard Error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});
router.get('/cohort/:cohortName', async (req, res) => {
    try {
        const { cohortName } = req.params;
        const limit = parseInt(req.query.limit) || 50;
        const cacheKey = `leaderboard_${cohortName}_${limit}`;
        const cachedData = cache.get(cacheKey);
        if (cachedData) {
            res.json({ success: true, data: cachedData });
            return;
        }
        const leaderboard = await Result_1.default.aggregate([
            {
                $match: {
                    cohort: cohortName,
                    $or: [
                        { customPaperId: { $exists: false } },
                        { customPaperId: null }
                    ]
                }
            },
            { $unwind: "$review" },
            {
                $match: {
                    "review.userAnswerIndex": { $ne: null },
                    $expr: { $eq: ["$review.userAnswerIndex", "$review.correctAnswerIndex"] }
                }
            },
            { $group: { _id: { userId: "$userId", question: "$review.question" } } },
            {
                $lookup: {
                    from: "questions",
                    localField: "_id.question",
                    foreignField: "question",
                    as: "questionDetails"
                }
            },
            { $unwind: "$questionDetails" },
            {
                $addFields: {
                    points: {
                        $switch: {
                            branches: [
                                { case: { $eq: ["$questionDetails.difficulty", "Easy"] }, then: 1 },
                                { case: { $eq: ["$questionDetails.difficulty", "Medium"] }, then: 3 },
                                { case: { $eq: ["$questionDetails.difficulty", "Hard"] }, then: 5 }
                            ],
                            default: 1
                        }
                    }
                }
            },
            { $group: { _id: "$_id.userId", totalPoints: { $sum: "$points" } } },
            { $sort: { totalPoints: -1 } },
            {
                $setWindowFields: {
                    sortBy: { totalPoints: -1 },
                    output: { rank: { $documentNumber: {} } }
                }
            },
            { $limit: limit },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'userDetails'
                }
            },
            { $unwind: '$userDetails' },
            {
                $project: {
                    id: '$_id',
                    name: '$userDetails.name',
                    points: '$totalPoints',
                    rank: 1,
                    cohort: cohortName
                }
            }
        ]);
        cache.set(cacheKey, leaderboard);
        res.json({ success: true, data: leaderboard });
    }
    catch (error) {
        console.error("Cohort Leaderboard Error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});
exports.default = router;
