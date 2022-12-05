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
import { Box } from "@mui/material";
import { keyframes } from "@mui/system";
import React, { useEffect, useState } from "react";

const slideInAnimation = keyframes`
  from {
    transform: translateY(0px);
  }
  to {
    transform: translateY(-100px);
  }
`;

type ActionType =
  | "Correct"
  | "Wrong"
  | "Improvement"
  | "ChildNode"
  | "NodeOpen"
  | "NodeHide"
  | "NodeCollapse"
  | "NodeStudied"
  | "NodeBookmark"
  | "NodeShare"
  | "Search";

type ActionBubbleProps = {
  actionType: ActionType;
};

const getActionIcon = (actionType: ActionType) => {
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
  throw new Error("Unidentified aciontType");
};

const ActionBubble = ({ actionType }: ActionBubbleProps) => {
  const Icon = getActionIcon(actionType);
  const [showIcon, setShowIcon] = useState(true);
  useEffect(() => {
    setShowIcon(true);
    setTimeout(() => {
      setShowIcon(false);
    }, 3000);
  }, [actionType]);
  return showIcon ? (
    <Box
      sx={{
        width: "14px",
        height: "14px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "50%",
        background: actionType === "Wrong" ? "#F45B2B" : "#3FAB51",
        fontSize: "10px",
        animation: `${slideInAnimation} 3s ease-out 0s infinite normal forwards`,
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
