import { Box, Typography } from "@mui/material";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import { styled } from "@mui/system";
import { collection, Firestore, getDocs, query } from "firebase/firestore";
import React, { ChangeEvent, useEffect, useRef, useState } from "react";
import { IUser } from "src/types/IUser";

import OptimizedAvatar2 from "@/components/OptimizedAvatar2";

type UserSuggestionProps = {
  db: Firestore;
  onlineUsers: any;
  action: (suggestion: IUser) => void;
  autoFocus?: boolean;
};

const SuggestionList = styled(Paper)(({ theme }) => ({
  position: "fixed",
  width: "100%",
  maxHeight: "300px",
  overflowY: "auto",
  marginTop: theme.spacing(1),
  zIndex: 1,
}));

const UserSuggestion = ({ db, onlineUsers, action, autoFocus }: UserSuggestionProps) => {
  const [inputValue, setInputValue] = useState<string>("");
  const [users, setUsers] = useState<IUser[]>([]);
  const [suggestions, setSuggestions] = useState<IUser[]>([]);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(!!autoFocus);
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
    if (!inputValue.trim()) {
      setSuggestions(users.slice(0, 10));
      return;
    }
    const handler = setTimeout(() => {
      const filteredOptions = (query: string): IUser[] => {
        if (!query) {
          return users.slice(0, 10);
        }
        const lowerCaseQuery = query.toLowerCase();
        return users.filter(
          (user: IUser) =>
            user.fName.toLowerCase().startsWith(lowerCaseQuery) ||
            user.lName.toLowerCase().startsWith(lowerCaseQuery) ||
            user.uname.toLowerCase().startsWith(lowerCaseQuery)
        );
      };
      setSuggestions(filteredOptions(inputValue.trim()));
      setShowSuggestions(true);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [inputValue, users]);

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleClickOutside = (event: MouseEvent) => {
    if (wrapperRef.current && !wrapperRef.current.contains(event.target) && !autoFocus) {
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
        sx={{ position: "sticky", top: 0 }}
      />
      {showSuggestions && (
        <SuggestionList sx={{ width: "400px" }}>
          <List>
            {suggestions.map((suggestion: IUser, index: number) => (
              <ListItem
                button
                key={index}
                onClick={() => {
                  action(suggestion);
                  setShowSuggestions(false);
                }}
                sx={{ height: "50px" }}
              >
                <Box
                  sx={{
                    width: `30px`,
                    height: `30px`,
                    cursor: "pointer",
                    transition: "all 0.2s 0s ease",
                    background: "linear-gradient(143.7deg, #FDC830 15.15%, #F37335 83.11%);",
                    borderRadius: "50%",
                    "& > .user-image": {
                      borderRadius: "50%",
                      overflow: "hidden",
                      width: "20px",
                      height: "20px",
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
                    size={30}
                    sx={{ border: "none" }}
                  />
                  <Box
                    sx={{
                      fontSize: "1px",
                      backgroundColor: !onlineUsers[suggestion.uname]
                        ? theme => (theme.palette.mode === "dark" ? "#1b1a1a" : "#fefefe")
                        : "",
                    }}
                    className={onlineUsers[suggestion.uname] ? "UserStatusOnlineIcon" : ""}
                  />
                </Box>
                <Box>
                  <Typography sx={{ pl: 1.5, fontSize: "14px" }}>{suggestion.fullName}</Typography>
                  <Typography sx={{ pl: 1, color: "grey", fontSize: "12px" }}>@{suggestion.uname}</Typography>
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
