import { NextApiRequest, NextApiResponse } from "next";
import { SearchParams } from "typesense/lib/Typesense/Documents";

import { clientTypesense } from "@/lib/typesense/typesense.config";
import { getQueryParameter } from "@/lib/utils/utils";

import { FilterProcessedReferences, ResponseAutocompleteProcessedReferencesFilter } from "../../knowledgeTypes";

async function handler(req: NextApiRequest, res: NextApiResponse<ResponseAutocompleteProcessedReferencesFilter>) {
  const q = getQueryParameter(req.query.q) || "";

  try {
    const searchParameters: SearchParams = { q, query_by: "title" };
    const searchResults = await clientTypesense
      .collections<FilterProcessedReferences>("processedReferences")
      .documents()
      .search(searchParameters);

    const references: FilterProcessedReferences[] = searchResults.hits?.map(el => el.document) || [];
    const response: ResponseAutocompleteProcessedReferencesFilter = {
      results: references,
    };
    res.status(200).json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ errorMessage: "Cannot get contributors" });
  }
}

export default handler;
