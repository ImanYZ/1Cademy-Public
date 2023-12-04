import AddReactionIcon from "@mui/icons-material/AddReaction";
import { Button, IconButton } from "@mui/material";
import { Box } from "@mui/system";
import React from "react";

import { DESIGN_SYSTEM_COLORS } from "@/lib/theme/colors";

type EmoticonsProps = {
  messageId: string;
  reactionsMap: { [key: string]: string[] };
  toggleEmojiPicker: (event: any, messageId?: string) => void;
  toggleReaction: (messageId: string, emoji: string) => void;
};
export const Emoticons = ({ messageId, reactionsMap, toggleEmojiPicker, toggleReaction }: EmoticonsProps) => {
  return (
    <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "5px" }}>
      {reactionsMap[messageId]?.map(emoji => (
        <Button
          sx={{
            color: theme =>
              theme.palette.mode === "dark" ? DESIGN_SYSTEM_COLORS.gray100 : DESIGN_SYSTEM_COLORS.notebookG700,
            fontSize: "15px",
            minWidth: "0",
            padding: "0px 10px",
            borderRadius: "12px",
            background: theme =>
              theme.palette.mode === "dark" ? DESIGN_SYSTEM_COLORS.notebookG500 : DESIGN_SYSTEM_COLORS.gray300,
          }}
          key={emoji}
          onClick={() => {
            toggleReaction(messageId, emoji);
          }}
        >
          {emoji} 1
        </Button>
      ))}
      {reactionsMap[messageId]?.length > 0 && (
        <IconButton onClick={(e: any) => toggleEmojiPicker(e, messageId)}>
          <AddReactionIcon color="secondary" />
        </IconButton>
      )}
    </Box>
  );
};
