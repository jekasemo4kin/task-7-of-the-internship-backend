const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const { protect } = require('../middlewares/authMiddleware');
const upload = require('../utils/cloudinary');
const { validateInventory } = require('../middlewares/validation');
router.get('/my', protect, inventoryController.getMyInventories);
router.get('/with-access', protect, inventoryController.getInventoriesWithAccess);
router.get('/', inventoryController.getAllInventories); 
router.get('/:id', inventoryController.getSingleInventory); 

router.post('/', protect, upload.single('image'), validateInventory, inventoryController.createInventory);
router.post('/:id/custom-id/preview', protect, inventoryController.generateCustomIdPreview);

router.put('/:id', protect, upload.single('image'), inventoryController.updateInventory);
router.put('/:id/access-settings', protect, inventoryController.updateAccessSettings);
router.put('/:id/custom-id-config', protect, inventoryController.updateCustomIdConfig);
router.delete('/:id', protect, inventoryController.deleteInventory);
module.exports = router;