const statsService = require('../services/statsService');
const inventoryService = require('../services/inventoryService');
const getStats = async (req, res) => {
  try {
    const { inventoryId } = req.params;
    
    if (!req.user) {
        console.log(`403 Forbidden: User not authenticated for inventory ${inventoryId}`);
        return res.status(403).json({ message: 'Forbidden: You are not authenticated.' });
    }

    const inventory = await inventoryService.getInventoryById(inventoryId);
    if (!inventory) {
      console.log(`404 Not Found: Inventory with ID ${inventoryId} not found`);
      return res.status(404).json({ message: 'Inventory not found' });
    }

    console.log(`User ID: ${req.user.id}, User Role: ${req.user.role}`);
    console.log(`Inventory Creator ID: ${inventory.createdById}`);

    const isOwnerOrAdmin = inventory.createdById === req.user.id || req.user.role === 'ADMIN';

    if (!isOwnerOrAdmin) {
        console.log(`403 Forbidden: User ${req.user.id} does not have permission for inventory ${inventoryId}`);
        return res.status(403).json({ message: 'Forbidden: You do not have permission to view these statistics.' });
    }

    const stats = await statsService.calculateAndGetInventoryStats(inventoryId);
    res.json(stats);
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
};
module.exports = {
  getStats,
};