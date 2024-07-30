import { DocumentReference, Timestamp, Transaction, WriteBatch } from "firebase-admin/firestore";
import { TransactionWrite } from "src/types";
import { INode } from "src/types/INode";
import { INodeType } from "src/types/INodeType";
import { INodeVersion } from "src/types/INodeVersion";
import { IComReputationUpdates, updateReputation } from "./reputations";
import { detach, isVersionApproved } from "./helpers";
import { MAX_TRANSACTION_WRITES, checkRestartBatchWriteCounts, commitBatch, db } from "@/lib/firestoreServer/admin";
import {
  changeNodeTitle,
  createPractice,
  createUpdateUserVersion,
  generateTagsData,
  getCumulativeProposerVersionRatingsOnNode,
  getUserVersion,
  indexNodeChange,
  transferUserVersionsToNewNode,
} from "./version-helpers";
import { retrieveAndSignalAllUserNodesChanges } from "./retrieveAndsignalAllUserNodesChanges";
import { getNode } from "./getNode";
import { GetTypedCollectionsReturn, getTypedCollections } from "./getTypedCollections";
import { convertToTGet } from "./convertToTGet";
import { arrayToChunks } from "./arrayToChunks";

export const versionCreateUpdate = async ({
  notebookId, // optional string
  batch,
  nodeId,
  nodeData,
  nodeRef,
  nodeType,
  instantApprove,
  courseExist,
  isInstructor,
  versionId,
  versionData,
  // Boolean
  newVersion,
  // False if proposal to improve, and indicates the type if proposal for a new child.
  childType,
  voter,
  correct,
  wrong,
  award,
  addedParents,
  addedChildren,
  removedParents,
  removedChildren,
  currentTimestamp,
  newUpdates,
  writeCounts,
  t,
  tWriteOperations,
}: {
  notebookId: string; // optional string
  batch: WriteBatch | null;
  nodeId: string;
  nodeData: INode;
  nodeRef: DocumentReference;
  nodeType: INodeType;
  instantApprove: boolean;
  courseExist: boolean;
  isInstructor: boolean;
  versionId: string;
  versionData: INodeVersion;
  newVersion: boolean;
  childType: INodeType | undefined;
  voter: string;
  correct: number;
  wrong: number;
  award: any;
  addedParents: string[];
  addedChildren: string[];
  removedParents: string[];
  removedChildren: string[];
  currentTimestamp: Timestamp;
  newUpdates: any;
  writeCounts: number;
  t: Transaction | null;
  tWriteOperations: TransactionWrite[];
}): Promise<[newBatch: WriteBatch, writeCounts: number]> => {
  const {
    title,
    children,
    content,
    nodeImage,
    nodeVideo,
    nodeAudio,
    parents,
    referenceIds,
    referenceLabels,
    references,
    tagIds,
    tags,
    proposer,
    imageUrl,
    fullname,
    chooseUname,
    subType,
    proposal,
    summary,
    createdAt,
    viewers,
    corrects,
    wrongs,
    awards,
    deleted,
    accepted: previouslyAccepted,
  }: INodeVersion = versionData;

  let newBatch = batch;

  // If the version is deleted, the user should have not been able to vote on it.
  if (!deleted) {
    await detach(async () => {
      const reputationTypes: string[] = ["All Time", "Monthly", "Weekly", "Others", "Others Monthly", "Others Weekly"];
      const comReputationUpdates: IComReputationUpdates = {};
      let batch = db.batch();
      let writeCounts = 0;

      const tWriteOperations: { objRef: any; data: any; operationType: "set" | "update" | "delete" }[] = [];
      //  proposer and voters are the same user, automatic self-vote
      [batch, writeCounts] = await updateReputation({
        batch,
        uname: proposer,
        imageUrl,
        fullname,
        chooseUname,
        tagIds,
        tags,
        nodeType,
        correctVal: correct,
        wrongVal: wrong,
        instVal: award,
        ltermVal: 0,
        ltermDayVal: 0,
        voter,
        writeCounts,
        comReputationUpdates,
        t: null,
        tWriteOperations,
      });
      for (const tagId in comReputationUpdates) {
        for (const reputationType of reputationTypes) {
          if (!comReputationUpdates[tagId][reputationType]) continue;

          if (comReputationUpdates[tagId][reputationType].isNew) {
            batch.set(
              comReputationUpdates[tagId][reputationType].docRef,
              comReputationUpdates[tagId][reputationType].docData
            );
          } else {
            batch.update(
              comReputationUpdates[tagId][reputationType].docRef,
              comReputationUpdates[tagId][reputationType].docData
            );
          }
          [batch, writeCounts] = await checkRestartBatchWriteCounts(batch, writeCounts);
        }
      }
      await commitBatch(batch);
    });

    // Mark the userNode for the voter as isStudied = true and changed = false,
    // otherwise, they would not have voted on the version of the node.
    // let voterNodeData, proposerNodeData;
    // [voterNodeData, newBatch, writeCounts] = await createUserNodeOrMarkStudied(
    //   newBatch,
    //   voter,
    //   nodeId,
    //   currentTimestamp,
    //   writeCounts
    // );
    const versionCorrects = corrects + correct;
    const versionWrongs = wrongs + wrong;
    const versionRatings = versionCorrects - versionWrongs;
    //  corrects and wrongs are 0 since this was just created
    // The data of the original node that an improvement proposal is on it, or
    // the parent node where the pending proposal for the child node exists.

    versionData.accepted = isVersionApproved({
      corrects: versionCorrects,
      wrongs: versionWrongs,
      nodeData,
      isInstructor,
      instantApprove,
    });

    // If the version was accepted previously, accepted === true.
    // If the version is determined to be approved right now, versionData.accepted === true.

    if (versionData.accepted) {
      const { newMaxVersionRating, adminPoints, nodeAdmin, aImgUrl, aFullname, aChooseUname } =
        await getCumulativeProposerVersionRatingsOnNode({
          nodeId,
          nodeType: nodeData.nodeType,
          nodeDataAdmin: nodeData.admin,
          aImgUrl: nodeData.aImgUrl,
          aFullname: nodeData.aFullname,
          aChooseUname: nodeData.aChooseUname,
          updatingVersionId: versionId,
          updatingVersionData: versionData,
          updatingVersionRating: versionRatings,
          updatingVersionNotAccepted: !previouslyAccepted,
          t,
          tWriteOperations,
        });
      let nodeUpdates: any = {
        // Number of users who have marked the node as studied.
        // studied: nodeData.studied + (voterNodeData && !voterNodeData.isStudied ? 1 : 0),
        adminPoints,
        admin: nodeAdmin,
        aImgUrl,
        aFullname,
        aChooseUname,
        maxVersionRating: newMaxVersionRating,
        nodeType,
        updatedAt: currentTimestamp,
      };

      //  proposal was accepted previously, not accepted just now
      if (previouslyAccepted) {
        // When someone votes on an accepted proposal of a node, that person has definitely studied it.
        // So, if previously isStudied was false, we should increment the number of studied and later set isStudied to true for the user.
        if (
          // (voterNodeData && !voterNodeData.isStudied) ||
          nodeAdmin !== nodeData.admin ||
          newMaxVersionRating !== nodeData.maxVersionRating
        ) {
          if (t) {
            tWriteOperations.push({
              objRef: nodeRef,
              data: nodeUpdates,
              operationType: "update",
            });
          } else if (newBatch) {
            newBatch.update(nodeRef, nodeUpdates);
            [newBatch, writeCounts] = await checkRestartBatchWriteCounts(newBatch, writeCounts);
          }
        }
        await detach(async () => {
          let batch = db.batch();
          let writeCounts = 0;
          await retrieveAndSignalAllUserNodesChanges({
            batch,
            linkedId: nodeId,
            nodeChanges: nodeUpdates,
            major: false,
            currentTimestamp,
            writeCounts,
          });
          await commitBatch(batch);
        });
        //  the version we are dealing with is just accepted (nodeDataDoc is not null)
        //  this was a pending proposal that was just accepted
      } else {
        // const selfVote = proposer === voter;
        // if (!selfVote) {
        // Mark the userNode for the proposer as isStudied = true and changed = false,
        // otherwise, they would not have proposed the version of the node.
        // [proposerNodeData, newBatch, writeCounts] = await createUserNodeOrMarkStudied(
        //   newBatch,
        //   proposer,
        //   nodeId,
        //   currentTimestamp,
        //   writeCounts
        // );
        // }
        // //////////////////////////IMPORTANT/////////////////////////////////
        // For an improvement, the version and userVersion documents should be created and changed outside of this function.
        // For a child proposal, the version and userVersion documents should be updated inside this function.
        // ////////////////////////////////////////////////////////////////////
        //  if proposal is an improvement
        if (!childType) {
          nodeUpdates = {
            ...nodeUpdates, // admin related fields and maxVersionRating
            children,
            content,
            nodeImage,
            nodeVideo,
            nodeAudio,
            title,
            parents,
            referenceIds,
            references,
            referenceLabels,
            tagIds,
            tags,
            // studied: selfVote ? 1 : 2,
            studied: 0,
            subType,
            changedAt: currentTimestamp,
            versions: nodeData.versions + (newVersion ? 1 : 0),
            ...(nodeType === "Question" && { choices: versionData.choices }),
          };

          [newBatch, writeCounts] = await generateTagsData({
            batch: newBatch,
            nodeId,
            isTag: nodeData.isTag,
            nodeUpdates,
            nodeTagIds: nodeData.tagIds,
            nodeTags: nodeData.tags,
            versionTagIds: tagIds,
            versionTags: tags,
            proposer,
            imageUrl,
            fullname,
            chooseUname,
            currentTimestamp,
            writeCounts,
            t,
            tWriteOperations,
          });

          if (t) {
            tWriteOperations.push({
              objRef: nodeRef,
              data: nodeUpdates,
              operationType: "update",
            });
          } else if (newBatch) {
            newBatch.update(nodeRef, nodeUpdates);
            [newBatch, writeCounts] = await checkRestartBatchWriteCounts(newBatch, writeCounts);
          }
          if (nodeData.title !== title || nodeType !== nodeData.nodeType) {
            await detach(async () => {
              console.log("<=::::::=> CHANGE TITLE <=::::::=>");
              let batch = db.batch();
              let writeCounts = 0;
              [batch, writeCounts] = await changeNodeTitle({
                batch,
                nodeData,
                nodeId,
                newTitle: title,
                nodeType,
                currentTimestamp,
                writeCounts,
                t: null,
                tWriteOperations: [],
              });
              await commitBatch(batch);
              console.log("<=::::::=> DONE CHANGE TITLE <=::::::=>");
            });
          }

          // signal search about improvement or new node
          await indexNodeChange(nodeId, title, "UPDATE");

          // TODO: move these to queue
          await detach(async () => {
            let batch = db.batch();
            let writeCounts = 0;
            const updatedNodeIds: {
              nodeId: string;
              nodeChanges: Partial<INode>;
            }[] = [];

            for (const addedParent of addedParents) {
              await db.runTransaction(async t => {
                const linkedNode = await getNode({ nodeId: addedParent, t });
                const linkedNodeChanges = {
                  children: [...linkedNode.nodeData.children, { node: nodeId, title, label: "", type: nodeType }],
                  studied: 0,
                  changedAt: currentTimestamp,
                  updatedAt: currentTimestamp,
                };

                updatedNodeIds.push({
                  nodeId: addedParent,
                  nodeChanges: linkedNodeChanges,
                });

                t.update(linkedNode.nodeRef, linkedNodeChanges);
              });
            }
            for (const addedChild of addedChildren) {
              await db.runTransaction(async t => {
                const linkedNode = await getNode({ nodeId: addedChild, t });
                const linkedNodeChanges = {
                  parents: [...linkedNode.nodeData.parents, { node: nodeId, title, label: "", type: nodeType }],
                  studied: 0,
                  changedAt: currentTimestamp,
                  updatedAt: currentTimestamp,
                };

                updatedNodeIds.push({
                  nodeId: addedChild,
                  nodeChanges: linkedNodeChanges,
                });

                t.update(linkedNode.nodeRef, linkedNodeChanges);
              });
            }

            for (const removedParent of removedParents) {
              await db.runTransaction(async t => {
                const linkedNode = await getNode({ nodeId: removedParent, t });
                const linkedNodeChanges = {
                  children: linkedNode.nodeData.children.filter((l: any) => l.node !== nodeId),
                  studied: 0,
                  changedAt: currentTimestamp,
                  updatedAt: currentTimestamp,
                };

                updatedNodeIds.push({
                  nodeId: removedParent,
                  nodeChanges: linkedNodeChanges,
                });

                t.update(linkedNode.nodeRef, linkedNodeChanges);
              });
            }
            for (const removedChild of removedChildren) {
              await db.runTransaction(async t => {
                const linkedNode = await getNode({ nodeId: removedChild, t });
                const linkedNodeChanges = {
                  parents: linkedNode.nodeData.parents.filter((l: any) => l.node !== nodeId),
                  studied: 0,
                  changedAt: currentTimestamp,
                  updatedAt: currentTimestamp,
                };

                updatedNodeIds.push({
                  nodeId: removedChild,
                  nodeChanges: linkedNodeChanges,
                });

                t.update(linkedNode.nodeRef, linkedNodeChanges);
              });
            }

            for (const { nodeId, nodeChanges } of updatedNodeIds) {
              [batch, writeCounts] = await retrieveAndSignalAllUserNodesChanges({
                batch,
                linkedId: nodeId,
                nodeChanges: nodeChanges,
                major: true,
                currentTimestamp,
                writeCounts,
              });
            }
            await commitBatch(batch);
          });
          //  just accepted a proposal for a new child node (not an improvement)
        } else {
          let childNodeRef = db.collection("nodes").doc();
          if (versionId && !(await db.collection("nodes").doc(versionId).get()).exists) {
            childNodeRef = db.collection("nodes").doc(versionId);
          }
          let childNode: Partial<INode> = {
            children,
            content,
            nodeImage,
            nodeVideo,
            nodeAudio,
            deleted: false,
            parents: [{ node: nodeId, title: nodeData.title, label: "", type: nodeData.nodeType }],
            referenceIds,
            references,
            referenceLabels,
            tagIds,
            tags,
            title,
            updatedAt: currentTimestamp,
            ...(nodeType === "Question" && { choices: versionData.choices }),
          };

          const { versionsColl, userVersionsColl }: Partial<GetTypedCollectionsReturn> = getTypedCollections();
          const versionRef = versionsColl.doc();
          //  before setting childNode version, need to obtain the correct corresponding collection in the database
          const childVersion = {
            ...childNode,
            proposer,
            imageUrl,
            fullname,
            chooseUname,
            proposal,
            summary,
            newChild: true,
            accepted: true,
            corrects: versionCorrects,
            wrongs: versionWrongs,
            awards,
            viewers,
            node: childNodeRef.id,
            createdAt,
          };
          if (t) {
            tWriteOperations.push({
              objRef: versionRef,
              data: childVersion,
              operationType: "set",
            });
          } else if (newBatch) {
            newBatch.set(versionRef, childVersion);
            [newBatch, writeCounts] = await checkRestartBatchWriteCounts(newBatch, writeCounts);
          }

          newUpdates.versionId = versionRef.id;
          newUpdates.nodeId = childNodeRef.id;
          newUpdates.versionData = childVersion;

          // signal search about improvement or new node
          await indexNodeChange(newUpdates.nodeId, title, "NEW");

          // userNode for voter
          const newUserNodeObj: any = {
            correct: correct === 1,
            createdAt: currentTimestamp,
            updatedAt: currentTimestamp,
            deleted: false,
            isStudied: true,
            bookmarked: false,
            changed: false,
            node: childNodeRef.id,
            open: true,
            user: voter,
            visible: true,
            wrong: wrong === 1,
          };

          if (notebookId) {
            newUserNodeObj.notebooks = [notebookId];
            newUserNodeObj.expands = [true];
          }

          const userNodeRef = db.collection("userNodes").doc();
          if (t) {
            tWriteOperations.push({
              objRef: userNodeRef,
              data: newUserNodeObj,
              operationType: "set",
            });
          } else if (newBatch) {
            newBatch.set(userNodeRef, { ...newUserNodeObj });
            [batch, writeCounts] = await checkRestartBatchWriteCounts(newBatch, writeCounts);
          }
          const userNodeLogRef = db.collection("userNodesLog").doc();
          delete newUserNodeObj.updatedAt;
          if (t) {
            tWriteOperations.push({
              objRef: userNodeLogRef,
              data: newUserNodeObj,
              operationType: "set",
            });
          } else if (newBatch) {
            newBatch.set(userNodeLogRef, newUserNodeObj);
            [batch, writeCounts] = await checkRestartBatchWriteCounts(newBatch, writeCounts);
          }

          //  Delete the old version on the parent.
          const { versionsCommentsColl }: any = getTypedCollections();

          let versionsCommentsRef = versionsCommentsColl
            .where("version", "==", versionId)
            .where("deleted", "==", false);
          const versionsCommentsDocs = await convertToTGet(versionsCommentsRef, t);
          for (let versionCommentDoc of versionsCommentsDocs.docs) {
            const versionCommentId = versionCommentDoc.Id;
            const versionCommentData = versionCommentDoc.data();
            versionsCommentsRef = versionsCommentsColl.doc(versionCommentId);
            // In this case, we don't need to create a new version.
            // We can just change the version id from the old version to the new version on the child node.
            const versionCommentUpdate = {
              ...versionCommentData,
              version: versionRef.id,
              updatedAt: currentTimestamp,
            };
            if (t) {
              tWriteOperations.push({
                objRef: versionsCommentsRef,
                data: versionCommentUpdate,
                operationType: "set",
              });
            } else if (newBatch) {
              newBatch.set(versionsCommentsRef, versionCommentUpdate);
              [newBatch, writeCounts] = await checkRestartBatchWriteCounts(newBatch, writeCounts);
            }
          }

          [batch, writeCounts] = await generateTagsData({
            batch,
            nodeId: childNodeRef.id,
            isTag: false,
            nodeUpdates: childNode,
            nodeTagIds: [],
            nodeTags: [],
            versionTagIds: tagIds,
            versionTags: tags,
            proposer,
            aImgUrl: imageUrl,
            aFullname: fullname,
            aChooseUname: chooseUname,
            currentTimestamp,
            writeCounts,
            t,
            tWriteOperations,
          });

          childNode = {
            ...childNode,
            nodeType: childType,
            corrects: correct === 1 ? 1 : 0,
            wrongs: wrong === 1 ? 1 : 0,
            versions: 1,
            viewers: 1,
            // For the proposer and the voter, it should be marked as studied.
            studied: 2,
            // adminPoints: versionRatings, TODO:check this field
            admin: proposer,
            aImgUrl: imageUrl,
            aFullname: fullname,
            aChooseUname: chooseUname,
            maxVersionRating: versionRatings > 1 ? versionRatings : 1,
            // comments: versionsCommentsDocs.docs.length,
            createdAt: currentTimestamp,
            changedAt: currentTimestamp,
            updatedAt: currentTimestamp,
          };

          if (t) {
            tWriteOperations.push({
              objRef: childNodeRef,
              data: childNode,
              operationType: "set",
            });
          } else if (newBatch) {
            newBatch.set(childNodeRef, childNode);
            [newBatch, writeCounts] = await checkRestartBatchWriteCounts(newBatch, writeCounts);
          }

          nodeUpdates = {
            ...nodeUpdates, // admin related props
            changedAt: currentTimestamp,
            children: [...nodeData.children, { node: childNodeRef.id, title: title, label: "", type: childType }],
            // For the proposer and the voter, it's marked as studied.
            // studied: 2,
            studied: 0,
          };

          // it will only update admin
          if (t) {
            tWriteOperations.push({
              objRef: nodeRef,
              data: nodeUpdates,
              operationType: "update",
            });
          } else if (newBatch) {
            newBatch.update(nodeRef, nodeUpdates);
            [newBatch, writeCounts] = await checkRestartBatchWriteCounts(newBatch, writeCounts);
          }

          // Mark the userNode for the proposer and voter as isStudied = true and changed = false,
          // otherwise, they would not have proposed the version or voted on the version of the node.
          // [proposerNodeData, newBatch, writeCounts] = await createUserNodeOrMarkStudied(
          //   newBatch,
          //   proposer,
          //   childNodeRef.id,
          //   currentTimestamp,
          //   writeCounts
          // );
          // [voterNodeData, newBatch, writeCounts] = await createUserNodeOrMarkStudied(
          //   newBatch,
          //   voter,
          //   childNodeRef.id,
          //   currentTimestamp,
          //   writeCounts
          // );

          //  add this question to the practice tool for every user with the same default tag
          if (childType === "Question") {
            await detach(async () => {
              let batch = db.batch();
              let writeCounts = 0;
              [batch, writeCounts] = await createPractice({
                batch,
                unames: [],
                tagIds,
                nodeId: childNodeRef.id,
                parentId: childNode.parents?.[0]?.node || "",
                currentTimestamp,
                writeCounts,
              });
              await commitBatch(batch);
            });
          }
        }

        // TODO: move these to queue
        await detach(async () => {
          let batch = db.batch();
          let writeCounts = 0;
          // In both cases of accepting an improvement proposal and a child proposal,
          // we need to signal all the users that it's changed.
          await retrieveAndSignalAllUserNodesChanges({
            batch,
            linkedId: nodeId,
            nodeChanges: nodeUpdates,
            major: true,
            currentTimestamp,
            writeCounts,
          });
          await commitBatch(batch);
        });
      }
    }
  }
  if (newBatch) {
    return [newBatch, writeCounts];
  } else {
    newBatch = db.batch();
    return [newBatch, writeCounts];
  }
};
