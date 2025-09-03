const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const protect = async (req, res, next) => { 
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) { 
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await prisma.user.findUnique({
                where: { id: decoded.id },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    role: true,
                },
            });
        if (!req.user) {
            return res.status(401).json({ message: 'Not authorized, user not found' });
        }

        next();
        } catch (error) {
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }
    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};


const adminProtect = (req, res, next) => {
    if (req.user && req.user.role === 'ADMIN') {
        next();
    } else {
        res.status(403).json({ message: 'Forbidden, not an admin' });
    }
};
module.exports = { protect, adminProtect };