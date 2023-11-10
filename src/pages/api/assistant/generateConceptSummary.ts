import { NextApiRequest, NextApiResponse } from "next";
import { generateFlashcard } from "src/utils/assistant-helpers";

export type IAssistantConetentSummary = {
  paragraphs: string[];
  model: "gpt-4-1106-preview" | "gpt-4-0613";
};

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const payload = req.body as IAssistantConetentSummary;
    const paragraphs = payload.paragraphs || [];
    const model = payload.model || "gpt-4-1106-preview";
    const concepts: any = await generateFlashcard(paragraphs, [], model);
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
