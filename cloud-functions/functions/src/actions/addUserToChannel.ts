import { db } from "../admin";

type IaddUserToChannel = {
  userData: any;
};

export const addUserToChannel = async ({ userData }: IaddUserToChannel) => {
  try {
    const channelDoc = await db.collection("channels").doc(userData.tagId).get();
    if (channelDoc.exists) {
      const channelData: any = channelDoc.data();
      const membersInfo = channelData.membersInfo;
      if (!channelData.members.includes(userData.uname)) {
        membersInfo[userData.uname] = {
          uname: userData.uname,
          imageUrl: userData.imageUrl,
          chooseUname: !!userData.chooseUname,
          fullname: `${userData.fName} ${userData.lName}`,
          role: "",
          joined: new Date(),
        };
        channelData.members.push(userData.uname);
        await channelDoc.ref.update({
          membersInfo,
          members: channelData.members,
        });
        console.log("user", userData.uname, "added to", userData.tagId);
      }
    }
  } catch (error) {
    console.log(error);
  }
};
