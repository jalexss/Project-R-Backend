const { check, oneOf, body } = require("express-validator");
const { allRoles, statusUser } = require("../helpers/constans");
/*
// validaciones de los campos con check de express-validator


// validaciones antes de enlazar al controlador


// Estructura del check --
	[
		check('nombreCampoRegistradoEnBaseDeDatos', 'mensaje de error').not().isEmpty()

		check('nombreCampoRegistradoEnBaseDeDatos')
			.not()
			.isEmpty()
			.withMessage('mensaje de error'),
		check(...).isLength({ min: 2, max 10 })
			.withMessage(...)
	]
*/

// AUTH - CONTROLLER VALIDATION
const validarCheckLogin = [
  check("username")
    .not()
    .isEmpty()
    .withMessage(`username doesn't exist or is misspelled`),
  check("password")
    .not()
    .isEmpty()
    .withMessage(`Password incorrect or account doesn't exist.`),
];

const validarCheckRegister = [
  check("firstName") //campos que chequearan
    .not()
    .isEmpty()
    .withMessage("This field is required")
    .isLength({ min: 2, max: 20 })
    .withMessage("First name must be greater than 6 and less than 30"),
  check("lastName") //campos que chequearan
    .not()
    .isEmpty()
    .withMessage("This field is required")
    .isLength({ min: 2, max: 20 })
    .withMessage("Last name must be greater than 6 and less than 30"),
  check("username") //campos que chequearan
    .not()
    .isEmpty()
    .withMessage("This field is required")
    .not()
    .matches(/^[A-Za-z][A-Za-z0-9_]$/g)
    .withMessage(
      "Dont allow use whitespaces and special characters(-, _ , @, #...)"
    )
    .isLength({ min: 4, max: 20 })
    .withMessage("Username must be greater than 3 and less than 20"),
  check("email", "This field is required, should be a Email!")
    .isEmail()
    .trim()
    .escape()
    .normalizeEmail(),
  check("password")
    .isLength({ min: 6, max: 30 })
    .withMessage("Password must be greater than 6 and less than 30")
    .matches("[0-9]")
    .withMessage("Password Must Contain a Number")
    .matches("[A-Z]")
    .withMessage("Password Must Contain an Uppercase Letter")
    .trim()
    .escape(),
];
const validarCheckUpdate = [
  body("firstName")
    .if(body("firstName").exists())
    .not()
    .isEmpty()
    .withMessage("This field is required")
    .isLength({ min: 2, max: 20 })
    .withMessage("First name must be greater than 6 and less than 30"),
  body("lastName")
    .if(body("lastName").exists())
    .not()
    .isEmpty()
    .withMessage("This field is required")
    .isLength({ min: 2, max: 20 })
    .withMessage("Last name must be greater than 6 and less than 30"),
  // check("username")
  body("username")
    .if(body("username").exists())
    .not()
    .isEmpty()
    .withMessage("This field is required")
    .not()
    .matches(/^[A-Za-z][A-Za-z0-9_]$/g)
    .withMessage(
      "Dont allow use whitespaces and special characters(-, _ , @, #...)"
    )
    .isLength({ min: 4, max: 20 })
    .withMessage("Username must be greater than 3 and less than 20"),
  body("email", "This field is required, should be a Email!")
    .if(body("email").exists())
    .not()
    .isEmpty()
    .isEmail()
    .trim()
    .escape(),
  body("status")
    .if(body("status").exists())
    .not()
    .isEmpty()
    .withMessage("This field is required")
    .not()
    .custom((value) => {
      statusUser.includes(value);
    })
    .withMessage("Not is a valid status"),
  body("role")
    .if(body("role").exists())
    .not()
    .isEmpty()
    .withMessage("This field is required")
    .not()
    .custom((value) => {
      allRoles.includes(value);
    })
    .withMessage("Not is a valid role"),
  body("password")
    .if(body("password").exists())
    .not()
    .isEmpty()
    .withMessage(`Password is required`),
  body("newPassword")
    .if(body("newPassword").exists())
    .not()
    .isEmpty()
    .isLength({ min: 6, max: 30 })
    .withMessage("Password must be greater than 6 and less than 30")
    .matches("[0-9]")
    .withMessage("Password Must Contain a Number")
    .matches("[A-Z]")
    .withMessage("Password Must Contain an Uppercase Letter")
    .trim()
    .escape(),
];

// RECETAS - CONTROLLER VALIDATION
const validarCheckRecetas = [
  check("title")
    .not()
    .isEmpty()
    .withMessage("This field is required")
    .isLength({ min: 10, max: 70 })
    .withMessage("This field must be greater than 10 and less than 70"),
  check("description")
    .not()
    .isEmpty()
    .withMessage("This field is required")
    .isLength({ min: 10, max: 255 })
    .withMessage("This field must be greater than 10"),
  check("ingredients")
    .not()
    .isEmpty()
    .withMessage("This field is required")
    .isLength({ min: 1, max: 50 })
    .withMessage("This field must be greater than 1"),
  check("instruction")
    .not()
    .isEmpty()
    .withMessage("This field is required")
    .isLength({ min: 10 })
    .withMessage("This field must be greater than 10"),
  check("minutes")
    .isNumeric({ min: 0, max: 1440 })
    .withMessage("This fields is only numbers. Min: 0, Max: 1440"),
];

// COMENTARIOS - CONTROLLER VALIATION

const validarComentarios = [
  check("comment")
    .not()
    .isEmpty()
    .withMessage("This field is required")
    .isLength({ min: 1, max: 522 })
    .withMessage("This field must be greater than 1 and less than 522"),
];

const validarResetPassword = body("password")
  .isLength({ min: 6, max: 30 })
  .withMessage("Password must be greater than 6 and less than 30")
  .matches("[0-9]")
  .withMessage("Password Must Contain a Number")
  .matches("[A-Z]")
  .withMessage("Password Must Contain an Uppercase Letter")
  .trim()
  .escape();

module.exports = {
  validarCheckLogin,
  validarCheckRegister,
  validarCheckUpdate,
  validarCheckRecetas,
  validarComentarios,
  validarResetPassword,
};
