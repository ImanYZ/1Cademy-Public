import { NextApiRequest, NextApiResponse } from "next";

import { getQueryParameter } from "@/lib/utils/utils";

import { FilterValue } from "../../knowledgeTypes";
import { getInstitutionsForAutocomplete } from "../../lib/firestoreServer/institutions";

// Logic
// - getting existing institutions from given institutions array from institution collection
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
