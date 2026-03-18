const express = require('express');
const router = express.Router();
const {
    getArchives,
    createFolder,
    uploadDocument,
    deleteFolder,
    deleteDocument
} = require('../controllers/archiveController');
const { protect } = require('../middleware/auth');
const documentUpload = require('../middleware/documentUpload');

router.use(protect);

router.route('/')
    .get(getArchives);

router.route('/folders')
    .post(createFolder);

router.route('/folders/:id')
    .delete(deleteFolder);

router.route('/documents')
    .post(documentUpload.single('file'), uploadDocument);

router.route('/documents/:id')
    .delete(deleteDocument);

module.exports = router;
