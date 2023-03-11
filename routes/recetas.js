/* 
	Rutas de Recetas / Recetas
	host + /api/recetas (example: http://localhost:4000/api/recetas)
*/

const { Router } = require("express");

const {
  getRecetas,
  getRecetaById,
  getRecetasByUser,
  crearReceta,
  actualizarReceta,
  eliminarReceta,
  uploadImages,
  searchReceta,
} = require("../controllers/recetas");
const { validarJWT } = require("../middlewares/validar-jwt");
const { validarCampos } = require("../middlewares/validar-campos");
const { validarCheckRecetas } = require("../middlewares/validar-check");
const { validarUploadImages } = require("../middlewares/validar-upload");
const { upload } = require("../middlewares/uploadImages");

const router = Router();

router.use(validarJWT); //cualquier peticion abajo de esto va a tener que validar su token

/* 
	Estructura de las rutas -- 
	router.method('/ruta', [ middlewares, middlewares2 ], controllers); 
	router.method('/ruta', middleware, controllers); 

*/

router.get("/", getRecetas);

router.get("/recetaId/:recetaId", getRecetaById);

router.get("/user/:user", getRecetasByUser);

router.get("/search", searchReceta);

router.post("/create", [validarCheckRecetas, validarCampos], crearReceta);

router.post(
  "/images/upload/:recetaId",
  [validarUploadImages, upload.array("images", 6)],
  uploadImages
);

router.put(
  "/:recetaId",
  [validarCheckRecetas, validarCampos],
  actualizarReceta
);

router.delete("/:recetaId", eliminarReceta);

module.exports = router;
