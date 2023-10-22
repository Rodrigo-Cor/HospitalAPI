const express = require('express');
const router = express.Router();

const medico = require('../controllers/medico.controllers');

router.post('/register', medico.register);

module.exports = router;