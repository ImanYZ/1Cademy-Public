import { NextApiRequest, NextApiResponse } from "next";
import { SearchParams } from "typesense/lib/Typesense/Documents";

import { clientTypesense } from "@/lib/typesense/typesense.config";
import { getQueryParameter } from "@/lib/utils/utils";

import { LinkedKnowledgeNode, ResponseAutocompleteFullNodes, TypesenseNodesSchema } from "../../knowledgeTypes";

async function handler(req: NextApiRequest, res: NextApiResponse<ResponseAutocompleteFullNodes>) {
  const q = getQueryParameter(req.query.q) || "*";

  try {
    const searchParameters: SearchParams = { q, query_by: "title", sort_by: "mostHelpful:desc" };
    const searchResults = await clientTypesense
      .collections<TypesenseNodesSchema>("nodes")
      .documents()
      .search(searchParameters);
    const fullNodes: LinkedKnowledgeNode[] = (searchResults.hits || [])
      .map(el => el.document)
      .map(el => ({
        node: el.id,
        title: el.title,
        content: el.content,
        nodeImage: el.nodeImage,
        nodeType: el.nodeType
      }));

    res.status(200).json({ results: fullNodes });
  } catch (error) {
    console.error(error);
    res.status(500).json({ errorMessage: "Cannot get node titles to autocomplete" });
  }
}

export default handler;
