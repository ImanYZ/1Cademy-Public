import { Typography } from "@mui/material";
import { Box } from "@mui/system";
import moment from "moment";
import React from "react";
import { IChannelMessage } from "src/chatTypes";

import MarkdownRender from "@/components/Markdown/MarkdownRender";
import OptimizedAvatar2 from "@/components/OptimizedAvatar2";
import { DESIGN_SYSTEM_COLORS } from "@/lib/theme/colors";

import { Emoticons } from "../Common/Emoticons";
import { MessageButtons } from "./MessageButtons";
type MessageLeftProps = {
  reply: any;
  toggleEmojiPicker: (event: any, message?: IChannelMessage) => void;
  toggleReaction: (message: IChannelMessage, emoji: string) => void;
  forwardMessage: (message: any) => void;
};
export const Replies = ({ reply, toggleEmojiPicker, toggleReaction, forwardMessage }: MessageLeftProps) => {
  return (
    <Box
      sx={{
        display: "flex",
        gap: "10px",
        marginTop: "25px",
      }}
    >
      <Box
        sx={{
          width: `${30}px`,
          height: `${30}px`,
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
        <Box>
          <OptimizedAvatar2 alt={"Haroon Waheed"} imageUrl={reply?.imageUrl} size={30} sx={{ border: "none" }} />
        </Box>
        <Box sx={{ background: "#12B76A" }} className="UserStatusOnlineIcon" />
      </Box>

      <Box sx={{ width: "90%" }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Typography
            sx={{
              fontSize: "16px",
              fontWeight: "500",
              lineHeight: "24px",
            }}
          >
            {reply.sender}
          </Typography>
          <Typography sx={{ ml: "4px", fontSize: "12px" }}>
            {moment(reply.createdAt.toDate().getTime()).format("h:mm a")}
          </Typography>
        </Box>

        <Box
          className="reply-box"
          sx={{
            position: "relative",
            fontSize: "16px",
            fontWeight: "400",
            lineHeight: "24px",
            p: "10px 14px",
            borderRadius: "12px",
            background: theme =>
              theme.palette.mode === "dark" ? DESIGN_SYSTEM_COLORS.notebookG700 : DESIGN_SYSTEM_COLORS.gray200,
          }}
        >
          <MarkdownRender text={reply.message || ""} />
          <Box className="message-buttons" sx={{ display: "none" }}>
            <MessageButtons message={reply} toggleEmojiPicker={toggleEmojiPicker} forwardMessage={forwardMessage} />
          </Box>

          <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "5px" }}>
            <Emoticons message={reply} toggleEmojiPicker={toggleEmojiPicker} toggleReaction={toggleReaction} />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
