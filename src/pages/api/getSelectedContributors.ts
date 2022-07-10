import { NextApiRequest, NextApiResponse } from "next";

import { getContributorsForAutocomplete } from "../../lib/users";
import { getQueryParameter } from "../../lib/utils";
import { FilterValue } from "../../src/knowledgeTypes";

async function handler(req: NextApiRequest, res: NextApiResponse<FilterValue[]>) {
  try {
    const userIds = (getQueryParameter(req.query.users) || "").split(",").filter(el => el !== "");

    const response = await getContributorsForAutocomplete(userIds);

    res.status(200).json(response);
  } catch (error) {
    console.error(error);
    res.status(500);
  }
}

export default handler;
