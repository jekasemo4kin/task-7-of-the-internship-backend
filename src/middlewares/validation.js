const { body, validationResult } = require('express-validator');
const validateRegistration = [
  body('email').isEmail().withMessage('Enter a valid email address'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];
const validateInventory = [
  body('title').isLength({ min: 1 }).withMessage('Title must be at least 3 characters long'),
  body('category').notEmpty().withMessage('Category cannot be empty'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];
module.exports = {
  validateRegistration,
  validateInventory,
};