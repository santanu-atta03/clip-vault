const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'clipvault/documents',
        resource_type: 'auto',
        // Cloudinary allows these formats
        allowed_formats: ['pdf', 'doc', 'docx', 'txt', 'xls', 'xlsx', 'ppt', 'pptx', 'csv', 'rtf'],
    }
});

// Init upload
const documentUpload = multer({
    storage: storage,
    limits: { fileSize: 20000000 }, // 20MB limit for documents
});

module.exports = documentUpload;

