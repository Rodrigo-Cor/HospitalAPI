const express = require('express');
const router = express.Router();

const user = require('../controllers/user.controllers');

//router.post('/registry', user.createUser);
router.post('/login', user.loginUser);
//router.post('/verify', user.verifyUser);
//router.get('/connection', user.getConnection);

module.exports = router;
