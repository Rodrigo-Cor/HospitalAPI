const express = require("express");
const router = express.Router();

const cita = require("../controllers/cita.controllers");

router.post("/availabilityDay", cita.getAppointmentsDays);
router.get("/doctors", cita.getDoctors);
router.post("/registry", cita.scheduleAppointment);
router.get("/getEspecialidades", cita.getEspecialidades);

module.exports = router;
