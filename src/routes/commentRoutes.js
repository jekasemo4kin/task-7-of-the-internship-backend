const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const { protect } = require('../middlewares/authMiddleware');

router.get('/item/:itemId', commentController.getCommentsByItem);
router.post('/item/:itemId', protect, commentController.addCommentToItem);

router.get('/inventory/:inventoryId', commentController.getCommentsByInventory);
router.post('/inventory/:inventoryId', protect, commentController.addCommentToInventory);
module.exports = router;