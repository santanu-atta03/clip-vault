const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
    originalName: {
        type: String,
        required: true,
        trim: true
    },
    fileName: {
        type: String,
        required: true
    },
    mimeType: {
        type: String,
        required: true
    },
    size: {
        type: Number,
        required: true
    },
    url: {
        type: String,
        required: true
    },
    folder: {
        type: mongoose.Schema.ObjectId,
        ref: 'Folder',
        default: null // Null means root directory
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Document', documentSchema);
