import { NextApiRequest, NextApiResponse } from "next";

import { EmailValidation } from "../../knowledgeTypes";

async function handler(req: NextApiRequest, res: NextApiResponse<EmailValidation>) {
  try {
    // institution: null | Not Found! | nameFromAInstitution
    res.status(200).json({ institution: "MIT" });
    // res.status(200).json({ institution: 'Not Found!' });
    // res.status(200).json({ institution: null });
  } catch (error) {
    console.error(error);
    res.status(500);
  }
}

export default handler;
