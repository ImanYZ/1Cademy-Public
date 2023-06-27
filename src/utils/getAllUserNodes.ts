import { IUserNode } from "src/types/IUserNode";
import { db } from "../lib/firestoreServer/admin";
import { convertToTGet } from "./";
import { DocumentData } from "firebase-admin/firestore";

export const getAllUserNodes = async ({ nodeId, t, onlyVisible }: any) => {
  let userNodesQuery = db.collection("userNodes").where("node", "==", nodeId);
  // if (onlyVisible) {
  //   // TODO: update only user nodes which has the notebooks
  //   // userNodesQuery = userNodesQuery.where("visible", "==", true);
  //   // []
  //   // userNodesQuery = userNodesQuery.where("visible", "==", true);
  // }
  const userNodesDocs = await convertToTGet(userNodesQuery, t);
  const userNodesData: any[] = [];
  const userNodesRefs: any[] = [];
  userNodesDocs.forEach((doc: DocumentData) => {
    const userNodeData = doc.data() as IUserNode;

    if (userNodeData.notebooks && userNodeData.notebooks.length > 0) {
      userNodesData.push({ ...doc.data(), id: doc.id });
      userNodesRefs.push(db.collection("userNodes").doc(doc.id));
    }
  });

  userNodesData.forEach(c => console.log("get userNode:", c.id));
  return { userNodesData, userNodesRefs };
};
