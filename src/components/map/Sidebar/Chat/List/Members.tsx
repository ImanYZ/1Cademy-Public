import { Button, Paper, Typography } from "@mui/material";
import { Box } from "@mui/system";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useState } from "react";

import { DESIGN_SYSTEM_COLORS } from "@/lib/theme/colors";

dayjs.extend(relativeTime);

type MemberProps = {
  selectedChannel: any;
  openUserInfoSidebar: any;
};
export const Members = ({ selectedChannel, openUserInfoSidebar }: MemberProps) => {
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
            background: theme =>
              theme.palette.mode === "dark" ? DESIGN_SYSTEM_COLORS.notebookG700 : DESIGN_SYSTEM_COLORS.gray25,
            py: "10px",
          }}
        >
          <Button
            sx={{
              width: "95%",
              height: "46px",
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
              width: "95%",
              height: "46px",
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
              width: "95%",
              height: "46px",
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
                  width: "50px",
                  height: "50px",
                  borderRadius: "200px",
                  background: "linear-gradient(to right, #FDC830, #F37335)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {selectedChannel.membersInfo[member].fullname
                  .split(" ")
                  .slice(0, 2)
                  .map((word: string) => word[0])
                  .join(" ")}
              </Box>
              <Box>
                <Box sx={{ width: "350px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
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
                        theme.palette.mode === "dark"
                          ? theme.palette.common.notebookG200
                          : theme.palette.common.gray500,
                    }}
                  >
                    @{selectedChannel.membersInfo[member].uname}
                  </Typography>
                </Box>
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
