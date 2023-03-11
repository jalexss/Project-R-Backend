const response = require("express");
const multer = require("multer");
const fs = require("fs");

const { getFileExtension } = require("../helpers/getFileExtension");

//Storage

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, process.env.STORAGE_PATH);
  },

  filename: function (req, file, cb) {
    const { recetaId } = req.params;
    const ext = getFileExtension(file);
    const userId = req.id;
    const path = `./${process.env.STORAGE_PATH}/${userId}/receta/${recetaId}`;
    const name = `${userId}/receta/${recetaId}/image${Date.now()}.${ext}`;

    fs.access(path, (error) => {
      // To check if given directory
      // already exists or not
      if (error) {
        // If current directory does not exist then create it
        fs.mkdir(path, { recursive: true }, (error) => {
          if (error) {
            console.log(error);
          } else {
            console.log("New Directory created successfully !!");
            cb(null, name);
          }
        });
      } else {
        console.log("Given Directory already exists !!");
        cb(null, name);
      }
    });
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 20971520 }, //expresado en bytes
  fileFilter: (req, file, cb) => {
    if (!process.env.ALLOWED_EXTENSIONS.includes(getFileExtension(file))) {
      req.file_error = "file not allowed";
      return cb(null, false);
    }

    if (!file) {
      req.file_error = "Is required one file";
      return cb(null, false);
    }

    cb(null, true);
  },
});

module.exports = {
  upload,
};
