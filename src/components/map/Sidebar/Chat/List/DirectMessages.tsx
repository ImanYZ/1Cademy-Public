import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import { IconButton, Paper, TextField, Typography } from "@mui/material";
import { Box } from "@mui/system";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { doc, Firestore, updateDoc } from "firebase/firestore";
import Fuse from "fuse.js";
import { useCallback, useEffect, useState } from "react";
import { IConversation } from "src/chatTypes";

import { CustomBadge } from "@/components/map/CustomBudge";
import OptimizedAvatar2 from "@/components/OptimizedAvatar2";
import { useAuth } from "@/context/AuthContext";
import { generateChannelName } from "@/lib/utils/chat";

import { getMessageSummary } from "../../helpers/common";
import GroupAvatar from "../Common/GroupAvatar";
import { CreateDirectChannel } from "./CreateDirectChannel";

dayjs.extend(relativeTime);
type DirectMessageProps = {
  openRoom: any;
  conversations: IConversation[];
  db: Firestore;
  onlineUsers: any;
  openDMChannel: any;
  notifications: any;
};
export const DirectMessagesList = ({
  openRoom,
  conversations,
  db,
  onlineUsers,
  // openDMChannel,
  notifications,
}: DirectMessageProps) => {
  const [{ user }] = useAuth();
  const [notificationHash, setNotificationHash] = useState<any>({});
  const [newChannel, setNewChannel] = useState(false);
  const [searchedConversations, setSearchedConversations] = useState<IConversation[]>(conversations);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const fuse = new Fuse(conversations, {
    keys: ["title"],
    threshold: 0.3,
    isCaseSensitive: false,
    shouldSort: true,
    findAllMatches: true,
    useExtendedSearch: true,
  });

  useEffect(() => {
    setNotificationHash(
      notifications.reduce((acu: { [channelId: string]: any }, cur: any) => {
        if (!acu.hasOwnProperty(cur.channelId)) {
          acu[cur.channelId] = [];
        }
        acu[cur.channelId].push(cur);
        return acu;
      }, {})
    );
  }, [notifications]);

  const handleDeleteChannel = useCallback(
    async (event: React.MouseEvent<HTMLButtonElement>, conversation: IConversation) => {
      event.stopPropagation();
      const channelRef = doc(db, "conversations", conversation.id);
      await updateDoc(channelRef, {
        deleted: true,
      });
    },
    []
  );

  const OverlappingAvatars = ({ members }: any) => {
    if (!user?.uname) return <></>;
    const otherUser = Object.keys(members).filter((u: string) => u !== user?.uname)[0];
    const userInfo = members[otherUser] || members[user?.uname];
    return (
      <Box
        sx={{
          width: `40px`,
          height: `40px`,
          cursor: "pointer",
          transition: "all 0.2s 0s ease",
          background: "linear-gradient(143.7deg, #FDC830 15.15%, #F37335 83.11%);",
          borderRadius: "50%",
          "& > .user-image": {
            borderRadius: "50%",
            overflow: "hidden",
            width: "30px",
            height: "30px",
          },
          "@keyframes slidein": {
            from: {
              transform: "translateY(0%)",
            },
            to: {
              transform: "translateY(100%)",
            },
          },
        }}
      >
        <OptimizedAvatar2 alt={userInfo?.fullname} imageUrl={userInfo?.imageUrl} size={40} sx={{ border: "none" }} />

        {onlineUsers[userInfo?.uname] && (
          <Box
            sx={{
              fontSize: "1px",
            }}
            className="UserStatusOnlineIcon"
          />
        )}
      </Box>
    );
  };

  const handleSearch = (e: any) => {
    setSearchQuery(e.target.value);
    if (!e.target.value) {
      setSearchedConversations(conversations);
      return;
    }
    const results = fuse.search(e.target.value).map(result => result.item);
    setSearchedConversations([...results]);
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "4px" }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingY: "10px" }}>
        <TextField fullWidth placeholder="Search Conversation" value={searchQuery} onChange={handleSearch} />
      </Box>
      <Box mb={1} sx={{ display: "flex", justifyContent: "end" }}>
        <IconButton
          sx={{ background: theme => (theme.palette.mode === "dark" ? "rgb(85, 64, 43)" : "rgb(253, 234, 215)") }}
          onClick={() => setNewChannel(true)}
        >
          <AddIcon />
        </IconButton>
      </Box>
      {searchedConversations.map((conversation: IConversation, idx: number) => (
        <Paper
          className="direct-channel"
          onClick={() => openRoom("direct", conversation)}
          key={idx}
          elevation={3}
          sx={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            padding: "12px 16px 10px 16px",
            borderRadius: "8px",
            boxShadow: theme =>
              theme.palette.mode === "light"
                ? "0px 1px 2px rgba(0, 0, 0, 0.06), 0px 1px 3px rgba(0, 0, 0, 0.1)"
                : "none",
            background: theme =>
              theme.palette.mode === "dark" ? theme.palette.common.notebookG700 : theme.palette.common.gray100,
            marginBottom: "5px",
            cursor: "pointer",
            ":hover": {
              background: theme =>
                theme.palette.mode === "dark" ? theme.palette.common.notebookG600 : theme.palette.common.gray200,
            },
          }}
        >
          <Box
            className="direct-channel-box"
            sx={{
              display: "flex",
              alignItems: "center",
              gap: "9px",
            }}
          >
            <Box sx={{ mr: "7px" }}>
              {Object.keys(conversation.membersInfo).length > 2 ? (
                <GroupAvatar membersInfo={conversation.membersInfo} size={35} max={2} />
              ) : (
                <OverlappingAvatars members={conversation.membersInfo} />
              )}
            </Box>
            <Box sx={{ display: "block" }}>
              <Typography
                sx={{
                  fontSize: "13px",
                  fontWeight: "500",
                  lineHeight: "24px",
                }}
              >
                {conversation?.title || generateChannelName(conversation.membersInfo, user)}
              </Typography>
            </Box>

            <Typography
              sx={{
                fontSize: "12px",
                color: theme =>
                  theme.palette.mode === "dark" ? theme.palette.common.notebookG200 : theme.palette.common.gray500,
                ml: "auto",
              }}
            >
              {dayjs(conversation.updatedAt.toDate().getTime()).fromNow()}
            </Typography>
            {(notificationHash[conversation.id] || []).length > 0 && (
              <CustomBadge
                value={notificationHash[conversation.id].length}
                sx={{
                  height: "20px",
                  p: "6px",
                  fontSize: "13px",
                }}
              />
            )}
            <IconButton
              className="direct-channel-delete"
              sx={{
                display: "none",
                width: "30px",
                height: "30px",
                p: "3px",
              }}
              onClick={e => handleDeleteChannel(e, conversation)}
            >
              <CloseIcon />
            </IconButton>
          </Box>
          {(notificationHash[conversation.id] || []).length > 0 && (
            <Typography sx={{ fontSize: "13px", color: "grey", pl: "54px" }}>
              {getMessageSummary(notificationHash[conversation.id][0])}
            </Typography>
          )}
        </Paper>
      ))}
      <CreateDirectChannel db={db} user={user} onlineUsers={onlineUsers} setOpen={setNewChannel} open={newChannel} />
    </Box>
  );
};
