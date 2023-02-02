import CloseIcon from "@mui/icons-material/Close";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import LogoutIcon from "@mui/icons-material/Logout";
import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search";
import { Link, Typography, useTheme } from "@mui/material";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Tooltip from "@mui/material/Tooltip";
import { Stack } from "@mui/system";
import { getAuth } from "firebase/auth";
import Image from "next/image";
import { useRouter } from "next/router";
import React, { useState } from "react";

import useThemeChange from "@/hooks/useThemeChange";

import LogoDarkMode from "../../public/DarkModeLogoMini.png";
import { useAuth } from "../context/AuthContext";
import ROUTES from "../lib/utils/routes";
import { capitalizeString } from "../lib/utils/string.utils";
import AppHeaderSearchBar from "./AppHeaderSearchBar2";
import { ONE_CADEMY_SECTIONS, OneCademySection } from "./home/SectionsItems";

export const HEADER_HEIGHT = 50;

type MenuBarProps = {
  items: OneCademySection[];
  onCloseMenu: () => void;
};

const MenuBar = ({ items, onCloseMenu }: MenuBarProps) => {
  return (
    <Stack
      direction={"column"}
      justifyContent={"space-between"}
      alignItems={"center"}
      sx={{ height: `calc(100vh - ${HEADER_HEIGHT}px)` }}
    >
      <Stack
        flex={1}
        direction={"column"}
        alignItems={"center"}
        justifyContent={"center"}
        spacing="32px"
        padding={"32px"}
      >
        {items.map(cur => {
          return (
            <Tooltip key={cur.id} title={cur.title}>
              <Link
                href={`#${cur.id}`}
                onClick={onCloseMenu}
                sx={{
                  color: theme => (theme.palette.mode === "dark" ? "common.white" : "common.black"),
                  cursor: "pointer",
                  textDecoration: "none",
                }}
              >
                {cur.label}
              </Link>
            </Tooltip>
          );
        })}
      </Stack>
      {/* TODO: add footer */}
      {/* <AppFooter /> */}
    </Stack>
  );
};

// type AppHeaderProps = {
//   switchSection: any;
//   homeClick: any;
// };

const AppHeader = () => {
  const [profileMenuOpen, setProfileMenuOpen] = useState(null);
  const isProfileMenuOpen = Boolean(profileMenuOpen);
  const [openMenu, setOpenMenu] = useState(false);
  const [{ isAuthenticated, user }] = useAuth();
  const router = useRouter();
  const [handleThemeSwitch] = useThemeChange();
  const theme = useTheme();

  const signOut = async () => {
    router.push(ROUTES.home);
    getAuth().signOut();
  };

  const handleProfileMenuOpen = (event: any) => {
    setProfileMenuOpen(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setProfileMenuOpen(null);
  };

  const renderProfileMenu = (
    <Menu id="ProfileMenu" anchorEl={profileMenuOpen} open={isProfileMenuOpen} onClose={handleProfileMenuClose}>
      {isAuthenticated && user && (
        <Typography sx={{ p: "6px 16px" }}>
          {capitalizeString(user.chooseUname ? user.uname : user.fName ?? "")}
        </Typography>
      )}
      {isAuthenticated && user && (
        <MenuItem sx={{ flexGrow: 3 }} onClick={signOut}>
          <LogoutIcon /> <span id="LogoutText">Logout</span>
        </MenuItem>
      )}
    </Menu>
  );

  const signUpHandler = () => {
    router.push(ROUTES.signIn);
  };

  return (
    <>
      <Box
        sx={{
          background: theme => (theme.palette.mode === "dark" ? "rgba(0,0,0,.72)" : "#f8f8f894"),
          backdropFilter: "saturate(180%) blur(20px)",
          position: "sticky",
          top: "0",
          zIndex: "22",
        }}
      >
        <Stack
          direction={"row"}
          justifyContent="space-between"
          alignItems="center"
          spacing={"16px"}
          sx={{ maxWidth: "1280px", margin: "auto", height: `${HEADER_HEIGHT}px` }}
        >
          <Stack direction={"row"} alignItems="center" spacing={"16px"}>
            <Tooltip title="1Cademy's Landing Page">
              <img
                src={LogoDarkMode.src}
                alt="logo"
                width="30px"
                height="30px"
                style={{ cursor: "pointer" }}
                onClick={() => router.push("/")}
              />
            </Tooltip>
            <Stack
              direction={"row"}
              aria-label="scrollable auto tabs navigation bar"
              spacing={"16px"}
              alignItems={"center"}
              justifyContent={"space-between"}
              sx={{
                display: {
                  xs: "none",
                  md: "flex",
                },
              }}
            >
              {ONE_CADEMY_SECTIONS.slice(1).map(cur => {
                return (
                  <Tooltip key={cur.id} title={cur.title}>
                    <Link
                      href={`#${cur.id}`}
                      sx={{
                        whiteSpace: "nowrap",
                        color: theme =>
                          theme.palette.mode === "dark" ? theme.palette.common.white : theme.palette.common.black,
                        cursor: "pointer",
                        textDecoration: "none",
                      }}
                    >
                      {cur.label}
                    </Link>
                  </Tooltip>
                );
              })}
            </Stack>
          </Stack>

          <Box sx={{ width: "100%", display: { xs: isAuthenticated ? "block" : "none", sm: "block" } }}>
            <AppHeaderSearchBar />
          </Box>
          {/* <Box sx={{ flexGrow: 1 }}>
            </Box> */}
          <Stack direction={"row"} justifyContent="flex-end" alignItems="center" spacing={"8px"}>
            {/* <Box > */}
            <Tooltip title="Open Searcher">
              <IconButton
                onClick={() => console.log("onClickSearcher")}
                sx={{ display: { xs: !isAuthenticated ? undefined : "none", sm: "none" } }}
                size="small"
              >
                <SearchIcon />
              </IconButton>
            </Tooltip>
            {/* </Box> */}

            <Tooltip title="Change theme">
              <IconButton onClick={handleThemeSwitch} size="small">
                {theme.palette.mode === "dark" ? <LightModeIcon /> : <DarkModeIcon />}
              </IconButton>
            </Tooltip>

            {!isAuthenticated && (
              <Tooltip title="Apply to join 1Cademy">
                <Button
                  variant="contained"
                  onClick={() => window?.open(ROUTES.apply, "_blank")}
                  sx={{
                    fontSize: 14,
                    borderRadius: 40,
                    height: "25px",
                    width: "60px",
                    textTransform: "capitalize",
                  }}
                >
                  Apply
                </Button>
              </Tooltip>
            )}

            {isAuthenticated && user ? (
              <Tooltip title={capitalizeString(user.chooseUname ? user.uname : user.fName ?? "")}>
                <IconButton onClick={handleProfileMenuOpen}>
                  <Box
                    sx={{
                      width: "26px",
                      height: "26px",
                      borderRadius: "30px",
                      color: theme => theme.palette.common.gray,
                    }}
                    aria-haspopup="true"
                    aria-controls="lock-menu"
                    aria-label={`${user.fName}'s Account`}
                    aria-expanded={isProfileMenuOpen ? "true" : undefined}
                  >
                    <Image
                      src={user.imageUrl || ""}
                      alt={user.fName}
                      width="26px"
                      height="26px"
                      quality={40}
                      objectFit="cover"
                      style={{
                        borderRadius: "30px",
                      }}
                    />
                  </Box>
                </IconButton>
                {/* <Box sx={{ width: "22px", height: "22px",  }}>
                  <Box
                    sx={{
                      width: "inherit",
                      height: "inherit",
                      borderRadius: "30px",
                      color: theme => theme.palette.common.gray,
                    }}
                    aria-haspopup="true"
                    aria-controls="lock-menu"
                    aria-label={`${user.fName}'s Account`}
                    aria-expanded={isProfileMenuOpen ? "true" : undefined}
                    onClick={handleProfileMenuOpen}
                  >
                    <Image
                      src={user.imageUrl || ""}
                      alt={user.fName}
                      width="22px"
                      height="22px"
                      quality={40}
                      objectFit="cover"
                      style={{
                        borderRadius: "30px",
                      }}
                    />
                  </Box>
                </Box> */}

                {/* <IconButton
                  aria-haspopup="true"
                  aria-controls="lock-menu"
                  aria-label={`${user.fName}'s Account`}
                  aria-expanded={isProfileMenuOpen ? "true" : undefined}
                  onClick={handleProfileMenuOpen}
                  color="inherit"
                > 
                </IconButton> */}
              </Tooltip>
            ) : (
              <Tooltip title="SIGN IN/UP">
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={signUpHandler}
                  sx={{
                    minWidth: "100px",
                    fontSize: 14,
                    backgroundColor: theme.palette.mode === "dark" ? "#303030" : "#e4e4e4",
                    color: theme.palette.mode === "dark" ? theme.palette.common.white : theme.palette.common.black,
                    borderRadius: 40,
                    height: "25px",
                    textTransform: "capitalize",
                    ":hover": {
                      backgroundColor: theme.palette.mode === "dark" ? "#444444" : "#cacaca",
                    },
                  }}
                >
                  Sign In/Up
                </Button>
              </Tooltip>
            )}

            <IconButton
              onClick={() => setOpenMenu(prev => !prev)}
              sx={{ display: { xs: "flex", md: "none" }, alignSelf: "center" }}
              size="small"
            >
              {openMenu ? <CloseIcon /> : <MenuIcon />}
            </IconButton>
          </Stack>
        </Stack>
        {isAuthenticated && user && renderProfileMenu}
        {openMenu && <MenuBar items={ONE_CADEMY_SECTIONS.slice(1)} onCloseMenu={() => setOpenMenu(false)} />}
      </Box>
    </>
  );
};

export const AppHeaderMemoized = React.memo(AppHeader);

export default AppHeaderMemoized;
