const express = require('express');
const router = express.Router();
const itemController = require('../controllers/itemController');
const { protect } = require('../middlewares/authMiddleware');

router.get('/:inventoryId', itemController.getItemsByInventory);
router.get('/details/:itemId', itemController.getSingleItem);
router.post('/:inventoryId', protect, itemController.createItem);
router.put('/:itemId', protect, itemController.updateItem);
router.delete('/:itemId', protect, itemController.deleteItem);

module.exports = router;