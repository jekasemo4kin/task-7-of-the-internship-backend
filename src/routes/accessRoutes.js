const express = require('express');
const router = express.Router();
const accessController = require('../controllers/accessController');
const { protect } = require('../middlewares/authMiddleware');
router.post('/:inventoryId', protect, accessController.grantAccess);
router.put('/:inventoryId/:userId', protect, accessController.updateAccess);
router.delete('/:inventoryId/:userId', protect, accessController.removeAccess);
router.get('/:inventoryId', protect, accessController.getAccess);
module.exports = router;