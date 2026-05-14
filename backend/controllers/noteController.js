const Note = require('../models/Note');
const cloudinary = require('../config/cloudinary');

// Helper to upload buffer to Cloudinary
const uploadToCloudinary = (buffer, options) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(options, (error, result) => {
            if (error) return reject(error);
            resolve(result);
        });
        uploadStream.end(buffer);
    });
};


// @desc    Get all notes for a user
// @route   GET /api/notes
// @access  Private
const getNotes = async (req, res) => {
    try {
        const notes = await Note.find({ user: req.user._id }).sort({ isPinned: -1, createdAt: -1 });
        res.json(notes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a new note
// @route   POST /api/notes
// @access  Private
const createNote = async (req, res) => {
    const { title, content, isPinned, tags, color } = req.body;
    let image = null;

    if (req.file) {
        const result = await uploadToCloudinary(req.file.buffer, {
            folder: 'clipvault/images',
            transformation: [{ width: 1000, height: 1000, crop: 'limit' }]
        });
        image = result.secure_url;
    }



    try {
        const note = await Note.create({
            title,
            content,
            image: image || req.body.imageUrl || null,
            isPinned: isPinned === 'true' || isPinned === true,
            tags: tags ? (Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim())) : [],
            color,
            user: req.user._id,
        });

        const io = req.app.get('io');
        if (io) {
            io.to(req.user._id.toString()).emit('new_note', note);
        }

        res.status(201).json(note);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update a note
// @route   PUT /api/notes/:id
// @access  Private
const updateNote = async (req, res) => {
    const { title, content, isPinned, tags, color, removeImage } = req.body;

    try {
        let note = await Note.findById(req.params.id);

        if (!note) {
            return res.status(404).json({ message: 'Note not found' });
        }

        // Check if user owns the note
        if (note.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        const updateData = {
            title,
            content,
            isPinned: isPinned === 'true' || isPinned === true,
            tags: tags ? (Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim())) : [],
            color,
        };

        if (req.file) {
            const result = await uploadToCloudinary(req.file.buffer, {
                folder: 'clipvault/images',
                transformation: [{ width: 1000, height: 1000, crop: 'limit' }]
            });
            updateData.image = result.secure_url;
        } else if (removeImage === 'true' || removeImage === true) {


            updateData.image = null;
        }

        note = await Note.findByIdAndUpdate(req.params.id, updateData, {
            new: true,
        });

        res.json(note);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete a note
// @route   DELETE /api/notes/:id
// @access  Private
const deleteNote = async (req, res) => {
    try {
        const note = await Note.findById(req.params.id);

        if (!note) {
            return res.status(404).json({ message: 'Note not found' });
        }

        // Check if user owns the note
        if (note.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        await note.deleteOne();

        res.json({ message: 'Note removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getNotes,
    createNote,
    updateNote,
    deleteNote,
};
