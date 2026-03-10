const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [false, 'Please provide a title'],
        trim: true,
        maxlength: [100, 'Title cannot be more than 100 characters']
    },
    content: {
        type: String,
        required: [true, 'Please provide content'],
    },
    image: {
        type: String,
        default: null
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    isPinned: {
        type: Boolean,
        default: false
    },
    tags: [String],
    color: {
        type: String,
        default: '#1f2937' // Default dark gray
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Note', noteSchema);
