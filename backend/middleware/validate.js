/**
 * middleware/validate.js
 * Reusable validation chains using express-validator.
 */
const { body, validationResult } = require('express-validator');

// Run validation and short-circuit on errors
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

// ── Auth ──────────────────────────────────────────────────────────────────────
const validateLogin = [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
  validate,
];

const validateRegister = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 100 }),
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  validate,
];

// ── Interview ─────────────────────────────────────────────────────────────────
const validateStartInterview = [
  body('jobRole').trim().notEmpty().withMessage('jobRole is required'),
  body('interviewType')
    .optional()
    .isIn(['mock', 'real'])
    .withMessage('interviewType must be mock or real'),
  validate,
];

const validateSubmitAnswer = [
  body('answerText').trim().notEmpty().withMessage('answerText is required'),
  validate,
];

module.exports = {
  validateLogin,
  validateRegister,
  validateStartInterview,
  validateSubmitAnswer,
};
