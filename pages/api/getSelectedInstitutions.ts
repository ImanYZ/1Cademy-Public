import { NextApiRequest, NextApiResponse } from "next";

import { getInstitutionsForAutocomplete } from "../../lib/firestoreServer/institutions";
import { getQueryParameter } from "../../lib/utils";
import { FilterValue } from "../../src/knowledgeTypes";

async function handler(req: NextApiRequest, res: NextApiResponse<FilterValue[]>) {
  try {
    const institutions = (getQueryParameter(req.query.institutions) || "").split(",").filter(el => el !== "");

    const response = await getInstitutionsForAutocomplete(institutions);

    res.status(200).json(response);
  } catch (error) {
    console.error(error);
    res.status(500);
  }
}

export default handler;
