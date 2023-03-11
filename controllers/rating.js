const { ratingValues } = require("../helper/constans");
const Rating = require("../models/Rating");

const addRatingByRecetaId = async (req, res = response) => {
  const { recetaId } = req.params;
  const { value } = req.body;
  const userId = req.id;

  if (!ratingValues.includes(value)) {
    return res.status(400).json({ ok: false, msg: "Is a invalid value" });
  }

  if (!recetaId) {
    return res.status(400).json({ ok: true, msg: "A Id its required" });
  }

  try {
    if (value === 0) {
      await Rating.findOneAndDelete({
        receta: recetaId,
        usuario: userId,
      });
      return res.status(200).json({ ok: true, msg: "rating deleted" });
    }

    await Rating.findOneAndUpdate(
      { receta: recetaId, usuario: userId },
      { receta: recetaId, usuario: userId, rating: value },
      { upsert: true, new: true }
    );

    return res.status(200).json({ ok: true, msg: "rating added" });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ ok: false, msg: "Hable con el administrador" });
  }
};

module.exports = {
  addRatingByRecetaId,
};
