const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  // create a trasporter
  const transporter = nodemailer.createTransport({
    host: "smtp.mailtrap.io",
    port: 25,
    auth: {
      user: "3790e426d4d46c",
      pass: "08b133775189b2",
    },
  });
  // define the email options
  const mailOptions = {
    FormData: "Sagun to Sujan <tsuzanbt@gmail.com>",
    to: options.email,
    subject: options.subject,
    text: options.message,
    // html:""
  };
  // actually send the email
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
