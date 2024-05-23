import SearchIcon from "@mui/icons-material/Search";
import { Autocomplete, TextField, Typography } from "@mui/material";
import { Box } from "@mui/system";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { collection, Firestore, getDocs, query, updateDoc } from "firebase/firestore";
import Fuse from "fuse.js";
import { useEffect, useState } from "react";
import { IUser } from "src/types/IUser";

import OptimizedAvatar2 from "@/components/OptimizedAvatar2";
import { generateChannelName } from "@/lib/utils/chat";

dayjs.extend(relativeTime);
type DirectMessageProps = {
  db: Firestore;
  user: IUser;
  onlineUsers: any;
  selectedChannel: any;
  getChannelRef: any;
};
export const AddMember = ({ db, user, onlineUsers, selectedChannel, getChannelRef }: DirectMessageProps) => {
  const [users, setUsers] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const fuse = new Fuse(users, { keys: ["fullname"] });

  useEffect(() => {
    const getUsers = async () => {
      const usersQuery = query(collection(db, "users"));
      const usersDocs = await getDocs(usersQuery);
      const _users: any = [];
      usersDocs.docs.forEach((userDoc: any) => {
        _users.push({
          ...userDoc.data(),
          fullname: `${userDoc.data().fName} ${userDoc.data().lName}`,
          id: userDoc.id,
        });
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

  const addNewMember = (member: any) => {
    setSearchValue("");
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
  };
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "4px" }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingY: "10px" }}>
        <Autocomplete
          placeholder="Search User"
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
                addNewMember(option);
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
      </Box>
    </Box>
  );
};
