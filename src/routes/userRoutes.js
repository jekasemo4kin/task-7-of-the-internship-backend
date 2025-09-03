const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middlewares/authMiddleware');

router.get('/', protect, userController.getAllUsers);
router.put('/role', protect, userController.updateUserRole);

module.exports = router;