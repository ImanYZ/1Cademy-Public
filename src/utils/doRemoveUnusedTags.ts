import { checkRestartBatchWriteCounts, commitBatch, db } from "../lib/firestoreServer/admin";
import { deleteTagCommunityAndTagsOfTags } from ".";

export const doRemoveUnusedTags = async () => {
  // Each key is the node ID of a tag and it value if the array of node ids that are tagging the tag.
  const tagsNodes: any = {};
  const nodesDocs = await db.collection("nodes").where("deleted", "==", false).get();
  //  obtain all nodes that are not deleted
  for (let nodeDoc of nodesDocs.docs) {
    const nodeData = nodeDoc.data();
    //  if the node is a tag, add it to tagNodes dictionary as an empty list
    if (nodeData.isTag && !(nodeDoc.id in tagsNodes)) {
      tagsNodes[nodeDoc.id] = [];
    }
    //  for all of nodeData's tags, add them to tagsNodes accordingly
    for (let tagId of nodeData.tagIds) {
      if (!(tagId in tagsNodes)) {
        //  doesn't already exist, create it
        tagsNodes[tagId] = [nodeDoc.id];
      } else {
        //  already exists, push it instead
        tagsNodes[tagId].push(nodeDoc.id);
      }
    }
  }
  let writeCounts = 0;
  let batch = db.batch();
  //  iterate through dictionary, if no node has tagged this tag, i.e.,
  //  there are no elements in array with the given key,
  //  that means that it is not being tagged. mark isTag as false
  for (let tagId in tagsNodes) {
    if (tagsNodes[tagId].length === 0) {
      [batch, writeCounts] = await deleteTagCommunityAndTagsOfTags({ batch, nodeId: tagId, writeCounts });
      const tagNodeRef = db.collection("nodes").doc(tagId);
      batch.update(tagNodeRef, { isTag: false });
      [batch, writeCounts] = await checkRestartBatchWriteCounts(batch, writeCounts);
      console.log(tagId);
    }
  }
  await commitBatch(batch);
};
