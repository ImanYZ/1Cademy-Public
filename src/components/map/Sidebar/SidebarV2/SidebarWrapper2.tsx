import { Theme } from "@emotion/react";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import CloseIcon from "@mui/icons-material/Close";
import { Drawer, DrawerProps, IconButton, Tooltip, Typography } from "@mui/material";
import { Box, SxProps } from "@mui/system";
import Image, { StaticImageData } from "next/image";
import React, { ReactNode, useCallback, useRef } from "react";

import { Z_INDEX } from "@/lib/utils/constants";

type SidebarWrapperProps = {
  id?: string;
  title: string;
  open: boolean;
  onClose: () => void;
  SidebarContent: ReactNode;
  SidebarOptions?: ReactNode;
  width?: number;
  anchor?: DrawerProps["anchor"];
  headerImage?: StaticImageData;
  showCloseButton?: boolean;
  showScrollUpButton?: boolean;
  disabled?: boolean;
  sx?: SxProps<Theme>;
  sxContentWrapper?: SxProps<Theme>;
};
/**
 * Only Sidebar content should be scrollable
 */
export const SidebarWrapper2 = ({
  id,
  title,
  open,
  onClose,
  anchor = "left",
  width = 430,
  headerImage,
  SidebarOptions = null,
  SidebarContent,
  showCloseButton = true,
  showScrollUpButton = true,
  disabled,
  sx,
  sxContentWrapper,
}: SidebarWrapperProps) => {
  const sidebarContentRef = useRef<any>(null);

  const scrollToTop = useCallback(() => {
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
        id,
        className: "scroll-styled",
        sx: {
          maxHeight: "100vh",
          width: { xs: "100%", sm: width },
          borderRight: "none",
          background: theme => (theme.palette.mode === "dark" ? "#1B1A1A" : "#F9FAFB"),
          transition: "0.5s cubic-bezier(0.4, 0, 0.2, 1) !important",
          scrollBehavior: "smooth",
          borderRadius: "6px",
          ":hover": {
            "::-webkit-scrollbar-thumb": {
              background: "rgba(119, 119, 119, 0.692)",
            },
          },
          zIndex: Z_INDEX.sidebars,
          ...sx,
        },
      }}
    >
      {title && (
        <Box sx={{ position: "relative", height: headerImage ? "127px" : "auto", p: "24px" }}>
          {headerImage && <Image src={headerImage} alt="header image" width={width} height={127} />}
          <Typography
            component={"h2"}
            sx={{
              fontSize: "24px",
              fontWeight: "700",
              lineHeight: "29.05px",
              marginBottom: headerImage ? "50px" : undefined,
            }}
          >
            {title}
          </Typography>
        </Box>
      )}

      {open && (
        <>
          <Box id={`${id}-options`}>{SidebarOptions}</Box>
          <Box
            id={`${id}-content`}
            ref={sidebarContentRef}
            sx={{
              position: "relative",
              overflowX: "hidden",
              overflowY: "auto",
              scrollBehavior: "smooth",
              "::-webkit-scrollbar-thumb": {
                background: "rgba(119, 119, 119, 0.692)",
                borderRadius: "4px",
              },
              "::-webkit-scrollbar ": { width: "4px", height: "4px" },
              borderRadius: "6px",
              ...sxContentWrapper,
            }}
          >
            {SidebarContent}
          </Box>
        </>
      )}
      {showScrollUpButton && (
        <Box
          sx={{
            position: "fixed",
            bottom: "10px",
            left: `${width - 56}px`,
            display: "flex",
            justifyContent: "flex-end",
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
      {showCloseButton && (
        <Box
          sx={{
            position: "absolute",
            top: { xs: "0px", sm: "10px" },
            right: "10px",
          }}
        >
          <Tooltip title="Close the sidebar." placement="left">
            <IconButton
              disabled={disabled}
              onClick={onClose}
              sx={{
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
    </Drawer>
  );
};
