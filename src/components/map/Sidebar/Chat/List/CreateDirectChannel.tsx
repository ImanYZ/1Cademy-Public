import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from "@mui/material";
import { Box } from "@mui/system";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { addDoc, collection, Firestore } from "firebase/firestore";
import { useState } from "react";

import { useCreateActionTrack } from "@/lib/utils/Map.utils";

import UserSuggestion from "../Common/UserSuggestion";

dayjs.extend(relativeTime);
type DirectMessageProps = {
  db: Firestore;
  user: any;
  onlineUsers: any;
  open: any;
  setOpen: any;
};

export const CreateDirectChannel = ({ db, user, onlineUsers, open, setOpen }: DirectMessageProps) => {
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
  const [userError, setUserError] = useState<boolean>(false);

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

  const createNewChannel = async () => {
    if (!title) {
      setTitleError(true);
      return;
    } else if (titleError) {
      setTitleError(false);
    }

    if (Object.keys(members).length < 2) {
      setUserError(true);
      return;
    } else if (userError) {
      setUserError(false);
    }
    const memberUnames = [];
    for (const member in members) {
      memberUnames.push(member);
    }

    const channelRef = collection(db, "conversations");
    await addDoc(channelRef, {
      title: title,
      members: memberUnames,
      membersInfo: members,
      deleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    setTitle("");
    setMembers({});
    createActionTrack({ action: "MessageMemberAdded" });
    handleClose();
  };

  const handleDeleteChip = (member: string) => {
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
            helperText={titleError ? "Title is required" : null}
          />
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingY: "10px" }}>
            <UserSuggestion
              db={db}
              onlineUsers={onlineUsers}
              action={handleMembers}
              autoFocus={true}
              chips={Object.keys(members)
                .filter((member: any) => member !== user.uname)
                .map((member: any) => {
                  return { id: member, fullName: members[member].fullname };
                })}
              handleDeleteChip={handleDeleteChip}
              error={userError}
              helperText={"User is required"}
            />
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
