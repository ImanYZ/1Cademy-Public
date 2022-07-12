import { NextApiRequest, NextApiResponse } from "next";

import { UsernameValidation } from "../../knowledgeTypes";

async function handler(req: NextApiRequest, res: NextApiResponse<UsernameValidation>) {
  try {
    res.status(200).json({ valid: true });
  } catch (error) {
    console.error(error);
    res.status(500);
  }
}

export default handler;
