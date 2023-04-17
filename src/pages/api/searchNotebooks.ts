import { NextApiRequest, NextApiResponse } from "next";
import { SearchParams } from "typesense/lib/Typesense/Documents";

import { getQueryParameter } from "@/lib/utils/utils";

import { SearchNotebookResponse, TypesenseNodesSchema } from "../../knowledgeTypes";
import { clientTypesense } from "../../lib/typesense/typesense.config";
import fbAuth from "../../middlewares/fbAuth";
async function handler(req: NextApiRequest, res: NextApiResponse<SearchNotebookResponse>) {
  const q = getQueryParameter(req.body.q) || "";

  try {
    const isSearchingAll = !q || q === "*";
    let found: number = 0;
    let currentPage: number = 0;
    let searchParameters: SearchParams = {
      q,
      query_by: "title",
      num_typos: `2`,
      typo_tokens_threshold: 2,
      filter_by: `owner: ${req.body.data.user.name}`,
    };
    if (isSearchingAll) {
      searchParameters = { ...searchParameters };
    }
    const searchResults = await clientTypesense
      .collections<TypesenseNodesSchema>("notebooks")
      .documents()
      .search(searchParameters);
    found = Math.max(found, searchResults.found);
    currentPage = Math.max(currentPage, searchResults.page);
    const data: any = searchResults.hits?.map(el => el.document) || [];
    res.status(200).json({
      data: data,
      page: currentPage,
      numResults: Math.max(data.length, found),
    });
  } catch (error) {
    console.error(error);
    res.status(500);
  }
}

export default fbAuth(handler);
