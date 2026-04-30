import express, { Request, Response, Router } from 'express';
import mongoose from 'mongoose';
import Cohort, { ICohort } from '../models/Cohort';
import Topic, { ITopic } from '../models/Topic';
import Question from '../models/Question';
import Result from '../models/Result';

const router: Router = express.Router();

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

router.post('/generate-quiz', async (req: Request, res: Response): Promise<void> => {
  try {
    const { topicId, subTopics, difficulty, limit, userId, subMode, questionType } = req.body;

    if (!topicId || !userId) {
      res.status(400).json({ success: false, message: 'topicId and userId are required' });
      return;
    }
    let matchQuery: any = { topicId: new mongoose.Types.ObjectId(topicId as string) };
    
    if (subTopics && Array.isArray(subTopics) && subTopics.length > 0 && !subTopics.includes('All')) {
      matchQuery.subTopic = { $in: subTopics };
    }
    
    if (difficulty && Array.isArray(difficulty) && difficulty.length > 0 && !difficulty.includes('Mix')) {
      matchQuery.difficulty = { $in: difficulty };
    }

    const questionLimit = parseInt(limit as string) || 30;
    let rawQuestions = await Question.find(matchQuery).lean();
    const results = await Result.find({ userId, topicId }).sort({ createdAt: 1 });
    const qStatus = new Map<string, string>();
    
    results.forEach(result => {
      if(result.review) {
        result.review.forEach((q: any) => {
          if (q.userAnswerIndex === null || q.userAnswerIndex === undefined) qStatus.set(q.question, 'skipped');
          else if (q.userAnswerIndex === q.correctAnswerIndex) qStatus.set(q.question, 'correct');
          else qStatus.set(q.question, 'incorrect');
        });
      }
    });

    let processedQuestions: any[] = [];
    const shuffleArray = (arr: any[]) => arr.sort(() => 0.5 - Math.random());
    if (subMode === 'revision') {
      const isMixedType = !questionType || questionType.includes('Mixed') || questionType.length === 0;

      if (!isMixedType) {
        rawQuestions.forEach(q => {
          const status = qStatus.get(q.question) || 'unattempted';
          let mappedStatus = '';
          
          if (status === 'unattempted') mappedStatus = 'Not Attempted';
          else if (status === 'incorrect') mappedStatus = 'Answered Wrong';
          else if (status === 'correct') mappedStatus = 'Answered Correct';
          else if (status === 'skipped') mappedStatus = 'Skipped';

          if (questionType.includes(mappedStatus)) {
            processedQuestions.push(q);
          }
        });
      } else {
        processedQuestions = [...rawQuestions];
      }
    } else {
      const unattempted: any[] = [];
      const incorrectSkipped: any[] = [];
      const correct: any[] = [];

      rawQuestions.forEach(q => {
        const status = qStatus.get(q.question) || 'unattempted';
        if (status === 'unattempted') unattempted.push(q);
        else if (status === 'incorrect' || status === 'skipped') incorrectSkipped.push(q);
        else correct.push(q);
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
      const optionsWithFlag = q.options.map((text: string, idx: number) => ({ 
        text, 
        isCorrect: idx === q.correctAnswerIndex 
      }));
      
      const shuffledOptions = shuffleArray(optionsWithFlag);
      const newCorrectIndex = shuffledOptions.findIndex((o: any) => o.isCorrect);
      
      return {
        ...q,
        options: shuffledOptions.map((o: any) => o.text),
        correctAnswerIndex: newCorrectIndex
      };
    });

    res.json({ success: true, count: finalQuestions.length, data: finalQuestions });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;