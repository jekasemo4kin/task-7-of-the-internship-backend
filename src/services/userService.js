const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getAllUsers = async () => {
    return prisma.user.findMany({
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
        },
    });
};

const updateUserRole = async (userId, newRole) => {
  return prisma.user.update({
    where: { id: userId },
    data: { role: newRole },
  });
};

module.exports = {
    getAllUsers,
    updateUserRole,
};