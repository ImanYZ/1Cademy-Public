import { IUserNode } from "src/types/IUserNode";
import { db } from "../lib/firestoreServer/admin";
import { convertToTGet } from "./";
import { DocumentData } from "firebase-admin/firestore";

export const getAllUserNodes = async ({ nodeId, t, onlyVisible }: any) => {
  let userNodesQuery = db.collection("userNodes").where("node", "==", nodeId);
  //removed this because we need to update the usernodes if the node if it's visible in a notebook or not
  // if (onlyVisible) {
  //   // TODO: update only user nodes which has the notebooks
  //   // userNodesQuery = userNodesQuery.where("visible", "==", true);
  //   // []
  //   // userNodesQuery = userNodesQuery.where("visible", "==", true);
  // }
  const userNodesDocs = await convertToTGet(userNodesQuery, t);
  const userNodesData: any[] = [];
  const userNodesRefs: any[] = [];

  for (let doc of userNodesDocs.docs) {
    const userNodeData = doc.data() as IUserNode;
    if (onlyVisible) {
      if ((!userNodeData.notebooks || !userNodeData.notebooks.length) && !userNodeData.visible) {
        continue;
      }
    }
    userNodesData.push({ ...doc.data(), id: doc.id });
    userNodesRefs.push(db.collection("userNodes").doc(doc.id));
  }
  userNodesData.forEach(c => console.log("get userNode:", c.id));
  return { userNodesData, userNodesRefs };
};
