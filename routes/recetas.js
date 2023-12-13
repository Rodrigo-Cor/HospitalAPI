const express = require("express");
const router = express.Router();

const receta = require("../controllers/receta.controllers");

router.post("/fetchRecetaAppointment",receta.getRecetaByIDCita);
router.post("/makereceta",receta.makeReceta);


module.exports = router;