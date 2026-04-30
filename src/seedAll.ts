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
    console.log('Connected to MongoDB. Clearing old data...');

    // Delete existing data safely
    await User.deleteMany({ email: { $in: ['mentor1@peer.dev', 'mentor2@peer.dev', 'student1@peer.dev', 'student2@peer.dev', 'alex@example.com'] } });
    await Cohort.deleteMany({ name: { $in: ['Full Stack Development', 'Cyber Security'] } });
    await Course.deleteMany({ category: { $in: ['Full Stack', 'Cyber Security'] } });
    await Badge.deleteMany({ name: { $in: ['First Steps', 'Team Player', 'Security Pro'] } });
    
    console.log('Creating users with plaintext passwords (letting Mongoose pre-save hook hash them)...');
    
    const mentor1 = await User.create({
      name: 'John Mentor (Full Stack)',
      email: 'mentor1@peer.dev',
      password: 'password123',
      role: 'mentor',
      points: 500,
    });

    const mentor2 = await User.create({
      name: 'Sarah Mentor (Cyber Sec)',
      email: 'mentor2@peer.dev',
      password: 'password123',
      role: 'mentor',
      points: 500,
    });

    const student1 = await User.create({
      name: 'Alex Student (Full Stack)',
      email: 'student1@peer.dev',
      password: 'password123',
      role: 'student',
      points: 100,
    });

    const student2 = await User.create({
      name: 'Emma Student (Cyber Sec)',
      email: 'student2@peer.dev',
      password: 'password123',
      role: 'student',
      points: 100,
    });

    const demoUser = await User.create({
      name: 'Alex Demo',
      email: 'alex@example.com',
      password: 'Demo!1234',
      role: 'student',
      points: 150,
    });

    // Create Cohorts
    console.log('Creating cohorts...');
    const fullStackCohort = await Cohort.create({
      name: 'Full Stack Development',
      description: 'Master the MERN stack and software engineering fundamentals.',
      mentor: mentor1._id,
      startDate: new Date('2026-05-01'),
      endDate: new Date('2026-11-01'),
      tags: ['React', 'Node.js', 'MongoDB', 'Express'],
      members: [student1._id, demoUser._id],
    });

    const cyberSecCohort = await Cohort.create({
      name: 'Cyber Security',
      description: 'Learn ethical hacking, network defense, and penetration testing.',
      mentor: mentor2._id,
      startDate: new Date('2026-05-01'),
      endDate: new Date('2026-11-01'),
      tags: ['PenTesting', 'Network Security', 'Cryptography'],
      members: [student2._id, demoUser._id],
    });

    // Create Courses
    console.log('Creating LMS courses...');
    const fsCourse = await Course.create({
      title: 'Full Stack Web Engineering',
      description: 'Comprehensive guide to modern web development.',
      difficulty: 'Intermediate',
      category: 'Full Stack',
      tags: ['MERN', 'TypeScript'],
      modules: [
        {
          title: 'Module 1: Backend with Node.js',
          order: 1,
          lessons: [
            { title: 'Introduction to Express', type: 'video', order: 1 }
          ]
        }
      ],
      totalModules: 1,
      totalLessons: 1,
      cohortId: fullStackCohort._id,
      createdBy: mentor1._id,
      enrolledStudents: [demoUser._id, student1._id]
    });

    const csCourse = await Course.create({
      title: 'Cyber Security Essentials',
      description: 'Secure networks and protect systems from cyber attacks.',
      difficulty: 'Beginner',
      category: 'Cyber Security',
      tags: ['Linux', 'Security'],
      modules: [
        {
          title: 'Module 1: Ethical Hacking',
          order: 1,
          lessons: [
            { title: 'Metasploit Basics', type: 'video', order: 1 }
          ]
        }
      ],
      totalModules: 1,
      totalLessons: 1,
      cohortId: cyberSecCohort._id,
      createdBy: mentor2._id,
      enrolledStudents: [demoUser._id, student2._id]
    });

    // Create Badges (LMS)
    console.log('Creating badges...');
    await Badge.create({
      name: 'First Steps',
      icon: '🎓',
      description: 'Enrolled in a peer cohort',
      color: '#6366f1',
      trigger: 'first_enroll',
    });
    await Badge.create({
      name: 'Team Player',
      icon: '🤝',
      description: 'Collaborated on a project',
      color: '#10b981',
      trigger: 'project_collab',
    });

    // Create Quiz Topics
    console.log('Creating quiz topics...');
    await Topic.deleteMany({ cohortId: { $in: [fullStackCohort._id, cyberSecCohort._id] } });
    
    const fsTopic = await Topic.create({
      cohortId: fullStackCohort._id,
      title: 'JavaScript Fundamentals',
      description: 'Assess basic concepts of scope, closures, and async JS.',
      category: 'Coding',
      difficulty: 'Intermediate',
      subTopics: ['Closures', 'Promises', 'Event Loop'],
    });

    const csTopic = await Topic.create({
      cohortId: cyberSecCohort._id,
      title: 'Network Protocol Auditing',
      description: 'Deep dive into packet architectures and sniffing vulnerabilities.',
      category: 'Security',
      difficulty: 'Hard',
      subTopics: ['TCP/IP', 'Wireshark', 'DNS Spoofing'],
    });

    // Create Quiz Questions
    console.log('Creating quiz questions...');
    await Question.deleteMany({ topicId: { $in: [fsTopic._id, csTopic._id] } });

    await Question.create({
      topicId: fsTopic._id,
      subTopic: 'Promises',
      difficulty: 'Intermediate',
      question: 'Which method resolves multiple promises concurrently?',
      options: ['Promise.all', 'Promise.race', 'Promise.any', 'Promise.resolve'],
      correctAnswerIndex: 0,
      explanation: 'Promise.all resolves when all passed promises resolve.'
    });

    await Question.create({
      topicId: csTopic._id,
      subTopic: 'TCP/IP',
      difficulty: 'Hard',
      question: 'Which TCP flag is used to establish the initial connection three-way handshake?',
      options: ['ACK', 'SYN', 'FIN', 'RST'],
      correctAnswerIndex: 1,
      explanation: 'SYN (Synchronize) packets initiate handshakes.'
    });

    // Create Discussions
    console.log('Creating discussions...');
    await Discussion.deleteMany({ cohortId: { $in: [fullStackCohort._id, cyberSecCohort._id] } });

    await Discussion.create({
      title: 'Best state management in 2026?',
      content: 'Is Zustand completely replacing Redux for new applications?',
      author: student1._id,
      cohortId: fullStackCohort._id,
      courseId: fsCourse._id,
      tags: ['React', 'State Management'],
      replies: [
        {
          content: 'Zustand offers far less boilerplate!',
          author: mentor1._id,
          likes: 2,
        }
      ]
    });

    // Create Projects
    console.log('Creating projects...');
    await Project.deleteMany({ cohortId: { $in: [fullStackCohort._id, cyberSecCohort._id] } });

    const fsProject = await Project.create({
      title: 'AI-Powered Project Tracker',
      pitch: 'A unified project tracking system leveraging AI analysis.',
      description: 'Create an intelligent dashboard that tracks code updates.',
      problemStatement: 'Developers lose context between issues and actual task statuses.',
      techStack: ['React', 'Node.js', 'Python'],
      cohortId: fullStackCohort._id,
      hostId: mentor1._id,
      roles: [
        {
          title: 'Frontend Developer',
          description: 'Build components for interactive task boards.',
          skillsRequired: ['React', 'Tailwind'],
          filled: false,
        }
      ],
      status: 'hiring',
      deadline: new Date('2026-06-01'),
    });

    const csProject = await Project.create({
      title: 'Network Vulnerability Scanner',
      pitch: 'Automated auditing tool for private local networks.',
      description: 'Build a Python agent mapping local ports to CVE vulnerabilities.',
      problemStatement: 'Manual infrastructure checks fail to identify zero-day exposures quickly.',
      techStack: ['Python', 'Bash', 'Docker'],
      cohortId: cyberSecCohort._id,
      hostId: mentor2._id,
      roles: [
        {
          title: 'Security Analyst',
          description: 'Assess tool output benchmarks.',
          skillsRequired: ['Nmap', 'CVE Mapping'],
          filled: false,
        }
      ],
      status: 'hiring',
      deadline: new Date('2026-06-01'),
    });

    // Create Applications
    console.log('Creating applications...');
    await Application.deleteMany({ projectId: { $in: [fsProject._id, csProject._id] } });

    await Application.create({
      userId: demoUser._id,
      projectId: fsProject._id,
      roleId: (fsProject.roles[0] as any)._id,
      status: 'hired',
      resumeUrl: 'https://peerlearn.dev/resume/alex.pdf',
      coverNote: 'Excited about scaling workflows with React.',
    });

    // Create Tasks
    console.log('Creating tasks...');
    await Task.deleteMany({ projectId: { $in: [fsProject._id, csProject._id] } });

    await Task.create({
      projectId: fsProject._id,
      assigneeId: demoUser._id,
      title: 'Build Interactive Kanban Wireframe',
      description: 'Wire up standard todo, in-progress, done columns with drag animations.',
      status: 'todo',
      priority: 'high',
      dueDate: new Date('2026-05-15'),
    });

    console.log('Mock data seeded successfully with proper password hashing.');
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error seeding comprehensive data:', error);
    process.exit(1);
  }
};

seed();
