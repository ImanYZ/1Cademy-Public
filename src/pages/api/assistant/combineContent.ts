import { NextApiRequest, NextApiResponse } from "next";
import { combineContents } from "src/utils/assistant-helpers";

export type IAssistantCombineContentPayload = {
  passages: string[];
};

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const payload = req.body as IAssistantCombineContentPayload;
    const content = combineContents(payload.passages || []);
    return res.status(200).json({
      content,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send({
      error: true,
    });
  }
}

export default handler;
