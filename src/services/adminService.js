const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const findAdminCode = async (code) => {
  return prisma.adminCode.findFirst({
    where: { code: code },
  });
};

module.exports = {
  findAdminCode,
};