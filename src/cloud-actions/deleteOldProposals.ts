import { batchUpdate, commitBatch, db } from "./utils/admin";

export const deleteOldProposals = async () => {
  try {
    let currentDate = new Date();

    // Calculate the date 4 months ago
    let fourMonthsAgo = new Date();
    fourMonthsAgo.setMonth(currentDate.getMonth() - 4);

    const versionsDocs = await db
      .collection("versions")
      .where("deleted", "==", false)
      .where("accepted", "==", false)
      .get();

    for (let versionDoc of versionsDocs.docs) {
      const versionData = versionDoc.data();

      if (versionData.createdAt.toDate() < fourMonthsAgo) {
        batchUpdate(versionDoc.ref, {
          deleted: true,
          deletedByBot: true,
        });
      }
    }
    await commitBatch();
  } catch (error) {
    console.log("deleteOldProposals", error);
  }
};
