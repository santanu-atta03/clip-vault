const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, '..', 'uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, `doc-${Date.now()}${path.extname(file.originalname)}`);
    }
});

// Check file type
function checkFileType(file, cb) {
    // Allowed extensions (documents)
    const filetypes = /pdf|doc|docx|txt|xls|xlsx|ppt|pptx|csv|rtf/;
    // Allowed mimetypes
    const mimetypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'text/csv',
        'application/rtf'
    ];

    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = mimetypes.includes(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Error: Documents Only! (PDF, DOCX, TXT, etc.)'));
    }
}

// Init upload
const documentUpload = multer({
    storage: storage,
    limits: { fileSize: 20000000 }, // 20MB limit for documents
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    }
});

module.exports = documentUpload;
