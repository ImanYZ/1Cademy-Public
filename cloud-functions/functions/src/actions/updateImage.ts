import { db } from "../admin";

type IaddUserToChannel = {
  userData: any;
};

export const updateImage = async ({ userData }: IaddUserToChannel) => {
  try {
    const channels = await db.collection("channels").get();
    for (const channelDoc of channels.docs) {
      const channelData: any = channelDoc.data();
      if (!channelData.members.includes(userData.uname)) continue;
      const membersInfo = channelData.membersInfo;
      if (channelData.members.includes(userData.uname)) {
        membersInfo[userData.uname] = {
          uname: userData.uname,
          imageUrl: userData.imageUrl,
          chooseUname: !!userData.chooseUname,
          fullname: `${userData.fName} ${userData.lName}`,
          role: "",
          joined: new Date(),
        };
        await channelDoc.ref.update({
          membersInfo,
        });
        console.log("user", userData.uname, "updated");
      }
    }
    const conversations = await db.collection("conversations").get();
    for (const conversationDoc of conversations.docs) {
      const conversationData: any = conversationDoc.data();
      if (!conversationData.members.includes(userData.uname)) continue;
      const membersInfo = conversationData.membersInfo;
      if (conversationData.members.includes(userData.uname)) {
        membersInfo[userData.uname] = {
          uname: userData.uname,
          imageUrl: userData.imageUrl,
          chooseUname: !!userData.chooseUname,
          fullname: `${userData.fName} ${userData.lName}`,
          role: "",
          joined: new Date(),
        };
        await conversationDoc.ref.update({
          membersInfo,
        });
        console.log("user", userData.uname, "updated");
      }
    }
  } catch (error) {
    console.log(error);
  }
};
