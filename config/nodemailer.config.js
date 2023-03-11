const nodemailer = require("nodemailer");

const user = process.env.EMAIL;
const password = process.env.PASSWORD_NODEMAILER;

const transport = nodemailer.createTransport({
  // host: "0.0.0.0", //mailhog
  port: "1025", //mailhog
});

const sendConfirmationEmail = (username, email, confirmationCode) => {
  console.log("confirm-email");
  transport
    .sendMail({
      from: user,
      to: email,
      subject: "Please confirm your account",
      html: `
      <div>
        <h1>Email Confirmation</h1>
        <h2>Hello ${username}</h2>
        <p>Thank you for subscribing. Please confirm your email by clicking on the following link</p>
        <a href=${process.env.URL_REACT_HOST}/auth/confirmedAccount?token=${confirmationCode}>Click here</a>
      </div>`,
    })
    .catch((err) => console.log(err));
};
const sendResetPasswordEmail = (username, email, resetPasswordCode) => {
  console.log("Reset-password-email");
  transport
    .sendMail({
      from: user,
      to: email,
      subject: "Reset Password",
      html: `
      <div>
        <h1>Confirm Reset Password</h1>
        <h2>Hello!. ${username},</h2>
        <p>This email is for help you to change your password.</p>
        <h3>Confirm reset password.</h3>
        <p>Use the link for start change your password</p>
        <a href=${process.env.URL_REACT_HOST}/auth/reset-password?token=${resetPasswordCode}>Click here</a>
      </div>`,
    })
    .catch((err) => console.log(err));
};

module.exports = {
  sendConfirmationEmail,
  sendResetPasswordEmail,
};
