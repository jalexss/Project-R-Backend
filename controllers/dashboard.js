const { response } = require("express");
const Comentario = require("../models/Comentario");
const Receta = require("../models/Receta");
const Usuario = require("../models/Usuario");

const getDashboardData = async (req, res = response) => {
  let now = new Date();
  let startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  try {
    const [
      usersCreatedToday,
      recetasCreatedToday,
      commentsCreatedToday,
      usersCount,
      latestUserCreated,
      latestUserUpdated,
      usersBannedCount,
      recetasCount,
      latestRecetaCreated,
      latestRecetaUpdated,
      commentsCount,
      latestCommentCreated,
      latestCommentUpdated,
    ] = await Promise.all([
      Usuario.countDocuments({ createdAt: startOfToday }),
      Receta.countDocuments({ createdAt: startOfToday }),
      Comentario.countDocuments({ createdAt: startOfToday }),
      Usuario.countDocuments(),
      Usuario.findOne({})
        .sort({ createdAt: -1 })
        .select("_id username role status createdAt updatedAt"),
      Usuario.findOne({})
        .sort({ updatedAt: 1 })
        .select("_id username role status createdAt updatedAt"),
      Usuario.countDocuments({ status: "banned" }),
      Receta.countDocuments(),
      Receta.findOne({})
        .sort({ createdAt: -1 })
        .select("usuario _id title createdAt updatedAt")
        .populate({
          path: "usuario",
          select: "username",
        }),
      Receta.findOne({})
        .sort({ updatedAt: 1 })
        .select("usuario _id title createdAt updatedAt")
        .populate({
          path: "usuario",
          select: "username",
        }),
      Comentario.countDocuments(),
      Comentario.findOne({}).sort({ createdAt: -1 }).populate({
        path: "usuario",
        select: "username",
      }),
      Comentario.findOne({}).sort({ createdAt: 1 }).populate({
        path: "usuario",
        select: "username",
      }),
    ]);

    res.status(200).json({
      // users,
      users: {
        usersCount,
        latestUserCreated,
        latestUserUpdated,
        usersBannedCount,
        usersCreatedToday,
      },
      // recetas,
      recetas: {
        recetasCount,
        latestRecetaCreated,
        latestRecetaUpdated,
        recetasCreatedToday,
      },
      // comments,
      comments: {
        commentsCount,
        latestCommentCreated,
        latestCommentUpdated,
        commentsCreatedToday,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ ok: false, msg: "Error. Pls see logs" });
  }
};

module.exports = {
  getDashboardData,
};
