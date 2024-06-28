import { Box, Typography } from "@mui/material";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import { styled } from "@mui/system";
import { collection, Firestore, getDocs, query } from "firebase/firestore";
import Fuse from "fuse.js";
import React, { ChangeEvent, useEffect, useRef, useState } from "react";
import { IUser } from "src/types/IUser";

import OptimizedAvatar2 from "@/components/OptimizedAvatar2";

type UserSuggestionProps = {
  db: Firestore;
  onlineUsers: any;
  action: (suggestion: IUser) => void;
};

const SuggestionList = styled(Paper)(({ theme }) => ({
  position: "absolute",
  width: "100%",
  maxHeight: "300px",
  overflowY: "auto",
  marginTop: theme.spacing(1),
  zIndex: 1,
}));

const UserSuggestion = ({ db, onlineUsers, action }: UserSuggestionProps) => {
  const [inputValue, setInputValue] = useState<string>("");
  const [users, setUsers] = useState<IUser[]>([]);
  const [suggestions, setSuggestions] = useState<IUser[]>([]);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const fuse = new Fuse(users, {
    keys: ["fullName", "uname"],
  });
  const wrapperRef = useRef<any>(null);

  useEffect(() => {
    const getUsers = async () => {
      const usersQuery = query(collection(db, "users"));
      const usersDocs = await getDocs(usersQuery);
      const _users: any = [];
      usersDocs.docs.forEach((userDoc: any) => {
        _users.push({ ...userDoc.data(), fullName: `${userDoc.data().fName} ${userDoc.data().lName}` });
      });
      setUsers(_users);
      setSuggestions(_users.splice(0, 10));
    };
    getUsers();
  }, [db]);

  useEffect(() => {
    if (!inputValue) return;
    const handler = setTimeout(() => {
      const filteredOptions = (query: string): any => {
        if (!query) {
          return [];
        }
        return fuse
          .search(query)
          .map(result => result.item)
          .filter((item: any) => !item.deleted);
      };
      setSuggestions(filteredOptions(inputValue));
      setShowSuggestions(true);
    }, 1000);

    return () => {
      clearTimeout(handler);
    };
  }, [inputValue]);

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleClickOutside = (event: MouseEvent) => {
    if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
      setShowSuggestions(false);
    }
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  return (
    <Box ref={wrapperRef} style={{ position: "relative", width: "100%" }}>
      <TextField
        value={inputValue}
        onChange={handleInputChange}
        placeholder="Search User"
        fullWidth
        variant="outlined"
        onFocus={() => {
          setShowSuggestions(true);
        }}
      />
      {showSuggestions && (
        <SuggestionList>
          <List>
            {suggestions.map((suggestion: IUser, index: number) => (
              <ListItem
                button
                key={index}
                onClick={() => {
                  action(suggestion);
                  setShowSuggestions(false);
                }}
              >
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
                  <OptimizedAvatar2
                    alt={suggestion.fullName || ""}
                    imageUrl={suggestion.imageUrl}
                    size={40}
                    sx={{ border: "none" }}
                  />
                  <Box
                    sx={{
                      fontSize: "1px",
                      backgroundColor: !onlineUsers[suggestion.uname]
                        ? theme => (theme.palette.mode === "dark" ? "#1b1a1a" : "#fefefe")
                        : "",
                    }}
                    className={onlineUsers[suggestion.uname] ? "UserStatusOnlineIcon" : "UserStatusOfflineIcon"}
                  />
                </Box>
                <Box>
                  <Typography sx={{ pl: 2 }}>{suggestion.fullName}</Typography>
                  <Typography sx={{ pl: 1, color: "grey", fontSize: "15px" }}>@{suggestion.uname}</Typography>
                </Box>
              </ListItem>
            ))}
            {suggestions.length === 0 && (
              <ListItem>
                <ListItemText primary="No suggestions found" />
              </ListItem>
            )}
          </List>
        </SuggestionList>
      )}
    </Box>
  );
};

export default UserSuggestion;
