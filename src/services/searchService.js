const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const searchInventories = async ({ searchQuery, category, tags, sortBy, author }) => {
  const where = {
    isPublic: true,
  };

  if (searchQuery) {
    where.OR = [
      { title: { contains: searchQuery, mode: 'insensitive' } },
      { description: { contains: searchQuery, mode: 'insensitive' } },
    ];
  }

  if (category && category !== 'ALL') {
    where.category = category;
  }

  if (tags && tags.length > 0) {
    const tagNames = tags.split(',').map(tag => tag.trim());
    
    const tagConditions = tagNames.map(tagName => ({
      tags: {
        some: {
          name: {
            equals: tagName,
            mode: 'insensitive'
          }
        }
      }
    }));
    
    where.AND = tagConditions;
  }

  if (author) {
    where.createdBy = {
      OR: [
        { name: { contains: author, mode: 'insensitive' } },
        { email: { contains: author, mode: 'insensitive' } },
      ],
    };
  }

  let orderBy = {};
  if (sortBy === 'createdAt') {
    orderBy = { createdAt: 'desc' };
  } else if (sortBy === 'itemCount') {
    orderBy = { items: { _count: 'desc' } };
  }

  return prisma.inventory.findMany({
    where,
    select: {
      id: true,
      title: true,
      description: true,
      imageUrl: true,
      tags: {
        select: {
          id: true,
          name: true,
        },
      },
      createdBy: {
        select: {
          name: true,
        },
      },
      _count: {
        select: {
          items: true,
        },
      },
    },
    orderBy,
  });
};

const searchItems = async (query) => {
  return prisma.item.findMany({
    where: {
      OR: [
        {
          customId: {
            search: query,
          },
        },
      ],
    },
    include: {
      inventory: {
        select: {
          id: true,
          title: true,
        },
      },
    },
  });
};

module.exports = {
  searchInventories,
  searchItems,
};