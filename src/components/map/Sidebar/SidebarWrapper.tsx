// import "./SidebarWrapper.css";

import CloseIcon from "@mui/icons-material/Close";
import { Box } from "@mui/material";
import Image from "next/image";
import React from "react";

import { MemoizedMetaButton } from "../MetaButton";



type SidebarWrapperProps = {
  headerImage: any;
  title: string;
  scrollToTop: any;
  closeSideBar: any;
  children: JSX.Element;
  noHeader?: any;
};

const SidebarWrapper = (props: SidebarWrapperProps) => {
  return (
    <>
      <div
        id="SidebarContainer"
        className={props.noHeader ? "MiniUserProfileSidebar" : ""}
        style={{ position: "relative" }}
      >
        <Box id="SideBarClose" sx={{ position: "absolute", top: "10px", right: "10px" }}>
          <MemoizedMetaButton onClick={props.closeSideBar} tooltip="Close the sidebar." tooltipPosition="left">
            <CloseIcon />
            {/* <div className="CloseButton">
            <i className="material-icons">close</i>
          </div> */}
          </MemoizedMetaButton>
        </Box>
        {!props.noHeader ? (
          <>
            <div id="SidebarHeader">
              {/* <img
                id="SidebarHeaderImage"
                src={props.headerImage}
                alt={props.title + " Header Background"}
                width="100%"
              ></img> */}
              <Image src={props.headerImage} alt={props.title + " Header Background"} />
              <div id="SidebarHeaderText">{props.title}</div>
            </div>
            <div id="SidebarBody">{props.children}</div>
          </>
        ) : (
          props.children
        )}
      </div>
      {/* <div id="ScrollToTop">
        <MemoizedMetaButton onClick={props.scrollToTop} tooltip="Back to top." tooltipPosition="Left">
          <i className="material-icons gray-text">arrow_upward</i>
        </MemoizedMetaButton>
      </div> */}
    </>
  );
};

export const MemoizedSidebarWrapper = React.memo(SidebarWrapper);
