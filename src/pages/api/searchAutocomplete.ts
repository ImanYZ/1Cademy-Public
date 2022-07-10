import { NextApiRequest, NextApiResponse } from "next";
import { SearchParams } from "typesense/lib/Typesense/Documents";

import { getQueryParameter } from "@/lib/utils/utils";

import { ResponseAutocompleteNodes, TypesenseNodesSchema } from "../../knowledgeTypes";
import { clientTypesense } from "../../lib/typesense/typesense.config";

async function handler(req: NextApiRequest, res: NextApiResponse<ResponseAutocompleteNodes>) {
  const q = getQueryParameter(req.query.q) || "";

  try {
    const isSearchingAll = !q || q === "*";
    const searchParameters: SearchParams = isSearchingAll
      ? { q, query_by: "title", sort_by: "mostHelpful:desc" }
      : { q, query_by: "title" };
    const searchResults = await clientTypesense
      .collections<TypesenseNodesSchema>("nodes")
      .documents()
      .search(searchParameters);
    const titles = searchResults.hits?.map(el => el.document.title) || [];
    const searchText = isSearchingAll ? "" : q.toLowerCase();
    const titlesStartWithKey = titles.filter(cur => cur.toLowerCase().startsWith(searchText));

    const titlesResult = titles ? Array.from(new Set([...titlesStartWithKey, ...titles])) : [];
    res.status(200).json({ results: titlesResult });
  } catch (error) {
    console.error(error);
    res.status(500).json({ errorMessage: "Cannot get node titles to autocomplete" });
  }
}

export default handler;
