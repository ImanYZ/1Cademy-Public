import { NextApiRequest, NextApiResponse } from "next";
import { SearchParams } from "typesense/lib/Typesense/Documents";

import { clientTypesense } from "../../lib/typesense/typesense.config";
import { getQueryParameter } from "../../lib/utils";
import { LinkedKnowledgeNode, ResponseAutocompleteFullTags, TypesenseNodesSchema } from "../../src/knowledgeTypes";

async function handler(req: NextApiRequest, res: NextApiResponse<ResponseAutocompleteFullTags>) {
  const q = getQueryParameter(req.query.q) || "";

  try {
    const searchParameters: SearchParams = { q, query_by: "title", filter_by: "isTag: true" };
    const searchResults = await clientTypesense.collections<TypesenseNodesSchema>("nodes").documents().search(searchParameters);
    const tags: LinkedKnowledgeNode[] = (searchResults.hits || []).map(el => ({
      title: el.document.title,
      node: el.document.id,
      nodeType: el.document.nodeType,
      content: el.document.content,
      label: '',
      nodeImage: el.document.nodeImage
    }));
    res.status(200).json({ results: tags });
  } catch (error) {
    console.error(error);
    res.status(500).json({ errorMessage: "Cannot get tags" });
  }
}

export default handler;
