import { Firestore } from "firebase-admin/firestore";
import { roundNum } from "src/utils/common.utils";
import { USER_VERSIONS, USER_VERSIONS_COMMENTS, VERSIONS, VERSIONS_COMMENTS } from "src/utils/getTypedCollections";

import { batchSet, batchUpdate, commitBatch, db } from "./utils/admin";

// On 1Cademy.com nodes do not have their list of contributors and institutions
// assigned to them. We should run this function every 25 hours in a PubSub to
// assign these arrays.

export const assignNodeContributorsInstitutionsStats = async () => {
  // First get the list of all users and create an Object to map their ids to their
  // institution names.
  try {
    const userInstitutions: { [key: string]: any } = {};
    const userFullnames: { [key: string]: string } = {};
    let institutionsSet = new Set();
    const stats = {
      users: 0,
      institutions: 0,
      nodes: 0,
      links: 0,
      proposals: 0,
      createdAt: new Date(),
    };
    const userDocs = await db.collection("users").get();
    for (let userDoc of userDocs.docs) {
      const userData = userDoc.data();
      userInstitutions[userDoc.id] = userData.deInstit;
      userFullnames[userDoc.id] = userData.fName + " " + userData.lName;
      stats.users += 1;
      institutionsSet.add(userData.deInstit); // aba
    }
    stats.institutions = institutionsSet.size;

    const contributors: { [key: string]: any } = {};
    let institutions: { [key: string]: any } = {};
    const tags: { [key: string]: string[] } = {};
    const references: { [key: string]: string[] } = {};
    // Retrieving all the nodes data and saving them in nodesData, so that we don't
    // need to retrieve them one by one, over and over again.
    const nodesData: { [key: string]: any } = {};
    const nodeDocsInitial = await db.collection("nodes").orderBy("createdAt").limit(1).get();
    let lastVisibleNodeDoc = nodeDocsInitial.docs[nodeDocsInitial.docs.length - 1];
    while (lastVisibleNodeDoc) {
      const nodeDocs = await db
        .collection("nodes")
        .orderBy("createdAt")
        .startAfter(lastVisibleNodeDoc)
        .limit(10000)
        .get();

      for (let nodeDoc of nodeDocs.docs) {
        const nodeData = nodeDoc.data();
        nodesData[nodeDoc.id] = nodeData;
        stats.nodes += 1;
        stats.links +=
          (nodeData.parents.length + nodeData.children.length) / 2 + nodeData.tags.length + nodeData.references.length;
        for (let tag of nodeData.tags) {
          if (tag.node in tags) {
            tags[tag.node].push(nodeDoc.id);
          } else {
            tags[tag.node] = [];
          }
        }
        for (let reference of nodeData.references) {
          if (reference.node in references) {
            references[reference.node].push(nodeDoc.id);
          } else {
            references[reference.node] = [];
          }
        }
      }
      lastVisibleNodeDoc = nodeDocs.docs[nodeDocs.docs.length - 1];
    }

    // We should retrieve all the accepted versions for all types of nodes.
    const nodeTypes = ["Concept", "Code", "Relation", "Question", "Reference", "Idea"];
    // We cannot update the reputations on nodes only looking at the
    // versions (proposals) that are not considerred yet, because the
    // pervious versions may get new votes. So, we accumulate all the
    // votes on all accepted proposals every time we run this function.
    // So, we need to create a nodes object to keep track of all the
    // updates and finally batch write all of them into nodes collection.
    const nodesUpdates: { [key: string]: any } = {};
    const { versionsColl } = getTypedCollections(db);
    const versionDocs = await versionsColl.where("nodeType", "in", nodeTypes).get();
    for (let versionDoc of versionDocs.docs) {
      const versionData = versionDoc.data();
      stats.proposals += 1;
      // Only if the version is accepted and it has never been deleted, i.e.,
      // deleted attribute does not exist or it's false:
      if (!versionData.deleted && versionData.accepted) {
        // We should add the proposer's id and institution
        // to the contributors and institutions arrays in the corresponding node.
        const nodeRef = db.collection("nodes").doc(versionData.node);
        if (versionData.node in nodesData) {
          // Only if the node does not exist in nodesUpdates, we need to create it,
          // and add the nodeRef to be able to update the node at the end.
          if (!(versionData.node in nodesUpdates)) {
            nodesUpdates[versionData.node] = {
              nodeRef,
            };
          }
          // In institutions and contributors, each key represents an
          // institution or contributor and the corresponding value is
          // the reputation of the institution or contributor on the node.
          // For the contributors, it also includes the fullname.
          // A user may have multiple accepted proposals on a node. However,
          // We have to update the node multiple times for such a user because
          // we should update their reputation points on the node.
          if (!("contributors" in nodesUpdates[versionData.node])) {
            nodesUpdates[versionData.node].contributors = {};
          }
          if (!("institutions" in nodesUpdates[versionData.node])) {
            nodesUpdates[versionData.node].institutions = {};
          }
          // We also need to add the names of contributors and institutions in
          // separate fields to be able to directly query them.
          if (!("contribNames" in nodesUpdates[versionData.node])) {
            nodesUpdates[versionData.node].contribNames = [];
          }
          if (!("institNames" in nodesUpdates[versionData.node])) {
            nodesUpdates[versionData.node].institNames = [];
          }
          if (
            !(versionData.proposer in nodesUpdates[versionData.node].contributors) &&
            versionData.proposer in userFullnames &&
            "imageUrl" in versionData
          ) {
            nodesUpdates[versionData.node].contribNames.push(versionData.proposer);
            nodesUpdates[versionData.node].contributors[versionData.proposer] = {
              fullname: userFullnames[versionData.proposer],
              imageUrl: versionData.imageUrl,
              chooseUname: versionData.chooseUname ? versionData.chooseUname : false,
              reputation: 0,
            };
            if (
              versionData.proposer in userInstitutions &&
              !(userInstitutions[versionData.proposer] in nodesUpdates[versionData.node].institutions)
            ) {
              nodesUpdates[versionData.node].institNames.push(userInstitutions[versionData.proposer]);
              nodesUpdates[versionData.node].institutions[userInstitutions[versionData.proposer]] = {
                reputation: 0,
              };
            }
          }
          if (versionData.proposer in nodesUpdates[versionData.node].contributors) {
            nodesUpdates[versionData.node].contributors[versionData.proposer].reputation +=
              versionData.corrects - versionData.wrongs;
          }
          if (
            versionData.proposer in userInstitutions &&
            userInstitutions[versionData.proposer] in nodesUpdates[versionData.node].institutions
          ) {
            nodesUpdates[versionData.node].institutions[userInstitutions[versionData.proposer]].reputation +=
              versionData.corrects - versionData.wrongs;
          }
          if (versionData.proposer in contributors) {
            contributors[versionData.proposer].reputation += versionData.corrects - versionData.wrongs;
          } else {
            if (userInstitutions[versionData.proposer]) {
              contributors[versionData.proposer] = {
                docRef: db.collection("users").doc(versionData.proposer),
                reputation: versionData.corrects - versionData.wrongs,
              };
            }
          }
          if (userInstitutions[versionData.proposer] in institutions) {
            institutions[userInstitutions[versionData.proposer]].reputation +=
              versionData.corrects - versionData.wrongs;
          } else {
            if (userInstitutions[versionData.proposer] === undefined) {
              continue;
            }
            const institutionDocs = await db
              .collection("institutions")
              .where("name", "==", userInstitutions[versionData.proposer])
              .get();
            if (institutionDocs.docs.length > 0) {
              institutions[userInstitutions[versionData.proposer]] = {
                docRef: db.collection("institutions").doc(institutionDocs.docs[0].id),
                reputation: versionData.corrects - versionData.wrongs,
              };
            }
          }
        }
      }
    }
    for (let nodeId in nodesUpdates) {
      await batchUpdate(nodesUpdates[nodeId].nodeRef, {
        contributors: nodesUpdates[nodeId].contributors,
        institutions: nodesUpdates[nodeId].institutions,
        contribNames: nodesUpdates[nodeId].contribNames,
        institNames: nodesUpdates[nodeId].institNames,
      });
    }
    for (let contributorId in contributors) {
      await batchUpdate(contributors[contributorId].docRef, {
        totalPoints: roundNum(contributors[contributorId].reputation),
      });
    }
    for (let institutionName in institutions) {
      await batchUpdate(institutions[institutionName].docRef, {
        totalPoints: roundNum(institutions[institutionName].reputation),
      });
    }

    stats.links = Math.round(stats.links);
    const statRef = db.collection("stats").doc();
    await batchSet(statRef, stats);
    await commitBatch();
  } catch (err) {
    console.log("error ocurred ", err);
  }
};

export const getTypedCollections = (db: Firestore) => {
  let versionsColl = db.collection(VERSIONS);
  let userVersionsColl = db.collection(USER_VERSIONS);
  let versionsCommentsColl = db.collection(VERSIONS_COMMENTS);
  let userVersionsCommentsColl = db.collection(USER_VERSIONS_COMMENTS);

  return {
    versionsColl,
    userVersionsColl,
    versionsCommentsColl,
    userVersionsCommentsColl,
  };
};
