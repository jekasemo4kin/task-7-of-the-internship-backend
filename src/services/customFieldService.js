const { PrismaClient, FieldType } = require('@prisma/client');
const prisma = new PrismaClient();

const mapFieldType = (typeString) => {
    switch (typeString) {
        case 'SINGLE_LINE_TEXT':
            return FieldType.SINGLE_LINE_TEXT;
        case 'MULTILINE_TEXT':
            return FieldType.MULTILINE_TEXT;
        case 'NUMBER':
            return FieldType.NUMBER;
        case 'BOOLEAN':
            return FieldType.BOOLEAN;
        case 'DOCUMENT_IMAGE':
            return FieldType.DOCUMENT_IMAGE;
        default:
            throw new Error(`Unsupported field type: ${typeString}`);
    }
};

const createCustomField = async (inventoryId, data) => {
  const { name, type, ...restOfData } = data;

    const prismaType = mapFieldType(type);  
  return prisma.customField.create({
    data: {
      name: name,
      type: prismaType,
      ...restOfData,
      inventory: { connect: { id: inventoryId } }
    },
  });
};

const updateCustomField = async (id, data) => {
  const { type, ...restOfData } = data;
  const updateData = { ...restOfData };

  if (type) {
      updateData.type = mapFieldType(type);
  }

  return prisma.customField.update({
    where: { id },
    data: updateData,
  });
};

const deleteCustomField = async (id) => {
  return prisma.customField.delete({
    where: { id },
  });
};

module.exports = {
  createCustomField,
  updateCustomField,
  deleteCustomField,
};