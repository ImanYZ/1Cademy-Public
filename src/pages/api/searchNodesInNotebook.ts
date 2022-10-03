import { NextApiRequest, NextApiResponse } from "next";

import { getTypesenseClient } from "@/lib/typesense/typesense.config";
import { homePageSortByDefaults } from "@/lib/utils/utils";

import { SearchNodesResponse, SimpleNode, TypesenseNodesSchema } from "../../knowledgeTypes";
// import { SortDirection, SortValues } from "../../noteBookTypes";
import { NodeType } from "../../types";
import { SortDirection, SortValues } from "../../nodeBookTypes";

async function handler(req: NextApiRequest, res: NextApiResponse<SearchNodesResponse>) {
  const { q = "*", nodeTypes = [], tags = [], nodesUpdatedSince, sortOption, sortDirection, page } = req.body;

  try {
    const typesenseClient = getTypesenseClient();

    const searchParameters = {
      q,
      query_by: "title,content",
      sort_by: buildSort(sortOption, sortDirection),
      filter_by: buildFilter(nodeTypes, tags, nodesUpdatedSince),
      page,
    };

    const searchResults = await typesenseClient
      .collections<TypesenseNodesSchema>("nodes")
      .documents()
      .search(searchParameters);

    const allPostsData = (searchResults.hits ?? []).map(
      (el): SimpleNode => ({
        id: el.document.id,
        title: el.document.title,
        changedAt: el.document.changedAt,
        content: el.document.content,
        nodeType: el.document.nodeType,
        nodeImage: el.document.nodeImage || "",
        corrects: el.document.corrects,
        wrongs: el.document.wrongs,
        tags: el.document.tags,
        contributors: el.document.contributors,
        institutions: el.document.institutions,
        choices: el.document.choices || [],
        versions: el.document.versions,
      })
    );

    res.status(200).json({
      data: allPostsData || [],
      page: searchResults.page,
      numResults: searchResults.found,
      perPage: homePageSortByDefaults.perPage,
    });
  } catch (error) {
    console.error(error);
    res.status(500);
  }
}

export default handler;

const buildFilter = (nodeTypes: NodeType, tags: string[], nodesUpdatedSince: number) => {
  const filters = [];
  if (nodeTypes.length) filters.push(`nodeType:=[${nodeTypes.toString()}]`);
  if (tags.length) filters.push(`tags:=[${tags.toString()}]`);

  if (nodesUpdatedSince) {
    const updatedAt = new Date();
    updatedAt.setDate(updatedAt.getDate() - nodesUpdatedSince);
    if (updatedAt) filters.push(`changedAtMillis:>${updatedAt.getTime()}`);
  }

  return filters.join("&& ");
};

const buildSort = (sortOption: SortValues, sortDirection: SortDirection) => {
  const sorts = [];
  const direction = sortDirection === "ASCENDING" ? "asc" : "desc";
  if (sortOption === "LAST_VIEWED") sorts.push(`updatedAt: ${direction}`); //
  if (sortOption === "DATE_MODIFIED") sorts.push(`changedAtMillis: ${direction}`); // UPDATE AT
  if (sortOption === "PROPOSALS") sorts.push(`proposalsAmount: ${direction}`); // calculate number of proposal
  if (sortOption === "UP_VOTES") sorts.push(`corrects: ${direction}`);
  if (sortOption === "DOWN_VOTES") sorts.push(`wrongs: ${direction}`); // add down votes
  if (sortOption === "NET_NOTES") sorts.push(`netVotes: ${direction}`); // UP_VOTES + DOWN_VOTES
  return sorts.join(",");
};
