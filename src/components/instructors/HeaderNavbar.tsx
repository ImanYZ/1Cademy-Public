import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { AppBar, Box, Button, styled, Tab, Tabs, Toolbar, Tooltip, tooltipClasses, TooltipProps } from "@mui/material";
import Image from "next/image";
import { useRouter } from "next/router";
import React from "react";

import LogoDarkMode from "../../../public/DarkModeLogo.svg";
import { User } from "../../knowledgeTypes";
import { Option } from "../layouts/InstructorsLayout";

type HeaderNavbarProps = { options: Option[]; user: User };
const HeaderNavbar = ({ options, user }: HeaderNavbarProps) => {
  const router = useRouter();

  const getTabSelected = () => {
    const tabSelected = options.findIndex(cur => cur.route === router.route);
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
        {user.role === "INSTRUCTOR" && (
          <Tabs
            value={getTabSelected()}
            variant="scrollable"
            scrollButtons="auto"
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
            {options.map((page, idx) => (
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
        )}
        <Box sx={{ flex: 1, display: "flex", justifyContent: "flex-end", gap: "24px" }}>
          <Button
            onClick={() => router.push("/dashboard")}
            color="secondary"
            sx={{ wordBreak: "normal", width: "233px", p: "12px 24px 12px 37px" }}
          >
            <ArrowForwardIosIcon fontSize="small" sx={{ mr: "20px" }} />
            GO TO NOTEBOOK
          </Button>
          <Box
            sx={{
              width: "55px",
              height: "55px",
              position: "relative",
              color: theme => theme.palette.common.gray,
            }}
          >
            <Tooltip title={user.role ?? ""}>
              <Image
                src={user.imageUrl}
                alt={"name"}
                width="55px"
                height="55px"
                quality={40}
                objectFit="cover"
                style={{
                  borderRadius: "50%",
                }}
              />
            </Tooltip>
          </Box>
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
