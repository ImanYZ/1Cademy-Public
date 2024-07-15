import { Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from "@mui/material";
import { Box } from "@mui/system";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { addDoc, collection, Firestore } from "firebase/firestore";
import { useState } from "react";

import { Post } from "@/lib/mapApi";
import { useCreateActionTrack } from "@/lib/utils/Map.utils";

import UserSuggestion from "../Common/UserSuggestion";

dayjs.extend(relativeTime);
type DirectMessageProps = {
  db: Firestore;
  user: any;
  onlineUsers: any;
  open: any;
  setOpen: any;
  roomType: string;
};

export const CreateDirectChannel = ({ db, user, onlineUsers, open, setOpen, roomType }: DirectMessageProps) => {
  const createActionTrack = useCreateActionTrack();
  const [title, setTitle] = useState<string>("");
  const [members, setMembers] = useState<any>({
    [user.uname]: {
      uname: user.uname,
      imageUrl: user.imageUrl,
      chooseUname: !!user.chooseUname,
      fullname: `${user.fName} ${user.lName}`,
      role: "",
      uid: user.userId,
    },
  });
  const [titleError, setTitleError] = useState<boolean>(false);

  const handleClose = () => {
    setOpen(false);
  };

  const handleMembers = (member: any) => {
    const membersInfo = {
      ...members,
      [member.uname]: {
        uname: member.uname,
        imageUrl: member.imageUrl,
        chooseUname: !!member.chooseUname,
        fullname: `${member.fName} ${member.lName}`,
        role: "",
        uid: member.userId,
      },
    };
    setMembers(membersInfo);
  };

  const createNewChannel = async (member: any) => {
    if (!title) {
      setTitleError(true);
      return;
    }
    const memberUnames = [];
    for (const member in members) {
      memberUnames.push(member);
    }

    const channelRef = collection(db, "conversations");
    const newDoc = await addDoc(channelRef, {
      title: title,
      members: memberUnames,
      membersInfo: members,
      createdAt: new Date(),
    });
    setTitleError(false);
    const docRef = collection(db, "notifications");
    await addDoc(docRef, {
      sender: user.uname,
      channelId: newDoc.id,
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
    createActionTrack({ action: "MessageMemberAdded" });
    handleClose();
  };

  const removeMember = (member: string) => {
    const prevMembers = { ...members };
    delete prevMembers[member];
    setMembers(prevMembers);
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Create channel</DialogTitle>
      <DialogContent sx={{ height: "100%", width: "600px", overflow: "visible" }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <TextField
            placeholder="Title"
            value={title}
            onChange={e => setTitle(e.target.value)}
            fullWidth
            error={titleError}
          />
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingY: "10px" }}>
            <UserSuggestion db={db} onlineUsers={onlineUsers} action={handleMembers} autoFocus={true} />
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: "5px" }}>
            {Object.keys(members).map((member: any, idx: number) => {
              return (
                <Chip
                  key={idx}
                  label={members[member].fullname}
                  variant="outlined"
                  onDelete={() => removeMember(member)}
                />
              );
            })}
          </Box>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={createNewChannel} color="primary">
          Create
        </Button>
        <Button onClick={handleClose} color="primary">
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};
