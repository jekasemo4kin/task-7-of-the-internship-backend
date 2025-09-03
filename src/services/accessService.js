const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const checkWriteAccess = async (inventoryId, user) => {
  if (!user) {
    return false;
  }

  const inventory = await prisma.inventory.findUnique({
    where: { id: inventoryId },
  });
  if (!inventory) {
    return false;
  }

 if (user.role === 'ADMIN' || inventory.createdById === user.id) {
    return true;
  }
  

  if (inventory.isPublic) {
    return true;
  }
  

  const accessRight = await prisma.accessRight.findUnique({
    where: {
      inventoryId_userId: {
        inventoryId,
        userId: user.id,
      },
    },
  });
  
  return accessRight?.canWrite || false;
};

const createAccessRight = async (inventoryId, userId, canWrite) => {
  return prisma.accessRight.upsert({
    where: {
      inventoryId_userId: {
        inventoryId,
        userId,
      },
    },
    update: { canWrite },
    create: {
      inventoryId,
      userId,
      canWrite,
    },
  });
};

const updateAccessRight = async (inventoryId, userId, canWrite) => {
  return prisma.accessRight.update({
    where: {
      inventoryId_userId: {
        inventoryId,
        userId,
      },
    },
    data: {
      canWrite,
    },
  });
};

const deleteAccessRight = async (inventoryId, userId) => {
  return prisma.accessRight.delete({
    where: {
      inventoryId_userId: {
        inventoryId,
        userId,
      },
    },
  });
};

const getAccessRightsByInventory = async (inventoryId) => {
  return prisma.accessRight.findMany({
    where: { inventoryId },
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
  });
};

module.exports = {
  checkWriteAccess,
  createAccessRight,
  updateAccessRight,
  deleteAccessRight,
  getAccessRightsByInventory,
};