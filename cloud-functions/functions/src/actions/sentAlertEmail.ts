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
const transporter2 = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL2,
    pass: process.env.EMAILPASS2,
  },
});
export const sentAlertEmail = async (logData: any, error: boolean) => {
  try {
    let details = "";
    for (let key in logData) {
      if (key === "createdAt") {
        const date = logData.createdAt.toDate();
        details += `<li>detected at: ${date}</li>\n`;
      } else {
        details += `<li>${key}: ${JSON.stringify(logData[key])}</li>\n`;
      }
    }
    let mailOptions = {
      from: process.env.EMAIL,
      to: ["ouhrac@gmail.com", "oneweb@umich.edu"],
      subject: `Error Alert ${logData.project || "1Cademy"}`,
      html: `Details:\n\n<ul>${details}</ul>`,
    };
    if (error) {
      transporter.sendMail(mailOptions, async (error: any, data: any) => {
        if (error) {
          console.log(error);
        }
      });
    } else {
      mailOptions.from = process.env.EMAIL2;
      mailOptions.to = ["ouhrac@gmail.com"];
      (mailOptions.subject = `Info ${logData.project || "1Cademy"}`),
        transporter2.sendMail(mailOptions, async (error: any, data: any) => {
          if (error) {
            console.log(error);
          }
        });
    }
  } catch (error) {
    console.log(error);
  }
};
