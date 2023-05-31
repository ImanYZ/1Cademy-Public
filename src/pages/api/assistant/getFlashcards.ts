import { NextApiRequest, NextApiResponse } from "next";
import { getFlashcardsFromPassage } from "src/utils/assistant-helpers";

export type IAssistantGetTopicPayload = {
  passage: string;
};

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const payload = req.body as IAssistantGetTopicPayload;
    const topic = await getFlashcardsFromPassage(payload.passage);
    return res.status(200).json({
      topic,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send({
      error: true,
    });
  }
}

export default handler;
