const express = require("express");
require("dotenv").config();
const { dbConnection } = require("./database/config");
const cors = require("cors");
const { seedInsert } = require("./database/seed");

//crear el servidor de express
const app = express();

// Base de datos
dbConnection();

// CORS
app.use(cors());

//directorio publico
app.use("/api/public", express.static("public"));
app.use("/api/storage", express.static("storage"));
// app.use(express.static("store"));

// lectura y parseo del body
app.use(express.json());

//rutas
// auth // crear, login, renew(token)
app.use("/api/auth", require("./routes/auth"));

// CRUD: todo lo relativo al posteo de recetas de comidas
app.use("/api/recetas", require("./routes/recetas"));

// CRUD: todo lo relativo al posteo de recetas de comidas
app.use("/api/comments", require("./routes/comentarios"));

// CRUD: todo lo relativo al usuario  que no tiene que ver con un registro normal
app.use("/api/users", require("./routes/usuario"));

app.use("/api/admin", require("./routes/dashboard"));

app.use("/api/rating", require("./routes/rating"));

seedInsert();

// Escuchar peticiones

app.listen(process.env.PORT, () => {
  console.log(`Servidor corriendo`);
});
