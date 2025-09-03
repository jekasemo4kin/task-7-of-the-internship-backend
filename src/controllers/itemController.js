const itemService = require('../services/itemService');
const inventoryService = require('../services/inventoryService');
const accessService = require('../services/accessService');

const getItemsByInventory = async (req, res) => {
    try {
        const { inventoryId } = req.params;
        const items = await itemService.getItemsByInventory(inventoryId);
        res.json(items);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch items' });
    }
};
const getSingleItem = async (req, res) => {
    try {
        const { itemId } = req.params;
        const item = await itemService.getSingleItem(itemId);
        if (!item) {
            return res.status(404).json({ error: 'Item not found' });
        }
        res.json(item);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch item' });
    }
};
const createItem = async (req, res) => {
    try {
        const { inventoryId } = req.params;
        const { customData, customId } = req.body;
        const hasWriteAccess = await accessService.checkWriteAccess(inventoryId, req.user);
        if (!hasWriteAccess) {
            return res.status(403).json({ message: 'Forbidden' });
        }

        const item = await itemService.createItem(inventoryId, { customData, customId }, req.user.id);
        res.status(201).json(item);
    } catch (error) {
        console.error("Error in createItem:", error);
        if (error.message === 'Custom ID already exists.') {
            return res.status(409).json({ error: 'Custom ID already exists.' });
        }
        res.status(500).json({ error: 'Failed to create item' });
    }
};
const updateItem = async (req, res) => {
    try {
        const { itemId } = req.params;
        const { version, ...updateData } = req.body;
        const item = await itemService.getSingleItem(itemId);
        if (!item) return res.status(404).json({ error: 'Item not found' });
        const hasWriteAccess = await accessService.checkWriteAccess(item.inventoryId, req.user);
        if (!hasWriteAccess) {
            return res.status(403).json({ message: 'Forbidden' });
        }
        const updatedItem = await itemService.updateItem(itemId, { ...updateData, version });
        res.json(updatedItem);
    } catch (error) {
        if (error.code === 'P2025') {
            return res.status(409).json({ message: 'Conflict' });
        }
        res.status(500).json({ error: 'Failed to update item' });
    }
};
const deleteItem = async (req, res) => {
    try {
        const { itemId } = req.params;
        const item = await itemService.getSingleItem(itemId);
        if (!item) return res.status(404).json({ error: 'Item not found' });
        const hasWriteAccess = await accessService.checkWriteAccess(item.inventoryId, req.user);
        if (!hasWriteAccess) {
            return res.status(403).json({ message: 'Forbidden' });
        }
        await itemService.deleteItem(itemId);
        res.status(204).send();
    } catch (error) {
        console.error("Error in deleteItem:", error);
        res.status(500).json({ error: 'Failed to delete item' });
    }
};
module.exports = {
    getItemsByInventory,
    getSingleItem,
    createItem,
    updateItem,
    deleteItem,
};