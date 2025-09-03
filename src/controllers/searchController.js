const searchService = require('../services/searchService');

const globalSearch = async (req, res) => {
  try {
    const { search, category, tags, sortBy, author } = req.query;
    const inventories = await searchService.searchInventories({
      searchQuery: search,
      category,
      tags,
      sortBy,
      author,
    });
    
    res.json({
      inventories,
    });
  } catch (error) {
    console.error('Error fetching inventories:', error);
    res.status(500).json({ error: 'Failed to perform search' });
  }
};

module.exports = {
  globalSearch,
};