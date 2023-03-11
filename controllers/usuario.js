const mongoose = require("mongoose");
const express = require("express");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const path = require("path");

const Usuario = require("../models/Usuario");
const Comentario = require("../models/Comentario");
const Receta = require("../models/Receta");
const { generarJWT } = require("../helpers/jwt");

const getUsuarios = async (req, res) => {
  const { username: reqUsername } = req.query;

  try {
    const query = reqUsername
      ? Usuario.findOne({ username: reqUsername })
      : Usuario.find();

    const usuarios = await query.select("-password -confirmationCode").lean();

    return res.status(200).json({ ok: true, usuarios });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ ok: false, msg: "Por favor hable con el administrador" });
  }
};

const getUserById = async (req, res) => {
  const { userId } = req.params;

  try {
    let userById = {};

    userById = await Usuario.findById(userId);

    if (!userById) {
      return res.status(404).json({ ok: false, msg: "User dont exist!" });
    }

    const {
      avatar,
      createdAt,
      email,
      first_name,
      last_name,
      role,
      username,
      _id,
    } = userById;

    res.json({
      ok: true,
      avatar,
      createdAt,
      email,
      firstname: first_name,
      lastname: last_name,
      role,
      username,
      id: _id,
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ ok: false, msg: "Por favor hable con el administrador" });
  }
};

const crearUsuarioByModerator = async (req, res) => {
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

const actualizarUsuario = async (req, res) => {
  const { userId } = req.params;
  const {
    email,
    username,
    lastName,
    firstName,
    status,
    role,
    password,
    newPassword,
  } = req.body;

  let userUpdated = {};

  try {
    const user = await Usuario.findById(userId);
    const authUser = await Usuario.findById(req.id);
    const isValidUser = authUser.isHighRoles();

    if (!user) {
      return res
        .status(404)
        .json({ ok: false, msg: "usuario no existe con ese id" });
    }

    if (!isValidUser && user._id.toString() !== authUser._id.toString()) {
      return res
        .status(403)
        .json({ ok: false, msg: "No tiene privilego de editar este usuario" });
    }

    if (email) {
      userUpdated.email = email;
    }

    if (username) {
      userUpdated.username = username;
    }

    if (lastName) {
      userUpdated.last_name = lastName;
    }

    if (firstName) {
      userUpdated.first_name = firstName;
    }

    if (status) {
      userUpdated.status = status;
    }

    if (role) {
      userUpdated.role = role;
    }

    if (password) {
      let validPassword = bcrypt.compareSync(password, user.password);
      let validNewPassword = bcrypt.compareSync(newPassword, user.password);

      if (!validPassword) {
        return res.status(400).json({ ok: false, msg: `Wrong password` });
      }

      if (validNewPassword) {
        return res
          .status(400)
          .json({ ok: false, msg: `You are using you old password as new...` });
      }

      const salt = bcrypt.genSaltSync(10);
      userUpdated.password = bcrypt.hashSync(newPassword, salt);
    }

    await Usuario.findByIdAndUpdate(
      userId,
      {
        ...userUpdated,
      },
      { new: true }
    );

    res.status(200).json({ ok: true, msg: "Updated successfully!" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ ok: false, msg: "Hable con el administrador" });
  }
};

const borrarUsuario = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await Usuario.findById(userId);
    const authUser = await Usuario.findById(req.id);
    const isValidUser = authUser.isHighRoles();

    if (!user) {
      return res
        .status(404)
        .json({ ok: false, msg: "usuario no existe con ese id" });
    }

    if (!isValidUser && user._id.toString() !== authUser._id.toString()) {
      return res
        .status(403)
        .json({ ok: false, msg: "No tiene privilego de editar este usuario" });
    }

    const [usuarioDeleted, recetasDeleted, comentariosDeleted] =
      await Promise.all([
        Usuario.findByIdAndDelete(userId),
        Receta.deleteMany({ usuario: userId }),
        Comentario.deleteMany({ usuario: userId }),
      ]);

    const documentsDeletedCount =
      1 + recetasDeleted.deletedCount + comentariosDeleted.deletedCount;

    res.status(200).json({ ok: true, msg: "Done!", documentsDeletedCount });
  } catch (error) {
    console.log(error);
    res.status(500).json({ ok: false, msg: "Hable con el administrador" });
  }
};

const toggleFavorites = async (req, res) => {
  const { userId, recetaId } = req.params;
  const { addFavorite } = req.body; // yes - no

  try {
    const receta = await Receta.findById(recetaId);
    const { favorites = [] } = await Usuario.findById(userId);
    let allFavoritesRecetas = [];

    if (!receta) {
      return res.status(400).json({ ok: false, msg: "Receta dont exist" });
    }

    if (!addFavorite) {
      return res.status(400).json({ ok: false, msg: "Invalid option!" });
    }

    if (addFavorite === "no") {
      allFavoritesRecetas = favorites.filter(
        (favorite) => favorite.toString() !== recetaId
      );

      await Usuario.findByIdAndUpdate(userId, {
        favorites: allFavoritesRecetas,
      });
      return res.status(200).json({ ok: true });
    }

    if (favorites.length > 0) {
      allFavoritesRecetas = favorites.filter(
        (favorite) => favorite.toString() !== recetaId
      );
      await Usuario.findByIdAndUpdate(userId, {
        favorites: [...allFavoritesRecetas, recetaId],
      });
      return res.status(200).json({
        ok: true,
      });
    }

    await Usuario.findByIdAndUpdate(
      userId,
      {
        favorites: [recetaId],
      },
      { new: true }
    );

    res.status(200).json({ ok: true, msg: "Changed successfully!" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ ok: false, msg: "Hable con el administrador" });
  }
};

const myFavorites = async (req, res) => {
  const userId = req.id;

  try {
    const { favorites } = await Usuario.findById(userId)
      .select("favorites -_id")
      .populate({ path: "favorites", populate: "usuario" })
      .lean();

    res.status(200).json({ ok: true, favorites });
  } catch (error) {
    console.log(error);
    res.status(500).json({ ok: false, msg: "Hable con el administrador" });
  }
};

const myRecetas = async (req, res) => {
  const recetasUser = await Receta.find({ usuario: req.id })
    .populate({
      path: "usuario",
      select: "username avatar _id",
    })
    .lean();
  res.status(200).json(recetasUser);
};

const searchUser = async (req, res) => {
  const { query } = req.query;

  try {
    const user = await Usuario.find({
      username: { $regex: query },
    })
      .select("_id avatar username last_name first_name createAt")
      .lean();

    res.status(200).json(user);
  } catch (error) {
    console.log(error);
    res.status(500).json({ ok: false, msg: "Hable con el administrador" });
  }
};
const uploadAvatar = async (req, res) => {
  try {
    if (req.hasOwnProperty("file_error")) {
      return res.status(400).json({
        ok: false,
        error: req.file_error,
      });
    }

    if (!req.file) {
      return res.status(400).json({ ok: false, msg: "Is required one file" });
    }

    const userId = req.id;
    const directory = `${process.env.STORAGE_PATH}/${userId}/avatar`;
    const avatar = req.file.filename; //pathname
    const avatarFileName = req.file.filename.split("/")[2];

    fs.readdir(directory, (err, files) => {
      if (err) throw err;

      for (const file of files) {
        if (file !== avatarFileName) {
          fs.unlink(path.join(directory, file), (err) => {
            if (err) throw err;
          });
        }
      }
    });

    await Usuario.findByIdAndUpdate(
      userId,
      {
        avatar,
      },
      { new: true }
    );

    res.status(200).json({ ok: true, msg: "Changed successfully!" });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ ok: false, msg: "Por favor hable con el administrador" });
  }
};

const borrarAvatar = async (req, res) => {
  try {
    const { userId } = req.params;
    const directory = `${process.env.STORAGE_PATH}/${userId}/avatar`;

    fs.readdir(directory, (err, files) => {
      if (err) throw err;

      for (const file of files) {
        fs.unlink(path.join(directory, file), (err) => {
          if (err) throw err;
        });
      }
    });

    await Usuario.findByIdAndUpdate(
      userId,
      {
        avatar: "",
      },
      { new: true }
    );

    res.status(200).json({ ok: true, msg: "Changed successfully!" });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ ok: false, msg: "Por favor hable con el administrador" });
  }
};

module.exports = {
  getUsuarios,
  getUserById,
  crearUsuarioByModerator,
  actualizarUsuario,
  borrarUsuario,
  toggleFavorites,
  myFavorites,
  myRecetas,
  searchUser,
  uploadAvatar,
  borrarAvatar,
};
