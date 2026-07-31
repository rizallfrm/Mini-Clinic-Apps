'use strict';

const express = require('express');
const userController = require('../controllers/userController');
const authenticate = require('../middlewares/authenticate');
const { authorize } = require('../middlewares/authorize');

const router = express.Router();
router.use(authenticate);
router.use(authorize('ADMIN'));

router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.post('/', userController.createUser);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);

module.exports = router;
