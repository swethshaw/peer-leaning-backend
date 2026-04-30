"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const User_1 = __importDefault(require("../models/User"));
const notification_1 = __importDefault(require("../models/notification"));
const router = express_1.default.Router();
router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            res.status(400).json({ success: false, message: 'Please provide all fields' });
            return;
        }
        const existingUser = await User_1.default.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            res.status(400).json({ success: false, message: 'Account with this email already exists' });
            return;
        }
        const salt = await bcrypt_1.default.genSalt(10);
        const hashedPassword = await bcrypt_1.default.hash(password, salt);
        const newUser = new User_1.default({
            name,
            email: email.toLowerCase(),
            password: hashedPassword
        });
        await newUser.save();
        try {
            await notification_1.default.create({
                userId: newUser._id,
                cohort: "System",
                type: "achievement",
                title: "Welcome to PeerLearning!",
                message: `Hi ${name.split(' ')[0]}, we are thrilled to have you here. Start by exploring the Dashboard or joining a Cohort.`
            });
        }
        catch (notifError) {
            console.error("Failed to generate welcome notification:", notifError);
        }
        const userObject = newUser.toObject();
        delete userObject.password;
        res.status(201).json({ success: true, data: userObject });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({ success: false, message: 'Please provide email and password' });
            return;
        }
        const user = await User_1.default.findOne({ email: email.toLowerCase() });
        if (!user) {
            res.status(404).json({ success: false, message: 'Invalid email or password.' });
            return;
        }
        const isMatch = await bcrypt_1.default.compare(password, user.password);
        if (!isMatch) {
            res.status(400).json({ success: false, message: 'Invalid email or password.' });
            return;
        }
        const userObject = user.toObject();
        delete userObject.password;
        try {
            await notification_1.default.create({
                userId: user._id,
                cohort: "System",
                type: "achievement",
                title: "Security Alert: New Login",
                message: `Welcome back, ${user.name}! A new login was detected on your account.`
            });
        }
        catch (notifError) {
            console.error("Failed to generate login notification:", notifError);
        }
        res.json({ success: true, data: userObject });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
router.get('/:id', async (req, res) => {
    try {
        const user = await User_1.default.findById(req.params.id).select('-password');
        if (!user) {
            res.status(404).json({ success: false, message: 'User not found' });
            return;
        }
        res.json({ success: true, data: user });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
router.patch('/:id', async (req, res) => {
    try {
        if (req.body.password)
            delete req.body.password;
        if (req.body.email)
            delete req.body.email;
        const updatedUser = await User_1.default.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true }).select('-password');
        if (!updatedUser) {
            res.status(404).json({ success: false, message: 'User not found' });
            return;
        }
        res.json({ success: true, data: updatedUser });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
router.put('/:id/password', async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User_1.default.findById(req.params.id);
        if (!user) {
            res.status(404).json({ success: false, message: 'User not found' });
            return;
        }
        const isMatch = await bcrypt_1.default.compare(currentPassword, user.password);
        if (!isMatch) {
            res.status(400).json({ success: false, message: 'Current password is incorrect' });
            return;
        }
        const salt = await bcrypt_1.default.genSalt(10);
        user.password = await bcrypt_1.default.hash(newPassword, salt);
        await user.save();
        res.json({ success: true, message: 'Password updated successfully' });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
exports.default = router;
