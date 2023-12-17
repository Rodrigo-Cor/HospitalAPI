const express = require("express");
const router = express.Router();

const receta = require("../controllers/receta.controllers");
const recetaController = require("../controllers/receta.controllers");

router.post("/getData", receta.getDataRecipe);
router.post("/create", receta.createRecipe);
router.get("/allMedicines", recetaController.getMedicines);
router.get("/allTreatments", recetaController.getTreatments);
router.get("/allServices", recetaController.getServices);

module.exports = router;
