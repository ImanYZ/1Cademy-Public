import { MODEL } from "@/lib/utils/constants";
import { NextApiRequest, NextApiResponse } from "next";
import fbAuth from "src/middlewares/fbAuth";
import { generateFlashcard } from "src/utils/assistant-helpers";

export type IAssistantConetentSummary = {
  paragraphs: string[];
  model: string;
};

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const payload = req.body as IAssistantConetentSummary;
    const paragraphs = payload.paragraphs || [];
    const concept: any = await generateFlashcard(paragraphs, []);
    return res.status(200).json({
      concepts: [concept],
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send({
      error: true,
    });
  }
}

export default fbAuth(handler);
