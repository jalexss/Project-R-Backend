const { Router } = require("express");
const { getDashboardData } = require("../controllers/dashboard");
const { isHighUser } = require("../middlewares/comprobar-role");
const { validarJWT } = require("../middlewares/validar-jwt");

const router = Router();

router.get("/dashboard", [validarJWT, isHighUser], getDashboardData);

module.exports = router;
