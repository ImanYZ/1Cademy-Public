import { NextApiRequest, NextApiResponse } from "next";
import Typesense from "typesense";
import { SearchParams } from "typesense/lib/Typesense/Documents";

import { getQueryParameter } from "@/lib/utils/utils";

import { FilterValue, ResponseAutocompleteFilter } from "../../knowledgeTypes";

async function handler(req: NextApiRequest, res: NextApiResponse<ResponseAutocompleteFilter>) {
  const q = getQueryParameter(req.query.q) || "";

  const client = new Typesense.Client({
    nodes: [
      {
        host: process.env.ONECADEMYCRED_TYPESENSE_HOST as string,
        port: parseInt(process.env.ONECADEMYCRED_TYPESENSE_PORT as string),
        protocol: process.env.ONECADEMYCRED_TYPESENSE_PROTOCOL as string,
      },
    ],
    apiKey: process.env.ONECADEMYCRED_TYPESENSE_APIKEY as string,
  });

  if (q.length === 0) {
    const defaultContributors =
      process.env.NODE_ENV === "production"
        ? require("@/lib/datasets/defaultContributors.prod.json")
        : require("@/lib/datasets/defaultContributors.dev.json");
    const response: ResponseAutocompleteFilter = {
      results: defaultContributors,
    };
    res.status(200).json(response);
    return;
  }

  try {
    const searchParameters: SearchParams = { q, query_by: "name,username" };
    const searchResults = await client
      .collections<{ name: string; username: string; imageUrl: string }>("users")
      .documents()
      .search(searchParameters);

    const contributors: FilterValue[] | undefined = searchResults.hits?.map(el => ({
      id: el.document.username,
      name: el.document.name,
      imageUrl: el.document.imageUrl,
    }));
    const response: ResponseAutocompleteFilter = {
      results: contributors || [],
    };
    res.status(200).json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ errorMessage: "Cannot get contributors" });
  }
}

export default handler;
