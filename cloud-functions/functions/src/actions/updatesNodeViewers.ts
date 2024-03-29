import { db } from "../admin";
type IUpdatesNodeViewers = {
  nodeId: string;
  viewers: number;
  bookmarkedNum?: number;
  isStudiedNum?: number;
};
export const updatesNodeViewers = async ({
  nodeId,
  viewers,
  isStudiedNum = 0,
  bookmarkedNum = 0,
}: IUpdatesNodeViewers) => {
  await db.runTransaction(async t => {
    const nodeDoc = await t.get(db.collection("nodes").doc(nodeId));
    if (nodeDoc.exists) {
      const nodeData = nodeDoc.data();
      console.log(viewers);
      const newViewers = Math.max(0, (nodeData?.viewers || 0) + viewers);
      const studied = Math.max((nodeData?.studied || 0) + isStudiedNum);
      const bookmarks = Math.max((nodeData?.bookmarks || 0) + bookmarkedNum);
      t.update(nodeDoc.ref, { viewers: newViewers, studied, bookmarks, updatedAt: new Date() });
    }
  });
};
