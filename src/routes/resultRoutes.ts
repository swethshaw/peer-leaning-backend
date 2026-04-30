import express, { Request, Response, Router } from 'express';
import mongoose from 'mongoose';
import Result from '../models/Result';
import Notification from '../models/notification';
import Cohort from '../models/Cohort';
import Topic from '../models/Topic';
import Question from '../models/Question';
import User from '../models/User';

const router: Router = express.Router();

router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const newResult = await Result.create(req.body);
    try {
      await Notification.create({
        userId: req.body.userId,
        cohort: req.body.cohort,
        type: 'result',
        title: 'Quiz Result Saved!',
        message: 'Your recent quiz attempt has been evaluated and saved successfully.',
      });
    } catch (notifError) {
      console.error('Failed to create result notification:', notifError);
    }
    try {
      if (req.body.cohort) {
        const newRankings = await Result.aggregate([
          { $match: { cohort: req.body.cohort } },
          { $group: { _id: '$userId', totalPoints: { $sum: '$score' } } },
          { $sort: { totalPoints: -1 } },
          { $limit: 3 }
        ]);
        const isTop3 = newRankings.some(user => user._id.toString() === req.body.userId);
        if (isTop3) {
          await Notification.create({
            userId: req.body.userId,
            cohort: req.body.cohort,
            type: 'achievement',
            title: 'Top 3 Leaderboard!',
            message: 'Incredible! Your recent score just bumped you into the top 3 of your cohort!',
          });
        }
      }
    } catch (achievementError) {
      console.error('Failed to process achievement notification:', achievementError);
    }

    res.status(201).json({ success: true, data: newResult });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/user/:userId', async (req: Request, res: Response): Promise<void> => {
  try {
    const results = await Result.find({ userId: req.params.userId })
      .populate('topicId', 'title category')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: results });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/activity/:userId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - 36);

    const activity = await Result.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId as string),
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
  } catch (error: any) {
    console.error("Activity Heatmap Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/dashboard/:userId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const [cohorts, topics, userResults, questionCountsAgg] = await Promise.all([
      Cohort.find(),
      Topic.find(),
      Result.find({
        userId,
        $or: [
          { customPaperId: { $exists: false } },
          { customPaperId: null }
        ]
      }),
      Question.aggregate([
        { $group: { _id: "$topicId", count: { $sum: 1 } } }
      ])
    ]);
    const questionCountMap = new Map();
    questionCountsAgg.forEach(q => questionCountMap.set(q._id.toString(), q.count));

    const resultsByTopic: Record<string, any[]> = {};
    userResults.forEach(r => {
      const tId = r.topicId.toString();
      if (!resultsByTopic[tId]) resultsByTopic[tId] = [];
      resultsByTopic[tId].push(r);
    });

    const allData: Record<string, any[]> = {};
    cohorts.forEach(c => { allData[c.name] = []; });

    for (const topic of topics) {
      const topicIdStr = topic._id.toString();
      const totalQuestions = questionCountMap.get(topicIdStr) || 0;

      const topicResults = resultsByTopic[topicIdStr] || [];
      const correctQuestionSet = new Set<string>();

      topicResults.forEach(result => {
        if (result.review && result.review.length > 0) {
          result.review.forEach((q: any) => {
            if (q.userAnswerIndex !== null && q.userAnswerIndex === q.correctAnswerIndex) {
              correctQuestionSet.add(q.question);
            }
          });
        }
      });

      const solvedQuestions = correctQuestionSet.size;
      const topicData = { ...topic.toObject(), totalQuestions, solvedQuestions };
      const cohort = cohorts.find(c => c._id.toString() === topic.cohortId.toString());
      if (cohort) allData[cohort.name].push(topicData);
    }

    res.json({ success: true, data: allData });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;