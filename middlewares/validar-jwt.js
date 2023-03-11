const { response } = require("express");
const jwt = require("jsonwebtoken");

const validarJWT = (req, res = response, next) => {
  // x-token headers en postman
  const token = req.header("x-token");

  if (!token) {
    return res.status(401).json({
      ok: false,
      msg: "No token in request!.",
    });
  }

  try {
    const { id, username } = jwt.verify(token, process.env.SECRET_JWT_SEED);
    req.id = id;
    req.username = username;
  } catch (error) {
    return res.status(401).json({
      ok: false,
      msg: "You need be logged!.",
    });
  }

  next();
};

const validarJWTWithEmail = (req, res = response, next) => {
  const { resetPasswordCode } = req.params;

  if (!resetPasswordCode) {
    return res.status(400).json({
      ok: false,
      msg: "No token in request!.",
    });
  }

  jwt.verify(resetPasswordCode, process.env.SECRET_JWT_SEED, function (err) {
    if (err) {
      return res.status(400).json({
        ok: false,
        msg: "Invalid token or has expired",
      });
    }
    next();
  });
};

module.exports = {
  validarJWT,
  validarJWTWithEmail,
};
