import { body } from 'express-validator';

export const userValidation = {
  updateProfile: [
    body('firstName')
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('First name must be between 2 and 100 characters'),
    body('lastName')
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Last name must be between 2 and 100 characters'),
    body('phoneNumber')
      .optional()
      .matches(/^[0-9]{10}$/)
      .withMessage('Phone number must be 10 digits'),
    body('dateOfBirth')
      .optional()
      .isISO8601()
      .withMessage('Invalid date format')
      .custom((value) => {
        const age = new Date().getFullYear() - new Date(value).getFullYear();
        if (age < 18) {
          throw new Error('Must be at least 18 years old');
        }
        return true;
      })
  ],

  updatePreferences: [
    body('riskProfile')
      .optional()
      .isIn(['conservative', 'moderate', 'aggressive'])
      .withMessage('Invalid risk profile')
  ]
};
