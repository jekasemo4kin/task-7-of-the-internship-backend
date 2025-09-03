const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const createComment = async (data) => {
  return prisma.comment.create({
    data,
    include: {
      user: {
        select: { name: true },
      },
    },
  });
};

const getCommentsByItem = async (itemId) => {
  return prisma.comment.findMany({
    where: { itemId },
    include: {
      user: {
        select: { name: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
};

const getCommentsByInventory = async (inventoryId) => {
  return prisma.comment.findMany({
    where: { inventoryId },
    include: {
      user: {
        select: { name: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
};

module.exports = {
  createComment,
  getCommentsByItem,
  getCommentsByInventory,
};