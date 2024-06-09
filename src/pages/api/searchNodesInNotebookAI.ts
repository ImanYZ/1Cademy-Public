import { NextApiRequest, NextApiResponse } from "next";

import { getTypesenseClient } from "@/lib/typesense/typesense.config";
import { homePageSortByDefaults } from "@/lib/utils/utils";

import { SearchNodesResponse, TypesenseNodesSchema } from "../../knowledgeTypes";
import { NodeType, SimpleNode2 } from "../../types";
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
import { topGoogleSearchResults } from "src/utils/assistant-helpers";

async function handler(req: NextApiRequest, res: NextApiResponse<SearchNodesResponse>) {
  const {
    query = "*",
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
    const queryFields = ["title"];
    if (!onlyTitle) {
      queryFields.push("content");
    }

    let allPostsData: SimpleNode2[] = [];
    let found: number = 0;
    let currentPage: number = 0;

    //TO:DO implement the logic here of getting nodes corresponding to the user query
    //using a LLM

    // put the result in allPostsData

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
        action: query,
        imageUrl: userData.imageUrl,
        createdAt: Timestamp.now(),
        doer: uname,
        chooseUname: userData.chooseUname,
        fullname: `${userData.fName} ${userData.lName}`,
        nodeId: allPostsData.length ? allPostsData[0].id : "",
        receivers: [],
        email: userData.email,
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
