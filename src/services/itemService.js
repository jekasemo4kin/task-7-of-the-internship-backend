const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const customIdService = require('../services/customIdService'); 
const { findOrCreateTags } = require('./tagService');
const inventoryService = require('./inventoryService');

const getItemsByInventory = async (inventoryId) => {
    return prisma.item.findMany({
        where: { inventoryId },
        include: {
            createdBy: {
                select: {
                    name: true,
                },
            },
        },
    });
};

const getSingleItem = async (id) => {
    return prisma.item.findUnique({
        where: { id },
        include: {
            createdBy: {
                select: {
                    name: true,
                },
            },
            likes: true,
            comments: {
                include: {
                    user: { select: { name: true } },
                }
            },
            inventory: {
                select: {
                    id: true,
                    customIdConfig: true,
                    createdById: true,
                    isPublic: true,
                    customFields: {
                orderBy: {
                    orderIndex: 'asc',
                },
            },
                    accessRights: {
                        where: {
                        },
                        select: {
                            userId: true,
                            canWrite: true,
                        }
                    },
                }
            }
        },
    });
};

const createItem = async (inventoryId, reqBodyData, userId) => {
    const inventory = await prisma.inventory.findUnique({
        where: { id: inventoryId },
        select: { customIdConfig: true }
    });
    
    if (!inventory) {
        throw new Error('Inventory not found');
    }
    
    let customId = null;
    if (inventory.customIdConfig && inventory.customIdConfig.length > 0) {
        customId = await customIdService.generateCustomId(inventory.customIdConfig, inventoryId);
    }

    const customData = reqBodyData.customData;
    
    const itemData = {
        customData,
        inventory: { connect: { id: inventoryId } },
        createdBy: { connect: { id: userId } },
    };

    if (customId) {
        itemData.customId = customId;
    }

    return prisma.item.create({
        data: itemData,
    });
};

const updateItem = async (id, data) => {
    const { version, customId, ...updateData } = data;
    const updatedItemData = {
        ...updateData,
        version: version + 1,
    };
    if (data.customId !== undefined) {
      updatedItemData.customId = data.customId;
    }
    return prisma.item.update({
        where: { id, version },
        data: updatedItemData,
    });
};

const deleteItem = async (id) => {
    return prisma.$transaction(async (prisma) => {
        await prisma.like.deleteMany({
            where: { itemId: id },
        });

        await prisma.comment.deleteMany({
            where: { itemId: id },
        });

        return prisma.item.delete({
            where: { id },
        });
    });
};

module.exports = {
    getItemsByInventory,
    getSingleItem,
    createItem,
    updateItem,
    deleteItem,
};