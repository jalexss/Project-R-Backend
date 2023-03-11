/* 
	Rutas de Rating / Rating
	host + /api/comments (example: http://localhost:4000/api/rating)
*/

const { Router } = require("express");

const { validarJWT } = require("../middlewares/validar-jwt");
const { addRatingByRecetaId } = require("../controllers/rating");

const router = Router();

router.use(validarJWT);

/* 
	Estructura de las rutas -- 
	router.method('/ruta', [ middlewares, middlewares2 ], controllers); 
	router.method('/ruta', middleware, controllers); 

*/

router.put("/receta/:recetaId", addRatingByRecetaId);

module.exports = router;
