import { NextApiRequest, NextApiResponse } from "next";

import { getQueryParameter } from "@/lib/utils/utils";

import { checkEmailInstitution, unameExists } from "./signup";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const errors: { [key: string]: string } = {};
    const email = getQueryParameter(req.query.email) || "";
    const uname = getQueryParameter(req.query.uname) || "";
    if (email.length > 0) {
      const institution = await checkEmailInstitution(email, true);
      if (!institution) {
        errors.email = "This email address is already in use";
      }

      if (institution === "Not Found") {
        errors.email =
          "At this point, only members of academic/research institutions can join us. If you've enterred the email address provided by your academic/research institution, but you see this message, contact oneweb@umich.edu";
      }
    }
    if (uname.length > 0) {
      const userAlreadyExists = await unameExists(uname);
      if (userAlreadyExists) {
        errors.uname = "This username is already in use";
      }
    }
    res.status(200).json(errors);
  } catch (error) {
    console.error(error);
    res.status(500);
  }
}

export default handler;
