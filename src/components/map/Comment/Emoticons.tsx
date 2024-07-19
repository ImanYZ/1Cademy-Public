import AddReactionIcon from "@mui/icons-material/AddReaction";
import { Button, IconButton } from "@mui/material";
import { Box } from "@mui/system";
import React, { useEffect, useState } from "react";
import { Reaction } from "src/chatTypes";
import { IComment } from "src/commentTypes";

import { DESIGN_SYSTEM_COLORS } from "@/lib/theme/colors";
import shortenNumber from "@/lib/utils/shortenNumber";

type EmoticonsProps = {
  comment: IComment;
  reactionsMap: Reaction[];
  toggleEmojiPicker: (event: any, comment?: IComment) => void;
  toggleReaction: (comment: IComment, emoji: string) => void;
  user: any;
};
export const Emoticons = ({ comment, reactionsMap, toggleEmojiPicker, toggleReaction, user }: EmoticonsProps) => {
  const [reactions, setReactions] = useState<any>({});
  useEffect(() => {
    setReactions(
      reactionsMap.reduce((acu: { [emoji: string]: string[] }, cur: Reaction) => {
        if (acu.hasOwnProperty(cur.emoji)) {
          acu[cur.emoji].push(cur.user);
        } else if (cur.emoji) {
          acu[cur.emoji] = [cur.user];
        }
        return acu;
      }, {})
    );
  }, [reactionsMap]);
  const handleAddReaction = (e: any) => toggleEmojiPicker(e, comment);
  return (
    <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "5px" }}>
      {Object.keys(reactions)?.map((emoji: string) => (
        <Button
          sx={{
            color: theme =>
              theme.palette.mode === "dark" ? DESIGN_SYSTEM_COLORS.gray100 : DESIGN_SYSTEM_COLORS.notebookG700,
            fontSize: "15px",
            minWidth: "0",
            padding: "0px 10px",
            borderRadius: "12px",
            border: reactions[emoji].includes(user?.uname) ? "1px solid orange" : "",
            background: theme =>
              theme.palette.mode === "dark" ? DESIGN_SYSTEM_COLORS.notebookG500 : DESIGN_SYSTEM_COLORS.gray300,
          }}
          key={emoji}
          onClick={() => {
            toggleReaction(comment, emoji);
          }}
        >
          {emoji}{" "}
          <span style={{ fontWeight: reactions[emoji].includes(user?.uname) ? "bold" : "", paddingLeft: "2px" }}>
            {shortenNumber(reactions[emoji].length, 2, false)}
          </span>
        </Button>
      ))}
      {Object.keys(reactions)?.length > 0 && (
        <IconButton onClick={handleAddReaction}>
          <AddReactionIcon color="secondary" />
        </IconButton>
      )}
    </Box>
  );
};
