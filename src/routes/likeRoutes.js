const express = require('express');
const router = express.Router();
const likeController = require('../controllers/likeController');
const { protect } = require('../middlewares/authMiddleware');
router.post('/:itemId', protect, likeController.toggleLike);
module.exports = router;