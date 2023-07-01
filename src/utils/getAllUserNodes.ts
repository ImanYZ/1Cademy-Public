import { IUserNode } from "src/types/IUserNode";
import { db } from "../lib/firestoreServer/admin";
import { convertToTGet } from "./";
import { DocumentData } from "firebase-admin/firestore";

export const getAllUserNodes = async ({ nodeId, t, onlyVisible }: any) => {
  let userNodesQuery = db.collection("userNodes").where("node", "==", nodeId);
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
  return { userNodesData, userNodesRefs };
};
