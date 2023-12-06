import SearchIcon from "@mui/icons-material/Search";
import { Chip, FormControlLabel, ListItemText, Paper, Radio, Stack, TextField, Typography } from "@mui/material";
import { Box } from "@mui/system";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import React, { useEffect, useState } from "react";

import OptimizedAvatar2 from "@/components/OptimizedAvatar2";
import { DESIGN_SYSTEM_COLORS } from "@/lib/theme/colors";

dayjs.extend(relativeTime);

export const Forward = () => {
  const [users, setUsers] = useState<any>([]);
  useEffect(() => {
    setUsers([
      { title: "Phoneix Baker", tag: "1cademy", totalMessages: 100, createdAt: "11:34 am" },
      { title: "1man Yechezaare", tag: "Design Science", totalMessages: 100, createdAt: "11:34 am" },
      { title: "Sam Ouhra", tag: "1cademy", totalMessages: 100, createdAt: "11:34 am" },
      { title: "Ameer Hamza", tag: "Data Science", totalMessages: 100, createdAt: "11:34 am" },
    ]);
  }, []);
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "5px" }}>
      <Typography sx={{ color: DESIGN_SYSTEM_COLORS.notebookG200 }}>To:</Typography>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingY: "10px" }}>
        <TextField
          sx={{
            width: "100%",
          }}
          placeholder="Search"
          id="outlined-basic"
          variant="outlined"
          InputProps={{
            inputProps: {
              style: {
                padding: "9.5px 14px",
              },
            },
            startAdornment: <SearchIcon />,
          }}
        />
      </Box>
      <Stack direction="row" spacing={1} flexWrap="wrap" gap={"3px"}>
        <Chip label="Phoneix Baker" variant="outlined" onDelete={() => {}} />
        <Chip label="1man Yechezaare" variant="outlined" onDelete={() => {}} />
        <Chip label="Sam Ouhra" variant="outlined" onDelete={() => {}} />
        <Chip label="Ameer Hamza" variant="outlined" onDelete={() => {}} />
      </Stack>
      <Typography sx={{ color: DESIGN_SYSTEM_COLORS.notebookG200 }}>Recommendations</Typography>
      {users.map((user: any, idx: number) => (
        <Paper
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
                width: "95%",
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
                  <OptimizedAvatar2
                    alt={"Haroon Waheed"}
                    imageUrl={
                      "https://firebasestorage.googleapis.com/v0/b/onecademy-1.appspot.com/o/ProfilePictures%2FJqxTY6ZE08dudguFF0KDPqbkoZt2%2FWed%2C%2018%20Jan%202023%2022%3A14%3A06%20GMT_430x1300.jpeg?alt=media&token=9ef2b4e0-1d78-483a-ae3d-79c2007dfb31"
                    }
                    size={50}
                    sx={{ border: "none" }}
                  />
                </Box>
                <Box sx={{ background: "#12B76A", left: "35px" }} className="UserStatusOnlineIcon" />
              </Box>
              <Box>
                <Box sx={{ width: "390px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Typography
                    sx={{
                      fontSize: "16px",
                      fontWeight: "500",
                      lineHeight: "24px",
                    }}
                  >
                    {user.title}
                  </Typography>
                </Box>
                <Typography
                  sx={{
                    fontSize: "12px",
                    color: theme =>
                      theme.palette.mode === "dark" ? theme.palette.common.notebookG200 : theme.palette.common.gray500,
                  }}
                >
                  {user.tag}
                </Typography>
              </Box>
            </Box>
            <FormControlLabel control={<Radio />} label={<ListItemText />} />
          </Box>
        </Paper>
      ))}
    </Box>
  );
};
