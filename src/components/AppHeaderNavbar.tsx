import CloseIcon from "@mui/icons-material/Close";
import MenuIcon from "@mui/icons-material/Menu";
import { Box, Button, IconButton, Tab, Tabs } from "@mui/material";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Tooltip, { tooltipClasses, TooltipProps } from "@mui/material/Tooltip";
import { styled } from "@mui/system";
import { getAuth } from "firebase/auth";
import Image from "next/image";
import { useRouter } from "next/router";
import { FC } from "react";

import SECTIONS from "@/lib/utils/navbarSections";

import LogoDarkMode from "../../public/DarkModeLogo.svg";
import AppHeaderSearchBar from "./AppHeaderSearchBar";

type Props = {
  showApply?: boolean;
  showMenu: boolean;
  showSearch: boolean;
  onCloseMenu: () => void;
  onShowMenu: () => void;
  isSignedIn: boolean;
};
const AppAppBar: FC<Props> = ({
  showApply = true,
  showMenu = false,
  showSearch = false,
  onCloseMenu,
  onShowMenu,
  isSignedIn,
}) => {
  const router = useRouter();

  const handleSignout = async () => {
    //TODO: Remove thhis button before deploying
    await getAuth().signOut();
    router.push("/signin");
  };
  const onRedirectToSignin = () => {
    router.push("/signin");
  };
  const getTabSelected = () => {
    const tabSelected = SECTIONS.findIndex(cur => cur.route === router.route);
    return tabSelected >= 0 ? tabSelected : false;
  };

  return (
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
          {SECTIONS.map((page, idx) => (
            <LightTooltip key={idx} title={page.title}>
              <Tab
                onClick={event => {
                  event.preventDefault();
                  page.label === "NODE" ? router.push(page.route) : open(page.route, "_blank");
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
        <Box sx={{ flex: 1, display: "flex", justifyContent: "flex-end", gap: "10px" }}>
          {(router.route !== "/" || (router.route === "/" && showSearch)) && (
            <Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
              <AppHeaderSearchBar />
            </Box>
          )}

          {showApply && (
            <LightTooltip title="Apply to join 1Cademy">
              <Button
                variant="contained"
                color="primary"
                href="https://1cademy.us/home#JoinUsSection"
                target="_blank"
                rel="noreferrer"
                sx={{
                  minWidth: "90px",
                  display: { xs: "none", md: "block" },
                  fontSize: 16,
                  fontWeight: "700",
                  color: "common.white",
                  p: "6px 16px",
                  my: "auto",
                  borderRadius: 40,
                  textAlign: "center",
                }}
              >
                APPLY!
              </Button>
            </LightTooltip>
          )}

          {isSignedIn ? (
            <LightTooltip title="Sign Out">
              <Button
                variant="outlined"
                onClick={handleSignout}
                sx={{
                  color: theme => theme.palette.common.white,
                  borderColor: theme => theme.palette.common.white,
                  minWidth: "116px",
                  display: { xs: "none", md: "block" },
                  fontSize: 16,
                  fontWeight: "700",

                  my: "auto",
                  borderRadius: 40,
                  textAlign: "center",
                  width: "152px",
                }}
              >
                SIGN OUT
              </Button>
            </LightTooltip>
          ) : (
            <LightTooltip title="Sign In/Out">
              <Button
                variant="outlined"
                onClick={onRedirectToSignin}
                sx={{
                  color: theme => theme.palette.common.white,
                  borderColor: theme => theme.palette.common.white,
                  minWidth: "120px",
                  display: { xs: "none", md: "block" },
                  fontSize: 16,
                  fontWeight: "700",
                  my: "auto",
                  borderRadius: 40,
                  textAlign: "center",
                }}
              >
                SIGN IN/UP
              </Button>
            </LightTooltip>
          )}

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
          )}
        </Box>
      </Toolbar>
    </AppBar>
    // </div >
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

export default AppAppBar;
