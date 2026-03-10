const mongoose = require('mongoose');

const serverPostSchema = new mongoose.Schema({
    text: {
        type: String,
        required: [true, 'Please provide text content']
    },
    image: {
        type: String,
        default: null
    },
    author: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    server: {
        type: mongoose.Schema.ObjectId,
        ref: 'Server',
        required: true
    }
}, {
    timestamps: true
});

// Index for performance
serverPostSchema.index({ server: 1 });
serverPostSchema.index({ author: 1 });

module.exports = mongoose.model('ServerPost', serverPostSchema);
