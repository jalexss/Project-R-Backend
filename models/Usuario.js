const { Schema, model } = require("mongoose");
const { allRoles, statusUser } = require("../helpers/constans");

//esquema usuario para la base de datos
const UsuarioSchema = new Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    avatar: { type: String },
    role: {
      type: String,
      enum: {
        values: allRoles,
        message: "{VALUE} Not is a valid role",
        default: "client",
        required: true,
      },
    },
    status: {
      type: String,
      enum: statusUser,
      default: "pending",
    },
    confirmationCode: { type: String, unique: true },
    resetPasswordCode: { type: String },
    favorites: [
      {
        type: Schema.Types.ObjectId,
        ref: "Receta",
        unique: true,
      },
    ],
  },
  { timestamps: true, versionKey: false }
);

UsuarioSchema.methods.isHighRoles = function () {
  return allRoles.some((role) => role !== "client" && role === this.role);
};

module.exports = model("Usuario", UsuarioSchema);
