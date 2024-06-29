import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import { Box } from "@mui/system";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Firestore, updateDoc } from "firebase/firestore";
import { IUser } from "src/types/IUser";

import { generateChannelName } from "@/lib/utils/chat";
import { useCreateActionTrack } from "@/lib/utils/Map.utils";

import UserSuggestion from "../Common/UserSuggestion";

dayjs.extend(relativeTime);
type DirectMessageProps = {
  db: Firestore;
  user: IUser;
  onlineUsers: any;
  selectedChannel: any;
  getChannelRef: any;
  open: any;
  setOpen: any;
};

export const AddMember = ({
  db,
  user,
  onlineUsers,
  selectedChannel,
  getChannelRef,
  open,
  setOpen,
}: DirectMessageProps) => {
  const createActionTrack = useCreateActionTrack();

  const handleClose = () => {
    setOpen(false);
  };

  const addNewMember = (member: any) => {
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
    createActionTrack({ action: "MessageMemberAdded" });
    handleClose();
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Add people to this conversation</DialogTitle>
      <DialogContent sx={{ height: "100px", width: "600px", overflow: "visible" }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingY: "10px" }}>
            <UserSuggestion db={db} onlineUsers={onlineUsers} action={addNewMember} autoFocus={true} />
          </Box>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} color="primary">
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};
