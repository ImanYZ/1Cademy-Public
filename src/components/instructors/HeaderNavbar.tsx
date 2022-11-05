import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { AppBar, Box, Button, styled, Tab, Tabs, Toolbar, Tooltip, tooltipClasses, TooltipProps } from "@mui/material";
import Image from "next/image";
import { useRouter } from "next/router";
import React from "react";

import LogoDarkMode from "../../../public/DarkModeLogo.svg";

const OPTIONS: { id: string; title: string; label: string; route: string }[] = [
  // { id: "01", label: "HOME", title: "HOME", route: "/dashboard" },
  { id: "02", label: "DASHBOARD", title: "DASHBOARD", route: "/instructors/dashboard" },
  // { id: "03", label: "STUDENTS", title: "STUDENTS", route: "/instructors/students" },
  { id: "04", label: "QUESTIONS", title: "QUESTIONS", route: "/instructors/questions" },
  { id: "05", label: "SETTINGS", title: "SETTINGS", route: "/instructors/settings" },
];

type HeaderNavbarProps = {};
const HeaderNavbar = ({}: HeaderNavbarProps) => {
  const router = useRouter();

  console.log("router.route", router.route);

  const getTabSelected = () => {
    const tabSelected = OPTIONS.findIndex(cur => cur.route === router.route);
    return tabSelected >= 0 ? tabSelected : false;
  };
  return (
    <AppBar data-testid="app-nav-bar" position="sticky">
      <Toolbar sx={{ height: "75px", justifyContent: "space-between" }}>
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
                onClick={event => {
                  event.preventDefault();
                  router.push(page.route);
                }}
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
        <Box sx={{ flex: 1, display: "flex", justifyContent: "flex-end", gap: "24px" }}>
          <Button color="secondary" sx={{ wordBreak: "normal", width: "233px", p: "12px 24px 12px 37px" }}>
            <ArrowForwardIosIcon fontSize="small" sx={{ mr: "20px" }} />
            GO TO NOTEBOOK
          </Button>
          <Box
            sx={{
              width: "55px",
              height: "55px",
              position: "relative",
              // borderRadius: "50%",
              // border: "solid 2px",
              // borderColor: theme => theme.palette.common.gray,
              color: theme => theme.palette.common.gray,
            }}
          >
            <Image
              src={"/lightModeLibraryBackground.jpg"}
              alt={"name"}
              width="55px"
              height="55px"
              quality={40}
              objectFit="cover"
              style={{
                borderRadius: "50%",
              }}
            />
          </Box>
          {/* <Box
            sx={{
              width: "55px",
              height: "55px",
              border: "solid 2px",
              borderColor: theme => theme.palette.common.gray,
              color: theme => theme.palette.common.gray,
              borderRadius: "30px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: theme => theme.palette.common.white,
            }}
          >
            <Image src={"/lightModeLibraryBackground.jpg"} alt={name} width="33px" height="24px" quality={40} />
          </Box> */}

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
    </AppBar>
  );
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
