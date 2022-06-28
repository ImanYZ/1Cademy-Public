import fs from "fs";
import { NextApiRequest, NextApiResponse } from "next";
import path from "path";

import { generateFeedbackReport } from "../../lib/excel";
import { getFeedback } from "../../lib/feedback";

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const data = await getFeedback();
    generateFeedbackReport(data);

    const filePath = path.join("public", "feedback.xlsx");
    const stat = fs.statSync(filePath);

    res.writeHead(200, {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Length": stat.size
    });

    const readStream = fs.createReadStream(filePath);
    // We replaced all the event handlers with a simple call to readStream.pipe()
    readStream.pipe(res);
  } catch (error) {
    console.error(error);
    res.status(500).json({ errorMessage: "Cannot send feedback" });
  }
}

export default handler;
