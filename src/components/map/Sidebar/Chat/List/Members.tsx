import { Button, Drawer, Paper, Typography } from "@mui/material";
import { Box } from "@mui/system";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Firestore, updateDoc } from "firebase/firestore";
import { useState } from "react";

import OptimizedAvatar2 from "@/components/OptimizedAvatar2";
import { DESIGN_SYSTEM_COLORS } from "@/lib/theme/colors";
import { generateChannelName } from "@/lib/utils/chat";

dayjs.extend(relativeTime);

type MemberProps = {
  db: Firestore;
  user: any;
  selectedChannel: any;
  openUserInfoSidebar: any;
  onlineUsers: any;
  leading: boolean;
  sidebarWidth: number;
  getChannelRef: any;
};
export const Members = ({
  user,
  selectedChannel,
  openUserInfoSidebar,
  onlineUsers,
  leading,
  sidebarWidth,
  getChannelRef,
}: MemberProps) => {
  const [openActions, setOpenActions] = useState<any>(null);

  const removeMember = (member: any) => {
    const membersInfo = selectedChannel.membersInfo;
    const members = selectedChannel.members;
    const filteredMembers = members.filter((mber: any) => mber !== member?.uname);
    delete membersInfo[member?.uname];
    const channelRef = getChannelRef(selectedChannel?.id);
    updateDoc(channelRef, {
      title: generateChannelName(membersInfo, user),
      members: filteredMembers,
      membersInfo,
    });
    setOpenActions(null);
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "9px", marginTop: "9px" }}>
      {/* {!newMemberSection && roomType === "direct" && (
        <Paper
          onClick={() => setNewMemberSection(true)}
          elevation={3}
          className="CollapsedProposal collection-item"
          sx={{
            display: "flex",
            gap: "15px",
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
          <PersonAddIcon />
          <Typography>Add a member</Typography>
        </Paper>
      )} */}

      <Drawer
        anchor={"bottom"}
        open={openActions}
        onClose={() => setOpenActions(null)}
        sx={{
          "&.MuiDrawer-root > .MuiPaper-root": {
            width: sidebarWidth,
          },
        }}
      >
        {leading && openActions?.uname !== user?.uname && Object.keys(selectedChannel.membersInfo).length > 2 && (
          <Button
            sx={{
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
            onClick={() => removeMember(openActions)}
          >
            Remove member from chat
          </Button>
        )}
        <Button
          onClick={() => {
            openUserInfoSidebar(openActions.uname, openActions.imageUrl, openActions.fullname, openActions.chooseUname);
            setOpenActions(null);
          }}
          sx={{
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
      </Drawer>

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
