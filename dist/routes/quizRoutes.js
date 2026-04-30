"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const Cohort_1 = __importDefault(require("../models/Cohort"));
const Topic_1 = __importDefault(require("../models/Topic"));
const Question_1 = __importDefault(require("../models/Question"));
const Result_1 = __importDefault(require("../models/Result"));
const router = express_1.default.Router();
router.get('/dashboard/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const [cohorts, topics, userResults, questionCountsAgg] = await Promise.all([
            Cohort_1.default.find(),
            Topic_1.default.find(),
            Result_1.default.find({
                userId,
                $or: [
                    { customPaperId: { $exists: false } },
                    { customPaperId: null }
                ]
            }),
            Question_1.default.aggregate([
                { $group: { _id: "$topicId", count: { $sum: 1 } } }
            ])
        ]);
        const questionCountMap = new Map();
        questionCountsAgg.forEach(q => questionCountMap.set(q._id.toString(), q.count));
        const resultsByTopic = {};
        userResults.forEach(r => {
            const tId = r.topicId.toString();
            if (!resultsByTopic[tId])
                resultsByTopic[tId] = [];
            resultsByTopic[tId].push(r);
        });
        const allData = {};
        cohorts.forEach(c => { allData[c.name] = []; });
        for (const topic of topics) {
            const topicIdStr = topic._id.toString();
            const totalQuestions = questionCountMap.get(topicIdStr) || 0;
            const topicResults = resultsByTopic[topicIdStr] || [];
            const correctQuestionSet = new Set();
            topicResults.forEach(result => {
                if (result.review && result.review.length > 0) {
                    result.review.forEach((q) => {
                        if (q.userAnswerIndex !== null && q.userAnswerIndex === q.correctAnswerIndex) {
                            correctQuestionSet.add(q.question);
                        }
                    });
                }
            });
            const solvedQuestions = correctQuestionSet.size;
            const topicData = { ...topic.toObject(), totalQuestions, solvedQuestions };
            const cohort = cohorts.find(c => c._id.toString() === topic.cohortId.toString());
            if (cohort)
                allData[cohort.name].push(topicData);
        }
        res.json({ success: true, data: allData });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
router.post('/generate-quiz', async (req, res) => {
    try {
        const { topicId, subTopics, difficulty, limit, userId, subMode, questionType } = req.body;
        if (!topicId || !userId) {
            res.status(400).json({ success: false, message: 'topicId and userId are required' });
            return;
        }
        let matchQuery = { topicId: new mongoose_1.default.Types.ObjectId(topicId) };
        if (subTopics && Array.isArray(subTopics) && subTopics.length > 0 && !subTopics.includes('All')) {
            matchQuery.subTopic = { $in: subTopics };
        }
        if (difficulty && Array.isArray(difficulty) && difficulty.length > 0 && !difficulty.includes('Mix')) {
            matchQuery.difficulty = { $in: difficulty };
        }
        const questionLimit = parseInt(limit) || 30;
        let rawQuestions = await Question_1.default.find(matchQuery).lean();
        const results = await Result_1.default.find({ userId, topicId }).sort({ createdAt: 1 });
        const qStatus = new Map();
        results.forEach(result => {
            if (result.review) {
                result.review.forEach((q) => {
                    if (q.userAnswerIndex === null || q.userAnswerIndex === undefined)
                        qStatus.set(q.question, 'skipped');
                    else if (q.userAnswerIndex === q.correctAnswerIndex)
                        qStatus.set(q.question, 'correct');
                    else
                        qStatus.set(q.question, 'incorrect');
                });
            }
        });
        let processedQuestions = [];
        const shuffleArray = (arr) => arr.sort(() => 0.5 - Math.random());
        if (subMode === 'revision') {
            const isMixedType = !questionType || questionType.includes('Mixed') || questionType.length === 0;
            if (!isMixedType) {
                rawQuestions.forEach(q => {
                    const status = qStatus.get(q.question) || 'unattempted';
                    let mappedStatus = '';
                    if (status === 'unattempted')
                        mappedStatus = 'Not Attempted';
                    else if (status === 'incorrect')
                        mappedStatus = 'Answered Wrong';
                    else if (status === 'correct')
                        mappedStatus = 'Answered Correct';
                    else if (status === 'skipped')
                        mappedStatus = 'Skipped';
                    if (questionType.includes(mappedStatus)) {
                        processedQuestions.push(q);
                    }
                });
            }
            else {
                processedQuestions = [...rawQuestions];
            }
        }
        else {
            const unattempted = [];
            const incorrectSkipped = [];
            const correct = [];
            rawQuestions.forEach(q => {
                const status = qStatus.get(q.question) || 'unattempted';
                if (status === 'unattempted')
                    unattempted.push(q);
                else if (status === 'incorrect' || status === 'skipped')
                    incorrectSkipped.push(q);
                else
                    correct.push(q);
            });
            let combined = [
                ...shuffleArray(unattempted),
                ...shuffleArray(incorrectSkipped),
                ...shuffleArray(correct)
            ];
            processedQuestions = combined;
        }
        if (processedQuestions.length < questionLimit) {
            res.status(400).json({
                success: false,
                message: `Only found ${processedQuestions.length} questions matching your selected filters. Please select more Sub-topics, Difficulties, or Question Types, or reduce the number of questions requested.`
            });
            return;
        }
        processedQuestions = processedQuestions.slice(0, questionLimit);
        processedQuestions = shuffleArray(processedQuestions);
        const finalQuestions = processedQuestions.map(q => {
            const optionsWithFlag = q.options.map((text, idx) => ({
                text,
                isCorrect: idx === q.correctAnswerIndex
            }));
            const shuffledOptions = shuffleArray(optionsWithFlag);
            const newCorrectIndex = shuffledOptions.findIndex((o) => o.isCorrect);
            return {
                ...q,
                options: shuffledOptions.map((o) => o.text),
                correctAnswerIndex: newCorrectIndex
            };
        });
        res.json({ success: true, count: finalQuestions.length, data: finalQuestions });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
exports.default = router;
