import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import CloseIcon from "@mui/icons-material/Close";
import { Drawer, DrawerProps, IconButton, Tooltip, Typography, useMediaQuery, useTheme } from "@mui/material";
import { Box } from "@mui/system";
import Image, { StaticImageData } from "next/image";
import React, { ReactNode, useCallback, useMemo, useRef } from "react";
import { OpenSidebar } from "src/pages/notebook";

type SidebarWrapperProps = {
  title: string;
  open: boolean;
  onClose: () => void;
  SidebarContent: ReactNode;
  width: number;
  height?: number;
  SidebarOptions?: ReactNode;
  anchor?: DrawerProps["anchor"];
  headerImage?: StaticImageData;
  hoverWidth?: number;
  showCloseButton?: boolean;
  showScrollUpButton?: boolean;
  isMenuOpen?: boolean;
  contentSignalState: any;
  openSidebar?: OpenSidebar;
  innerHeight?: number;
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
  height = 100,
  headerImage,
  SidebarOptions = null,
  SidebarContent,
  showCloseButton = true,
  showScrollUpButton = true,
  hoverWidth,
  isMenuOpen,
  contentSignalState,
  innerHeight,
  openSidebar,
}: SidebarWrapperProps) => {
  const sidebarContentRef = useRef<any>(null);
  const theme = useTheme();

  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const scrollToTop = useCallback(() => {
    if (!sidebarContentRef.current) return;
    sidebarContentRef.current.scrollTop = 0;
  }, [sidebarContentRef]);

  const sidebarContent = useMemo(() => {
    return <>{SidebarContent}</>;
  }, [contentSignalState]);

  return (
    <Drawer
      id="sidebarDrawer"
      variant="persistent"
      anchor={anchor}
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          minWidth: { xs: "0px", sm: width },
          width: { xs: isMenuOpen ? "100%" : "auto", md: width },
          maxWidth: { xs: width, sm: "80px" },
          height: height < 100 && innerHeight ? `${(height / 100) * innerHeight}px` : `${height}%`,
          borderRight: "none",
          background: theme => (theme.palette.mode === "dark" ? "rgb(31,31,31)" : "rgb(240,240,240)"),
          boxShadow:
            !isMobile || isMenuOpen || openSidebar !== null
              ? theme =>
                  theme.palette.mode === "dark"
                    ? "-1px 0px 10px 4px rgba(190, 190, 190, 1)"
                    : "-1px 0px 10px 4px #3b3b3b"
              : "",
          ":-webkit-box-shadow":
            isMenuOpen || openSidebar !== null
              ? theme =>
                  theme.palette.mode === "dark"
                    ? "-1px 0px 10px 4px rgba(190, 190, 190, 1)"
                    : "-1px 0px 10px 4px #3b3b3b"
              : "",
          ":-moz-box-shadow":
            isMenuOpen || openSidebar !== null
              ? theme =>
                  theme.palette.mode === "dark"
                    ? "-1px 0px 10px 4px rgba(190, 190, 190, 1)"
                    : "-1px 0px 10px 4px #3b3b3b"
              : "",
          // left: open ? "0" : `${-width - 20}px`,
          ":hover": {
            maxWidth: { xs: width, sm: "50vw" },
            width: hoverWidth ? hoverWidth : undefined,
          },
          transition: "width 1s cubic-bezier(0.4, 0, 0.2, 1) ",
        },
      }}
    >
      {headerImage && (
        <Box sx={{ width }}>
          <Box>
            {height > 50 ? (
              <Box sx={{ position: "relative", height: "127px", width }}>
                <Image src={headerImage} alt="header image" width={width} height={127} />
                <Typography
                  component={"h2"}
                  sx={{
                    width: "100%",
                    position: "absolute",
                    bottom: 0,
                    paddingLeft: "13px",
                    fontSize: { xs: "24px", sm: "40px" },
                    background: theme =>
                      theme.palette.mode === "dark"
                        ? "linear-gradient(0deg, rgba(31, 31, 31, 1) 0%, rgba(31, 31, 31, 0) 100%)"
                        : "linear-gradient(0deg, rgb(255, 255, 255) 0%, rgba(255, 255, 255, 0) 100%)",
                  }}
                >
                  {title}
                </Typography>
              </Box>
            ) : (
              <>
                {title != "Proposals" && title != "Search Nodes" && (
                  <Typography
                    component={"h2"}
                    sx={{
                      width: "100%",
                      marginTop: "10px",
                      paddingLeft: "13px",
                      fontSize: { xs: "24px", sm: "40px" },
                      background: theme =>
                        theme.palette.mode === "dark"
                          ? "linear-gradient(0deg, rgba(31, 31, 31, 1) 0%, rgba(31, 31, 31, 0) 100%)"
                          : "linear-gradient(0deg, rgb(255, 255, 255) 0%, rgba(255, 255, 255, 0) 100%)",
                    }}
                  >
                    {title}
                  </Typography>
                )}
              </>
            )}
          </Box>
        </Box>
      )}
      <Box>{SidebarOptions}</Box>
      <Box
        ref={sidebarContentRef}
        sx={{
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
        {sidebarContent}
      </Box>

      {showCloseButton && (
        <Box sx={{ position: "absolute", top: "10px", right: "10px" }}>
          <Tooltip title="Close the sidebar." placement="left">
            <IconButton
              onClick={onClose}
              sx={{
                background: theme => (theme.palette.mode === "light" ? "rgb(240,240,240)" : "rgb(31,31,31)"),
                ":hover": {
                  background: theme =>
                    theme.palette.mode === "light" ? "rgba(240,240,240,0.7)" : "rgba(31,31,31,0.7)",
                },
              }}
            >
              <CloseIcon />
            </IconButton>
          </Tooltip>
        </Box>
      )}

      {showScrollUpButton && (
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
                  background: theme =>
                    theme.palette.mode === "light" ? "rgba(240,240,240,0.7)" : "rgba(31,31,31,0.7)",
                },
              }}
            >
              <ArrowUpwardIcon />
            </IconButton>
          </Tooltip>
        </Box>
      )}
    </Drawer>
  );
};
