const ServerPost = require('../models/ServerPost');
const ServerMember = require('../models/ServerMember');

// @desc    Get all posts for a server
// @route   GET /api/servers/:id/posts
// @access  Private
exports.getServerPosts = async (req, res) => {
    try {
        // Check if user is a member
        const member = await ServerMember.findOne({ server: req.params.id, user: req.user._id });
        if (!member) {
            return res.status(403).json({ message: 'Must be a member to view posts' });
        }

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const posts = await ServerPost.find({ server: req.params.id })
            .populate('author', 'username')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await ServerPost.countDocuments({ server: req.params.id });

        res.json({
            posts,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalPosts: total
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a post in a server
// @route   POST /api/servers/:id/posts
// @access  Private
exports.createPost = async (req, res) => {
    try {
        const { text } = req.body;
        const image = req.file ? `/uploads/${req.file.filename}` : null;

        // Check membership
        const member = await ServerMember.findOne({ server: req.params.id, user: req.user._id });
        if (!member) {
            return res.status(403).json({ message: 'Must be a member to post' });
        }

        const post = await ServerPost.create({
            text,
            image,
            author: req.user._id,
            server: req.params.id
        });

        const populatedPost = await ServerPost.findById(post._id).populate('author', 'username');

        // Socket.io event will be handled in routes or server.js
        if (req.app.get('io')) {
            req.app.get('io').to(req.params.id).emit('new_post', populatedPost);
        }

        res.status(201).json(populatedPost);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete a post
// @route   DELETE /api/posts/:id
// @access  Private
exports.deletePost = async (req, res) => {
    try {
        const post = await ServerPost.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Check if author or Admin/Owner
        const member = await ServerMember.findOne({ server: post.server, user: req.user._id });

        const isAuthor = post.author.toString() === req.user._id.toString();
        const isAdmin = member && (member.role === 'Admin' || member.role === 'Owner');

        if (!isAuthor && !isAdmin) {
            return res.status(403).json({ message: 'Not authorized to delete this post' });
        }

        await ServerPost.findByIdAndDelete(req.params.id);

        if (req.app.get('io')) {
            req.app.get('io').to(post.server.toString()).emit('post_deleted', req.params.id);
        }

        res.json({ message: 'Post deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
