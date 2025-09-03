const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const findOrCreateTags = async (tagNames) => {
  if (!tagNames || tagNames.length === 0) {
    return [];
  }

  const tagPromises = tagNames.map(async (name) => {
    const existingTag = await prisma.tag.findUnique({
      where: { name: name.toLowerCase() },
    });

    if (existingTag) {
      return existingTag;
    } else {
      return prisma.tag.create({
        data: { name: name.toLowerCase() },
      });
    }
  });

  return Promise.all(tagPromises);
};

const getTagsForSearch = async () => {
  return prisma.tag.findMany({
    select: {
      id: true,
      name: true,
    },
    orderBy: {
      name: 'asc',
    },
  });
};

module.exports = {
  findOrCreateTags,
  getTagsForSearch,
};