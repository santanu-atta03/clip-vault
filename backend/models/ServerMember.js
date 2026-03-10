const mongoose = require('mongoose');

const serverMemberSchema = new mongoose.Schema({
    server: {
        type: mongoose.Schema.ObjectId,
        ref: 'Server',
        required: true
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    role: {
        type: String,
        enum: ['Owner', 'Admin', 'Member'],
        default: 'Member'
    }
}, {
    timestamps: true
});

// Index for performance
serverMemberSchema.index({ server: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('ServerMember', serverMemberSchema);
