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

const clearAll = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected. Clearing ALL data...');

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

    console.log('Database cleared successfully!');
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error clearing database:', error);
    process.exit(1);
  }
};

clearAll();
