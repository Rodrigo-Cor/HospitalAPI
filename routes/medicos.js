const express = require('express');
const router = express.Router();

const medico = require('../controllers/medico.controllers');

router.post('/register', medico.register);
router.post('/appointment', medico.showAppointment);

module.exports = router;