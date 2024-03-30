const nodemailer = require("nodemailer");
import { google } from "googleapis";

const oAuth2Client = new google.auth.OAuth2(process.env.CLIENT_ID, process.env.CLIENT_SECRET, process.env.REDIRECT_URI);

oAuth2Client.setCredentials({
  refresh_token: process.env.REFRESH_TOKEN,
});

const sendMail = async (mailOptions: any) => {
  try {
    const accessToken = await oAuth2Client.getAccessToken();
    const transport = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: process.env.EMAIL,
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        refreshToken: process.env.REFRESH_TOKEN,
        accessToken: accessToken,
      },
    });

    const result = transport.sendMail(mailOptions);
    return result;
  } catch (error) {
    console.log(error);
  }
};
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
      const result = sendMail(mailOptions);
      console.log(result);
    } else {
      mailOptions.to = ["ouhrac@gmail.com"];
      mailOptions.subject = `Info ${logData.project || "1Cademy"}`;
      const result = sendMail(mailOptions);
      console.log(result);
    }
  } catch (error) {
    console.log(error);
  }
};
