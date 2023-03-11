const { response } = require("express");
const Receta = require("../models/Receta");
const Usuario = require("../models/Usuario");

const validarUploadImages = async (req, res = response, next) => {
  const { recetaId } = req.params;
  const userId = req.id;
  const receta = await Receta.findById(recetaId);

  if (!receta) {
    return res
      .status(400)
      .json({ ok: false, msg: "This receta doesn't exist" });
  }

  if (userId !== receta.usuario.toString()) {
    return res.status(400).json({
      ok: false,
      msg: "This user not have permission for update this receta! ",
    });
  }

  next();
};

const validarUploadAvatar = async (req, res = response, next) => {
  const { userId } = req.params;
  try {
    const user = await Usuario.findById(userId);
    const authUser = await Usuario.findById(req.id);
    const isValidUser = authUser.isHighRoles();

    if (!isValidUser && user._id.toString() !== authUser._id) {
      return res
        .status(403)
        .json({ ok: false, msg: "No tiene privilego de editar este usuario" });
    }

    next();
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      ok: false,
      msg: "Error internal server, see logs",
    });
  }
};

module.exports = {
  validarUploadImages,
  validarUploadAvatar,
};
