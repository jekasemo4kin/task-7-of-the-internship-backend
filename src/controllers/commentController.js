const commentService = require('../services/commentService');
const accessService = require('../services/accessService');
const itemService = require('../services/itemService');
const inventoryService = require('../services/inventoryService');
const getCommentsByItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const comments = await commentService.getCommentsByItem(itemId);
    res.json(comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
};
const addCommentToItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { text } = req.body;
    const userId = req.user.id;

    if (!text || text.trim() === '') {
      return res.status(400).json({ message: 'Comment text cannot be empty.' });
    }
    const item = await itemService.getSingleItem(itemId);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    const hasWriteAccess = await accessService.checkWriteAccess(item.inventoryId, req.user);
    if (!hasWriteAccess) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const comment = await commentService.createComment({ itemId, userId, text });
    res.status(201).json(comment);
  } catch (error) {
    console.error('Error adding comment to item:', error);
    res.status(500).json({ error: 'Failed to add comment to item' });
  }
};
const getCommentsByInventory = async (req, res) => {
  try {
    const { inventoryId } = req.params;
    const comments = await commentService.getCommentsByInventory(inventoryId);
    res.json(comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
};
const addCommentToInventory = async (req, res) => {
  try {
    const { inventoryId } = req.params;
    const { text } = req.body;
    const userId = req.user.id;

    if (!text || text.trim() === '') {
      return res.status(400).json({ message: 'Comment text cannot be empty.' });
    }

    const hasWriteAccess = await accessService.checkWriteAccess(inventoryId, req.user);
    if (!hasWriteAccess) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    const comment = await commentService.createComment({ inventoryId, userId, text });
    res.status(201).json(comment);
  } catch (error) {
    console.error('Error adding comment to inventory:', error);
    res.status(500).json({ error: 'Failed to add comment to inventory' });
  }
};
module.exports = {
  getCommentsByItem,
  getCommentsByInventory,
  addCommentToItem,
  addCommentToInventory,
};