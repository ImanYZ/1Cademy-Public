import { AppBar, Box, Tab, Tabs, Toolbar, Tooltip } from "@mui/material";
import Image from "next/image";
import React from "react";

import LogoDarkMode from "../../../public/DarkModeLogo.svg";

const OPTIONS: { id: string; title: string; label: string; route: string }[] = [
  { id: "01", label: "HOME", title: "HOME", route: "" },
  { id: "02", label: "STUDENTS", title: "STUDENTS", route: "" },
  { id: "03", label: "QUESTIONS", title: "QUESTIONS", route: "" },
  { id: "04", label: "SETTINGS", title: "SETTINGS", route: "" },
];

const HeaderNavbar = () => {
  <AppBar data-testid="app-nav-bar">
    <Toolbar sx={{ height: "var(--navbar-height)", justifyContent: "space-between" }}>
      <LightTooltip title="1Cademy's Landing Page">
        <Box
          color="inherit"
          onClick={() => open("https://1cademy.us/home#LandingSection", "_blank")}
          sx={{
            fontSize: 24,
            margin: "4px 0px 0px 0px",
            cursor: "pointer",
            mr: { xs: "20px", md: "0px" },
          }}
        >
          <Image src={LogoDarkMode.src} alt="logo" width="52px" height="70px" />
        </Box>
      </LightTooltip>
      <Tabs
        value={getTabSelected()}
        variant="scrollable"
        scrollButtons="auto"
        // allowScrollButtonsMobile
        aria-label="scrollable auto tabs navigation bar"
        sx={{
          px: "25px",
          marginLeft: "auto",
          fontWeight: 400,
          display: { xs: "none", md: "flex" },
          "& .MuiTab-root": {
            color: "#AAAAAA",
          },
          "& .MuiTab-root.Mui-selected": {
            color: "common.white",
          },
          "& .MuiTabs-indicator": {
            backgroundColor: "common.orange",
          },
        }}
      >
        {OPTIONS.map((page, idx) => (
          <LightTooltip key={idx} title={page.title}>
            <Tab
              //   onClick={event => {
              //     event.preventDefault();
              //     page.label === "NODE" ? router.push(page.route) : open(page.route, "_blank");
              //   }}
              color="inherit"
              label={page.label}
              aria-label={page.title}
              sx={{
                fontFamily: "Work Sans,sans-serif",
                fontSize: "15px",
                letterSpacing: "-1px",
              }}
            />
          </LightTooltip>
        ))}
      </Tabs>
      <Box sx={{ flex: 1, display: "flex", justifyContent: "flex-end" }}>
        {(router.route !== "/" || (router.route === "/" && showSearch)) && (
          <Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>{/* <AppHeaderSearchBar /> */}</Box>
        )}

        {/* 
        {showMenu && (
          <LightTooltip title="Account">
            <IconButton
              size="large"
              edge="end"
              onClick={onCloseMenu}
              color="inherit"
              sx={{
                display: { xs: "flex", md: "none" },
              }}
            >
              <CloseIcon sx={{ color: theme => theme.palette.common.white, m: "auto" }} fontSize="large" />
            </IconButton>
          </LightTooltip>
        )}

        {!showMenu && (
          <LightTooltip title="Account">
            <IconButton
              size="large"
              edge="end"
              onClick={onShowMenu}
              color="inherit"
              sx={{
                display: { xs: "flex", md: "none" },
              }}
            >
              <MenuIcon sx={{ color: theme => theme.palette.common.white }} fontSize="large" />
            </IconButton>
          </LightTooltip>
        )} */}
      </Box>
    </Toolbar>
  </AppBar>;
};

const LightTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: theme.palette.common.white,
    color: "rgba(0, 0, 0, 0.87)",
    boxShadow: "0px 10px 30px 5px rgba(0,0,0,0.5)",
    fontSize: 12,
  },
}));

export default HeaderNavbar;
