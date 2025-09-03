const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const calculateAndGetInventoryStats = async (inventoryId) => {
    const items = await prisma.item.findMany({
        where: { inventoryId },
        select: {
            _count: {
                select: {
                    likes: true,
                    comments: true,
                },
            },
            customData: true,
        },
    });

    const customFields = await prisma.customField.findMany({
        where: { inventoryId },
        select: {
            name: true,
            type: true,
        },
    });

    const fieldTypeMap = customFields.reduce((map, field) => {
        map[field.name] = field.type;
        return map;
    }, {});

    if (items.length === 0) {
        return {
            inventoryId,
            stats: {
                likes: { maxLikes: 0 },
                comments: { maxComments: 0 },
                numberFields: {},
                textFields: {},
            },
        };
    }

    const stats = {
        likes: { maxLikes: 0 },
        comments: { maxComments: 0 },
        numberFields: {},
        textFields: {},
    };

    items.forEach(item => {
        const currentLikes = item._count.likes;
        const currentComments = item._count.comments;

        if (currentLikes > stats.likes.maxLikes) {
            stats.likes.maxLikes = currentLikes;
        }
        if (currentComments > stats.comments.maxComments) {
            stats.comments.maxComments = currentComments;
        }

        const customData = item.customData || {};
        for (const fieldName in customData) {
            const value = customData[fieldName];
            const fieldType = fieldTypeMap[fieldName];
            if (fieldType === 'NUMBER') {
                const numberValue = parseFloat(value);
                if (!isNaN(numberValue)) {
                    if (!stats.numberFields[fieldName]) {
                        stats.numberFields[fieldName] = {
                            min: numberValue,
                            max: numberValue,
                            sum: numberValue,
                            count: 1,
                        };
                    } else {
                        const fieldStats = stats.numberFields[fieldName];
                        if (numberValue < fieldStats.min) fieldStats.min = numberValue;
                        if (numberValue > fieldStats.max) fieldStats.max = numberValue;
                        fieldStats.sum += numberValue;
                        fieldStats.count++;
                    }
                }
            } else if (fieldType === 'SINGLE_LINE_TEXT' || fieldType === 'MULTILINE_TEXT') {
                const textValue = String(value);
                if (!stats.textFields[fieldName]) {
                    stats.textFields[fieldName] = {};
                }
                stats.textFields[fieldName][textValue] = (stats.textFields[fieldName][textValue] || 0) + 1;
            }
        }
    });

    for (const fieldName in stats.numberFields) {
        const fieldStats = stats.numberFields[fieldName];
        fieldStats.average = fieldStats.sum / fieldStats.count;
        delete fieldStats.sum;
        delete fieldStats.count;
    }

    for (const fieldName in stats.textFields) {
        const fieldStats = stats.textFields[fieldName];
        const sortedValues = Object.entries(fieldStats)
            .sort(([, countA], [, countB]) => countB - countA)
            .slice(0, 5)
            .map(([value, count]) => ({ value, count }));
        stats.textFields[fieldName] = sortedValues;
    }
    
    return {
        inventoryId,
        stats,
    };
};

module.exports = {
    calculateAndGetInventoryStats,
};