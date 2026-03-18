const Folder = require('../models/Folder');
const Document = require('../models/Document');

// @desc    Get all folders and docs in a specific folder (or root)
// @route   GET /api/archives?folderId=xxx
// @access  Private
const getArchives = async (req, res) => {
    try {
        const parentFolder = req.query.folderId || null;

        const folders = await Folder.find({ user: req.user._id, parentFolder }).sort({ createdAt: -1 });
        const documents = await Document.find({ user: req.user._id, folder: parentFolder }).sort({ createdAt: -1 });

        // Get path breadcrumbs
        let breadcrumbs = [];
        if (parentFolder) {
            let currentFolder = await Folder.findById(parentFolder);
            while (currentFolder) {
                breadcrumbs.unshift({ _id: currentFolder._id, name: currentFolder.name });
                if (currentFolder.parentFolder) {
                    currentFolder = await Folder.findById(currentFolder.parentFolder);
                } else {
                    currentFolder = null;
                }
            }
        }

        res.json({
            folders,
            documents,
            breadcrumbs
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a new folder
// @route   POST /api/archives/folders
// @access  Private
const createFolder = async (req, res) => {
    try {
        const { name, parentFolder, color } = req.body;

        const folder = await Folder.create({
            name,
            parentFolder: parentFolder || null,
            user: req.user._id,
            color
        });

        res.status(201).json(folder);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Upload new document
// @route   POST /api/archives/documents
// @access  Private
const uploadDocument = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Please upload a valid document file' });
        }

        const { folder } = req.body;

        const doc = await Document.create({
            originalName: req.file.originalname,
            fileName: req.file.filename,
            mimeType: req.file.mimetype,
            size: req.file.size,
            url: `/uploads/${req.file.filename}`,
            folder: folder && folder !== 'null' ? folder : null,
            user: req.user._id
        });

        res.status(201).json(doc);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete a folder
// @route   DELETE /api/archives/folders/:id
// @access  Private
const deleteFolder = async (req, res) => {
    try {
        const folder = await Folder.findById(req.params.id);

        if (!folder) {
            return res.status(404).json({ message: 'Folder not found' });
        }

        if (folder.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        // Recursively deleting documents inside the folder goes beyond basic scope, 
        // but let's simple delete the folder. Child contents will be orphaned unless we clean up.
        await folder.deleteOne();
        await Document.deleteMany({ folder: folder._id });
        await Folder.deleteMany({ parentFolder: folder._id });

        res.json({ message: 'Folder deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a document
// @route   DELETE /api/archives/documents/:id
// @access  Private
const deleteDocument = async (req, res) => {
    try {
        const doc = await Document.findById(req.params.id);

        if (!doc) {
            return res.status(404).json({ message: 'Document not found' });
        }

        if (doc.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        await doc.deleteOne();

        res.json({ message: 'Document removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getArchives,
    createFolder,
    uploadDocument,
    deleteFolder,
    deleteDocument
};
