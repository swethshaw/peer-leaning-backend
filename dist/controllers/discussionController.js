"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteDiscussion = exports.likeDiscussion = exports.replyToDiscussion = exports.createDiscussion = exports.getDiscussionById = exports.getDiscussions = void 0;
const Discussion_1 = __importDefault(require("../models/Discussion"));
// GET /api/discussions
const getDiscussions = async (req, res) => {
    try {
        const { cohortId, courseId, page = 1, limit = 20 } = req.query;
        const filter = {};
        if (cohortId)
            filter.cohortId = cohortId;
        if (courseId)
            filter.courseId = courseId;
        const posts = await Discussion_1.default.find(filter)
            .populate('author', 'name avatar')
            .sort({ createdAt: -1 })
            .skip((+page - 1) * +limit)
            .limit(+limit)
            .lean();
        res.json({ success: true, data: posts });
    }
    catch {
        res.status(500).json({ success: false, message: 'Failed to fetch discussions' });
    }
};
exports.getDiscussions = getDiscussions;
// GET /api/discussions/:id
const getDiscussionById = async (req, res) => {
    try {
        const post = await Discussion_1.default.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } }, { new: true })
            .populate('author', 'name avatar')
            .populate('replies.author', 'name avatar')
            .lean();
        if (!post)
            return res.status(404).json({ success: false, message: 'Post not found' });
        res.json({ success: true, data: post });
    }
    catch {
        res.status(500).json({ success: false, message: 'Failed to fetch discussion' });
    }
};
exports.getDiscussionById = getDiscussionById;
// POST /api/discussions
const createDiscussion = async (req, res) => {
    try {
        const { title, content, tags, cohortId, courseId } = req.body;
        if (!title || !content) {
            return res.status(400).json({ success: false, message: 'Title and content are required' });
        }
        const post = await Discussion_1.default.create({
            title, content, tags: tags ?? [],
            author: req.user?._id,
            cohortId, courseId,
        });
        const populated = await post.populate('author', 'name avatar');
        res.status(201).json({ success: true, data: populated });
    }
    catch {
        res.status(500).json({ success: false, message: 'Failed to create post' });
    }
};
exports.createDiscussion = createDiscussion;
// POST /api/discussions/:id/replies
const replyToDiscussion = async (req, res) => {
    try {
        const { content } = req.body;
        if (!content)
            return res.status(400).json({ success: false, message: 'Content required' });
        const post = await Discussion_1.default.findByIdAndUpdate(req.params.id, { $push: { replies: { content, author: req.user?._id, likes: 0 } } }, { new: true })
            .populate('author', 'name avatar')
            .populate('replies.author', 'name avatar');
        if (!post)
            return res.status(404).json({ success: false, message: 'Post not found' });
        res.json({ success: true, data: post });
    }
    catch {
        res.status(500).json({ success: false, message: 'Failed to add reply' });
    }
};
exports.replyToDiscussion = replyToDiscussion;
// PATCH /api/discussions/:id/like
const likeDiscussion = async (req, res) => {
    try {
        const post = await Discussion_1.default.findByIdAndUpdate(req.params.id, { $inc: { likes: 1 } }, { new: true });
        if (!post)
            return res.status(404).json({ success: false, message: 'Post not found' });
        res.json({ success: true, data: { likes: post.likes } });
    }
    catch {
        res.status(500).json({ success: false, message: 'Failed to like post' });
    }
};
exports.likeDiscussion = likeDiscussion;
// DELETE /api/discussions/:id
const deleteDiscussion = async (req, res) => {
    try {
        const post = await Discussion_1.default.findById(req.params.id);
        if (!post)
            return res.status(404).json({ success: false, message: 'Post not found' });
        if (post.author.toString() !== req.user?._id && req.user?.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }
        await post.deleteOne();
        res.json({ success: true, message: 'Post deleted' });
    }
    catch {
        res.status(500).json({ success: false, message: 'Failed to delete post' });
    }
};
exports.deleteDiscussion = deleteDiscussion;
