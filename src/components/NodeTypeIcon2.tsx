import ArticleIcon from "@mui/icons-material/Article";
import CodeIcon from "@mui/icons-material/Code";
import EmojiObjectsIcon from "@mui/icons-material/EmojiObjects";
// import EventIcon from "@mui/icons-material/Event";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import LocalLibraryIcon from "@mui/icons-material/LocalLibrary";
import LockIcon from "@mui/icons-material/Lock";
import MenuBookIcon from "@mui/icons-material/MenuBook";
// import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
// import PersonIcon from "@mui/icons-material/Person";
import ShareIcon from "@mui/icons-material/Share";
import { SvgIconProps } from "@mui/material/SvgIcon";
import Tooltip, { TooltipProps } from "@mui/material/Tooltip";
import { FC } from "react";
import { NodeType } from "src/types";

// import { NodeType } from "../types";

// This component has improvementTypes
// 1. optional tooltip
// 2. and use NodeType from type

type Props = {
  tooltipPlacement?: TooltipProps["placement"];
  nodeType?: NodeType;
} & SvgIconProps;

const NodeTypeIcon: FC<Props> = ({ nodeType, tooltipPlacement, color = "primary", ...rest }) => {
  const renderIcon = () => {
    switch (nodeType) {
      case "Code":
        return <CodeIcon color={color} {...rest} />;
      case "Concept":
        return <LocalLibraryIcon color={color} {...rest} />;
      case "Relation":
        return <ShareIcon color={color} {...rest} />;
      case "Question":
        return <HelpOutlineIcon color={color} {...rest} />;
      // case "Profile":
      //   return <PersonIcon color={color} {...rest} />;
      // case "Sequel":
      //   return <MoreHorizIcon color={color} {...rest} />;
      // case "Advertisement":
      //   return <EventIcon color={color} {...rest} />;
      case "Reference":
        return <MenuBookIcon color={color} {...rest} />;
      case "Idea":
        return <EmojiObjectsIcon color={color} {...rest} />;
      case "News":
        return <ArticleIcon color={color} {...rest} />;
      // case "Private":
      //   return <LockIcon color={color} {...rest} />;
      default:
        return <LockIcon color={color} {...rest} />;
    }
  };

  if (!nodeType) return null;

  if (tooltipPlacement)
    return (
      <Tooltip title={`${nodeType} node`} placement={tooltipPlacement}>
        {renderIcon()}
      </Tooltip>
    );

  return renderIcon();
};

export default NodeTypeIcon;
