const Usuario = require("../models/Usuario");
const bcrypt = require("bcryptjs");

const seedInsert = async (confirm = false) => {
  if (!confirm) return console.log("Creacion de la data no aceptada");

  try {
    console.log("creando data");

    await Usuario.deleteMany();
    await Usuario.insertMany(seedUsuarios);

    return console.log("creacion del seed completada!");
  } catch (error) {
    console.log(error);
    return console.log("creacion de la seed... failed! :(");
  }
};

const seedUsuarios = [
  {
    confirmationCode: bcrypt.hashSync("*"),
    email: "alex@prueba.com",
    password: bcrypt.hashSync("123456"),
    username: "admin",
    first_name: "hola",
    last_name: "wapo",
    role: "admin",
    status: "active",
  },
  {
    confirmationCode: bcrypt.hashSync("*"),
    email: "alex2@prueba.com",
    password: bcrypt.hashSync("123456"),
    username: "moderator",
    first_name: "hola",
    last_name: "wapo",
    role: "moderator",
    status: "active",
  },
  {
    confirmationCode: bcrypt.hashSync("*"),
    email: "alex5@prueba.com",
    password: bcrypt.hashSync("123456"),
    username: "alex",
    first_name: "hola",
    last_name: "wapo",
    role: "client",
    status: "active",
  },
  {
    confirmationCode: bcrypt.hashSync("*"),
    email: "alex3@prueba.com",
    password: bcrypt.hashSync("123456"),
    username: "SEO",
    first_name: "hola",
    last_name: "wapo",
    role: "SEO",
    status: "active",
  },
  {
    confirmationCode: bcrypt.hashSync("*"),
    email: "alex4@prueba.com",
    password: bcrypt.hashSync("123456"),
    username: "alexban",
    first_name: "hola",
    last_name: "wapo",
    role: "banned",
    status: "active",
  },
];

module.exports = { seedInsert };
