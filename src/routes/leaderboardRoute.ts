import express, { Request, Response, Router } from 'express';
import mongoose from 'mongoose';
import Result from '../models/Result';
import NodeCache from 'node-cache';
const cache = new NodeCache({ stdTTL: 300 });
const router: Router = express.Router();

router.get('/global', async (req: Request, res: Response): Promise<void> => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const cacheKey = `leaderboard_global_${limit}`;
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      res.json({ success: true, data: cachedData });
      return;
    }

    const leaderboard = await Result.aggregate([
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
    
  } catch (error: any) {
    console.error("Global Leaderboard Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/cohort/:cohortName', async (req: Request, res: Response): Promise<void> => {
  try {
    const { cohortName } = req.params;
    const limit = parseInt(req.query.limit as string) || 50;
    const cacheKey = `leaderboard_${cohortName}_${limit}`;
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      res.json({ success: true, data: cachedData });
      return;
    }


    const leaderboard = await Result.aggregate([
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
  } catch (error: any) {
    console.error("Cohort Leaderboard Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;