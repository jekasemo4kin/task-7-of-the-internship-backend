const userService = require('../services/userService');

const getAllUsers = async (req, res) => {
    try {
        const users = await userService.getAllUsers();
        res.status(200).json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Error fetching users' });
    }
};

const updateUserRole = async (req, res) => {
  try {
    const { userId, newRole } = req.body;
    if (!['USER', 'ADMIN'].includes(newRole)) {
      return res.status(400).json({ message: 'Invalid role provided' });
    }
    const updatedUser = await userService.updateUserRole(userId, newRole);
    res.status(200).json(updatedUser);
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ message: 'Error updating user role' });
  }
};

module.exports = {
    getAllUsers,
    updateUserRole,
};