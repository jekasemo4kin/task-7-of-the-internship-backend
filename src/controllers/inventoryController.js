const inventoryService = require('../services/inventoryService');
const customFieldService = require('../services/customFieldService');
const accessService = require('../services/accessService');

const getAllInventories = async (req, res) => {
  try {
    const filters = req.query;
    const inventories = await inventoryService.getInventories(filters);
    res.json(inventories);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch inventories' });
  }
};
const getSingleInventory = async (req, res) => {
  try {
    const { id } = req.params;
    const inventory = await inventoryService.getInventoryById(id);
    if (!inventory) {
      return res.status(404).json({ error: 'Inventory not found' });
    }
    res.json(inventory);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch inventory' });
  }
};
const createInventory = async (req, res) => {
  try {
    const { title, description, category, isPublic, customIdConfig, customFields, tags } = req.body;
    const imageUrl = req.file ? req.file.path : null;
    const parsedIsPublic = isPublic === 'true';
    let parsedCustomFields = [];
    if (customFields) {
      if (typeof customFields === 'string') {
        parsedCustomFields = JSON.parse(customFields);
      } else {
        parsedCustomFields = customFields;
      }
    }
    let parsedTags = [];
    if (tags) {
      if (typeof tags === 'string') {
        parsedTags = JSON.parse(tags);
      } else {
        parsedTags = tags;
      }
    }
    const inventory = await inventoryService.createInventory({ 
      title, 
      description, 
      category, 
      isPublic: parsedIsPublic, 
      customIdConfig, 
      imageUrl, 
      customFields: parsedCustomFields, 
      tags: parsedTags
    }, req.user.id);
    if (parsedCustomFields && parsedCustomFields.length > 0) {
      await Promise.all(parsedCustomFields.map(async (field) => {
        await customFieldService.createCustomField(inventory.id, field);
      }));
    }
    res.status(201).json(inventory);
  } catch (error) {
    console.error('Error in createInventory:', error);
    res.status(500).json({ error: 'Failed to create inventory' });
  }
};
const updateInventory = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, category, isPublic, tags, customFields, version } = req.body;
    const imageUrl = req.file ? req.file.path : undefined;
    const inventory = await inventoryService.getInventoryById(id);
    if (inventory.createdById !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Forbidden: You do not have permission to update this inventory' });
    }
    const updateData = { 
      title, 
      description, 
      category, 
      isPublic: isPublic === 'true', 
      tags, 
      imageUrl, 
      customFields,
      version: parseInt(version, 10), 
    };
    const updatedInventory = await inventoryService.updateInventory(id, { ...updateData });
    res.json(updatedInventory);
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(409).json({ message: 'Conflict: Inventory has been updated by another user. Please reload and try again.' });
    }
    console.error('Error in updateInventory:', error);
    res.status(500).json({ error: 'Failed to update inventory' });
  }
};
const deleteInventory = async (req, res) => {
  try {
    const { id } = req.params;
    const inventory = await inventoryService.getInventoryById(id);
    if (inventory.createdById !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Forbidden: You do not have permission to delete this inventory' });
    }
    await inventoryService.deleteInventory(id);
    res.status(204).json({ message: 'Inventory deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete inventory' });
  }
};
const getMyInventories = async (req, res) => {
  try {
    const filters = req.query;
    const inventories = await inventoryService.getInventoriesByUserId(req.user.id, filters);
    res.json(inventories);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user inventories.' });
  }
};
const getInventoriesWithAccess = async (req, res) => {
  try {
    const filters = req.query;
    const inventories = await inventoryService.getInventoriesWithAccess(req.user.id, filters);
    res.json(inventories);
  } catch (error) {
    console.error('Error fetching inventories with access:', error);
    res.status(500).json({ error: 'Failed to fetch inventories with access.' });
  }
};

const updateAccessSettings = async (req, res) => {
    const { id } = req.params;
    const { isPublic, accessRights } = req.body;
    const { user } = req;

    try {
        const inventory = await inventoryService.getInventoryById(id);
        if (!inventory) {
            return res.status(404).json({ message: 'Inventory not found.' });
        }
        
        if (inventory.createdById !== user.id && user.role !== 'ADMIN') {
            return res.status(403).json({ message: 'Forbidden. You do not have permission to edit access settings.' });
        }

        const updatedInventory = await inventoryService.updateAccessSettings(id, isPublic, accessRights);
        res.status(200).json(updatedInventory);
    } catch (error) {
        console.error('Error updating access settings:', error);
        res.status(500).json({ message: 'Error updating access settings.' });
    }
};

const updateCustomIdConfig = async (req, res) => {
    try {
        const { customIdConfig } = req.body;
        const inventoryId = req.params.id;
        const updatedInventory = await inventoryService.updateCustomIdConfig(inventoryId, customIdConfig);
        res.status(200).json(updatedInventory);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const generateCustomIdPreview = async (req, res) => {
    try {
        const { config } = req.body;
        const inventoryId = req.params.id;
        console.log('Received config for preview:', JSON.stringify(config, null, 2));
        const previewId = await inventoryService.generatePreview(inventoryId, config);
        console.log('Generated preview:', previewId);
        res.status(200).json({ previewId });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
  getAllInventories,
  getSingleInventory,
  createInventory,
  updateInventory,
  deleteInventory,
  getMyInventories,
  getInventoriesWithAccess,
  updateAccessSettings,
  updateCustomIdConfig,
  generateCustomIdPreview,
};