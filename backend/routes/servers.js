const express = require('express');
const router = express.Router();
const {
    createServer,
    getServers,
    getServer,
    updateServer,
    deleteServer,
    requestJoin,
    acceptRequest,
    rejectRequest,
    leaveServer,
    getServerRequests,
    getServerMembers
} = require('../controllers/serverController');
const { getServerPosts, createPost } = require('../controllers/serverPostController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.use(protect);

router.post('/create', upload.single('icon'), createServer);
router.get('/', getServers);
router.get('/:id', getServer);
router.put('/:id', upload.single('icon'), updateServer);
router.delete('/:id', deleteServer);

router.post('/:id/request-join', requestJoin);
router.post('/requests/:requestId/accept', acceptRequest);
router.post('/requests/:requestId/reject', rejectRequest);
router.get('/:id/requests', getServerRequests);
router.post('/:id/leave', leaveServer);
router.get('/:id/members', getServerMembers);

// Posts in server
router.get('/:id/posts', getServerPosts);
router.post('/:id/posts', upload.single('image'), createPost);

module.exports = router;
