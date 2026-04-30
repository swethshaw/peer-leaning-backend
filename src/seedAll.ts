import dotenv from 'dotenv';
import dns from 'node:dns';
dns.setServers(['8.8.8.8', '8.8.4.4']);
import mongoose from 'mongoose';
import User from './models/User';
import Cohort from './models/Cohort';
import Course from './models/Course';
import Project from './models/Project';
import Application from './models/Application';
import Task from './models/Task';
import Topic from './models/Topic';
import Question from './models/Question';
import Badge from './models/Badge';
import Discussion from './models/Discussion';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://peerquiz:Qwerty13579@peer.8zojvsr.mongodb.net/test';

const seed = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected. Wiping old data...');

    // Clear everything
    await Promise.all([
      User.deleteMany({}),
      Cohort.deleteMany({}),
      Course.deleteMany({}),
      Badge.deleteMany({}),
      Project.deleteMany({}),
      Application.deleteMany({}),
      Task.deleteMany({}),
      Topic.deleteMany({}),
      Question.deleteMany({}),
      Discussion.deleteMany({}),
      (await import('./models/Progress')).default.deleteMany({}),
      (await import('./models/Room')).default.deleteMany({}),
      (await import('./models/Result')).default.deleteMany({}),
      (await import('./models/HelpTicket')).default.deleteMany({}),
      (await import('./models/notification')).default.deleteMany({}),
    ]);

    const COMMON_PASSWORD = 'Demo!1234';

    console.log('Creating 5 users...');
    const users = await User.create([
      { name: 'Alice Admin', email: 'alice@peer.dev', password: COMMON_PASSWORD, role: 'mentor', points: 1000 },
      { name: 'Bob Builder', email: 'bob@peer.dev', password: COMMON_PASSWORD, role: 'student', points: 150 },
      { name: 'Charlie Coder', email: 'charlie@peer.dev', password: COMMON_PASSWORD, role: 'student', points: 200 },
      { name: 'David Defender', email: 'david@peer.dev', password: COMMON_PASSWORD, role: 'student', points: 50 },
      { name: 'Eve Expert', email: 'eve@peer.dev', password: COMMON_PASSWORD, role: 'student', points: 300 },
    ]);

    const [alice, bob, charlie, david, eve] = users;

    console.log('Creating Cohorts...');
    const fsCohort = await Cohort.create({
      name: 'Full Stack Development',
      description: 'Master the art of building complete web applications.',
      mentor: alice._id,
      startDate: new Date(),
      endDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
      members: [bob._id, charlie._id, eve._id],
    });

    const csCohort = await Cohort.create({
      name: 'Cyber Security',
      description: 'Defend systems and networks from digital attacks.',
      mentor: alice._id,
      startDate: new Date(),
      endDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
      members: [david._id, eve._id],
    });

    const topicsData = [
      { title: 'Foundations & Structure', difficulty: 'Beginner' as const },
      { title: 'Logic & Scripting', difficulty: 'Intermediate' as const },
      { title: 'System Architecture', difficulty: 'Intermediate' as const },
      { title: 'Data Management', difficulty: 'Advanced' as const },
      { title: 'Deployment & Security', difficulty: 'Advanced' as const },
    ];

    console.log('Syncing Topics, Courses, and Quizzes...');
    for (const data of topicsData) {
      // 1. Create Quiz Topic
      const topic = await Topic.create({
        cohortId: fsCohort._id,
        title: data.title,
        description: `Deep dive into ${data.title} principles.`,
        category: 'Core Engineering',
        difficulty: data.difficulty,
        subTopics: ['Fundamental Concept', 'Best Practices', 'Modern Tools', 'Optimization', 'Security']
      });

      // 2. Create Questions for this topic (mix levels)
      const difficulties: ('Easy' | 'Intermediate' | 'Hard')[] = ['Easy', 'Intermediate', 'Intermediate', 'Hard', 'Hard'];
      for (let i = 0; i < 5; i++) {
        await Question.create({
          topicId: topic._id,
          subTopic: topic.subTopics[i],
          difficulty: difficulties[i],
          question: `Sample ${difficulties[i]} question for ${data.title} - Item ${i+1}?`,
          options: ['Option A', 'Option B', 'Option C', 'Option D'],
          correctAnswerIndex: Math.floor(Math.random() * 4),
          explanation: `Detailed explanation for ${data.title} ${difficulties[i]} question.`
        });
      }

      // 3. Create Corresponding Course (LMS)
      await Course.create({
        title: `${data.title} Mastery`,
        description: `Learn everything about ${data.title} in this comprehensive track.`,
        difficulty: data.difficulty,
        category: 'Engineering',
        cohortId: fsCohort._id,
        createdBy: alice._id,
        totalModules: 5,
        totalLessons: 25,
        enrolledStudents: [bob._id, charlie._id, eve._id],
        modules: Array.from({ length: 5 }, (_, mi) => ({
          title: `Module ${mi + 1}: ${topic.subTopics[mi]}`,
          order: mi + 1,
          lessons: Array.from({ length: 5 }, (_, li) => ({
            title: `Lesson ${li + 1}: Deep Dive into ${topic.subTopics[mi]} Part ${li + 1}`,
            type: 'video',
            order: li + 1
          }))
        }))
      });
    }

    // Repeat for Cyber Security with different titles but same structure
    const csTopicsData = [
      { title: 'Network Security', difficulty: 'Beginner' as const },
      { title: 'Cryptography', difficulty: 'Intermediate' as const },
      { title: 'Penetration Testing', difficulty: 'Intermediate' as const },
      { title: 'Incident Response', difficulty: 'Advanced' as const },
      { title: 'Cloud Defense', difficulty: 'Advanced' as const },
    ];

    for (const data of csTopicsData) {
      const topic = await Topic.create({
        cohortId: csCohort._id,
        title: data.title,
        description: `Mastering ${data.title} for modern environments.`,
        category: 'Cyber Security',
        difficulty: data.difficulty,
        subTopics: ['Network', 'Crypto', 'Pentest', 'IR', 'Cloud']
      });

      for (let i = 0; i < 5; i++) {
        await Question.create({
          topicId: topic._id,
          subTopic: topic.subTopics[i],
          difficulty: 'Intermediate',
          question: `Security Scenario for ${data.title}: ${i+1}?`,
          options: ['Secure', 'Insecure', 'Vulnerable', 'Patched'],
          correctAnswerIndex: 0,
          explanation: 'Always follow the principle of least privilege.'
        });
      }

      await Course.create({
        title: `${data.title} Defense`,
        description: `Protect your infrastructure using ${data.title} strategies.`,
        difficulty: data.difficulty,
        category: 'Security',
        cohortId: csCohort._id,
        createdBy: alice._id,
        totalModules: 5,
        totalLessons: 25,
        enrolledStudents: [david._id, eve._id],
        modules: Array.from({ length: 5 }, (_, mi) => ({
          title: `Module ${mi + 1}: ${topic.subTopics[mi]}`,
          order: mi + 1,
          lessons: Array.from({ length: 5 }, (_, li) => ({
            title: `Lesson ${li + 1}: ${topic.subTopics[mi]} Training ${li + 1}`,
            type: 'article',
            order: li + 1
          }))
        }))
      });
    }

    console.log('Creating Projects and Interactions...');
    // Project 1: Alice hosts, Bob and Charlie joined
    const project1 = await Project.create({
      title: 'Peer Learning Platform',
      pitch: 'Revolutionizing how students learn together.',
      description: 'A full-scale social learning application.',
      problemStatement: 'Current LMS platforms are too isolated.',
      techStack: ['React', 'Node.js', 'Socket.io'],
      cohortId: fsCohort._id,
      hostId: alice._id,
      roles: [
        { title: 'Frontend Lead', description: 'Design UI', skillsRequired: ['React'], filled: true, assignedUserId: bob._id as any },
        { title: 'Backend Dev', description: 'API Design', skillsRequired: ['Node.js'], filled: true, assignedUserId: charlie._id as any },
        { title: 'UI Designer', description: 'Figma', skillsRequired: ['Figma'], filled: false }
      ],
      status: 'in-progress',
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      maxParticipants: 4,
      currentParticipants: 2
    });

    // Project 2: Eve hosts, David joined
    const project2 = await Project.create({
      title: 'Vulnerability Scanner',
      pitch: 'Automated network audits.',
      description: 'A Python-based tool for network security.',
      problemStatement: 'Manual scanning is too slow.',
      techStack: ['Python', 'Nmap'],
      cohortId: csCohort._id,
      hostId: eve._id,
      roles: [
        { title: 'Security Researcher', description: 'CVE Research', skillsRequired: ['Security'], filled: true, assignedUserId: david._id as any },
        { title: 'Python Scripter', description: 'Automation', skillsRequired: ['Python'], filled: false }
      ],
      status: 'hiring',
      deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      maxParticipants: 3,
      currentParticipants: 1
    });

    console.log('Creating Tasks with various states...');
    // Bob has a pending task
    await Task.create({
      projectId: project1._id,
      assigneeId: bob._id,
      title: 'Setup Tailwind Configuration',
      description: 'Create a theme for the new UI.',
      status: 'todo',
      priority: 'medium',
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
    });

    // Charlie is working on a task
    await Task.create({
      projectId: project1._id,
      assigneeId: charlie._id,
      title: 'Design Authentication Flow',
      description: 'Implement JWT on the backend.',
      status: 'in-progress',
      priority: 'high',
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
    });

    // David submitted a task (in-review)
    const task3 = await Task.create({
      projectId: project2._id,
      assigneeId: david._id,
      title: 'Nmap Script Integration',
      description: 'Hook up nmap results to the database.',
      status: 'in-review',
      priority: 'high',
      dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      submissions: [{
        userId: david._id,
        fileUrl: 'https://github.com/david/scanner/pull/1',
        fileName: 'nmap_fix.py',
        description: 'Completed the integration logic.',
        version: 1,
        submittedAt: new Date()
      }]
    });

    // Eve completed a task
    await Task.create({
      projectId: project2._id,
      assigneeId: eve._id,
      title: 'Documentation',
      description: 'Initial project readme.',
      status: 'done',
      priority: 'low',
      dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
    });

    console.log('Mocking Quiz and LMS Progress...');
    const Progress = (await import('./models/Progress')).default;
    const Result = (await import('./models/Result')).default;

    // Bob solved a quiz and completed some LMS lessons
    const bobCourse = await Course.findOne({ title: 'Foundations & Structure Mastery' });
    if (bobCourse) {
        await Progress.create({
            user: bob._id as any,
            course: bobCourse._id as any,
            completedLessons: [bobCourse.modules[0].lessons[0]._id, bobCourse.modules[0].lessons[1]._id] as any[],
            progressPercent: 8
        });
    }

    const bobTopic = await Topic.findOne({ title: 'Foundations & Structure' });
    if (bobTopic) {
        await Result.create({
            userId: bob._id as any,
            topicId: bobTopic._id as any,
            score: 4,
            totalQuestions: 5,
            percentage: 80,
            timeSpentSeconds: 120,
            review: [],
            cohort: fsCohort.name
        });
    }

    // Charlie has haven't solved anything (idle student)
    // David (Cyber) is very active
    const davidCourse = await Course.findOne({ title: 'Network Security Defense' });
    if (davidCourse) {
        await Progress.create({
            user: david._id as any,
            course: davidCourse._id as any,
            completedLessons: davidCourse.modules.flatMap(m => m.lessons.map(l => l._id)) as any[],
            progressPercent: 100
        });
    }

    console.log('Data Seeding Complete!');
    await mongoose.connection.close();
    process.exit(0);

  } catch (err) {
    console.error('Seeding Error:', err);
    process.exit(1);
  }
};

seed();
