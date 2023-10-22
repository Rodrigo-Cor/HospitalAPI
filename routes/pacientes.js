const express = require('express');
const router = express.Router();

const paciente = require('../controllers/paciente.controllers');

router.post('/register', paciente.register);
router.post('/appointment', paciente.showAppointment);


module.exports = router;
