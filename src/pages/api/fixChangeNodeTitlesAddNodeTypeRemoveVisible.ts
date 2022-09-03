import { NextApiRequest, NextApiResponse } from "next";

import { checkRestartBatchWriteCounts, db } from "../../lib/firestoreServer/admin";
import { getTypedCollections, NODE_TYPES, reputationTypes, tagsAndCommPoints } from "../../utils";

const changeTagTitleInAllDocs = async ({ batch, collName, allDocs, nodeId, newTitle, writeCounts }: any) => {
  let newBatch = batch;
  for (let doc of allDocs) {
    const linkedData = doc.data();
    if (linkedData.tagId === nodeId && linkedData.tag !== newTitle) {
      const linkedRef = db.collection(collName).doc(doc.id);
      newBatch.update(linkedRef, { tag: newTitle });
      [newBatch, writeCounts] = await checkRestartBatchWriteCounts(newBatch, writeCounts);
    }
  }
  return [newBatch, writeCounts];
};

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const allVersions: any = {};
    for (let nodeType of NODE_TYPES) {
      if (!allVersions.nodeType) {
        allVersions[nodeType] = [];
      }
      const { versionsColl }: any = getTypedCollections({ nodeType });
      const versionsQuery = versionsColl;
      const versionsDocs = await versionsQuery.get();
      for (let versionDoc of versionsDocs.docs) {
        const versionRef = versionsColl.doc(versionDoc.id);
        const versionData = versionDoc.data();
        allVersions[nodeType].push({ versionRef, versionData });
      }
    }
    const nodesDocs = await db.collection("nodes").get();
    const allNodeDocs = nodesDocs.docs;
    const messagesDocs = await db.collection("messages").get();
    const allMessagesDocs = messagesDocs.docs;
    const practicesDocs = await db.collection("practice").get();
    const allPracticesDocs = practicesDocs.docs;
    const usersDocs = await db.collection("users").get();
    const allUsersDocs = usersDocs.docs;
    const allReputationDocs = [];
    for (let tagReputation of reputationTypes) {
      const repDocs = await db.collection(tagReputation).get();
      allReputationDocs.push({ collectionName: tagReputation, reputationDocs: repDocs.docs });
    }

    let batch = db.batch();
    let writeCounts = 0;
    for (let nodeDoc of allNodeDocs) {
      const nodeData = nodeDoc.data();
      const nodeId = nodeDoc.id;
      const nodeRef = db.collection("nodes").doc(nodeId);
      const newTitle = nodeData.title;
      const nodeUpdates: any = {};
      console.log("node: " + newTitle);
      let linkedRef, linkedDoc, linkedData: any;
      for (let parent of nodeData.parents) {
        linkedRef = db.collection("nodes").doc(parent.node);
        linkedDoc = await linkedRef.get();
        linkedData = linkedDoc.data();
        const pChildren = linkedData.children;
        for (let idx = 0; idx < pChildren.length; idx++) {
          if (pChildren[idx].node === nodeId && (pChildren[idx].title !== newTitle || !pChildren[idx].type)) {
            pChildren[idx] = { title: newTitle, node: nodeId, label: "", type: nodeData.nodeType };
            batch.update(linkedRef, {
              children: pChildren,
            });
            [batch, writeCounts] = await checkRestartBatchWriteCounts(batch, writeCounts);
            break;
          }
        }
        if (!parent.type || "visible" in parent) {
          nodeUpdates.parents = nodeData.parents.filter((pN: any) => pN.node !== parent.node);
          const newParent = { ...parent, type: linkedData.nodeType };
          if ("visible" in parent) {
            delete newParent.visible;
          }
          nodeUpdates.parents.push(newParent);
        }
      }
      console.log("Done with parents.");

      for (let child of nodeData.children) {
        linkedRef = db.collection("nodes").doc(child.node);
        linkedDoc = await linkedRef.get();
        linkedData = linkedDoc.data();
        const cParents = linkedData.parents;
        for (let idx = 0; idx < cParents.length; idx++) {
          if (cParents[idx].node === nodeId && (cParents[idx].title !== newTitle || !cParents[idx].type)) {
            cParents[idx] = { title: newTitle, node: nodeId, label: "", type: nodeData.nodeType };
            batch.update(linkedRef, {
              parents: cParents,
            });
            [batch, writeCounts] = await checkRestartBatchWriteCounts(batch, writeCounts);
            break;
          }
        }
        if (!child.type || "visible" in child) {
          nodeUpdates.children = nodeData.children.filter((cN: any) => cN.node !== child.node);
          const newChild = { ...child, type: linkedData.nodeType };
          if ("visible" in child) {
            delete newChild.visible;
          }
          nodeUpdates.children.push(newChild);
        }
      }
      console.log("Done with children.");

      if (Object.keys(nodeUpdates).length > 0) {
        batch.update(nodeRef, {
          ...nodeUpdates,
        });
        [batch, writeCounts] = await checkRestartBatchWriteCounts(batch, writeCounts);
      }

      if (nodeData.isTag) {
        for (let taggingNodeDoc of allNodeDocs) {
          linkedData = taggingNodeDoc.data();
          for (let idx = 0; idx < linkedData.tagIds.length; idx++) {
            if (linkedData.tagIds[idx] === nodeId && linkedData.tags[idx] !== newTitle) {
              linkedData.tags[idx] = newTitle;
              linkedRef = db.collection("nodes").doc(taggingNodeDoc.id);
              batch.update(linkedRef, {
                tags: linkedData.tags[idx],
              });
              [batch, writeCounts] = await checkRestartBatchWriteCounts(batch, writeCounts);
              break;
            }
          }
        }
        console.log("Done with tagging nodes.");
        await tagsAndCommPoints({
          nodeId,
          callBack: async ({ collectionName, tagRef, tagDoc, tagData }: any) => {
            if (tagDoc) {
              if (
                (collectionName === "tags" && tagData.title !== newTitle) ||
                (collectionName !== "tags" && tagData.tag !== newTitle)
              ) {
                if (collectionName === "tags") {
                  batch.update(tagRef, { title: newTitle });
                } else {
                  batch.update(tagRef, { tag: newTitle });
                }
                [batch, writeCounts] = await checkRestartBatchWriteCounts(batch, writeCounts);
              }
            }
            console.log("Done with tags and communities: " + collectionName);
          },
        });

        [batch, writeCounts] = await changeTagTitleInAllDocs({
          batch,
          collName: "messages",
          allDocs: allMessagesDocs,
          nodeId,
          newTitle,
          writeCounts,
        });
        // { batch, collName, allDocs, nodeId, newTitle, writeCounts }
        [batch, writeCounts] = await changeTagTitleInAllDocs({
          batch,
          collName: "practice",
          allDocs: allPracticesDocs,
          nodeId,
          newTitle,
          writeCounts,
        });
        [batch, writeCounts] = await changeTagTitleInAllDocs({
          batch: batch,
          collName: "users",
          allDocs: allUsersDocs,
          nodeId,
          newTitle,
          writeCounts,
        });
        for (let { collectionName, reputationDocs } of allReputationDocs) {
          [batch, writeCounts] = await changeTagTitleInAllDocs({
            batch,
            collName: collectionName,
            allDocs: reputationDocs,
            nodeId,
            newTitle,
            writeCounts,
          });
        }

        for (let nodeType in allVersions) {
          for (let { versionRef, versionData } of allVersions[nodeType]) {
            for (let idx = 0; idx < versionData.tagIds.length; idx++) {
              if (versionData.tagIds[idx] === nodeId && versionData.tags[idx] !== newTitle) {
                versionData.tags[idx] = newTitle;
                await versionRef.update({ tags: versionData.tags });
                [batch, writeCounts] = await checkRestartBatchWriteCounts(batch, writeCounts);
              }
            }
          }
          console.log("Done with version of type " + nodeType);
        }
      }
      if (nodeData.nodeType === "Reference") {
        const citingNodesRefs = db.collection("nodes").where("referenceIds", "array-contains", nodeId);
        const citingNodesDocs = await citingNodesRefs.get();

        for (let citingNodeDoc of citingNodesDocs.docs) {
          linkedData = citingNodeDoc.data();
          const theRefIdx = linkedData.referenceIds.findIndex(nodeId);
          linkedRef = db.collection("nodes").doc(citingNodeDoc.id);
          linkedData.references[theRefIdx] = newTitle;
          batch.update(linkedRef, { references: linkedData.references });
          [batch, writeCounts] = await checkRestartBatchWriteCounts(batch, writeCounts);
        }
        console.log("Done with References.");
      }
    }
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ err, success: false });
  }
}

export default handler;
