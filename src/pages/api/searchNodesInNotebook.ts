import { NextApiRequest, NextApiResponse } from "next";

import { getTypesenseClient } from "@/lib/typesense/typesense.config";
import { homePageSortByDefaults } from "@/lib/utils/utils";

import { SearchNodesResponse, SimpleNode, TypesenseNodesSchema } from "../../knowledgeTypes";
// import { SortDirection, SortValues } from "../../noteBookTypes";
import { NodeType } from "../../types";
import { SortDirection, SortValues } from "../../nodeBookTypes";
import { db } from "@/lib/firestoreServer/admin";
import fbAuth from "src/middlewares/fbAuth";
import { IUserNode } from "src/types/IUserNode";
import { SearchParams } from "typesense/lib/Typesense/Documents";
import { arrayToChunks } from "src/utils";
import { QueryDocumentSnapshot, Timestamp } from "firebase-admin/firestore";
import { detach } from "src/utils/helpers";
import { IUser } from "src/types/IUser";
import { IActionTrack } from "src/types/IActionTrack";

async function handler(req: NextApiRequest, res: NextApiResponse<SearchNodesResponse>) {
  const {
    q = "*",
    nodeTypes = [],
    tags = [],
    nodesUpdatedSince,
    sortOption,
    sortDirection,
    page,
    onlyTitle,
  } = req.body;
  const { uname } = req.body.data?.user?.userData;

  try {
    const typesenseClient = getTypesenseClient();

    const queryFields = ["title"];
    if (!onlyTitle) {
      queryFields.push("content");
    }

    let allPostsData: SimpleNode[] = [];
    let found: number = 0;
    let currentPage: number = 0;

    for (const queryField of queryFields) {
      const searchParameters: SearchParams = {
        q,
        query_by: queryField,
        sort_by: buildSort(sortOption, sortDirection),
        filter_by: buildFilter(nodeTypes, tags, nodesUpdatedSince),
        page,
        num_typos: `2`,
        typo_tokens_threshold: 2,
      };

      const searchResults = await typesenseClient
        .collections<TypesenseNodesSchema>("nodes")
        .documents()
        .search(searchParameters);
      found = Math.max(found, searchResults.found);
      currentPage = Math.max(currentPage, searchResults.page);

      const _allPostsData = (searchResults.hits ?? []).map(
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
      for (const postData of _allPostsData) {
        const idx = allPostsData.findIndex(_postData => _postData.id === postData.id);
        if (idx === -1) {
          allPostsData.push(postData);
        }
      }
    }

    const nodeIds = allPostsData.map(post => post.id);
    let userStudiedNodes: { [key: string]: boolean } = {};

    const nodeIdChunks = arrayToChunks(nodeIds, 10);
    const userNodeDocs: QueryDocumentSnapshot<any>[] = [];

    for (const nodeIdChunk of nodeIdChunks) {
      if (!nodeIdChunk.length) {
        continue;
      }
      const snapshot = await db
        .collection("userNodes")
        .where("user", "==", uname)
        .where("node", "in", nodeIdChunk)
        .get();
      for (let i = 0; i < snapshot.docs.length; i++) {
        userNodeDocs.push(snapshot.docs[i]);
      }
    }

    for (const userNode of userNodeDocs) {
      const userNodeData = userNode.data() as IUserNode;
      userStudiedNodes[userNodeData.node] = !!userNodeData?.isStudied;
    }

    for (let postData of allPostsData) {
      postData.studied = userStudiedNodes.hasOwnProperty(postData.id) && userStudiedNodes[postData.id];
    }

    // TODO: move these to queue
    // action tracks
    await detach(async () => {
      const user = await db.collection("users").doc(uname).get();
      const userData = user.data() as IUser;
      const actionRef = db.collection("actionTracks").doc();
      actionRef.create({
        accepted: true,
        type: "Search",
        action: q,
        imageUrl: userData.imageUrl,
        createdAt: Timestamp.now(),
        doer: uname,
        chooseUname: userData.chooseUname,
        fullname: `${userData.fName} ${userData.lName}`,
        nodeId: allPostsData.length ? allPostsData[0].id : "",
        receivers: [],
      } as IActionTrack);
    });

    res.status(200).json({
      data: allPostsData || [],
      page: currentPage,
      numResults: Math.max(allPostsData.length, found),
      perPage: homePageSortByDefaults.perPage,
    });
  } catch (error) {
    res.status(500);
  }
}

export default fbAuth(handler);

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
