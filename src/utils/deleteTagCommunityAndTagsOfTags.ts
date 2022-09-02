import { checkRestartBatchWriteCounts, db } from "../lib/firestoreServer/admin";
import { tagsAndCommPoints } from ".";

// A tag should be deleted. So, in addition to deleting the document from the tags collection,
// we need to also delete its corresponding comPoints documents and tags of tags.
export const deleteTagCommunityAndTagsOfTags = async ({ batch, nodeId, writeCounts }: any) => {
  let newBatch = batch;
  // Delete the corresponding tag document from the tags collection.
  await tagsAndCommPoints({
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    nodeId,
    callback: async ({ collectionName, tagRef, tagDoc, tagData }: any) => {
      if (tagDoc && !tagData.deleted) {
        newBatch.update(tagRef, { deleted: true });
        [newBatch, writeCounts] = await checkRestartBatchWriteCounts(newBatch, writeCounts);
      }
    },
  });

  // Delete the corresponding tag of tags documents from the tags collection.
  const taggedtagDocs = await db.collection("tags").where("tagIds", "array-contains", nodeId).get();
  //  For every taggedtagDoc, remove the tag corresponding to nodeId from its list of tags.
  for (let taggedtagDoc of taggedtagDocs.docs) {
    const linkedRef = db.collection("tags").doc(taggedtagDoc.id);
    const linkedData = taggedtagDoc.data();
    const tagIdx = linkedData.tagIds.findIndex((tagId: any) => tagId === nodeId);
    if (tagIdx !== -1) {
      linkedData.tagIds.splice(tagIdx, 1);
      linkedData.tags.splice(tagIdx, 1);
      newBatch.update(linkedRef, { tagIds: linkedData.tagIds, tags: linkedData.tags });
      [newBatch, writeCounts] = await checkRestartBatchWriteCounts(newBatch, writeCounts);
    }
  }
  return [newBatch, writeCounts];
};
