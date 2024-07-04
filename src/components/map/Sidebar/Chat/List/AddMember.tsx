import { Box } from "@mui/system";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { addDoc, collection, Firestore, updateDoc } from "firebase/firestore";
import { IUser } from "src/types/IUser";

import { Post } from "@/lib/mapApi";
import { generateChannelName } from "@/lib/utils/chat";
import { createActionTrack } from "@/lib/utils/Map.utils";

import UserSuggestion from "../Common/UserSuggestion";

dayjs.extend(relativeTime);
type DirectMessageProps = {
  db: Firestore;
  user: IUser;
  onlineUsers: any;
  selectedChannel: any;
  getChannelRef: any;
  roomType: string;
};
export const AddMember = ({ db, user, onlineUsers, selectedChannel, getChannelRef, roomType }: DirectMessageProps) => {
  const addNewMember = async (member: any) => {
    if (selectedChannel.members?.includes(member?.uname)) return;

    const membersInfo = {
      ...selectedChannel.membersInfo,
      [member.uname]: {
        uname: member.uname,
        imageUrl: member.imageUrl,
        chooseUname: !!member.chooseUname,
        fullname: `${member.fName} ${member.lName}`,
        role: "",
        uid: member.userId,
      },
    };
    const members = [...selectedChannel.members, member?.uname];
    const channelRef = getChannelRef(selectedChannel?.id);
    updateDoc(channelRef, {
      title: generateChannelName(membersInfo, user),
      members,
      membersInfo,
    });
    const docRef = collection(db, "notifications");
    await addDoc(docRef, {
      sender: user.uname,
      channelId: selectedChannel.id,
      seen: false,
      notify: member?.uname,
      roomType,
      notificationType: "chat",
      createdAt: new Date(),
    });
    await Post("/sendFCMNotification", {
      title: `Added in group chat by ${user.fName} ${user.lName}`,
      body: "",
      receiverUID: member.userId,
    });
    createActionTrack(
      db,
      "MessageMemberAdded",
      "",
      {
        fullname: `${user?.fName} ${user?.lName}`,
        chooseUname: !!user?.chooseUname,
        uname: String(user?.uname),
        imageUrl: String(user?.imageUrl),
      },
      "",
      [],
      user.email
    );
  };
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "4px" }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingY: "10px" }}>
        <UserSuggestion db={db} onlineUsers={onlineUsers} action={addNewMember} />
      </Box>
    </Box>
  );
};
