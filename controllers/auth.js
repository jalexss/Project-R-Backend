const { response } = require("express");
const bcrypt = require("bcryptjs");
const Usuario = require("../models/Usuario");
const {
  generarJWT,
  generarJWTtoEmail,
  generarJWTtoResetPassword,
  isValidResetPasswordToken,
} = require("../helpers/jwt");
const {
  sendConfirmationEmail,
  sendResetPasswordEmail,
} = require("../config/nodemailer.config");

const crearUsuario = async (req, res = response) => {
  const { username, email, password, firstName, lastName } = req.body;

  try {
    let dbEmail = await Usuario.findOne({ email });
    let dbUsername = await Usuario.findOne({ username });

    if (dbEmail) {
      return res.status(400).json({ ok: false, msg: "Account already exist!" });
    }

    if (dbUsername) {
      return res
        .status(400)
        .json({ ok: false, msg: "Username already exist!" });
    }

    const usuario = new Usuario(req.body);
    usuario.role = "client";
    usuario.first_name = firstName;
    usuario.last_name = lastName;

    //encryptar password
    const salt = bcrypt.genSaltSync(10);
    usuario.password = bcrypt.hashSync(password, salt);

    //generar JWT Json web tokens / Jason web token
    await generarJWT(usuario.id, usuario.username);

    //token para confirmar email
    usuario.confirmationCode = await generarJWTtoEmail(usuario.email);

    await usuario.save();

    sendConfirmationEmail(
      usuario.username,
      usuario.email,
      usuario.confirmationCode
    );

    res.status(201).json({
      // mensaje de usuario creado
      msg: "Account created successfully",
      ok: true,
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ ok: false, msg: "Por favor hable con el administrador" });
  }
};

//Renovar JWT
const revalidarToken = async (req, res = response) => {
  const userAuthId = req.id;
  const userAuth = await Usuario.findOne({ _id: userAuthId });
  const {
    _id,
    username,
    role,
    avatar = undefined,
    email,
    status,
    favorites,
  } = userAuth;

  // Generar un nuevo JWT y retornarlo en esta peticion
  const token = await generarJWT(_id, username);

  res.json({
    avatar,
    email,
    id: _id,
    ok: true,
    role,
    status,
    token,
    username,
    favorites,
  });
};

//Login de usuario
const loginUsuario = async (req, res = response) => {
  const { username, password } = req.body;

  try {
    const usuario = await Usuario.findOne({ username });

    if (!usuario) {
      return res
        .status(400)
        .json({ ok: false, msg: `Wrong Password Or Account Doesn't Exist` });
    }

    if (usuario.status != "active") {
      return res
        .status(401)
        .json({ ok: false, msg: "Pending Account. Please Verify Your Email!" });
    }

    //confirmar los password
    const validPassword = bcrypt.compareSync(password, usuario.password);

    if (!validPassword) {
      return res
        .status(400)
        .json({ ok: false, msg: `Wrong Password Or Account Doesn't Exist` });
    }

    //Generar nuestro JWT jason web token
    const token = await generarJWT(usuario.id, usuario.username);

    if (!usuario.avatar) {
      usuario.avatar = undefined;
    }

    res.json({
      avatar: usuario.avatar,
      email: usuario.email,
      id: usuario.id,
      ok: true,
      role: usuario.role,
      status: usuario.status,
      token,
      username: usuario.username,
      favorites: usuario.favorites,
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ ok: false, msg: "Por favor hable con el administrador" });
  }
};

const activarUsuario = async (req, res) => {
  try {
    const usuario = await Usuario.findOne({
      confirmationCode: req.params.confirmationCode,
    });

    if (!usuario) {
      //verificando si existe el usuario con ese correo

      return res.status(404).json({ ok: false, msg: `Acount Doesn't Exist` });
    }

    usuario.status = "active";

    usuario.save((err) => {
      if (err) {
        return res.status(500).send({ message: err });
      }
    });

    res.json({ ok: true, msg: "Account Verified!." });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ ok: false, msg: "Por favor hable con el administrador" });
  }
};

const verificarUsuario = async (req, res) => {
  const dataUser = await Usuario.findById(req.id);
  const {
    avatar,
    username,
    role,
    email,
    id,
    status,
    favorites,
    first_name,
    last_name,
  } = dataUser;

  res.status(200).json({
    avatar,
    username,
    role,
    email,
    id,
    status,
    favorites,
    firstName: first_name,
    lastName: last_name,
  });
};

const confirmResetPassword = async (req, res = response) => {
  const { email } = req.body;

  try {
    const user = await Usuario.findOne({ email });

    if (!user) {
      return res
        .status(404)
        .json({ ok: false, msg: "Dont exist account with this email." });
    }

    const resetPasswordCode = await generarJWTtoResetPassword(email);

    await Usuario.findByIdAndUpdate(
      user._id,
      {
        resetPasswordCode,
      },
      { new: true }
    );

    sendResetPasswordEmail(user.username, email, resetPasswordCode);

    res.status(200).json({ ok: true, msg: "Done!" });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ ok: false, msg: "Por favor hable con el administrador" });
  }
};

const checkResetPasswordCode = async (req, res = response) => {
  const { resetPasswordCode } = req.params;

  try {
    const isValidToken = await isValidResetPasswordToken(resetPasswordCode);

    if (!isValidToken) {
      return res
        .status(404)
        .json({ ok: false, msg: "Not is a valid token or has expired" });
    }

    res.status(200).json({ ok: true, msg: "Is a valid code/token" });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ ok: false, msg: "Por favor hable con el administrador" });
  }
};

const resetPassword = async (req, res = response) => {
  const { resetPasswordCode } = req.params;
  const { password } = req.body;

  try {
    const user = await Usuario.findOne({ resetPasswordCode });
    const salt = bcrypt.genSaltSync(10);
    const newPassword = bcrypt.hashSync(password, salt);
    const isValidToken = await isValidResetPasswordToken(resetPasswordCode);

    if (!isValidToken) {
      return res
        .status(404)
        .json({ ok: false, msg: "Not is a valid token or has expired" });
    }

    await Usuario.findByIdAndUpdate(
      user._id,
      {
        password: newPassword,
      },
      { new: true }
    );

    res.status(200).json({ ok: true, msg: "Done!" });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ ok: false, msg: "Por favor hable con el administrador" });
  }
};

module.exports = {
  crearUsuario,
  loginUsuario,
  revalidarToken,
  verificarUsuario,
  activarUsuario,
  confirmResetPassword,
  resetPassword,
  checkResetPasswordCode,
};
