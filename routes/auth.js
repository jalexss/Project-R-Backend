/* 
	Rutas de Usuarios / Auth
	host + /api/auth (example: http://localhost:4000/api/auth)
*/

const { Router } = require("express");

const {
  validarJWT,
  validarJWTWithEmail,
} = require("../middlewares/validar-jwt");
const {
  crearUsuario,
  loginUsuario,
  revalidarToken,
  verificarUsuario,
  activarUsuario,
  confirmResetPassword,
  checkResetPasswordCode,
  resetPassword,
} = require("../controllers/auth");
const { validarCampos } = require("../middlewares/validar-campos");
const {
  validarCheckLogin,
  validarCheckRegister,
  validarResetPassword,
} = require("../middlewares/validar-check");

const router = Router();

/* 
	Estructura de las rutas -- 
	router.method('/ruta', [ middlewares, middlewares2 ], controllers); 
	router.method('/ruta', middleware, controllers); 

*/

router.get("/renew", validarJWT, revalidarToken);
router.get("/user", validarJWT, verificarUsuario);
router.get("/resetPassword/:resetPasswordCode", checkResetPasswordCode);
router.get("/confirm/:confirmationCode", activarUsuario);

router.post("/", [validarCheckLogin, validarCampos], loginUsuario);
router.post("/new", [validarCheckRegister, validarCampos], crearUsuario);
router.post("/confirmResetPassword", confirmResetPassword);
router.post(
  "/resetPassword/:resetPasswordCode",
  [validarResetPassword, validarCampos],
  resetPassword
);

module.exports = router;
