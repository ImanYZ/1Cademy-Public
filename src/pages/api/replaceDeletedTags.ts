import { NextApiRequest, NextApiResponse } from "next";

import { db } from "../../lib/firestoreServer/admin";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const nodesDocs = await db.collection("nodes").where("deleted", "==", false).get();
    //  obtain all nodes that are not deleted
    for (let nodeDoc of nodesDocs.docs) {
      console.log(nodeDoc.id);
      const nodeRef = db.collection("nodes").doc(nodeDoc.id);
      const nodeData = nodeDoc.data();
      let nodeTagIds = [...nodeData.tagIds];
      let nodeTags = [...nodeData.tags];
      const removedTags: any[] = [];
      const uniqueTags: any[] = [];
      const nodeTagIdsLength = nodeTagIds.length;
      //  for all of nodeData's tags, add them to tagsNodes accordingly
      for (let tagIdx1 = 0; tagIdx1 < nodeTagIdsLength; tagIdx1++) {
        const tagId = nodeData.tagIds[tagIdx1];
        const tag = nodeData.tags[tagIdx1];
        //  If it's previously seen.
        //  remove duplicate tags
        if (uniqueTags.includes(tagId)) {
          // Remove all the duplicate instances.
          for (let tagIdx2 = 0; tagIdx2 < nodeTagIdsLength; tagIdx2++) {
            if (nodeTagIds[tagIdx2] === tagId) {
              nodeTagIds.splice(tagIdx2, 1);
              nodeTags.splice(tagIdx2, 1);
            }
          }
          // Push only one of them.
          nodeTagIds.push(tagId);
          nodeTags.push(tag);
        } else {
          uniqueTags.push(tagId);
        }
        const tagDoc = await db.collection("nodes").doc(tagId).get();
        const tagData: any = tagDoc.data();
        //  if deleted, and not yet added to removedTags, filter it out of nodeTags
        if (tagData.deleted) {
          if (!removedTags.includes(tagId)) {
            for (let tagIdx2 = 0; tagIdx2 < nodeTagIdsLength; tagIdx2++) {
              if (nodeTagIds[tagIdx2] === tagId) {
                nodeTagIds.splice(tagIdx2, 1);
                nodeTags.splice(tagIdx2, 1);
              }
            }
            //  If people have used a tag on a node that was deleted and another node was created for it,
            //  then we need to find what that other node is, to replace the removed tag with it.
            const newTagDocs = await db
              .collection("nodes")
              .where("title", "==", tagData.title)
              .where("deleted", "==", false)
              .get();
            if (newTagDocs.docs.length > 0) {
              nodeTagIds.push(newTagDocs.docs[0].id);
              nodeTags.push(tagData.title);
            }
            removedTags.push(tagId);
          }
        }
      }
      await nodeRef.update({ tagIds: nodeTagIds, tags: nodeTags });
    }
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ err, success: false });
  }
}

export default handler;
