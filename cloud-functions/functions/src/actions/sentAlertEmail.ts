const nodemailer = require("nodemailer");
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAILPASS,
  },
});
export const sentAlertEmail = async (logData: any) => {
  try {
    let details = "";
    for (let key in logData) {
      details += `<li>${key}: ${logData[key]}</li>\n`;
    }
    const mailOptions = {
      from: process.env.EMAIL,
      to: "ouhrac@gmail.com",
      subject: `Error in 1cademy`,
      html: `Details:\n\n<ul>${details}</ul>`,
    };

    transporter.sendMail(mailOptions, async (error: any, data: any) => {
      if (error) {
        console.log(error);
      }
    });
  } catch (error) {
    console.log(error);
  }
};
