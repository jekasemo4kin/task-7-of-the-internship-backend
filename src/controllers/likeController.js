const likeService = require('../services/likeService');
const itemService = require('../services/itemService');
const accessService = require('../services/accessService');
const toggleLike = async (req, res) => {
  try {
    const { itemId } = req.params;
    const item = await itemService.getSingleItem(itemId);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    const hasWriteAccess = await accessService.checkWriteAccess(item.inventoryId, req.user);
    if (!hasWriteAccess) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    const result = await likeService.toggleLike(itemId, req.user.id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to toggle like' });
  }
};
module.exports = {
  toggleLike,
};