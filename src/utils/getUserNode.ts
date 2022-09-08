import { db } from "../lib/firestoreServer/admin";

export const getUserNode = async ({ nodeId, uname }: any) => {
  const userNodeQuery = db.collection("userNodes").where("node", "==", nodeId).where("user", "==", uname).limit(1);
  const userNodeDoc = await userNodeQuery.get();
  let userNodeData = null;
  let userNodeRef = null;
  if (userNodeDoc.docs.length > 0) {
    userNodeData = {
      ...userNodeDoc.docs[0].data(),
      id: userNodeDoc.docs[0].id,
    };
    userNodeRef = db.collection("userNodes").doc(userNodeDoc.docs[0].id);
  } else {
    userNodeRef = db.collection("userNodes").doc();
  }
  return { userNodeData, userNodeRef };
};
