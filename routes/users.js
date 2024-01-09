const express = require("express");
const router = express.Router();

const user = require("../controllers/user.controllers");

router.post("/login", user.loginUser);
router.post("/information", user.getInformation);
//router.get("/connection", user.getConnection);
router.post("/modify", user.modifyPassword);
//router.post("/deletePatient", user.deletePatient);

module.exports = router;
