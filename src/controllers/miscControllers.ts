import { Response } from 'express'
import User from '../models/User'
import Course from '../models/Course'
import Progress from '../models/Progress'
import { AuthRequest } from '../middleware/auth'

// ─── Leaderboard ─────────────────────────────────────────────────────────────

// GET /api/leaderboard
export const getGlobalLeaderboard = async (_req: AuthRequest, res: Response) => {
  try {
    const users = await User.find({ role: 'student' })
      .select('name avatar points badges enrolledCourses')
      .sort({ points: -1 })
      .limit(50)
      .lean()

    const entries = users.map((u, i) => ({
      rank: i + 1,
      user: { _id: u._id, name: u.name, avatar: u.avatar },
      points: u.points,
      coursesCompleted: 0, // could be enriched from Progress
      badges: u.badges.length,
    }))

    res.json({ success: true, data: entries })
  } catch {
    res.status(500).json({ success: false, message: 'Failed to fetch leaderboard' })
  }
}

// GET /api/leaderboard/cohort/:cohortId
export const getCohortLeaderboard = async (req: AuthRequest, res: Response) => {
  try {
    const { cohortId } = req.params;

    // 1. Get all students in the cohort
    const cohort = await (await import('../models/Cohort')).default.findById(cohortId).select('name members');
    if (!cohort) return res.status(404).json({ success: false, message: 'Cohort not found' });

    // 2. Aggregate Quiz Points for this cohort
    const quizPoints = await (await import('../models/Result')).default.aggregate([
      { $match: { cohort: cohort.name } },
      { $group: { _id: '$userId', total: { $sum: '$score' } } }
    ]);

    // 3. Aggregate LMS Points for this cohort
    // Find all courses in this cohort
    const courses = await Course.find({ cohortId }).select('_id');
    const courseIds = courses.map(c => c._id);

    const lmsPoints = await Progress.aggregate([
      { $match: { course: { $in: courseIds } } },
      { 
        $group: { 
          _id: '$user', 
          enrollmentPoints: { $sum: 10 },
          lessonPoints: { $sum: { $multiply: [{ $size: '$completedLessons' }, 5] } }
        } 
      }
    ]);

    // 4. Combine Points (ONLY LMS POINTS)
    const scoreMap: Record<string, any> = {};

    // Initialize with cohort members
    const members = await User.find({ _id: { $in: cohort.members } }).select('name avatar points badges').lean();
    members.forEach(m => {
      scoreMap[m._id.toString()] = {
        user: { _id: m._id, name: m.name, avatar: m.avatar },
        points: 0,
        badges: m.badges.length,
        lmsPoints: 0
      };
    });

    lmsPoints.forEach(lp => {
      const uid = lp._id.toString();
      if (scoreMap[uid]) {
        const totalLms = lp.enrollmentPoints + lp.lessonPoints;
        scoreMap[uid].points = totalLms;
        scoreMap[uid].lmsPoints = totalLms;
      }
    });

    const entries = Object.values(scoreMap)
      .sort((a, b) => b.points - a.points)
      .map((entry, i) => ({
        rank: i + 1,
        ...entry
      }));

    res.json({ success: true, data: entries });
  } catch (err: any) {
    console.error('Leaderboard error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch cohort leaderboard' });
  }
}

// ─── Bookmarks ────────────────────────────────────────────────────────────────

// GET /api/bookmarks
export const getBookmarks = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user?._id).populate({
      path: 'bookmarks',
      select: 'title description difficulty category thumbnail tags totalModules totalLessons',
    }).lean()

    res.json({ success: true, data: user?.bookmarks ?? [] })
  } catch {
    res.status(500).json({ success: false, message: 'Failed to fetch bookmarks' })
  }
}

// POST /api/bookmarks
export const addBookmark = async (req: AuthRequest, res: Response) => {
  try {
    const { courseId } = req.body
    if (!courseId) return res.status(400).json({ success: false, message: 'courseId required' })

    const course = await Course.findById(courseId)
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' })

    await User.findByIdAndUpdate(req.user?._id, { $addToSet: { bookmarks: courseId } })
    res.json({ success: true, message: 'Bookmarked' })
  } catch {
    res.status(500).json({ success: false, message: 'Failed to add bookmark' })
  }
}

// DELETE /api/bookmarks/:courseId
export const removeBookmark = async (req: AuthRequest, res: Response) => {
  try {
    await User.findByIdAndUpdate(req.user?._id, { $pull: { bookmarks: req.params.courseId } })
    res.json({ success: true, message: 'Bookmark removed' })
  } catch {
    res.status(500).json({ success: false, message: 'Failed to remove bookmark' })
  }
}

// GET /api/dashboard/summary
export const getDashboardSummary = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    const { cohortId } = req.query;

    // 1. Get User with basic stats
    const user = await User.findById(userId).select('points badges enrolledCourses').lean();
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // 2. Get Enrolled Courses with Progress
    const filter: any = { _id: { $in: user.enrolledCourses } };
    if (cohortId) filter.cohortId = cohortId;
    
    const enrolledCourses = await Course.find(filter)
      .select('title description difficulty category thumbnail totalModules totalLessons cohortId')
      .lean();

    const progresses = await Progress.find({ user: userId, course: { $in: user.enrolledCourses } }).lean();
    const progMap = Object.fromEntries(progresses.map(p => [p.course.toString(), p]));

    const enrichedCourses = enrolledCourses.map(c => ({
      ...c,
      progressPercent: progMap[c._id.toString()]?.progressPercent ?? 0,
      completedLessons: progMap[c._id.toString()]?.completedLessons.length ?? 0,
    }));

    // 3. Get Cohort Stats
    let cohortCoursesCount = 0;
    if (cohortId) {
      cohortCoursesCount = await Course.countDocuments({ cohortId });
    }

    // 4. Get Activity & Chart (Last 7 Days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentProgress = await Progress.find({ user: userId, updatedAt: { $gte: sevenDaysAgo } })
      .populate('course', 'title')
      .sort({ updatedAt: -1 })
      .lean();

    const weeklyData = new Array(7).fill(0);
    recentProgress.forEach(p => {
      const day = new Date(p.updatedAt).getDay();
      const index = day === 0 ? 6 : day - 1; 
      weeklyData[index] += 1;
    });
    const maxVal = Math.max(...weeklyData, 1);
    const chart = weeklyData.map(v => Math.round((v / maxVal) * 100));

    const activities = recentProgress.slice(0, 10).map(p => ({
      _id: new Date(p.updatedAt).toLocaleDateString(),
      type: 'lms_progress',
      title: 'Course Progress',
      detail: `Reached ${p.progressPercent}% in ${ (p.course as any).title }`,
      timestamp: p.updatedAt
    }));

    // 5. Calculate Streak
    let streak = 0;
    const today = new Date();
    today.setHours(0,0,0,0);
    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);
      const hasActivity = recentProgress.some(p => {
        const d = new Date(p.updatedAt);
        d.setHours(0,0,0,0);
        return d.getTime() === checkDate.getTime();
      });
      if (hasActivity) streak++;
      else if (i > 0) break;
    }

    res.json({ 
      success: true, 
      data: {
        myCourses: enrichedCourses,
        cohortCoursesCount,
        activities,
        chart,
        streak,
        weeklyTotal: weeklyData.reduce((a, b) => a + b, 0)
      }
    });
  } catch (err) {
    console.error('Summary error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch dashboard summary' });
  }
}
