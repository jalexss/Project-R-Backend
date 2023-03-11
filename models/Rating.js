const { Schema, model } = require("mongoose");
const { ratingValues } = require("../helpers/constans");

//comentarios de todos los ususarios a una receta
const RatingSchema = Schema(
  {
    receta: {
      type: Schema.Types.ObjectId,
      ref: "Receta",
      required: true,
    },

    rating: {
      type: Number,
      enum: {
        values: ratingValues,
        message: "{VALUE} Not is a valid value",
        required: true,
      },
    },

    usuario: {
      type: Schema.Types.ObjectId,
      ref: "Usuario",
      required: true,
    },
  },
  { versionKey: false, timestamps: true }
);

module.exports = model("Rating", RatingSchema);
