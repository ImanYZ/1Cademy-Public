import { Paper, Typography } from "@mui/material";
import { Box } from "@mui/system";
import React from "react";

import OptimizedAvatar2 from "@/components/OptimizedAvatar2";
type UsersTagProps = {
  user: any;
};
export const UsersTag = ({ user }: UsersTagProps) => {
  return (
    <Paper
      elevation={3}
      className="CollapsedProposal collection-item"
      sx={{
        display: "flex",
        flexDirection: "column",
        padding: "10px 10px 10px 10px",

        boxShadow: "none",
        background: theme =>
          theme.palette.mode === "dark" ? theme.palette.common.notebookG700 : theme.palette.common.gray100,
        marginBottom: "5px",
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
              width: `${50}px`,
              height: `${50}px`,
              cursor: "pointer",
              transition: "all 0.2s 0s ease",
              background: "linear-gradient(143.7deg, #FDC830 15.15%, #F37335 83.11%);",
              borderRadius: "50%",
              // transform: `translate(-50%, ${verticalPosition}px)`,
              "& > .user-image": {
                borderRadius: "50%",
                overflow: "hidden",
                width: "50px",
                height: "50px",
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
            <Box className="user-image">
              <OptimizedAvatar2 alt={"Haroon Waheed"} imageUrl={user.imageUrl} size={50} sx={{ border: "none" }} />
            </Box>
            <Box sx={{ background: "#12B76A", left: "35px" }} className="UserStatusOnlineIcon" />
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
                {user.display}
              </Typography>
            </Box>
            {/* <Typography
            sx={{
              fontSize: "12px",
              color: theme =>
                theme.palette.mode === "dark" ? theme.palette.common.notebookG200 : theme.palette.common.gray500,
            }}
          >
            
            {list.tag}
          </Typography> */}
          </Box>
        </Box>
      </Box>
    </Paper>
  );
};
