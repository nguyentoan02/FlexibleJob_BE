const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth.middleware');
const isAdmin = require('../middlewares/role.middleware');
const { getAllUsers } = require('../controllers/user.controller');

router.get('/', auth, isAdmin('admin'), getAllUsers);

module.exports = router;
