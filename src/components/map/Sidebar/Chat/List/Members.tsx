import { Button, Paper, Typography } from "@mui/material";
import { Box } from "@mui/system";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useState } from "react";

import OptimizedAvatar2 from "@/components/OptimizedAvatar2";
import { DESIGN_SYSTEM_COLORS } from "@/lib/theme/colors";

dayjs.extend(relativeTime);

type MemberProps = {
  selectedChannel: any;
  openUserInfoSidebar: any;
  onlineUsers: any;
  leading: boolean;
};
export const Members = ({ selectedChannel, openUserInfoSidebar, onlineUsers, leading }: MemberProps) => {
  const [openActions, setOpenActions] = useState<any>(null);
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "9px", marginTop: "9px" }}>
      {/* <Paper
        onClick={() => {}}
        elevation={3}
        className="CollapsedProposal collection-item"
        sx={{
          display: "flex",
          gap: "15px",
          padding: "12px 16px 10px 16px",
          borderRadius: "8px",
          boxShadow: theme =>
            theme.palette.mode === "light" ? "0px 1px 2px rgba(0, 0, 0, 0.06), 0px 1px 3px rgba(0, 0, 0, 0.1)" : "none",
          background: theme =>
            theme.palette.mode === "dark" ? theme.palette.common.notebookG700 : theme.palette.common.gray100,
          cursor: "pointer",
          ":hover": {
            background: theme =>
              theme.palette.mode === "dark" ? theme.palette.common.notebookG600 : theme.palette.common.gray200,
          },
        }}
      >
        <PersonAddIcon />
        <Typography>Add a member</Typography>
      </Paper> */}
      {openActions && (
        <Box
          sx={{
            position: "fixed",
            width: "23.8%",
            bottom: "0px",
            display: "flex",
            gap: "10px",
            flexDirection: "column",
            alignItems: "center",
            py: "10px",
          }}
        >
          {leading && (
            <Button
              sx={{
                width: "80%",
                height: "46px",
                borderRadius: "15px",
                color: theme =>
                  theme.palette.mode === "dark" ? DESIGN_SYSTEM_COLORS.baseWhite : DESIGN_SYSTEM_COLORS.gray900,
                background: theme =>
                  theme.palette.mode === "dark" ? DESIGN_SYSTEM_COLORS.notebookG600 : DESIGN_SYSTEM_COLORS.gray100,
                ":hover": {
                  background: theme =>
                    theme.palette.mode === "dark" ? DESIGN_SYSTEM_COLORS.notebookG500 : DESIGN_SYSTEM_COLORS.gray200,
                },
              }}
            >
              Remove member from chat
            </Button>
          )}
          <Button
            onClick={() => {
              openUserInfoSidebar(
                openActions.uname,
                openActions.imageUrl,
                openActions.fullname,
                openActions.chooseUname
              );
              setOpenActions(null);
            }}
            sx={{
              width: "80%",
              height: "46px",
              borderRadius: "15px",
              color: theme =>
                theme.palette.mode === "dark" ? DESIGN_SYSTEM_COLORS.baseWhite : DESIGN_SYSTEM_COLORS.gray900,
              background: theme =>
                theme.palette.mode === "dark" ? DESIGN_SYSTEM_COLORS.notebookG600 : DESIGN_SYSTEM_COLORS.gray100,
              ":hover": {
                background: theme =>
                  theme.palette.mode === "dark" ? DESIGN_SYSTEM_COLORS.notebookG500 : DESIGN_SYSTEM_COLORS.gray200,
              },
            }}
          >
            View Profile
          </Button>
          <Button
            onClick={() => {
              setOpenActions(null);
            }}
            sx={{
              width: "80%",
              height: "46px",
              borderRadius: "15px",
              color: theme =>
                theme.palette.mode === "dark" ? DESIGN_SYSTEM_COLORS.baseWhite : DESIGN_SYSTEM_COLORS.gray900,
              background: theme =>
                theme.palette.mode === "dark" ? DESIGN_SYSTEM_COLORS.notebookG600 : DESIGN_SYSTEM_COLORS.gray100,
              ":hover": {
                background: theme =>
                  theme.palette.mode === "dark" ? DESIGN_SYSTEM_COLORS.notebookG500 : DESIGN_SYSTEM_COLORS.gray200,
              },
            }}
          >
            Cancel
          </Button>
        </Box>
      )}
      {Object.keys(selectedChannel.membersInfo).map((member: any, idx: number) => (
        <Paper
          onClick={() => {
            setOpenActions(selectedChannel.membersInfo[member]);
          }}
          key={idx}
          elevation={3}
          className="CollapsedProposal collection-item"
          sx={{
            display: "flex",
            flexDirection: "column",
            padding: "12px 16px 10px 16px",
            borderRadius: "8px",
            boxShadow: theme =>
              theme.palette.mode === "light"
                ? "0px 1px 2px rgba(0, 0, 0, 0.06), 0px 1px 3px rgba(0, 0, 0, 0.1)"
                : "none",
            background: theme =>
              theme.palette.mode === "dark" ? theme.palette.common.notebookG700 : theme.palette.common.gray100,
            cursor: "pointer",
            ":hover": {
              background: theme =>
                theme.palette.mode === "dark" ? theme.palette.common.notebookG600 : theme.palette.common.gray200,
            },
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <Box
                sx={{
                  width: `40px`,
                  height: `40px`,
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
                <OptimizedAvatar2
                  alt={selectedChannel.membersInfo[member].fullname}
                  imageUrl={selectedChannel.membersInfo[member].imageUrl}
                  size={40}
                  sx={{ border: "none" }}
                />
                <Box
                  sx={{
                    background: onlineUsers.includes(selectedChannel.membersInfo[member].uname) ? "#12B76A" : "grey",
                    fontSize: "1px",
                  }}
                  className="UserStatusOnlineIcon"
                />
              </Box>
              <Box>
                <Typography
                  sx={{
                    fontSize: "16px",
                    fontWeight: "500",
                    lineHeight: "24px",
                  }}
                >
                  {selectedChannel.membersInfo[member].fullname}
                </Typography>
                <Typography
                  sx={{
                    fontSize: "14px",
                    color: theme =>
                      theme.palette.mode === "dark" ? theme.palette.common.notebookG200 : theme.palette.common.gray500,
                  }}
                >
                  @{selectedChannel.membersInfo[member].uname}
                </Typography>

                {/* <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <NextImage width={"20px"} src={TagIcon} alt="tag icon" />
                    <Box
                      sx={{
                        fontSize: "12px",
                        marginLeft: "5px",
                        color: theme =>
                          theme.palette.mode === "dark"
                            ? theme.palette.common.notebookG200
                            : theme.palette.common.gray500,
                      }}
                    >
                      Tag
                    </Box>
                  </Box>
                </Box> */}
              </Box>
            </Box>
          </Box>
        </Paper>
      ))}
    </Box>
  );
};
