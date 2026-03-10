const mongoose = require('mongoose');

const joinRequestSchema = new mongoose.Schema({
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
    status: {
        type: String,
        enum: ['Pending', 'Accepted', 'Rejected'],
        default: 'Pending'
    }
}, {
    timestamps: true
});

// Index for performance
joinRequestSchema.index({ server: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('JoinRequest', joinRequestSchema);
