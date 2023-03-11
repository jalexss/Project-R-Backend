const response = require("express");
const mongoose = require("mongoose");

const Receta = require("../models/Receta");
const Usuario = require("../models/Usuario");

const fs = require("fs");
const path = require("path");
const Comentario = require("../models/Comentario");
const Rating = require("../models/Rating");

const getRecetas = async (req, res = response) => {
  try {
    const { pagination = 1 } = req.query;
    const limit = 5;

    const recetas =
      pagination <= 0
        ? await Receta.find().populate({
            path: "usuario",
            select: "username avatar _id",
          })
        : await Receta.find()
            .populate({
              path: "usuario",
              select: "username avatar _id",
            })
            .limit(limit * 1)
            .skip((pagination - 1) * limit)
            .sort({ updatedAt: "desc" })
            .lean();

    const recetasCount = await Receta.countDocuments();

    res.json({
      ok: true,
      recetas,
      maxPagination: Math.ceil(recetasCount / limit),
    });
  } catch (error) {
    console.log(error);
    return res
      .status(404)
      .json({ ok: false, msg: "Habble con el administrador" });
  }
};

const getRecetaById = async (req, res) => {
  const { recetaId } = req.params;
  const userId = req.id;

  if (!recetaId) {
    return res.status(400).json({ ok: true, msg: "A id its required" });
  }

  try {
    const receta = await Receta.findById(recetaId)
      .populate({
        path: "usuario",
        select: "username avatar _id",
      })
      .lean();

    if (!receta) {
      return res
        .status(404)
        .json({ ok: false, msg: "receta no existe con ese id" });
    }

    const recetaRating = await Rating.find({ receta: recetaId }).select(
      "rating usuario -_id"
    );

    const ratingUser = recetaRating.filter((rating) => {
      return rating.usuario.toString() === userId;
    });

    const initialValue = 0;
    const meanRating = recetaRating.reduce((accumulator, currentValue) => {
      return (accumulator += currentValue.rating);
    }, initialValue);

    const average = meanRating / recetaRating.length;

    receta.ratingUser = ratingUser.length > 0 ? ratingUser[0].rating : 0;
    receta.rating = meanRating;
    receta.average = average;

    return res.status(200).json(receta);
  } catch (error) {
    console.log(error),
      res.status(500).json({ msg: "Hable con el administrador" });
  }
};

const getRecetasByUser = async (req, res) => {
  const { user } = req.params;

  try {
    let recetaByUserId = "";
    let recetaByUsername = "";
    // if (!userId) return res.status(400).json({ msg: `Where's the user?` });
    const userByUsername = await Usuario.findOne({ username: user });

    recetaByUsername = await Receta.find({ usuario: userByUsername?._id })
      .populate({
        path: "usuario",
        select: "username avatar _id",
      })
      .lean();

    if (mongoose.isValidObjectId(user)) {
      recetaByUserId = await Receta.find({ usuario: user })
        .populate({
          path: "usuario",
          select: "username avatar _id",
        })
        .lean();
    }

    if (!recetaByUserId && !recetaByUsername) {
      return res
        .status(404)
        .json({ ok: false, msg: "Don't there recipe with that account" });
    }

    const recetasFounded = recetaByUserId || recetaByUsername;

    res.status(200).json(recetasFounded);
  } catch (error) {
    console.log(error),
      res.status(500).json({ msg: "Hable con el administrador" });
  }
};

const crearReceta = async (req, res = response) => {
  const receta = req.body;

  try {
    let {
      title,
      usuario,
      minutes = 1,
      description,
      ingredients,
      instruction,
    } = receta;

    usuario = req.id;

    let recetaGuardada = new Receta({
      title,
      usuario,
      minutes,
      description,
      ingredients,
      instruction,
    });

    await recetaGuardada.save();

    res.json({
      ok: true,
      msg: "Receta created successfully",
      receta: recetaGuardada,
    });
  } catch (error) {
    console.log(error),
      res.status(500).json({ msg: "Hable con el administrador" });
  }
};

const actualizarReceta = async (req, res = response) => {
  const recetaId = req.params.recetaId;
  const userId = req.id;

  try {
    const receta = await Receta.findById(recetaId);

    if (!receta) {
      return res
        .status(404)
        .json({ ok: false, msg: "receta no existe con ese id" });
    }

    if (receta.usuario.toString() !== userId) {
      return res
        .status(401)
        .json({ ok: false, msg: "No tiene privilego de editar este receta" });
    }

    const nuevaReceta = {
      ...req.body,
      usuario: userId,
    };

    const recetaActualizada = await Receta.findByIdAndUpdate(
      recetaId,
      nuevaReceta,
      { new: true }
    );

    res.json({ ok: true, receta: recetaActualizada });
  } catch (error) {
    console.log(error);
    res.status(500).json({ ok: false, msg: "Hable con el administrador" });
  }
};

const eliminarReceta = async (req, res = response) => {
  const { recetaId } = req.params;
  try {
    const receta = await Receta.findById(recetaId);
    const authUser = await Usuario.findById(req.id);
    const isValidUser = authUser.isHighRoles();

    if (!receta) {
      return res
        .status(404)
        .json({ ok: false, msg: "receta no existe con ese id" });
    }

    if (!isValidUser && receta.usuario.toString() !== authUser._id.toString()) {
      return res.status(403).json({
        ok: false,
        msg: "This user not have permission for do this action!",
      });
    }

    const [recetaDeleted, comentariosDeleted] = await Promise.all([
      Receta.findByIdAndDelete(recetaId),
      Comentario.deleteMany({ receta: recetaId }),
    ]);

    const documentsDeletedCount = 1 + comentariosDeleted.deletedCount;

    res.json({ ok: true, msg: "Done!", documentsDeletedCount });
  } catch (error) {
    console.log(error);
    res.status(500).json({ ok: false, msg: "Hable con el administrador" });
  }
};

const uploadImages = async (req, res = response) => {
  try {
    if (req.hasOwnProperty("file_error")) {
      return res.status(400).json({
        ok: false,
        error: req.file_error,
      });
    }

    const { recetaId } = req.params;
    const userId = req.id;
    let directory = `${process.env.STORAGE_PATH}/${userId}/receta/${recetaId}`;
    const images = req.files;
    let pathNames = [];
    let fileNames = [];

    //directory + filename
    images.forEach((img, index) => (pathNames[index] = img.filename));

    images.forEach(
      //image.png in filesystem
      (img, index) => (fileNames[index] = img.filename.split("/")[3])
    );

    //borran los archivos que sean diferentes de los que estan en fileNames
    fs.readdir(directory, (err, files) => {
      if (err) throw err;

      for (const file of files) {
        if (!fileNames.includes(file)) {
          fs.unlink(path.join(directory, file), (err) => {
            if (err) throw err;
          });
        }
      }
    });

    await Receta.findByIdAndUpdate(
      recetaId,
      {
        images: pathNames,
      },
      { new: true }
    );

    res.status(200).json({ ok: true, msg: "Images added!" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ ok: false, msg: "Hable con el administrador" });
  }
};

const toggleFavorite = async (req, res) => {
  const { recetaId } = req.params;
  const { addFavorite } = req.body;
  const userId = req.id;

  try {
    const receta = await Receta.findById(recetaId);

    if (!receta) {
      return res
        .status(404)
        .json({ ok: false, msg: "receta no existe con ese id" });
    }

    if (!addFavorite) {
      return res
        .status(404)
        .json({ ok: false, msg: "No options include in this request" });
    }

    let allUserFavorite = receta.addedToFavorite;

    // if(!allUserFavorite) = {

    // }

    if (addFavorite === "no") {
      allUserFavorite = allUserFavorite.filter(
        (thisUser) => thisUser !== userId
      );
      await Receta.findByIdAndUpdate(
        recetaId,
        {
          addedToFavorite: [...AllUserFavorite],
        },
        { new: true }
      );

      return res.status(200).json({ ok: true, allUserFavorite });
    }

    Receta.findByIdAndUpdate(
      recetaId,
      {
        addedToFavorite: [...allUserFavorite, userId],
      },
      { new: true }
    );

    return res.status(200).json({ ok: true, allUserFavorite });
  } catch (error) {
    console.log(error);
    res.status(500).json({ ok: false, msg: "Hable con el administrador" });
  }
};

const searchReceta = async (req, res) => {
  const { query } = req.query;

  try {
    const recetas = await Receta.find({ title: { $regex: query } }).lean();

    res.status(200).json(recetas);
  } catch (error) {
    console.log(error);
    res.status(500).json({ ok: false, msg: "Hable con el administrador" });
  }
};

module.exports = {
  getRecetas,
  getRecetaById,
  getRecetasByUser,
  crearReceta,
  actualizarReceta,
  eliminarReceta,
  uploadImages,
  toggleFavorite,
  searchReceta,
};
