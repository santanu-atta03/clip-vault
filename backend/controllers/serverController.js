const Server = require('../models/Server');
const ServerMember = require('../models/ServerMember');
const JoinRequest = require('../models/JoinRequest');

// @desc    Create a server
// @route   POST /api/servers/create
// @access  Private
exports.createServer = async (req, res) => {
    try {
        const { name, description } = req.body;
        const icon = req.file ? `/uploads/${req.file.filename}` : null;

        const server = await Server.create({
            name,
            description,
            icon,
            owner: req.user._id
        });

        // Add owner as member
        await ServerMember.create({
            server: server._id,
            user: req.user._id,
            role: 'Owner'
        });

        res.status(201).json(server);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get all servers (discovery)
// @route   GET /api/servers
// @access  Private
exports.getServers = async (req, res) => {
    try {
        const { search } = req.query;
        let query = {};

        if (search) {
            query = {
                $or: [
                    { name: { $regex: search, $options: 'i' } },
                    { description: { $regex: search, $options: 'i' } }
                ]
            };
        }

        const servers = await Server.find(query).lean();

        // Add member count and check if user is member
        const processedServers = await Promise.all(servers.map(async (server) => {
            const memberCount = await ServerMember.countDocuments({ server: server._id });
            const userMember = await ServerMember.findOne({ server: server._id, user: req.user._id });
            const pendingRequest = await JoinRequest.findOne({ server: server._id, user: req.user._id, status: 'Pending' });

            return {
                ...server,
                memberCount,
                isMember: !!userMember,
                hasPendingRequest: !!pendingRequest,
                role: userMember ? userMember.role : null
            };
        }));

        res.json(processedServers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single server
// @route   GET /api/servers/:id
// @access  Private
exports.getServer = async (req, res) => {
    try {
        const server = await Server.findById(req.params.id);
        if (!server) {
            return res.status(404).json({ message: 'Server not found' });
        }

        const memberCount = await ServerMember.countDocuments({ server: server._id });
        const userMember = await ServerMember.findOne({ server: server._id, user: req.user._id });

        res.json({
            ...server._doc,
            memberCount,
            isMember: !!userMember,
            role: userMember ? userMember.role : null
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update server
// @route   PUT /api/servers/:id
// @access  Private
exports.updateServer = async (req, res) => {
    try {
        const server = await Server.findById(req.params.id);
        if (!server) {
            return res.status(404).json({ message: 'Server not found' });
        }

        // Check permissions (Owner/Admin)
        const member = await ServerMember.findOne({ server: server._id, user: req.user._id });
        if (!member || (member.role !== 'Owner' && member.role !== 'Admin')) {
            return res.status(403).json({ message: 'Not authorized to update this server' });
        }

        const { name, description } = req.body;
        if (name) server.name = name;
        if (description) server.description = description;
        if (req.file) server.icon = `/uploads/${req.file.filename}`;

        await server.save();
        res.json(server);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete server
// @route   DELETE /api/servers/:id
// @access  Private
exports.deleteServer = async (req, res) => {
    try {
        const server = await Server.findById(req.params.id);
        if (!server) {
            return res.status(404).json({ message: 'Server not found' });
        }

        // Only owner can delete
        if (server.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Only the owner can delete the server' });
        }

        await Server.findByIdAndDelete(req.params.id);
        await ServerMember.deleteMany({ server: req.params.id });
        // Optionally delete posts and join requests too
        res.json({ message: 'Server deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Request to join server
// @route   POST /api/servers/:id/request-join
// @access  Private
exports.requestJoin = async (req, res) => {
    try {
        const server = await Server.findById(req.params.id);
        if (!server) {
            return res.status(404).json({ message: 'Server not found' });
        }

        // Check if already a member
        const existingMember = await ServerMember.findOne({ server: server._id, user: req.user._id });
        if (existingMember) {
            return res.status(400).json({ message: 'Already a member of this server' });
        }

        // Check if already has a pending request
        const existingRequest = await JoinRequest.findOne({ server: server._id, user: req.user._id, status: 'Pending' });
        if (existingRequest) {
            return res.status(400).json({ message: 'Join request already pending' });
        }

        const request = await JoinRequest.create({
            server: server._id,
            user: req.user._id
        });

        // Notify owner/admins
        if (req.app.get('io')) {
            // We can emit to a server-specific admin channel or just the server room
            // For simplicity, let's emit to the server room and handle it on client
            req.app.get('io').to(server._id.toString()).emit('join_request', {
                serverName: server.name,
                user: req.user.username
            });
        }

        res.status(201).json(request);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Accept join request
// @route   POST /api/servers/requests/:requestId/accept
// @access  Private
exports.acceptRequest = async (req, res) => {
    try {
        const request = await JoinRequest.findById(req.params.requestId).populate('server');
        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }

        // Check permissions (Owner/Admin of the server)
        const member = await ServerMember.findOne({ server: request.server._id, user: req.user._id });
        if (!member || (member.role !== 'Owner' && member.role !== 'Admin')) {
            return res.status(403).json({ message: 'Not authorized to accept requests' });
        }

        request.status = 'Accepted';
        await request.save();

        // Add user as member
        await ServerMember.create({
            server: request.server._id,
            user: request.user,
            role: 'Member'
        });

        // Notify the user who requested
        if (req.app.get('io')) {
            req.app.get('io').to(request.user.toString()).emit('member_joined', {
                serverId: request.server._id,
                serverName: request.server.name
            });
        }

        res.json({ message: 'Request accepted' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Reject join request
// @route   POST /api/servers/requests/:requestId/reject
// @access  Private
exports.rejectRequest = async (req, res) => {
    try {
        const request = await JoinRequest.findById(req.params.requestId);
        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }

        // Check permissions
        const member = await ServerMember.findOne({ server: request.server, user: req.user._id });
        if (!member || (member.role !== 'Owner' && member.role !== 'Admin')) {
            return res.status(403).json({ message: 'Not authorized to reject requests' });
        }

        request.status = 'Rejected';
        await request.save();

        res.json({ message: 'Request rejected' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Leave server
// @route   POST /api/servers/:id/leave
// @access  Private
exports.leaveServer = async (req, res) => {
    try {
        const server = await Server.findById(req.params.id);
        if (!server) {
            return res.status(404).json({ message: 'Server not found' });
        }

        // Owners cannot leave, they must delete or transfer (transfer not implemented here)
        if (server.owner.toString() === req.user._id.toString()) {
            return res.status(400).json({ message: 'Owner cannot leave the server' });
        }

        await ServerMember.findOneAndDelete({ server: req.params.id, user: req.user._id });
        res.json({ message: 'Left server' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get pending join requests for a server
// @route   GET /api/servers/:id/requests
// @access  Private
exports.getServerRequests = async (req, res) => {
    try {
        const member = await ServerMember.findOne({ server: req.params.id, user: req.user._id });
        if (!member || (member.role !== 'Owner' && member.role !== 'Admin')) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const requests = await JoinRequest.find({ server: req.params.id, status: 'Pending' }).populate('user', 'username email');
        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get server members
// @route   GET /api/servers/:id/members
// @access  Private
exports.getServerMembers = async (req, res) => {
    try {
        const members = await ServerMember.find({ server: req.params.id }).populate('user', 'username email');
        res.json(members);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
