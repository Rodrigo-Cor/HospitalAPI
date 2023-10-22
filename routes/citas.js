const express = require('express');
const router = express.Router();

const cita = require('../controllers/cita.controllers');

//router.post('/registry', user.createUser);
router.post('/availabilityDay', cita.getAppointmentsDays);
router.post('/doctors', cita.getDoctors);
router.post('/registry', cita.scheduleAppointment);

//router.post('/verify', user.verifyUser);
//router.get('/connection', user.getConnection);

module.exports = router;
