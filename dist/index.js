"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = void 0;
const express_1 = __importDefault(require("express"));
const node_dns_1 = __importDefault(require("node:dns"));
node_dns_1.default.setServers(['8.8.8.8', '8.8.4.4']);
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const db_1 = __importDefault(require("./config/db"));
const quizRoutes_1 = __importDefault(require("./routes/quizRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const resultRoutes_1 = __importDefault(require("./routes/resultRoutes"));
const helpRoutes_1 = __importDefault(require("./routes/helpRoutes"));
const roomRoutes_1 = __importDefault(require("./routes/roomRoutes"));
const paperRoutes_1 = __importDefault(require("./routes/paperRoutes"));
const debugRoute_1 = __importDefault(require("./routes/debugRoute"));
const notificationRoutes_1 = __importDefault(require("./routes/notificationRoutes"));
const leaderboardRoute_1 = __importDefault(require("./routes/leaderboardRoute"));
const auth_1 = __importDefault(require("./routes/auth"));
const courses_1 = __importDefault(require("./routes/courses"));
const cohorts_1 = __importDefault(require("./routes/cohorts"));
const discussions_1 = __importDefault(require("./routes/discussions"));
const leaderboard_1 = __importDefault(require("./routes/leaderboard"));
const bookmarks_1 = __importDefault(require("./routes/bookmarks"));
const projects_1 = __importDefault(require("./routes/projects"));
const applications_1 = __importDefault(require("./routes/applications"));
const tasks_1 = __importDefault(require("./routes/tasks"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const express_rate_limit_1 = require("express-rate-limit");
dotenv_1.default.config();
const app = (0, express_1.default)();
const httpServer = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: ['http://localhost:5173', 'https://quiz-six-swart-50.vercel.app', process.env.CLIENT_URL || ''],
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
        credentials: true
    }
});
exports.io = io;
(0, db_1.default)();
app.use((0, helmet_1.default)());
app.use((0, morgan_1.default)(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use((0, cors_1.default)({
    origin: ['http://localhost:5173', 'https://quiz-six-swart-50.vercel.app', process.env.CLIENT_URL || ''],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true
}));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
const apiLimiter = (0, express_rate_limit_1.rateLimit)({
    windowMs: 15 * 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many requests, please try again later.' }
});
app.use('/api', apiLimiter);
io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);
    socket.on('join_room', (roomCode) => {
        const code = roomCode.toUpperCase();
        socket.join(code);
        console.log(`Socket ${socket.id} joined room: ${code}`);
    });
    socket.on('start_quiz', (roomCode) => {
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
app.get('/', (req, res) => {
    res.send('Peer Backend is live and socket-enabled!');
});
// Health check
app.get('/api/health', (_req, res) => {
    res.json({ success: true, message: 'PeerLearn LMS API is running', timestamp: new Date() });
});
// Quiz & Auth Backend Routes
app.use('/api/quiz', quizRoutes_1.default);
app.use('/api/users', userRoutes_1.default);
app.use('/api/results', resultRoutes_1.default);
app.use('/api/help', helpRoutes_1.default);
app.use('/api/rooms', roomRoutes_1.default);
app.use('/api/papers', paperRoutes_1.default);
app.use('/api/notifications', notificationRoutes_1.default);
app.use('/api/debug', debugRoute_1.default);
app.use('/api/leaderboard', leaderboardRoute_1.default); // Quiz leaderboard
// LMS Server Routes
app.use('/api/auth', auth_1.default);
app.use('/api/courses', courses_1.default);
app.use('/api/cohorts', cohorts_1.default);
app.use('/api/discussions', discussions_1.default);
app.use('/api/lms-leaderboard', leaderboard_1.default);
app.use('/api/bookmarks', bookmarks_1.default);
// Project Hub Routes
app.use('/api/projects', projects_1.default);
app.use('/api/applications', applications_1.default);
app.use('/api/tasks', tasks_1.default);
const PORT = parseInt(process.env.PORT, 10) || 5000;
httpServer.listen(PORT, () => {
    console.log(`Server & Sockets running on http://localhost:${PORT}`);
});
