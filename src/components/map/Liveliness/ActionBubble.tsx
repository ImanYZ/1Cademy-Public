import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import CloseFullscreenIcon from "@mui/icons-material/CloseFullscreen";
import DraftsIcon from "@mui/icons-material/Drafts";
import OpenInFullIcon from "@mui/icons-material/OpenInFull";
import PostAddIcon from "@mui/icons-material/PostAdd";
import ReplyIcon from "@mui/icons-material/Reply";
import SearchIcon from "@mui/icons-material/Search";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { Box, SxProps, Theme } from "@mui/material";
import { keyframes } from "@mui/system";
import React, { useEffect, useState } from "react";
import { ActionTrackType } from "src/knowledgeTypes";

const slideInAnimation = keyframes`
  0% {
    opacity: 0;
  }
  10%, 70% {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
`;

type ActionBubbleProps = {
  actionType: ActionTrackType;
  sx?: SxProps<Theme>;
};

const getActionIcon = (actionType: ActionTrackType) => {
  if (actionType === "Correct") return CheckIcon;
  if (actionType === "Wrong") return CloseIcon;
  if (actionType === "Improvement") return AutoAwesomeIcon;
  if (actionType === "ChildNode") return PostAddIcon;
  if (actionType === "NodeOpen") return OpenInFullIcon;
  if (actionType === "NodeHide") return VisibilityOffIcon;
  if (actionType === "NodeCollapse") return CloseFullscreenIcon;
  if (actionType === "NodeStudied") return DraftsIcon;
  if (actionType === "NodeBookmark") return BookmarkIcon;
  if (actionType === "NodeShare") return ReplyIcon;
  if (actionType === "Search") return SearchIcon;
  //console.error("Unidentified aciontType");
  return null;
  // throw new Error("Unidentified aciontType");
};

const ActionBubble = ({ actionType, sx }: ActionBubbleProps) => {
  const Icon = getActionIcon(actionType);

  const [showIcon, setShowIcon] = useState(true);
  useEffect(() => {
    setShowIcon(true);
    setTimeout(() => {
      setShowIcon(false);
    }, 3000);
  }, [actionType]);
  const isVote = actionType === "Correct" || actionType === "Wrong";

  if (!Icon) return null;

  return showIcon ? (
    <Box
      sx={{
        width: "14px",
        height: "14px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "50%",
        color: isVote ? (actionType === "Wrong" ? "#F45B2B" : "#3FAB51") : "#ffffff",
        fontSize: "20px",
        marginBottom: "5px",
        animation: `${slideInAnimation} 1.5s ease-out 0s normal forwards`,
        ...sx,
      }}
    >
      <Icon
        fontSize={"inherit"}
        sx={{
          transform: actionType === "NodeShare" ? "scaleX(-1)" : null,
        }}
      />
    </Box>
  ) : null;
};

export const MemoizedActionBubble = React.memo(ActionBubble);
