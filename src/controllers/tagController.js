const tagService = require('../services/tagService');
const getAllTags = async (req, res) => {
  try {
    const tags = await tagService.getTagsForSearch();
    res.json(tags);
  } catch (error) {
    console.error('Error fetching tags:', error);
    res.status(500).json({ error: 'Failed to fetch tags' });
  }
};
module.exports = {
  getAllTags,
};