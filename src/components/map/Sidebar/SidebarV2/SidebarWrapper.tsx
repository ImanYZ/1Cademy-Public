import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import CloseIcon from "@mui/icons-material/Close";
import { Drawer, DrawerProps, IconButton, Tooltip, Typography } from "@mui/material";
import { Box } from "@mui/system";
import Image, { StaticImageData } from "next/image";
import React, { ReactNode, useCallback, useRef } from "react";
type SidebarWrapperProps = {
  title: string;
  open: boolean;
  onClose: () => void;
  SidebarContent: ReactNode;
  SidebarOptions?: ReactNode;
  anchor?: DrawerProps["anchor"];
  headerImage?: StaticImageData;
  width: number;
};
/**
 * Only Sidebar content should be scrollable
 */
export const SidebarWrapper = ({
  title,
  open,
  onClose,
  anchor = "left",
  width,
  headerImage,
  SidebarOptions = null,
  SidebarContent,
}: SidebarWrapperProps) => {
  // const contentHight=useMemo(() => {
  //   if(headerImage && sidbe)
  // }, [second])

  const sidebarContentRef = useRef(null);

  const scrollToTop = useCallback(() => {
    // console.log(sidebarRef.current);
    if (!sidebarContentRef.current) return;
    sidebarContentRef.current.scrollTop = 0;
  }, [sidebarContentRef]);

  return (
    <Drawer
      variant="persistent"
      anchor={anchor}
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width,
          // border: "solid 2px yellow",
          background: theme => (theme.palette.mode === "dark" ? "rgb(31,31,31)" : "rgb(240,240,240)"),
        },
      }}
    >
      {headerImage && (
        <Box sx={{ position: "relative", height: "127px" }}>
          <Image src={headerImage} alt="header image" width={width} height={127} />
          <Typography
            component={"h2"}
            sx={{
              width: "100%",
              position: "absolute",
              bottom: 0,
              paddingLeft: "13px",
              // left: 13,
              fontSize: "40px",
              // backgroundColor: "red",
              background: theme =>
                theme.palette.mode === "dark"
                  ? "linear-gradient(0deg, rgba(31, 31, 31, 1) 0%, rgba(31, 31, 31, 0) 100%)"
                  : "linear-gradient(0deg, rgb(255, 255, 255) 0%, rgba(255, 255, 255, 0) 100%)",
            }}
          >
            {title}
          </Typography>
        </Box>
      )}
      <Box>{SidebarOptions}</Box>
      <Box
        ref={sidebarContentRef}
        sx={{
          // border: "solid 2px blue",
          height: "100%",
          overflowY: "auto",
          scrollBehavior: "smooth",
          "::-webkit-scrollbar-thumb": {
            background: "rgba(119, 119, 119, 0.692)",
            borderRadius: "4px",
          },
          "::-webkit-scrollbar ": { width: "4px", height: "4px" },
        }}
      >
        {SidebarContent}
      </Box>
      <Box sx={{ position: "absolute", top: "10px", right: "10px" }}>
        <Tooltip title="Close the sidebar." placement="left">
          <IconButton
            onClick={onClose}
            sx={{
              background: theme => (theme.palette.mode === "light" ? "rgb(240,240,240)" : "rgb(31,31,31)"),
              ":hover": {
                background: theme => (theme.palette.mode === "light" ? "rgba(240,240,240,0.7)" : "rgba(31,31,31,0.7)"),
              },
            }}
          >
            <CloseIcon />
          </IconButton>
        </Tooltip>
      </Box>
      <Box
        sx={{
          position: "absolute",
          bottom: "10px",
          right: "10px",
        }}
      >
        <Tooltip title="Back to top.">
          <IconButton
            onClick={scrollToTop}
            sx={{
              background: theme => (theme.palette.mode === "light" ? "rgb(240,240,240)" : "rgb(31,31,31)"),
              ":hover": {
                background: theme => (theme.palette.mode === "light" ? "rgba(240,240,240,0.7)" : "rgba(31,31,31,0.7)"),
              },
            }}
          >
            <ArrowUpwardIcon />
          </IconButton>
        </Tooltip>
      </Box>
    </Drawer>
  );
};
// export default React.memo(SidebarWrapper);
