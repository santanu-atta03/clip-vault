const mongoose = require('mongoose');

const folderSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a folder name'],
        trim: true,
        maxlength: [100, 'Folder name cannot be more than 100 characters']
    },
    parentFolder: {
        type: mongoose.Schema.ObjectId,
        ref: 'Folder',
        default: null
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    color: {
        type: String,
        default: '#4f46e5' // Default indigo
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Folder', folderSchema);
