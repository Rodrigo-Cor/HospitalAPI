const express = require('express');
const router = express.Router();

const recepcionista = require('../controllers/recepcionista.controllers');

router.post('/register', recepcionista.register);
router.post("/setSchedule", recepcionista.setSchedule);
router.post("/getPatientsPaid", recepcionista.getPatientsPaid);
router.get("/getConsultorios", recepcionista.getConsultorios);


module.exports = router;
