const accessService = require('../services/accessService');
const inventoryService = require('../services/inventoryService');
const grantAccess = async (req, res) => {
  try {
    const { inventoryId } = req.params;
    const { userId, canWrite } = req.body;

    const inventory = await inventoryService.getInventoryById(inventoryId);
    if (!inventory || (inventory.createdById !== req.user.id && req.user.role !== 'ADMIN')) {
      return res.status(403).json({ message: 'Forbidden: You do not have permission to manage access.' });
    }

    const access = await accessService.createAccessRight(inventoryId, userId, canWrite);
    res.status(201).json(access);
  } catch (error) {
    res.status(500).json({ error: 'Failed to grant access' });
  }
};
const updateAccess = async (req, res) => {
  try {
    const { inventoryId, userId } = req.params;
    const { canWrite } = req.body;
    
    const inventory = await inventoryService.getInventoryById(inventoryId);
    if (!inventory || (inventory.createdById !== req.user.id && req.user.role !== 'ADMIN')) {
      return res.status(403).json({ message: 'Forbidden: You do not have permission to manage access.' });
    }

    const updatedAccess = await accessService.updateAccessRight(inventoryId, userId, canWrite);
    res.json(updatedAccess);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update access' });
  }
};
const removeAccess = async (req, res) => {
  try {
    const { inventoryId, userId } = req.params;

    const inventory = await inventoryService.getInventoryById(inventoryId);
    if (!inventory || (inventory.createdById !== req.user.id && req.user.role !== 'ADMIN')) {
      return res.status(403).json({ message: 'Forbidden: You do not have permission to manage access.' });
    }

    await accessService.deleteAccessRight(inventoryId, userId);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to remove access' });
  }
};
const getAccess = async (req, res) => {
  try {
    const { inventoryId } = req.params;
    const accessRights = await accessService.getAccessRightsByInventory(inventoryId);
    res.json(accessRights);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get access rights' });
  }
};
module.exports = {
  grantAccess,
  updateAccess,
  removeAccess,
  getAccess,
};