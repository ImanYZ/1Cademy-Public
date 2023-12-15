import SearchIcon from "@mui/icons-material/Search";
import { Autocomplete, Paper, TextField, Typography } from "@mui/material";
import { Box } from "@mui/system";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { collection, Firestore, getDocs, query } from "firebase/firestore";
import Fuse from "fuse.js";
import { useEffect, useState } from "react";
import { IConversation } from "src/chatTypes";

import { CustomBadge } from "@/components/map/CustomBudge";
import OptimizedAvatar2 from "@/components/OptimizedAvatar2";
import { useAuth } from "@/context/AuthContext";

import { getMessageSummary } from "../../helpers/common";

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
  openDMChannel,
  notifications,
}: DirectMessageProps) => {
  const [{ user }] = useAuth();
  const [users, setUsers] = useState([]);
  const [searchValue, setSearchValue] = useState("");

  const fuse = new Fuse(users, { keys: ["uname"] });

  const [notificationHash, setNotificationHash] = useState<any>({});

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

  const generateChannelName = (members: any) => {
    const name = [];
    let more = 0;
    for (let mId in members) {
      if (name.length > 3) {
        more++;
      }
      if (mId !== user?.uname) name.push(members[mId].fullname + "");
    }
    if (more > 2) {
      name.push(`...`);
    }
    return name.join("");
  };
  const OverlappingAvatars = ({ members }: any) => {
    if (!user?.uname) return <></>;
    const otherUser = Object.keys(members).filter((u: string) => u !== user?.uname)[0];
    const userInfo = members[otherUser];
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
        <OptimizedAvatar2 alt={userInfo.fullname} imageUrl={userInfo.imageUrl} size={40} sx={{ border: "none" }} />
        <Box
          sx={{ background: onlineUsers.includes(userInfo.uname) ? "#12B76A" : "grey", fontSize: "1px" }}
          className="UserStatusOnlineIcon"
        />
      </Box>
    );
  };
  useEffect(() => {
    const getUsers = async () => {
      const usersQuery = query(collection(db, "users"));
      const usersDocs = await getDocs(usersQuery);
      const _users: any = [];
      usersDocs.docs.forEach((userDoc: any) => {
        _users.push({ ...userDoc.data(), fullname: `${userDoc.data().fName} ${userDoc.data().lName}` });
      });
      setUsers(_users);
    };
    getUsers();
  }, [db]);

  const searchWithFuse = (query: string): any => {
    if (!query) {
      return [];
    }
    return fuse
      .search(query)
      .map(result => result.item)
      .filter((item: any) => !item.deleted);
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "4px" }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingY: "10px" }}>
        <Autocomplete
          freeSolo
          options={searchWithFuse(searchValue)}
          onInputChange={(event, value) => {
            setSearchValue(value);
          }}
          renderInput={params => (
            <TextField
              {...params}
              label="Search"
              margin="normal"
              variant="outlined"
              InputProps={{
                ...params.InputProps,
                startAdornment: (
                  <Box sx={{ p: 1 }}>
                    <SearchIcon />
                    {params.InputProps.startAdornment}
                  </Box>
                ),
              }}
            />
          )}
          renderOption={(props, option: any) => (
            <li
              {...props}
              onClick={() => {
                openDMChannel(option);
              }}
            >
              {" "}
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
                <OptimizedAvatar2 alt={option.fullname} imageUrl={option.imageUrl} size={40} sx={{ border: "none" }} />
                <Box
                  sx={{ background: onlineUsers.includes(option.uname) ? "#12B76A" : "grey", fontSize: "1px" }}
                  className="UserStatusOnlineIcon"
                />
              </Box>
              <Box>
                <Typography sx={{ pl: 2 }}>{option.fullname}</Typography>
                <Typography sx={{ pl: 1, color: "grey", fontSize: "15px" }}>@{option.uname}</Typography>
              </Box>
            </li>
          )}
          getOptionLabel={(option: any) => (option.fullname ? option.fullname : "")}
          fullWidth
        />
        {/* {conversations.length > 0 && (
          <IconButton
            sx={{
              ml: "5px",
              background: theme =>
                theme.palette.mode === "dark" ? DESIGN_SYSTEM_COLORS.notebookG700 : DESIGN_SYSTEM_COLORS.gray100,
              borderRadius: "8px",
              border: theme =>
                `solid 1px ${
                  theme.palette.mode === "dark" ? DESIGN_SYSTEM_COLORS.notebookG500 : DESIGN_SYSTEM_COLORS.gray300
                }`,
            }}
          >
            <CreateIcon color="primary" />
          </IconButton>
        )} */}
      </Box>
      {conversations.map((conversation: IConversation, idx: number) => (
        <Paper
          onClick={() => openRoom("direct", conversation)}
          key={idx}
          elevation={3}
          className="CollapsedProposal collection-item"
          sx={{
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
            sx={{
              display: "flex",
              alignItems: "center",
              gap: "9px",
            }}
          >
            <Box sx={{ mr: "7px" }}>
              <OverlappingAvatars members={conversation.membersInfo} />
            </Box>
            <Box sx={{ display: "block" }}>
              <Typography
                sx={{
                  fontSize: "13px",
                  fontWeight: "500",
                  lineHeight: "24px",
                }}
              >
                {generateChannelName(conversation.membersInfo)}
              </Typography>
              {(notificationHash[conversation.id] || []).length > 0 && (
                <Typography sx={{ fontSize: "13px", color: "grey" }}>
                  {getMessageSummary(notificationHash[conversation.id][0])}
                </Typography>
              )}
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
          </Box>
        </Paper>
      ))}
    </Box>
  );
};
