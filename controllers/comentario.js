const response = require("express");

const Comentario = require("../models/Comentario");
const Receta = require("../models/Receta");

const getComments = async (req, res = response) => {
  try {
    const comments = await Comentario.find().populate({
      path: "usuario",
      select: "username avatar _id",
    });

    res.status(200).json({ ok: true, comments });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ ok: false, msg: "Por favor hable con el administrador" });
  }
};

const getCommentsByRecetaId = async (req, res = response) => {
  try {
    const { recetaId } = req.params;
    const { pagination = 1 } = req.query;
    const limit = 5;

    if (!recetaId) {
      return res
        .status(404)
        .json({ ok: false, msg: "receta dont exist with that id" });
    }

    const comments = await Comentario.find({
      receta: recetaId,
    })
      .populate({
        path: "usuario",
        select: "username avatar _id",
      })
      .skip((pagination - 1) * limit)
      .limit(limit * 1)
      .sort({ updatedAt: "desc" })
      .lean();

    const commentsCount = await Comentario.countDocuments();

    res.status(200).json({
      ok: true,
      comments,
      maxPagination: Math.ceil(commentsCount / limit),
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ ok: false, msg: "Por favor hable con el administrador" });
  }
};

const createComment = async (req, res) => {
  try {
    const { recetaId } = req.params;

    if (!recetaId) {
      return res.status(404).json({ ok: false, msg: "Receta dont exist" });
    }

    const { comment } = req.body;
    const receta = await Receta.findById(recetaId);

    if (!receta) {
      return res.status(404).json({ ok: false, msg: "Receta dont exist" });
    }

    const newComment = new Comentario({ comment });

    newComment.usuario = req.id;
    newComment.receta = receta._id;

    await newComment.save();

    return res.status(201).json({ ok: true, newComment });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ ok: false, msg: "Por favor hable con el administrador" });
  }
};

const updateComment = async (req, res) => {
  const commentId = req.params.commentId;
  const userId = req.id;
  const { comment } = req.body;

  try {
    if (!commentId) {
      return res.status(404).json({ ok: false, msg: "Receta dont exist" });
    }

    const commentDb = await Comentario.findById(commentId);

    const newComment = {
      comment,
      usuario: userId,
    };

    if (!commentDb) {
      return res.status(404).json({ ok: false, msg: "Comment do not exist" });
    }

    if (commentDb.usuario.toString() !== userId) {
      return res.status(401).json({
        ok: false,
        msg: "No tiene privilego de editar este comentario",
      });
    }

    await Comentario.findByIdAndUpdate(commentId, newComment, { new: true });

    res.json({ ok: true, comment: newComment });
  } catch (error) {
    console.log(error);
    res.status(500).json({ ok: false, msg: "Hable con el administrador" });
  }
};

const deleteComment = async (req, res) => {
  const comentarioId = req.params.commentId;
  const userId = req.id;

  try {
    if (!comentarioId) {
      return res.status(404).json({ ok: false, msg: "Comment dont exist." });
    }

    const comentario = await Comentario.findById(comentarioId);

    if (!comentario) {
      return res.status(404).json({ ok: false, msg: "Comment no exist" });
    }

    if (comentario.usuario._id.toString() !== userId) {
      return res.status(401).json({
        ok: false,
        msg: "No tiene privilego de editar este comentario",
      });
    }

    await Comentario.findByIdAndDelete(comentarioId);

    res.json({ ok: true, msg: "Deleted successfully!" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ ok: false, msg: "Hable con el administrador" });
  }
};

module.exports = {
  getComments,
  getCommentsByRecetaId,
  createComment,
  updateComment,
  deleteComment,
};
