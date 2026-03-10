const express = require('express');
const router = express.Router();
const { deletePost } = require('../controllers/serverPostController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.delete('/:id', deletePost);

module.exports = router;
