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
    const mailOptions = {
      from: process.env.EMAIL,
      to: "ouhrac@gmail.com",
      subject: `Error in 1cademy`,
      html: `Error:
      <p>Sent by: ${logData.uname}</p>
      <p>conversationId: ${logData.conversationId}</p>
      <p>severity: ${logData?.severity || ""}</p>
      <p>message: ${logData.message}</p>
      <p>error: ${logData?.error || ""}</p>`,
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
