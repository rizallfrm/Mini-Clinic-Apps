const { validationResult } = require('express-validator');
const { sendValidationError } = require('../utils/response');

/**
 * Middleware reusable untuk mengecek hasil validasi express-validator.
 * Gunakan setelah mendefinisikan aturan validasi di route.
 *
 * Contoh penggunaan:
 *   router.post('/login', loginRules, validate, authController.login);
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().reduce((acc, err) => {
      // Gunakan path (field name) sebagai key error
      if (!acc[err.path]) {
        acc[err.path] = err.msg;
      }
      return acc;
    }, {});

    return sendValidationError(res, 'Validation Error', formattedErrors);
  }
  next();
};

module.exports = validate;
