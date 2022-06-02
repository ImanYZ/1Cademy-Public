import { NextApiRequest, NextApiResponse } from "next";
import Typesense from "typesense";
import { SearchParams } from "typesense/lib/Typesense/Documents";

import { getQueryParameter } from "../../lib/utils";
import { ResponseAutocompleteInstitutions } from "../../src/knowledgeTypes";

async function handler(req: NextApiRequest, res: NextApiResponse<ResponseAutocompleteInstitutions>) {
  const q = getQueryParameter(req.query.q) || "";

  if (!q) {
    res.status(200).json({ results: [] });
    return;
  }
  const client = new Typesense.Client({
    nodes: [
      {
        host: process.env.ONECADEMYCRED_TYPESENSE_HOST as string,
        port: parseInt(process.env.ONECADEMYCRED_TYPESENSE_PORT as string),
        protocol: process.env.ONECADEMYCRED_TYPESENSE_PROTOCOL as string
      }
    ],
    apiKey: "xyz"
  });

  try {
    const searchParameters: SearchParams = { q, query_by: "name,username" };
    const searchResults = await client
      .collections<{ name: string; username: string; imageUrl: string }>("users")
      .documents()
      .search(searchParameters);

    const contributors = searchResults.hits?.map(el => ({
      id: el.document.username,
      name: el.document.name,
      imageUrl: el.document.imageUrl
    }));

    res.status(200).json({ results: contributors || [] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ errorMessage: "Cannot get contributors" });
  }
}

export default handler;
