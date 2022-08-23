// import "./NewChildProposal.css";
import AddIcon from '@mui/icons-material/Add';
import CodeIcon from '@mui/icons-material/Code';
import EmojiObjectsIcon from '@mui/icons-material/EmojiObjects';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import LocalLibraryIcon from '@mui/icons-material/LocalLibrary';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import ShareIcon from '@mui/icons-material/Share';
import React, { useCallback } from "react";

import MetaButton from "./MetaButton";

type NewChildProposalProps = {
  key: any,
  childNodeType: string,
  icon: any,
  openProposal: any,
  setOpenProposal: any,
  proposeNewChild: any,
}

const NewChildProposal = (props: NewChildProposalProps) => {
  const proposeNewChildClick = useCallback(
    (event: any) => props.proposeNewChild(event, props.childNodeType, props.setOpenProposal),
    [props.proposeNewChild, props.childNodeType, props.setOpenProposal]
  );

  return (
    <span >
      <MetaButton
        onClick={
          props.openProposal !== "ProposeNew" + props.childNodeType + "ChildNode"
            ? proposeNewChildClick
            : undefined
        }
      >
        <div className="NewProposalButton">
          <div className="NewProposalIcons">
            {/* <i className="material-icons orange-text">add</i> */}
            <AddIcon fontSize='small' />
            {/* local_library */}
            {/* share */}
            {/* help_outline */}
            {/* code */}
            {/* menu_book */}
            {/* emoji_objects */}
            {props.icon === 'local_library' && <LocalLibraryIcon fontSize='small' />}
            {props.icon === 'share' && <ShareIcon fontSize='small' />}
            {props.icon === 'help_outline' && <HelpOutlineIcon fontSize='small' />}
            {props.icon === 'code' && <CodeIcon fontSize='small' />}
            {props.icon === 'menu_book' && <MenuBookIcon fontSize='small' />}
            {props.icon === 'emoji_objects' && <EmojiObjectsIcon fontSize='small' />}
            {/* <i className={"material-icons orange-text"}>{props.icon}</i> */}
          </div>
          <div className="NewProposalButtonText">{props.childNodeType}</div>
        </div>
      </MetaButton>
    </span>
  );
};

export default React.memo(NewChildProposal);
