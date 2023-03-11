const { Schema, model } = require("mongoose");

//esquema Receta para la base de datos
const RecetaSchema = Schema(
  {
    //caracteristica del modelo receta
    //todo lo que tendra una receta a nivel de datos

    title: {
      type: String,
      required: true,
    },

    instruction: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      required: true,
    },

    minutes: {
      type: Number,
    },

    ingredients: {
      type: Array,
      required: true,
    },

    images: {
      type: Array,
    },

    usuario: {
      type: Schema.Types.ObjectId,
      ref: "Usuario",
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    // toJSON: { virtuals: true },
    // toObject: { virtuals: true },
  }
);

// RecetaSchema.virtual("comentarios", {
//   ref: "Comentario",
//   localField: "_id",
//   foreignField: "receta_id",
// });

module.exports = model("Receta", RecetaSchema);
