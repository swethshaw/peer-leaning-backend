"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const HelpTicket_1 = __importDefault(require("../models/HelpTicket"));
const router = express_1.default.Router();
router.post('/ticket', async (req, res) => {
    try {
        const ticket = await HelpTicket_1.default.create(req.body);
        res.status(201).json({ success: true, data: ticket });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
router.get('/tickets', async (req, res) => {
    try {
        const tickets = await HelpTicket_1.default.find().sort({ createdAt: -1 });
        res.json({ success: true, data: tickets });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
router.post('/tickets/:id/like', async (req, res) => {
    try {
        const { userId } = req.body;
        const ticket = await HelpTicket_1.default.findById(req.params.id);
        if (!ticket)
            return res.status(404).json({ success: false, message: 'Ticket not found' });
        const index = ticket.likes.indexOf(userId);
        if (index === -1)
            ticket.likes.push(userId);
        else
            ticket.likes.splice(index, 1);
        await ticket.save();
        res.json({ success: true, data: ticket });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
router.post('/tickets/:id/comment', async (req, res) => {
    try {
        const { userId, userName, text } = req.body;
        const ticket = await HelpTicket_1.default.findByIdAndUpdate(req.params.id, { $push: { comments: { userId, userName, text } } }, { new: true });
        res.json({ success: true, data: ticket });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
exports.default = router;
