const express = require('express');
const router = express.Router();
const customFieldController = require('../controllers/customFieldController');
const { protect } = require('../middlewares/authMiddleware');
router.post('/:inventoryId', protect, customFieldController.createCustomField);
router.put('/:id', protect, customFieldController.updateCustomField);
router.delete('/:id', protect, customFieldController.deleteCustomField);
module.exports = router;