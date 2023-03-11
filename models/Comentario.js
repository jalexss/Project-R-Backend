const { Schema, model } = require("mongoose");

//comentarios de todos los ususarios a una receta
const ComentarioSchema = Schema(
  {
    receta: {
      type: Schema.Types.ObjectId,
      ref: "Receta",
      required: true,
    },

    comment: {
      type: String,
      required: true,
    },

    usuario: {
      type: Schema.Types.ObjectId,
      ref: "Usuario",
      required: true,
    },
  },
  { versionKey: false, timestamps: true }
);

module.exports = model("Comentario", ComentarioSchema);
