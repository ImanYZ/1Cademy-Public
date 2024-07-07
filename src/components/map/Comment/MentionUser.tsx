import { Paper, Typography } from "@mui/material";
import { Box } from "@mui/system";
import React from "react";

import OptimizedAvatar2 from "@/components/OptimizedAvatar2";

type UsersTagProps = {
  user: any;
};
export const MentionUser = ({ user }: UsersTagProps) => {
  return (
    <Paper
      elevation={3}
      sx={{
        display: "flex",
        flexDirection: "column",
        p: "10px",
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
              width: `${30}px`,
              height: `${30}px`,
              cursor: "pointer",

              borderRadius: "50%",
              "& > .user-image": {
                borderRadius: "50%",
                overflow: "hidden",
                width: "30px",
                height: "30px",
              },
            }}
          >
            <Box className="user-image">
              <OptimizedAvatar2 alt={""} size={30} imageUrl={user.imageUrl} sx={{ border: "none" }} />
            </Box>
            <Box sx={{ background: "#12B76A" }} className="UserStatusOnlineIcon" />
          </Box>
          <Box>
            <Box sx={{ display: "flex", width: "300px", alignItems: "center" }}>
              <Typography
                sx={{
                  fontSize: "16px",
                  fontWeight: "500",
                  lineHeight: "24px",
                }}
              >
                {user.display}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </Paper>
  );
};
