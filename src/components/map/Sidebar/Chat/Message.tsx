import AddIcon from "@mui/icons-material/Add";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import CollectionsIcon from "@mui/icons-material/Collections";
import { Button, IconButton, InputBase } from "@mui/material";
import { Box } from "@mui/system";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import React, { useEffect, useState } from "react";

import { DESIGN_SYSTEM_COLORS } from "@/lib/theme/colors";

import { MessageLeft } from "./Message/MessageLeft";
import { MessageRight } from "./Message/MessageRight";

dayjs.extend(relativeTime);

export const Message = () => {
  const [messages, setMessages] = useState<any>([]);
  useEffect(() => {
    setMessages([
      {
        id: "132131313",
        message: "Hey Olivia, can you please review the latest node when you can?",
        sender: "Haroon",
        createdAt: "11:34 am",
      },
      {
        id: "132131313",
        message: "Hey Olivia, can you please review the latest node when you can?",
        sender: "You",
        createdAt: "11:34 am",
      },
      {
        id: "132131313",
        message: "Hey Olivia, can you please review the latest node when you can?",
        sender: "Haroon",
        createdAt: "11:34 am",
      },
      {
        id: "132131313",
        message: "Hey Olivia, can you please review the latest node when you can?",
        sender: "You",
        createdAt: "11:34 am",
      },
      {
        id: "132131313",
        message: "Hey Olivia, can you please review the latest node when you can?",
        sender: "Haroon",
        createdAt: "11:34 am",
      },
      {
        id: "132131313",
        message: "Hey Olivia, can you please review the latest node when you can?",
        sender: "You",
        createdAt: "11:34 am",
      },
    ]);
  }, []);
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "4px" }}>
      <Box
        sx={{
          height: "600px",
        }}
      >
        <Box
          className="messages-room"
          sx={{ height: "100%", overflow: "auto", borderBottom: "solid 1px grey", p: "10px 0px" }}
        >
          {messages.map((message: any) => (
            <Box key={message.id}>
              {message.sender !== "You" ? <MessageLeft message={message} /> : <MessageRight message={message} />}
            </Box>
          ))}
        </Box>
        <Box
          sx={{
            marginTop: "20px",
            border: theme =>
              `solid 1px ${
                theme.palette.mode === "light" ? DESIGN_SYSTEM_COLORS.gray300 : DESIGN_SYSTEM_COLORS.notebookG500
              }`,
            borderRadius: "4px",
            backgroundColor: theme =>
              theme.palette.mode === "dark" ? DESIGN_SYSTEM_COLORS.notebookG700 : DESIGN_SYSTEM_COLORS.gray100,
          }}
        >
          <InputBase
            id="message-chat"
            multiline={true}
            fullWidth
            placeholder="Type your message here..."
            autoComplete={"off"}
            sx={{
              p: "14px 14px",
              fontSize: "14px",
              backgroundColor: theme =>
                theme.palette.mode === "dark" ? DESIGN_SYSTEM_COLORS.notebookG700 : DESIGN_SYSTEM_COLORS.gray100,
              color: theme =>
                theme.palette.mode === "dark" ? DESIGN_SYSTEM_COLORS.baseWhite : DESIGN_SYSTEM_COLORS.notebookMainBlack,
              "::placeholder": {
                color: DESIGN_SYSTEM_COLORS.gray500,
              },
            }}
            inputProps={{
              style: {
                maxHeight: "60px",
                overflow: "auto",
              },
            }}
          />
          <Box
            sx={{
              width: "100%",
              p: "0px 8px 8px 8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <IconButton>
                <AddIcon />
              </IconButton>
              <IconButton>
                <CollectionsIcon />
              </IconButton>
              <IconButton>
                <AttachFileIcon />
              </IconButton>
            </Box>
            <Button
              variant="contained"
              sx={{
                minWidth: "0px",
                width: "36px",
                height: "36px",
                p: "10px",
                borderRadius: "8px",
              }}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                stroke={"white"}
              >
                <path
                  d="M7.74976 10.2501L16.4998 1.50014M7.85608 10.5235L10.0462 16.1552C10.2391 16.6513 10.3356 16.8994 10.4746 16.9718C10.5951 17.0346 10.7386 17.0347 10.8592 16.972C10.9983 16.8998 11.095 16.6518 11.2886 16.1559L16.7805 2.08281C16.9552 1.63516 17.0426 1.41133 16.9948 1.26831C16.9533 1.1441 16.8558 1.04663 16.7316 1.00514C16.5886 0.957356 16.3647 1.0447 15.9171 1.21939L1.84398 6.71134C1.34808 6.90486 1.10013 7.00163 1.02788 7.14071C0.965237 7.26129 0.965322 7.40483 1.0281 7.52533C1.10052 7.66433 1.34859 7.7608 1.84471 7.95373L7.47638 10.1438C7.57708 10.183 7.62744 10.2026 7.66984 10.2328C7.70742 10.2596 7.74028 10.2925 7.76709 10.3301C7.79734 10.3725 7.81692 10.4228 7.85608 10.5235Z"
                  stroke="inherit"
                  strokeWidth="1.66667"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
