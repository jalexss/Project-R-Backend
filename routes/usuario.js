/* 
	Rutas de Usuarios / User
	host + /api/users (example: http://localhost:4000/api/users)
*/

const { Router } = require("express");

const { validarJWT } = require("../middlewares/validar-jwt");
const { validarCampos } = require("../middlewares/validar-campos");
const {
  validarCheckRegister,
  validarCheckUpdate,
} = require("../middlewares/validar-check");
const {
  actualizarUsuario,
  borrarUsuario,
  crearUsuarioByModerator,
  getUserById,
  getUsuarios,
  toggleFavorites,
  myFavorites,
  myRecetas,
  searchUser,
  borrarAvatar,
  uploadAvatar,
} = require("../controllers/usuario");
const { upload } = require("../middlewares/uploadAvatar");
const { validarUploadAvatar } = require("../middlewares/validar-upload");
const { isHighUser } = require("../middlewares/comprobar-role");

const router = Router();

//cualquier peticion abajo de esto va a tener que validar su token
router.use(validarJWT);

/* 
	Estructura de las rutas -- 
	router.method('/ruta', [ middlewares, middlewares2 ], controllers); 
	router.method('/ruta', middleware, controllers); 

*/

router.get("/", getUsuarios);
router.get("/myRecetas", myRecetas);
router.get("/favorites", myFavorites);
router.get("/search", searchUser);
router.get("/:userId", getUserById);

router.post(
  "/",
  [isHighUser, validarCheckRegister, validarCampos],
  crearUsuarioByModerator
);
router.post("/:userId/recetas/:recetaId/favorites", toggleFavorites);

router.patch(
  "/:userId",
  [validarCheckUpdate, validarCampos],
  actualizarUsuario
);

router.delete("/:userId", borrarUsuario);

router.delete("/avatar/:userId", validarUploadAvatar, borrarAvatar);

router.patch(
  "/avatar/:userId",
  [validarUploadAvatar, upload.single("avatar")],
  uploadAvatar
);

module.exports = router;
