const { response } = require("express");
const Usuario = require("../models/Usuario");

const isHighUser = async (req, res = response, next) => {
  try {
    const user = await Usuario.findById(req.id);
    const isHighUser = user.isHighRoles();

    if (isHighUser) {
      return next();
    }

    return res
      .status(403)
      .json({ ok: false, message: "This user dont have permission for this." });
  } catch (error) {
    console.log(error);
    return res.status(404).json({ ok: false, msg: "Error with permissions!" });
  }
};

const isValidPermission = async (req, res = response, next) => {
  return next();
};

module.exports = {
  isValidPermission,
  isHighUser,
};
