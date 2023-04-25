import AccessTimeFilledOutlinedIcon from "@mui/icons-material/AccessTimeFilledOutlined";
import ArticleIcon from "@mui/icons-material/Article";
import BoltIcon from "@mui/icons-material/Bolt";
import { Box, Button, Paper, Stack, Typography } from "@mui/material";
import React from "react";

export const PracticeTool = () => {
  return (
    <Box
      sx={{
        position: "absolute",
        inset: "0px",
        background: theme =>
          theme.palette.mode === "dark" ? theme.palette.common.notebookG900 : theme.palette.common.notebookG900,
        zIndex: 1,
      }}
    >
      <Box sx={{ p: "48px 32px 32px 32px", borderBottom: theme => `solid 1px ${theme.palette.common.notebookG600}` }}>
        <Typography component={"h1"} sx={{ fontSize: "30px", fontWeight: 600 }}>
          1Cademy Assistant
        </Typography>
      </Box>
      <Box sx={{ p: "48px 100px" }}>
        <Box sx={{ maxWidth: "1040px", margin: "auto" }}>
          <Paper sx={{ p: "32px 40px 24px 40px", backgroundColor: theme => theme.palette.common.notebookMainBlack }}>
            <Typography
              sx={{ mb: "12px", color: theme => theme.palette.common.gray25, fontSize: "24px", fontWeight: 500 }}
            >
              Course 1
            </Typography>
            <Box sx={{ display: "flex", mb: "24px" }}>
              <Typography
                sx={{ mr: "48px", color: theme => theme.palette.common.gray25, fontSize: "16px", fontWeight: 500 }}
              >
                51%
              </Typography>
              <Typography
                sx={{ mr: "12px", color: theme => theme.palette.common.gray25, fontSize: "16px", fontWeight: 500 }}
              >
                500 / 999
              </Typography>
              <Typography sx={{ color: theme => theme.palette.common.gray25, fontSize: "16px", fontWeight: 500 }}>
                items learned
              </Typography>
            </Box>
            <Box
              sx={{
                mb: "24px",
                width: "100%",
                height: "18px",
                backgroundColor: theme => theme.palette.common.notebookG600,
                borderRadius: "8px",
              }}
            >
              <Box
                sx={{
                  width: "50%",
                  height: "100%",
                  backgroundColor: theme => theme.palette.common.primary800,
                  borderRadius: "8px",
                }}
              ></Box>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Stack direction={"row"} spacing={"24px"}>
                <Box sx={{ width: "50px", display: "flex", justifyContent: "space-between" }}>
                  <ArticleIcon sx={{ color: theme => theme.palette.common.yellow500 }} /> <Typography>8</Typography>
                </Box>
                <Box sx={{ width: "50px", display: "flex", justifyContent: "space-between" }}>
                  <AccessTimeFilledOutlinedIcon sx={{ color: theme => theme.palette.common.yellow500 }} />{" "}
                  <Typography>12</Typography>
                </Box>
                <Box sx={{ width: "50px", display: "flex", justifyContent: "space-between" }}>
                  <BoltIcon sx={{ color: theme => theme.palette.common.yellow500 }} /> <Typography>12</Typography>
                </Box>
              </Stack>
              <Button
                variant="contained"
                sx={{ backgroundColor: theme => theme.palette.common.primary800, borderRadius: "26px" }}
              >
                Review (12)
              </Button>
            </Box>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};
