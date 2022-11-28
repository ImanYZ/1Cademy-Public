// import "./NewChildProposal.css";
import AddIcon from "@mui/icons-material/Add";
import CodeIcon from "@mui/icons-material/Code";
import EmojiObjectsIcon from "@mui/icons-material/EmojiObjects";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import LocalLibraryIcon from "@mui/icons-material/LocalLibrary";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import ShareIcon from "@mui/icons-material/Share";
import { Box } from "@mui/material";
import React, { useCallback } from "react";

import { MemoizedMetaButton } from "./MetaButton";

type NewChildProposalProps = {
  key: any;
  childNodeType: string;
  icon: string;
  openProposal: any;
  setOpenProposal: any;
  proposeNewChild: any;
};

const NewChildProposal = (props: NewChildProposalProps) => {
  const proposeNewChildClick = useCallback(
    (event: any) => props.proposeNewChild(event, props.childNodeType, props.setOpenProposal),
    // TODO: check dependencies to remove eslint-disable-next-line
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [props.proposeNewChild, props.childNodeType, props.setOpenProposal]
  );

  return (
    <span>
      <MemoizedMetaButton
        onClick={
          props.openProposal !== "ProposeNew" + props.childNodeType + "ChildNode" ? proposeNewChildClick : undefined
        }
      >
        <Box className="NewProposalButton" sx={{ fontSize: "16px", textAlign: "center" }}>
          <div className="`NewProposalIcons`">
            {/* <i className="material-icons orange-text">add</i> */}
            <AddIcon fontSize="inherit" />
            {/* local_library */}
            {/* share */}
            {/* help_outline */}
            {/* code */}
            {/* menu_book */}
            {/* emoji_objects */}
            {props.icon === "local_library" && <LocalLibraryIcon fontSize="inherit" />}
            {props.icon === "share" && <ShareIcon fontSize="inherit" />}
            {props.icon === "help_outline" && <HelpOutlineIcon fontSize="inherit" />}
            {props.icon === "code" && <CodeIcon fontSize="inherit" />}
            {props.icon === "menu_book" && <MenuBookIcon fontSize="inherit" />}
            {props.icon === "emoji_objects" && <EmojiObjectsIcon fontSize="inherit" />}
            {/* <i className={"material-icons orange-text"}>{props.icon}</i> */}
          </div>
          <div className="NewProposalButtonText">{props.childNodeType}</div>
        </Box>
      </MemoizedMetaButton>
    </span>
  );
};

export default React.memo(NewChildProposal);
