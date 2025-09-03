const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const toggleLike = async (itemId, userId) => {
  const existingLike = await prisma.like.findUnique({
    where: {
      itemId_userId: {
        itemId,
        userId,
      },
    },
  });

  if (existingLike) {
    return prisma.like.delete({
      where: {
        itemId_userId: {
          itemId,
          userId,
        },
      },
    });
  } else {
    return prisma.like.create({
      data: {
        itemId,
        userId,
      },
    });
  }
};

module.exports = {
  toggleLike,
};