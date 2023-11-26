const express = require("express");
const router = express.Router();

const recepcionista = require("../controllers/recepcionista.controllers");

router.post("/register", recepcionista.register);
router.post("/setSchedule", recepcionista.setSchedule);
router.get("/fetchAppointmentsToday", recepcionista.getAppointmentsToday);
router.get("/listConsultorios", recepcionista.getConsultorios);
router.post("/fetchScheduledAppointments", recepcionista.getScheduledAppointments);
router.delete("/deletePatient", recepcionista.deletePatient);
router.delete("/deleteDoctor", recepcionista.deleteDoctor);

module.exports = router;
