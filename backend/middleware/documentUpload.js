const multer = require('multer');
const path = require('path');

const storage = multer.memoryStorage();

// Check file type
function checkFileType(file, cb) {
    const filetypes = /pdf|doc|docx|txt|xls|xlsx|ppt|pptx|csv|rtf/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
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



