import { NextApiRequest, NextApiResponse } from "next";
import { generateFlashcard } from "src/utils/assistant-helpers";

export type IAssistantConetentSummary = {
  paragraphs: string[];
};

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    console.log(req.body);
    const payload = req.body as IAssistantConetentSummary;
    const paragraphs = payload.paragraphs || [];
    const concepts: any = await generateFlashcard(paragraphs, []);
    return res.status(200).json({
      concepts,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send({
      error: true,
    });
  }
}

export default handler;
