import express, { Application, Request, Response } from 'express';
import dns from 'node:dns';
dns.setServers(['8.8.8.8', '8.8.4.4']);
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import connectDB from './config/db';

import quizRoutes from './routes/quizRoutes';
import userRoutes from './routes/userRoutes';
import resultRoutes from './routes/resultRoutes';
import helpRoutes from './routes/helpRoutes';
import roomRoutes from './routes/roomRoutes';
import paperRoutes from './routes/paperRoutes';
import debugRoute from './routes/debugRoute';
import notificationRoutes from './routes/notificationRoutes';
import leaderboardRoute from './routes/leaderboardRoute';

import authRoutes         from './routes/auth';
import courseRoutes       from './routes/courses';
import cohortRoutes       from './routes/cohorts';
import discussionRoutes   from './routes/discussions';
import lmsLeaderboardRoutes from './routes/leaderboard';
import bookmarkRoutes     from './routes/bookmarks';
import projectRoutes      from './routes/projects';
import applicationRoutes  from './routes/applications';
import taskRoutes         from './routes/tasks';

import helmet from 'helmet';
import morgan from 'morgan';
import { rateLimit } from 'express-rate-limit';

dotenv.config();

const app: Application = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: ['http://localhost:5173', process.env.CLIENT_URL || ''],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true
  }
});

connectDB();

app.use(helmet());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

app.use(cors({
  origin: ['http://localhost:5173', process.env.CLIENT_URL || ''],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' }
});
app.use('/api', apiLimiter);

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on('join_room', (roomCode: string) => {
    const code = roomCode.toUpperCase();
    socket.join(code);
    console.log(`Socket ${socket.id} joined room: ${code}`);
  });

  socket.on('start_quiz', (roomCode: string) => {
    io.to(roomCode.toUpperCase()).emit('quiz_started');
  });

  socket.on('participant_event', ({ roomCode, data }) => {
    socket.to(roomCode.toUpperCase()).emit('update_proctor_view', data);
  });

  socket.on('host_action', ({ roomCode, action, targetUserId }) => {
    io.to(roomCode.toUpperCase()).emit('force_action', { action, targetUserId });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

app.get('/', (req: Request, res: Response) => {
  res.send('Peer Backend is live and socket-enabled!');
});

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ success: true, message: 'PeerLearn LMS API is running', timestamp: new Date() })
});

// Quiz & Auth Backend Routes
app.use('/api/quiz', quizRoutes);
app.use('/api/users', userRoutes);
app.use('/api/results', resultRoutes);
app.use('/api/help', helpRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/papers', paperRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/debug', debugRoute);
app.use('/api/leaderboard', leaderboardRoute); // Quiz leaderboard

// LMS Server Routes
app.use('/api/auth',        authRoutes);
app.use('/api/courses',     courseRoutes);
app.use('/api/cohorts',     cohortRoutes);
app.use('/api/discussions', discussionRoutes);
app.use('/api/lms-leaderboard', lmsLeaderboardRoutes);
app.use('/api/bookmarks',   bookmarkRoutes);

// Project Hub Routes
app.use('/api/projects',     projectRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/tasks',        taskRoutes);

const PORT: number = parseInt(process.env.PORT as string, 10) || 5000;
httpServer.listen(PORT, () => {
  console.log(`Server & Sockets running on http://localhost:${PORT}`);
});

export { io };