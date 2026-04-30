import express, { Request, Response, Router } from 'express';
import mongoose from 'mongoose';
import Cohort, { ICohort } from '../models/Cohort';
import Topic, { ITopic } from '../models/Topic';
import Question from '../models/Question';
import Result from '../models/Result';

const router: Router = express.Router();

router.get('/fix-db', async (req: Request, res: Response) => {
  try {
    const allQuestions = await Question.find().lean();
    let updatedCount = 0;
    for (const q of allQuestions) {
      if (typeof q.topicId === 'string') {
        await Question.updateOne(
          { _id: q._id },
          { $set: { topicId: new mongoose.Types.ObjectId(q.topicId) } }
        );
        updatedCount++;
      }
    }

    res.json({ 
      success: true, 
      message: `Successfully fixed ${updatedCount} questions! Your database is now perfectly formatted.` 
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/fix-topics-db', async (req: Request, res: Response) => {
  try {
    const allTopics = await Topic.find().lean();
    let updatedCount = 0;
    for (const t of allTopics) {
      if (typeof t.cohortId === 'string') {
        await Topic.updateOne(
          { _id: t._id },
          { $set: { cohortId: new mongoose.Types.ObjectId(t.cohortId) } }
        );
        updatedCount++;
      }
    }

    res.json({ 
      success: true, 
      message: `Successfully fixed ${updatedCount} topics! Your database is now perfectly relational.` 
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;