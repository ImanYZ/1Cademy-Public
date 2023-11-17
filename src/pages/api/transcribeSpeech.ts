import { NextApiRequest, NextApiResponse } from "next";
import fbAuth from "src/middlewares/fbAuth";

import { OpenAI, toFile } from "openai";

const secretKey = process.env.OPENAI_API_KEY;
const openai = new OpenAI({
  apiKey: secretKey,
  //   OPENAI_API_ORG_ID: process.env.OPENAI_API_KEY,
});

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const { audioUrl } = req.body;
    const response = await fetch(audioUrl);
    const { text: transctiption } = await openai.audio.transcriptions.create({
      model: "whisper-1",
      file: await toFile(response.blob(), new Date().toString() + ".wav"),
      language: "en",
    });
    console.log(transctiption);
    return res.status(200).send({
      transctiption,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      error,
    });
  }
}

export default fbAuth(handler);
