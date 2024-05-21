import LinkIcon from "@mui/icons-material/Link";
import { Typography } from "@mui/material";
import { Box } from "@mui/system";
import React from "react";

import MarkdownRender from "@/components/Markdown/MarkdownRender";
import OptimizedAvatar2 from "@/components/OptimizedAvatar2";
import { DESIGN_SYSTEM_COLORS } from "@/lib/theme/colors";
type MessageRightProps = {
  message: any;
  membersInfo: any;
  openLinkedNode: any;
  onlineUsers: any;
  //reactionsMap: { [key: string]: string[] };
};
export const NodeLink = ({ message, membersInfo, openLinkedNode, onlineUsers }: MessageRightProps) => {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "end",
        gap: "10px",
        cursor: "pointer",
      }}
      onClick={() => openLinkedNode(message?.node?.id)}
    >
      <Box sx={{ marginTop: "45px", display: "flex", gap: "5px" }}>
        <Box
          sx={{
            width: `${!message.parentMessage ? 40 : 30}px`,
            height: `${!message.parentMessage ? 40 : 30}px`,
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
            alt={membersInfo[message.sender]?.fullname || ""}
            imageUrl={membersInfo[message.sender]?.imageUrl || ""}
            size={!message.parentMessage ? 40 : 30}
            sx={{ border: "none" }}
          />
          {onlineUsers.includes(membersInfo[message.sender]?.uname) && (
            <Box sx={{ background: "#12B76A", fontSize: "1px" }} className="UserStatusOnlineIcon" />
          )}
        </Box>
        <Box>
          <Typography
            sx={{
              fontSize: "16px",
              fontWeight: "500",
              lineHeight: "24px",
            }}
          >
            {membersInfo[message.sender]?.fullname || ""}
          </Typography>

          <Typography
            sx={{
              fontSize: "16px",
              fontWeight: "400",
              lineHeight: "24px",
              p: "10px 14px",
              background: theme =>
                theme.palette.mode === "dark"
                  ? message.sender === "You"
                    ? DESIGN_SYSTEM_COLORS.notebookG700
                    : DESIGN_SYSTEM_COLORS.notebookO900
                  : message.sender === "You"
                  ? DESIGN_SYSTEM_COLORS.gray200
                  : DESIGN_SYSTEM_COLORS.orange100,
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                p: "10px",
                borderRadius: "8px",
                background: theme =>
                  theme.palette.mode === "dark"
                    ? message.sender === "You"
                      ? DESIGN_SYSTEM_COLORS.notebookG600
                      : DESIGN_SYSTEM_COLORS.notebookO800
                    : message.sender === "You"
                    ? DESIGN_SYSTEM_COLORS.gray100
                    : DESIGN_SYSTEM_COLORS.orange50,
                mb: "10px",
              }}
            >
              <Box
                sx={{
                  width: "30px",
                  height: "30px",
                  borderRadius: "50%",
                  background: DESIGN_SYSTEM_COLORS.primary600,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <LinkIcon
                  sx={{
                    color: DESIGN_SYSTEM_COLORS.gray25,
                  }}
                />
              </Box>
              <Typography sx={{ fontWeight: "500" }}>
                {message?.node?.title.substr(0, 40)}
                {message?.node?.title.length > 40 ? "..." : ""}
              </Typography>
            </Box>
            <MarkdownRender text={message?.node?.content} />
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};
