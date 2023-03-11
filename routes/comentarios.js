/* 
	Rutas de Usuarios / User
	host + /api/comments (example: http://localhost:4000/api/comments)
*/

const { Router } = require("express");

const { validarJWT } = require("../middlewares/validar-jwt");
const { validarCampos } = require("../middlewares/validar-campos");
const { validarComentarios } = require("../middlewares/validar-check");
const {
  getComments,
  getCommentsByRecetaId,
  createComment,
  updateComment,
  deleteComment,
} = require("../controllers/comentario");

const router = Router();

//cualquier peticion abajo de esto va a tener que validar su token
router.use(validarJWT);

/* 
	Estructura de las rutas -- 
	router.method('/ruta', [ middlewares, middlewares2 ], controllers); 
	router.method('/ruta', middleware, controllers); 

*/

/* 
	--> Como son los comentarios de una receta ya creada,
	Se enfocara unicamente en el id de la receta para
	la manipulacion de comentarios
*/

router.get("/", getComments);

router.get("/receta/:recetaId", getCommentsByRecetaId);

router.post("/:recetaId", [validarComentarios, validarCampos], createComment);

router.put("/:commentId", [validarComentarios, validarCampos], updateComment);

router.delete("/:commentId", deleteComment);

module.exports = router;
