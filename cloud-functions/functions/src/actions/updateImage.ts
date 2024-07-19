import { db } from "../admin";

export const updateImage = async ({ userData }: any) => {
  const { uname, fName, lName, imageUrl } = userData;
  const fullname = `${fName} ${lName}`;

  try {
    await db.runTransaction(async transaction => {
      // Update channels
      const channelsQuery = await transaction.get(db.collection("channels").where("members", "array-contains", uname));
      const conversationsQuery = await transaction.get(
        db.collection("conversations").where("members", "array-contains", uname)
      );

      channelsQuery.forEach(channelDoc => {
        const channelData = channelDoc.data();
        if (channelData.members.includes(uname)) {
          const membersInfo = channelData.membersInfo || {};
          membersInfo[uname] = {
            ...membersInfo[uname],
            fullname,
            imageUrl,
          };
          transaction.update(channelDoc.ref, { membersInfo });
          console.log("user", uname, "updated in channels");
        }
      });

      // Update conversations

      console.log(conversationsQuery.docs.length, "conversations.DOCS");

      conversationsQuery.forEach(conversationDoc => {
        const conversationData = conversationDoc.data();
        if (conversationData.members.includes(uname)) {
          const membersInfo = conversationData.membersInfo || {};
          membersInfo[uname] = {
            ...membersInfo[uname],
            fullname,
            imageUrl,
          };
          transaction.update(conversationDoc.ref, { membersInfo });
          console.log("user", uname, "updated in conversations");
        }
      });
    });
  } catch (error) {
    console.log(error);
  }
};
