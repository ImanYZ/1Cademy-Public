// import "./SidebarWrapper.css";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import CloseIcon from "@mui/icons-material/Close";
import { Box } from "@mui/material";
import Image from "next/image";
import React, { useCallback, useRef } from "react";

import { MemoizedMetaButton } from "../MetaButton";

type SidebarWrapperProps = {
  headerImage: any;
  title: string;
  // scrollToTop: any;
  closeSideBar: any;
  children: JSX.Element;
  noHeader?: any;
};

const SidebarWrapper = (props: SidebarWrapperProps) => {
  const sidebarRef = useRef<any | null>(null);
  const scrollToTop = useCallback(() => {
    console.log(sidebarRef.current);
    if (!sidebarRef.current) return;
    sidebarRef.current.scrollTop = 0;
  }, [sidebarRef]);

  return (
    <>
      <Box
        // id="SidebarContainer"
        // className={props.noHeader ? "MiniUserProfileSidebar" : ""}
        sx={{ position: "relative", height: "100vh", marginTop: "0px", overflow: "hidden" }}
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
            <div id="SidebarBody" ref={sidebarRef} style={{ overflowY: "auto", height: "calc(100vh - 130px)" }}>
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
            <div ref={sidebarRef} style={{ overflowY: "auto", height: "100%" }}>
              {props.children}
            </div>
          </>
        )}
      </Box>
      <div id="ScrollToTop" style={{ marginBottom: "20px", marginLeft: "10px" }}>
        <MemoizedMetaButton onClick={scrollToTop} tooltip="Back to top." tooltipPosition="left">
          <ArrowUpwardIcon className="material-icons gray-text" />
        </MemoizedMetaButton>
      </div>
    </>
  );
};

export const MemoizedSidebarWrapper = React.memo(SidebarWrapper);
