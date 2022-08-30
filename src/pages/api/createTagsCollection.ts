import { NextApiRequest, NextApiResponse } from "next";

import { admin, checkRestartBatchWriteCounts, commitBatch, db } from "../../lib/firestoreServer/admin";
import { doRemoveUnusedTags, generateTagsOfTags, getDirectTags, hasCycle } from '../../utils';

const markNodesIsTag = async () => {
  let batch = db.batch();
  let writeCounts = 0;

  const nodeDocs = await db.collection("nodes").where("deleted", "==", false).get();
  for (let nodeDoc of nodeDocs.docs) {
    const nodeData = nodeDoc.data();
    for (let tagId of nodeData.tagIds) {
      const tagRef = db.collection("nodes").doc(tagId);
      const tagDoc = await tagRef.get();
      const tagData: any = tagDoc.data();
      if (!tagData.isTag) {
        batch.update(tagRef, { isTag: true });
        [batch, writeCounts] = await checkRestartBatchWriteCounts(batch, writeCounts);
      }
    }
  }
  await commitBatch(batch);
};

// This is an alternative to the function anyCycles/hasCycle.
// Returns the cycle path if it exists, otherwise returns undefined.
const findCycle = (tagsOfNodes: any) => {
  let visited = new Set();
  let result;

  // dfs set the result to a cycle when the given node was already on the current path.
  //    If not on the path, and also not visited, it is marked as such. It then
  //    iterates the node's tags and calls the function recursively.
  //    If any of those calls returns true, exit with true also
  const dfs = (node: any, path: any) => {
    if (path.has(node)) {
      result = [...path, node]; // convert to array (a Set maintains insertion order)
      result.splice(0, result.indexOf(node)); // remove part that precedes the cycle
      return true;
    }
    if (visited.has(node)) {
      return;
    }
    path.add(node);
    visited.add(node);
    if (((node in tagsOfNodes && tagsOfNodes[node].tagIds) || []).some((tagId: any) => dfs(tagId, path)))
      return path;
    // Backtrack
    path.delete(node);
    // No cycle found here: return undefined
  };

  // Perform a DFS traversal for each node (except nodes that get
  //   visited in the process)
  for (let node in tagsOfNodes) {
    if (!visited.has(node) && dfs(node, new Set())) return result;
  }
};

const addTagsIfNoCycleOrDuplicate = async ({ nodeId, nodeData, tagsOfNodes, nodesUpdates }: any) => {
  let tagsChanged = false;
  if (!(nodeId in tagsOfNodes)) {
    tagsOfNodes[nodeId] = { tags: [], tagIds: [] };
  }
  for (let tagIdx = 0; tagIdx < nodeData.tagIds.length; tagIdx++) {
    const tagId = nodeData.tagIds[tagIdx];
    const tag = nodeData.tags[tagIdx];
    if (!tagsOfNodes[nodeId].tagIds.includes(tagId)) {
      tagsOfNodes[nodeId].tagIds.push(tagId);
      tagsOfNodes[nodeId].tags.push(tag);
      if (hasCycle({ tagsOfNodes, nodeId, path: [] })) {
        console.log("Cycle was created, deleting the tag from tagsOfNodes");
        tagsOfNodes[nodeId].tagIds.pop();
        tagsOfNodes[nodeId].tags.pop();
        tagsChanged = true;
      }
    } else {
      // We need to set the list of tags on the node again because a duplicate is observed and we should remove it.
      tagsChanged = true;
    }
  }
  if (tagsChanged) {
    if (!(nodeId in nodesUpdates)) {
      nodesUpdates[nodeId] = { tags: [], tagIds: [] };
    }
    nodesUpdates[nodeId].tagIds = tagsOfNodes[nodeId].tagIds;
    nodesUpdates[nodeId].tags = tagsOfNodes[nodeId].tags;
  }
};

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const nodesUpdates: any = {};
    // In this code block, we populate the content of tagsOfNodes and
    // remove every tag from nodes if it results in a cycle or it's a duplicate.
    const tagsOfNodes = {};
    let nodesDocs = await db.collection("nodes").where("deleted", "==", false).get();
    //  obtain all nodes that are not deleted
    for (let nodeDoc of nodesDocs.docs) {
      const nodeData = nodeDoc.data();
      //  if the node is a tag, add it to tagNodes dictionary as an empty list
      if (!nodeData.deleted && nodeData.isTag) {
        console.log("Tag: " + nodeDoc.id);
        await addTagsIfNoCycleOrDuplicate({ nodeId: nodeDoc.id, nodeData, tagsOfNodes, nodesUpdates });
      }
    }
    console.log("Done with nodes with isTag = true.");

    // We need to retrieve all the nodes again to have the up-to-date list of tags on nodes.
    for (let nodeDoc of nodesDocs.docs) {
      const nodeData = nodeDoc.data();
      if (!nodeData.deleted) {
        await addTagsIfNoCycleOrDuplicate({ nodeId: nodeDoc.id, nodeData, tagsOfNodes, nodesUpdates });
      }
    }
    console.log("Done with node tags.");

    // Now that we have the right tags without cycle of duplicate for each tag node in tagsOfNodes,
    // we need to add indirect tags (tags of tags) to it, for each node.
    for (let nodeId in tagsOfNodes) {
      // { nodeId, tagIds, tags, nodeUpdates }
      await generateTagsOfTags({ nodeId, tagIds: [], tags: tagsOfNodes, nodeUpdates: nodesUpdates });
    }
    console.log("Done with generateTagsOfTags.");

    let batch = db.batch();
    let writeCounts = 0;
    // Now that we have the complete (direct and indirect) list of tags for each tag node,
    // we can generate the documents of the tags collection based on tagsOfNodes.
    for (let nodeDoc of nodesDocs.docs) {
      const nodeId = nodeDoc.id;
      // nodeUpdates is a subset of tagsOfNodes where the tags and tagIds are changed compared to those on the original node.
      if (nodeId in nodesUpdates && Object.keys(nodesUpdates[nodeId]).length > 0) {
        const nodeRef = db.collection("nodes").doc(nodeId);
        batch.update(nodeRef, nodesUpdates[nodeId]);
        [batch, writeCounts] = await checkRestartBatchWriteCounts(batch, writeCounts);
        console.log(nodeId + " updated!");
      }
    }
    await commitBatch(batch);

    // Now that we removed some tags from some nodes because of cycle or duplication,
    // it is possible that we end up with some tags that no one is tagging them.
    await doRemoveUnusedTags();
    console.log("Done with doRemoveUnusedTags.");

    // At this point, there should not be any cycle; if there is any, we should figure out why!
    const pathCycle = findCycle(tagsOfNodes);
    if (pathCycle) {
      throw "The cycle is: " + pathCycle;
    }
    console.log("Found no cycle.");

    await markNodesIsTag();
    console.log("markNodesIsTag Done!");

    batch = db.batch();
    writeCounts = 0;
    nodesDocs = await db.collection("nodes").where("deleted", "==", false).get();
    //  obtain all nodes that are not deleted
    for (let nodeDoc of nodesDocs.docs) {
      const nodeData = nodeDoc.data();
      //  if the node is a tag, add it to tagNodes dictionary as an empty list
      if (!nodeData.deleted && nodeData.isTag) {
        let tags = nodeData.tags;
        let tagIds = nodeData.tagIds;
        ({ tagIds, tags } = await getDirectTags({ nodeTagIds: tagIds, nodeTags: tags, tagsOfNodes }));
        const tagRef = db.collection("tags").doc();
        const currentTimestamp = admin.firestore.Timestamp.fromDate(new Date());
        batch.set(tagRef, {
          tags,
          tagIds,
          node: nodeDoc.id,
          title: nodeData.title,
          createdAt: currentTimestamp,
          updatedAt: currentTimestamp,
        });
        [batch, writeCounts] = await checkRestartBatchWriteCounts(batch, writeCounts);
        console.log(nodeData.title + " tag created!");
      }
    }
    await commitBatch(batch);
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ err, success: false });
  }
}

export default handler;