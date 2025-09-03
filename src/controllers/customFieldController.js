const customFieldService = require('../services/customFieldService');
const inventoryService = require('../services/inventoryService');

const createCustomField = async (req, res) => {
  try {
    const { inventoryId } = req.params;
    const inventory = await inventoryService.getInventoryById(inventoryId);
    if (!inventory || (inventory.createdById !== req.user.id && req.user.role !== 'ADMIN')) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    const customField = await customFieldService.createCustomField(inventoryId, req.body);
    res.status(201).json(customField);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create custom field' });
  }
};
const updateCustomField = async (req, res) => {
  try {
    const { id } = req.params;
    const field = await customFieldService.getCustomFieldById(id);
    const inventory = await inventoryService.getInventoryById(field.inventoryId);
    if (!inventory || (inventory.createdById !== req.user.id && req.user.role !== 'ADMIN')) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    const updatedField = await customFieldService.updateCustomField(id, req.body);
    res.json(updatedField);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update custom field' });
  }
};
const deleteCustomField = async (req, res) => {
  try {
    const { id } = req.params;
    const field = await customFieldService.getCustomFieldById(id);
    const inventory = await inventoryService.getInventoryById(field.inventoryId);
    if (!inventory || (inventory.createdById !== req.user.id && req.user.role !== 'ADMIN')) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    await customFieldService.deleteCustomField(id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete custom field' });
  }
};
module.exports = {
  createCustomField,
  updateCustomField,
  deleteCustomField,
};