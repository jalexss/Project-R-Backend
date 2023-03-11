const jwt = require("jsonwebtoken");
const Usuario = require("../models/Usuario");

let secretKey = process.env.SECRET_JWT_SEED;
let secretKeyTime = process.env.EXPIRE_TOKEN_TIME;
let skToConfirmCode = process.env.SECRET_JWT_SEED_CONFIRM_CODE;
let skTimeConfirmCode = process.env.EXPIRE_TOKEN_TIME_CONFIRM_CODE;
let skToResetPassword = process.env.SECRET_JWT_SEED_RESET_PASSWORD;
let skTimeResetPassword = process.env.EXPIRE_TOKEN_TIME_RESET_PASSWORD;

const isValidResetPasswordToken = async (resetPasswordCode) => {
  if (!resetPasswordCode) {
    return false;
  }
  try {
    const isValidToken = await jwt.verify(resetPasswordCode, skToResetPassword);

    if (!isValidToken) {
      return false;
    }

    const user = await Usuario.findOne({ resetPasswordCode });

    if (!user) {
      return false;
    }
  } catch (error) {
    return false;
  }

  return true;
};

const generarJWT = (id, username) => {
  return new Promise((resolve, reject) => {
    const payload = { id, username };
    jwt.sign(
      payload,
      secretKey,
      {
        expiresIn: secretKeyTime,
      },
      (err, token) => {
        if (err) {
          console.log(err);
          reject("jwt expired or not generated");
        }

        resolve(token);
      }
    );
  });
};

const generarJWTtoEmail = (email) => {
  return new Promise((resolve, reject) => {
    const payload = { email };
    jwt.sign(
      payload,
      skToConfirmCode,
      {
        expiresIn: skTimeConfirmCode,
      },
      (err, token) => {
        if (err) {
          console.log(err);
          reject("jwt expired or not generated");
        }

        resolve(token);
      }
    );
  });
};
const generarJWTtoResetPassword = (email) => {
  return new Promise((resolve, reject) => {
    const payload = { email };
    jwt.sign(
      payload,
      skToResetPassword,
      {
        expiresIn: skTimeResetPassword,
      },
      (err, token) => {
        if (err) {
          console.log(err);
          reject("jwt expired or not generated");
        }

        resolve(token);
      }
    );
  });
};

module.exports = {
  generarJWT,
  generarJWTtoEmail,
  generarJWTtoResetPassword,
  isValidResetPasswordToken,
};
