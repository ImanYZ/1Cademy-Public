import { Theme } from "@emotion/react";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import CloseIcon from "@mui/icons-material/Close";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { Drawer, DrawerProps, IconButton, Tooltip, Typography } from "@mui/material";
import { Box, SxProps } from "@mui/system";
import Image, { StaticImageData } from "next/image";
import React, { ReactNode, useCallback, useMemo, useRef } from "react";

import OptimizedAvatar2 from "@/components/OptimizedAvatar2";

type SidebarWrapperProps = {
  id?: string;
  title: string;
  open: boolean;
  onClose: () => void;
  SidebarContent: ReactNode;
  width: number;
  height?: number;
  SidebarOptions?: ReactNode;
  anchor?: DrawerProps["anchor"];
  headerImage?: StaticImageData;
  showCloseButton?: boolean;
  showScrollUpButton?: boolean;
  contentSignalState: any;
  innerHeight?: number;
  disabled?: boolean;
  sx?: SxProps<Theme>;
  sxContentWrapper?: SxProps<Theme>;
  moveBack?: any;
  sidebarType?: string | null;
  selectedChannel?: any;
  onlineUsers?: any;
  user?: any;
};
/**
 * Only Sidebar content should be scrollable
 */
export const SidebarWrapper = ({
  id,
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
  contentSignalState,
  innerHeight,
  disabled,
  sx,
  sxContentWrapper,
  moveBack = null,
  sidebarType = null,
  selectedChannel = null,
  onlineUsers,
  user,
}: SidebarWrapperProps) => {
  const sidebarContentRef = useRef<any>(null);

  const scrollToTop = useCallback(() => {
    if (!sidebarContentRef.current) return;
    sidebarContentRef.current.scrollTop = 0;
  }, [sidebarContentRef]);

  const sidebarContent = useMemo(() => {
    return <>{SidebarContent}</>;
  }, [contentSignalState]);

  const AvatarUser = ({ members }: any) => {
    const otherUser = Object.keys(members).filter((u: string) => u !== user?.uname)[0];
    const userInfo = members[otherUser];
    return (
      <Box sx={{ display: "flex", alignItems: "center", mt: 2 }}>
        <Box
          sx={{
            width: `30px`,
            height: `30px`,
            cursor: "pointer",
            transition: "all 0.2s 0s ease",
            background: "linear-gradient(143.7deg, #FDC830 15.15%, #F37335 83.11%);",
            borderRadius: "50%",
            "& > .user-image": {
              borderRadius: "50%",
              overflow: "hidden",
              width: "30px",
              height: "30px",
            },
            "@keyframes slidein": {
              from: {
                transform: "translateY(0%)",
              },
              to: {
                transform: "translateY(100%)",
              },
            },
          }}
        >
          <OptimizedAvatar2 alt={userInfo.fullname} imageUrl={userInfo.imageUrl} size={30} sx={{ border: "none" }} />
          <Box
            sx={{ background: onlineUsers.includes(userInfo.uname) ? "#12B76A" : "grey", fontSize: "1px" }}
            className="UserStatusOnlineIcon"
          />
        </Box>
        <Typography sx={{ pl: 2 }}>{userInfo.fullname}</Typography>
      </Box>
    );
  };
  return (
    <Drawer
      id="sidebarDrawer"
      variant="persistent"
      anchor={anchor}
      open={open}
      onClose={onClose}
      PaperProps={{
        id,
        sx: {
          maxHeight: "100vh",
          width: { xs: "100%", sm: width },
          height: height < 100 && innerHeight ? `${(height / 100) * innerHeight}px` : `${height}%`,
          borderRight: "none",
          background: theme => (theme.palette.mode === "dark" ? "#1B1A1A" : "#F9FAFB"),

          transition: "0.5s cubic-bezier(0.4, 0, 0.2, 1) !important",
          scrollBehavior: "smooth",
          "::-webkit-scrollbar-thumb": {
            borderRadius: "4px",
          },
          "::-webkit-scrollbar ": { width: "4px", height: "4px" },
          borderRadius: "6px",
          ":hover": {
            "::-webkit-scrollbar-thumb": {
              background: "rgba(119, 119, 119, 0.692)",
            },
          },
          ...sx,
          zIndex: 999,
        },
      }}
    >
      {sidebarType === "chat" && (
        <Box sx={{ display: "flex", alignItems: "center" }}>
          {moveBack && (
            <Tooltip title={"Go Back"}>
              <IconButton onClick={() => moveBack()} sx={{ mt: 2, ml: 2 }}>
                <ArrowBackIcon />
              </IconButton>
            </Tooltip>
          )}
          <Typography variant="h6" sx={{ ml: moveBack ? 2 : 0, p: 3, pb: 0, fontWeight: "bold" }}>
            {selectedChannel ? selectedChannel.title : "1Cademy Chat"}
          </Typography>
          {!!selectedChannel && !selectedChannel.title && <AvatarUser members={selectedChannel.membersInfo} />}
          {!!selectedChannel && !!selectedChannel.title && (
            <IconButton sx={{ mt: 3 }}>
              <MoreVertIcon />
            </IconButton>
          )}
        </Box>
      )}
      {title && (
        <Box>
          <Box>
            {!innerHeight || (height > 50 && innerHeight > 600) ? (
              <Box sx={{ position: "relative", height: headerImage ? "127px" : "auto", p: "24px", pb: 0 }}>
                {headerImage && <Image src={headerImage} alt="header image" width={width} height={127} />}
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Typography
                    component={"h2"}
                    sx={{
                      fontSize: { xs: "24px", sm: "40px" },
                      fontWeight: "700",
                      lineHeight: "29.05px",
                      marginBottom: headerImage ? "50px" : undefined,
                    }}
                  >
                    {title}
                  </Typography>
                </Box>
              </Box>
            ) : (
              <Box
                sx={{
                  height: "40px",
                }}
              >
                {title != "Proposals" && title != "Search Nodes" && (
                  <Typography
                    component={"h2"}
                    sx={{
                      width: "100%",
                      paddingLeft: "13px",
                      fontSize: { xs: "24px", sm: "40px" },
                      marginTop: "10px",
                    }}
                  >
                    {title}
                  </Typography>
                )}
              </Box>
            )}
          </Box>
        </Box>
      )}
      <Box>{SidebarOptions}</Box>
      <Box
        id={`${id}-content`}
        ref={sidebarContentRef}
        sx={{
          position: "relative",
          height: "100%",
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
        {sidebarContent}
      </Box>
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
