import { tagsAndCommPoints } from "./tagsAndCommPoints";

import { db, batchUpdate } from "../admin";

// A tag should be deleted. So, in addition to deleting the document from the tags collection,
// we need to also delete its corresponding comPoints documents and tags of tags.
export const deleteTagCommunityAndTagsOfTags = async ({ nodeId }: any) => {
  // Delete the corresponding tag document from the tags collection.
  await tagsAndCommPoints({
    nodeId,
    callBack: async ({ tagRef, tagDoc, tagData }: any) => {
      if (tagDoc && !tagData.deleted) {
        await batchUpdate(tagRef, { deleted: true });
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

      await batchUpdate(linkedRef, { tagIds: linkedData.tagIds, tags: linkedData.tags });
    }
  }
};
