const express = require('express');
const router = express.Router();

const recepionista = require('../controllers/recepcionista.controllers');

router.post('/register', recepionista.register);
router.post("/setSchedule", recepionista.setSchedule);
router.post("/getPatientsPaid", recepionista.getPatientsPaid);


module.exports = router;
