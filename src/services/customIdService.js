const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');
const moment = require('moment');

const generateIdPart = async (type, value, inventoryId) => {
    switch (type) {
        case 'TEXT':
            return value;
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
            case 'DATE':
    const format = value || 'YYYYMMDD';
    console.log(`Generating date with format: ${format}`);
    const generatedDate = moment().format(format);
    console.log(`Generated date result: ${generatedDate}`);
    return generatedDate;
        case 'SEQUENCE':
            const itemCount = await prisma.item.count({
                where: { inventoryId },
            });
            return itemCount + 1;
        default:
            return '';
    }
};

const generateCustomId = async (customIdConfig, inventoryId) => {
    const parts = await Promise.all(customIdConfig.map(async part => {
        const generatedPart = await generateIdPart(part.type, part.value, inventoryId);
        return `${generatedPart}${part.separator || ''}`;
    }));
    return parts.join('');
};

module.exports = {
    generateCustomId,
};