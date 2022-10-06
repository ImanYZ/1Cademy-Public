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
      <Box
        // id="SidebarContainer"
        // className={props.noHeader ? "MiniUserProfileSidebar" : ""}
        sx={{ position: "relative", height: "100%", marginTop: "0px", overflow: "hidden" }}
      >
        {!props.noHeader ? (
          <>
            <div id="SidebarHeader" style={{ position: "sticky", top: "0px", zIndex: 10, height: "130px" }}>
              <Box id="SideBarClose" sx={{ top: "10px", right: "10px", position: "absolute" }}>
                <MemoizedMetaButton onClick={props.closeSideBar} tooltip="Close the sidebar." tooltipPosition="left">
                  <CloseIcon />
                </MemoizedMetaButton>
              </Box>
              <Image src={props.headerImage} alt={props.title + " Header Background"} />
              <div id="SidebarHeaderText">{props.title}</div>
            </div>
            <div id="SidebarBody" style={{ overflowY: "auto" }}>
              {props.children}
            </div>
          </>
        ) : (
          <>
            <Box
              sx={{
                display: "flex",
                justifyContent: "end",
                width: "100%",
                top: "10px",
                right: "10px",
                position: "sticky",
              }}
            >
              <MemoizedMetaButton onClick={props.closeSideBar} tooltip="Close the sidebar." tooltipPosition="left">
                <CloseIcon />
              </MemoizedMetaButton>
            </Box>
            <div style={{ overflowY: "auto", height: "100%" }}>{props.children}</div>
          </>
        )}
      </Box>
      {/* <div id="ScrollToTop">
        <MemoizedMetaButton onClick={props.scrollToTop} tooltip="Back to top." tooltipPosition="Left">
          <i className="material-icons gray-text">arrow_upward</i>
        </MemoizedMetaButton>
      </div> */}
    </>
  );
};

export const MemoizedSidebarWrapper = React.memo(SidebarWrapper);
