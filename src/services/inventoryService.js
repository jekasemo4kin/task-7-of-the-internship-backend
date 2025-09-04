const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { findOrCreateTags } = require('./tagService');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');
const moment = require('moment');

const getInventories = async (filters = {}) => {
  console.log('Filters received:', filters);
  const { search, category, tags, sortBy, author } = filters;
  const tagsFromQuery = filters['tags[]'] || tags;
  const andConditions = [];
  
  if (search) {
    andConditions.push({
      title: {
        startsWith: search,
        mode: 'insensitive',
      },
    });
  }

  if (category && category !== 'ALL') {
    andConditions.push({
      category: category,
    });
  }

  if (author) {
    andConditions.push({
      createdBy: {
        OR: [
          { name: { contains: author, mode: 'insensitive' } },
          { email: { contains: author, mode: 'insensitive' } },
        ],
      },
    });
  }

  if (tagsFromQuery) {
    const tagNames = (Array.isArray(tagsFromQuery) ? tagsFromQuery : tagsFromQuery.split(','))
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);
    console.log('Processed tagNames:', tagNames);
    if (tagNames.length > 0) {
      const tagConditions = tagNames.map(name => ({
        tags: {
          some: {
            name: { 
              equals: name,
              mode: 'insensitive',
            },
          },
        },
      }));
      andConditions.push(...tagConditions);
    }
  }

  const where = andConditions.length > 0 ? { AND: andConditions } : {};
  const orderBy = [];
  if (sortBy === 'createdAt') {
    orderBy.push({ createdAt: 'desc' });
  } else if (sortBy === 'itemCount') {
    orderBy.push({ items: { _count: 'desc' } });
  } else {
    orderBy.push({ createdAt: 'desc' });
  }
  console.log('Final WHERE object:', JSON.stringify(where, null, 2));
  return await prisma.inventory.findMany({
    where,
    select: {
      id: true,
      title: true,
      category: true,
      description: true,
      isPublic: true,
      imageUrl: true,
      createdAt: true,
      createdBy: {
        select: {
          name: true,
          email: true,
        },
      },
      tags: {
        select: {
          name: true,
        },
      },
      _count: {
        select: { items: true },
      },
    },
    orderBy
  });
};

const getInventoryById = async (id) => {
  return prisma.inventory.findUnique({
    where: { id },
    include: {
      items: true,
      customFields: {
                orderBy: {
                    orderIndex: 'asc',
                },
            },
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      tags: {
        select: {
          name: true,
        },
      },
      comments: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
            }
          }
        },
        orderBy: {
          createdAt: 'desc',
        },
      },
      accessRights: {
        select: {
          userId: true,
          canWrite: true
        }
      }
    },
  });
};

const createInventory = async (data, userId) => {
  const { customFields, tags, ...restOfData } = data;
  
  const tagRecords = tags && tags.length > 0 ? await findOrCreateTags(tags) : [];

  const newInventory = await prisma.inventory.create({
    data: {
      ...restOfData,
      createdBy: { connect: { id: userId } },
      tags: {
        connect: tagRecords.map(tag => ({ id: tag.id })),
      },
      customFields: {
        create: customFields.map(field => ({
          name: field.name,
          type: field.type,
          showInTable: field.showInTable,
        })),
      },
    },
  });

  return newInventory;
};

const updateInventory = async (id, data) => {
  const { version, tags, customFields, ...updateData } = data;

  let updateTagData = {};
  if (tags) {
    const parsedTags = JSON.parse(tags);
    const tagRecords = await findOrCreateTags(parsedTags);
    
    const existingInventory = await prisma.inventory.findUnique({
      where: { id },
      include: { tags: true },
    });

    const existingTagNames = existingInventory.tags.map(t => t.name);
    const newTagNames = parsedTags;

    const tagsToDisconnect = existingInventory.tags.filter(t => !newTagNames.includes(t.name)).map(t => ({ id: t.id }));
    const tagsToConnect = tagRecords.filter(t => !existingTagNames.includes(t.name)).map(t => ({ id: t.id }));

    updateTagData = {
      tags: {
        disconnect: tagsToDisconnect,
        connect: tagsToConnect,
      },
    };
  }


  if (customFields !== undefined) {
    const existingFields = await prisma.customField.findMany({
      where: { inventoryId: id },
    });

    const fieldsToCreate = customFields.filter(f => !f.id || String(f.id).startsWith('new-'));
    const fieldsToUpdate = customFields.filter(f => f.id && !String(f.id).startsWith('new-'));
    const fieldsToDelete = existingFields.filter(
      existing => !customFields.some(incoming => incoming.id === existing.id)
    );

    const transactions = [];

    if (fieldsToCreate.length > 0) {
      transactions.push(
        prisma.customField.createMany({
          data: fieldsToCreate.map(f => ({
            inventoryId: id,
            name: f.name,
            type: f.type,
            showInTable: f.showInTable,
            orderIndex: customFields.findIndex(item => item.id === f.id),
          })),
        })
      );
    }

    for (const field of fieldsToUpdate) {
      transactions.push(
        prisma.customField.update({
          where: { id: field.id },
          data: { 
            name: field.name,
            type: field.type,
            showInTable: field.showInTable,
            orderIndex: customFields.findIndex(item => item.id === field.id),
          },
        })
      );
    }

    if (fieldsToDelete.length > 0) {
      transactions.push(
        prisma.customField.deleteMany({
          where: { id: { in: fieldsToDelete.map(f => f.id) } },
        })
      );
    }
    
    if (transactions.length > 0) {
      await prisma.$transaction(transactions);
    }
  }

  return prisma.inventory.update({
    where: { id, version },
    data: {
      ...updateData,
      ...updateTagData,
      version: version + 1,
    },
  });
};

const deleteInventory = async (id) => {
  return prisma.inventory.delete({
    where: { id },
  });
};

const getInventoriesByUserId = async (userId, filters = {}) => {
  console.log('Filters received:', filters);
  const { search, category, tags, sortBy, author } = filters;
  const tagsFromQuery = filters['tags[]'] || tags;
  const where = { createdById: userId };
  const orderBy = [];
  
  if (search) {
      where.title = { startsWith: search, mode: 'insensitive' };
  }
  if (category && category !== 'ALL') {
      where.category = category;
  }
  if (tagsFromQuery ) {
    const tagNames = (Array.isArray(tagsFromQuery) ? tagsFromQuery : tagsFromQuery.split(','))
    .map(tag => tag.trim())
    .filter(tag => tag.length > 0);
    console.log('Processed tagNames:', tagNames);
    if (tagNames.length > 0) {
      const tagConditions = tagNames.map(name => ({
      tags: {
        some: {
          name: name,
          mode: 'insensitive'
        }
      }
    }));
    where.AND = tagConditions;
  }}

  if (author) {
      where.createdBy = { 
          OR: [
              { name: { contains: author, mode: 'insensitive' } },
              { email: { contains: author, mode: 'insensitive' } }
          ]
      };
  }

  if (sortBy === 'createdAt') {
    orderBy.push({ createdAt: 'desc' });
  } else if (sortBy === 'itemCount') {
    orderBy.push({ items: { _count: 'desc' } });
  } else {
    orderBy.push({ createdAt: 'desc' });
  }
  console.log('Final WHERE object:', where);
  return await prisma.inventory.findMany({
    where,
    select: {
      id: true,
      title: true,
      category: true,
      isPublic: true,
      imageUrl: true,
      createdAt: true,
      createdBy: {
        select: {
          name: true,
          email: true
        },
      },
      tags: {
        select: {
          name: true,
        },
      },
      _count: {
        select: { items: true },
      },
    },
    orderBy,
  });
};

const getInventoriesWithAccess = async (userId, filters = {}) => {
  console.log('Filters received:', filters);
  const { search, category, tags, sortBy, author } = filters;
  const tagsFromQuery = filters['tags[]'] || tags;
  const where = {
    AND: [
      {
        createdById: {
          not: userId
        }
      },
      {
        OR: [
          { isPublic: true },
          {
            accessRights: {
              some: {
                userId: userId,
                canWrite: true
              }
            }
          }
        ]
      }
    ]
  };
  const andConditions = [];
  if (search) {
    andConditions.push({
      title: { startsWith: search, mode: 'insensitive' }
    });
  }
  
  if (category && category !== 'ALL') {
    andConditions.push({ category: category });
  }
  
  if (tagsFromQuery) {
    const tagNames = (Array.isArray(tagsFromQuery) ? tagsFromQuery : tagsFromQuery.split(','))
    .map(tag => tag.trim())
    .filter(tag => tag.length > 0);
    console.log('Processed tagNames:', tagNames);
    if (tagNames.length > 0) {
      const tagConditions = tagNames.map(name => ({
      tags: {
        some: {
          name: name,
          mode: 'insensitive'
        }
      }
    }));
    where.AND.push(...tagConditions);
  
  }}
  
  if (author) {
    andConditions.push({ 
      createdBy: { 
        OR: [
          { name: { contains: author, mode: 'insensitive' } },
          { email: { contains: author, mode: 'insensitive' } }
        ]
      }
    });
  }

  if (andConditions.length > 0) {
    where.AND.push(...andConditions);
  }

  const orderBy = [];
  if (sortBy === 'createdAt') {
    orderBy.push({ createdAt: 'desc' });
  } else if (sortBy === 'itemCount') {
    orderBy.push({ items: { _count: 'desc' } });
  } else {
    orderBy.push({ createdAt: 'desc' });
  }
  console.log('Final WHERE object:', where);
  return await prisma.inventory.findMany({
    where,
    select: {
      id: true,
      title: true,
      category: true,
      isPublic: true,
      imageUrl: true,
      createdAt: true,
      createdBy: {
        select: {
          name: true,
          email: true,
        },
      },
      tags: {
        select: {
          name: true,
        },
      },
      _count: {
        select: { items: true },
      },
    },
    orderBy,
  });
};

const updateAccessSettings = async (id, isPublic, accessRights) => {
    const updatedInventory = await prisma.inventory.update({
        where: { id },
        data: { isPublic },
    });

    if (!isPublic && accessRights) {
        await prisma.accessRight.deleteMany({
            where: { inventoryId: id },
        });

        await prisma.accessRight.createMany({
            data: accessRights.map(ar => ({
                inventoryId: id,
                userId: ar.userId,
                canWrite: ar.canWrite,
            })),
        });
    } else if (isPublic) {
        await prisma.accessRight.deleteMany({
            where: { inventoryId: id },
        });
    }

    return updatedInventory;
};

const updateCustomIdConfig = async (inventoryId, customIdConfig) => {
    return prisma.inventory.update({
        where: { id: inventoryId },
        data: {
            customIdConfig: customIdConfig,
        },
    });
};

const generateIdPart = async (type, inventoryId) => {
    switch (type) {
        case 'TEXT':
            return ''; 
        case '20_BIT_RANDOM':
            return crypto.randomBytes(3).readUIntBE(0, 3) & 0xFFFFF;
        case '32_BIT_RANDOM':
            return crypto.randomBytes(4).readUInt32BE(0);
        case '6_DIGIT_RANDOM':
            return Math.floor(100000 + Math.random() * 900000);
        case '9_DIGIT_RANDOM':
            return Math.floor(100000000 + Math.random() * 900000000);
        case 'GUID':
            return uuidv4();
        case 'DATE':
            return moment().format('YYYYMMDD');
        case 'SEQUENCE':
            const itemCount = await prisma.item.count({
                where: { inventoryId },
            });
            return itemCount + 1;
        default:
            return '';
    }
};

const generatePreview = async (inventoryId, config) => {
    const parts = await Promise.all(config.map(async part => {
        let value = part.value || '';
        if (part.type !== 'TEXT') {
            value = await generateIdPart(part.type, inventoryId);
        }
        return `${value}${part.separator || ''}`;
    }));
    return parts.join('');
};


module.exports = {
  getInventories,
  getInventoryById,
  createInventory,
  updateInventory,
  deleteInventory,
  getInventoriesByUserId,
  getInventoriesWithAccess,
  updateAccessSettings,
  updateCustomIdConfig,
  generatePreview,
  updateCustomIdConfig,
};