import LogoutIcon from "@mui/icons-material/Logout";
import NotificationsIcon from "@mui/icons-material/Notifications";
import SearchIcon from "@mui/icons-material/Search";
import { Tab, Tabs, Typography } from "@mui/material";
import { Box } from "@mui/system";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import NextImage from "next/image";
import React from "react";

import { DESIGN_SYSTEM_COLORS } from "@/lib/theme/colors";

import TagIcon from "../../../../../../public/tag.svg";
import { Members } from "./Members";
import { Nodes } from "./Nodes";

dayjs.extend(relativeTime);

export const Summary = () => {
  const [value, setValue] = React.useState(0);
  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };
  const a11yProps = (index: number) => {
    return {
      "aria-controls": `simple-tabpanel-${index}`,
    };
  };
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "9px", alignItems: "center" }}>
      <Box
        sx={{
          width: "70px",
          height: "70px",
          borderRadius: "200px",

          background: "linear-gradient(to right, #FDC830, #F37335)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {"Haroon Waheed"
          .split(" ")
          .slice(0, 2)
          .map((word: string) => word[0])
          .join(" ")}
      </Box>
      <Typography sx={{ fontWeight: "500", fontSize: "17px" }}>Public</Typography>
      <Box
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
              fontSize: "14px",
              marginLeft: "5px",
            }}
          >
            1Cademy
          </Box>
        </Box>
      </Box>
      <Typography
        sx={{
          color: theme =>
            theme.palette.mode === "dark" ? DESIGN_SYSTEM_COLORS.notebookG200 : DESIGN_SYSTEM_COLORS.gray500,
        }}
      >
        234 members, 734 online
      </Typography>
      <Box sx={{ display: "flex", gap: "10px" }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: "100px",
            height: "100px",
            borderRadius: "8px",
            cursor: "pointer",
            background: theme =>
              theme.palette.mode === "dark" ? DESIGN_SYSTEM_COLORS.notebookG600 : DESIGN_SYSTEM_COLORS.gray200,
            ":hover": {
              background: theme =>
                theme.palette.mode === "dark" ? DESIGN_SYSTEM_COLORS.notebookG500 : DESIGN_SYSTEM_COLORS.gray250,
            },
          }}
        >
          <Box>
            <SearchIcon />
          </Box>
          <Typography>Search</Typography>
        </Box>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: "100px",
            height: "100px",
            borderRadius: "8px",
            cursor: "pointer",
            background: theme =>
              theme.palette.mode === "dark" ? DESIGN_SYSTEM_COLORS.notebookG600 : DESIGN_SYSTEM_COLORS.gray200,
            ":hover": {
              background: theme =>
                theme.palette.mode === "dark" ? DESIGN_SYSTEM_COLORS.notebookG500 : DESIGN_SYSTEM_COLORS.gray250,
            },
          }}
        >
          <Box>
            <NotificationsIcon />
          </Box>
          <Typography>Mute</Typography>
        </Box>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: "100px",
            height: "100px",
            borderRadius: "8px",
            cursor: "pointer",
            background: theme =>
              theme.palette.mode === "dark" ? DESIGN_SYSTEM_COLORS.notebookG600 : DESIGN_SYSTEM_COLORS.gray200,
            ":hover": {
              background: theme =>
                theme.palette.mode === "dark" ? DESIGN_SYSTEM_COLORS.notebookG500 : DESIGN_SYSTEM_COLORS.gray250,
            },
          }}
        >
          <Box>
            <LogoutIcon />
          </Box>
          <Typography>Leave</Typography>
        </Box>
      </Box>
      <Box
        sx={{
          marginTop: "20px",
          borderBottom: 1,
          borderColor: theme => (theme.palette.mode === "dark" ? "black" : "divider"),
          width: "100%",
        }}
      >
        <Tabs value={value} onChange={handleChange} aria-label={"Bookmarks Tabs"} variant="fullWidth">
          {[{ title: "Members" }, { title: "Nodes" }, { title: "Media" }].map((tabItem: any, idx: number) => (
            <Tab
              key={tabItem.title}
              id={`chat-tab-${tabItem.title.toLowerCase()}`}
              label={tabItem.title}
              {...a11yProps(idx)}
            />
          ))}
        </Tabs>
      </Box>
      <Box sx={{ width: "100%" }}>
        {value === 0 && <Members />}
        {value === 1 && <Nodes />}
        {value === 2 && <Members />}
      </Box>
    </Box>
  );
};
