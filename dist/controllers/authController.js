"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePassword = exports.updateMe = exports.getMe = exports.login = exports.register = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const signToken = (id) => jsonwebtoken_1.default.sign({ id }, process.env.JWT_SECRET ?? 'secret', {
    expiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
});
// POST /api/auth/register
const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: 'All fields are required' });
        }
        const existing = await User_1.default.findOne({ email });
        if (existing) {
            return res.status(400).json({ success: false, message: 'Email already registered' });
        }
        const user = await User_1.default.create({ name, email, password });
        const token = signToken(user._id.toString());
        res.status(201).json({ success: true, data: { token, user } });
    }
    catch (err) {
        console.error('register error:', err);
        res.status(500).json({ success: false, message: 'Registration failed' });
    }
};
exports.register = register;
// POST /api/auth/login
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email and password required' });
        }
        const user = await User_1.default.findOne({ email }).select('+password');
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
        const token = signToken(user._id.toString());
        const userObj = user.toJSON();
        res.json({ success: true, data: { token, user: userObj } });
    }
    catch (err) {
        console.error('login error:', err);
        res.status(500).json({ success: false, message: 'Login failed' });
    }
};
exports.login = login;
// GET /api/auth/me
const getMe = async (req, res) => {
    try {
        const user = await User_1.default.findById(req.user?._id).populate('badges').lean();
        if (!user)
            return res.status(404).json({ success: false, message: 'User not found' });
        res.json({ success: true, data: user });
    }
    catch {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.getMe = getMe;
// PATCH /api/auth/me
const updateMe = async (req, res) => {
    try {
        const { name, email } = req.body;
        const user = await User_1.default.findByIdAndUpdate(req.user?._id, { name, email }, { new: true, runValidators: true });
        res.json({ success: true, data: user });
    }
    catch {
        res.status(500).json({ success: false, message: 'Update failed' });
    }
};
exports.updateMe = updateMe;
// PATCH /api/auth/password
const changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        const user = await User_1.default.findById(req.user?._id).select('+password');
        if (!user)
            return res.status(404).json({ success: false, message: 'User not found' });
        const valid = await user.comparePassword(oldPassword);
        if (!valid)
            return res.status(401).json({ success: false, message: 'Incorrect current password' });
        user.password = newPassword;
        await user.save();
        res.json({ success: true, message: 'Password updated successfully' });
    }
    catch {
        res.status(500).json({ success: false, message: 'Password change failed' });
    }
};
exports.changePassword = changePassword;
