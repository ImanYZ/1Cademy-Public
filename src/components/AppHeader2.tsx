import CloseIcon from "@mui/icons-material/Close";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import LogoutIcon from "@mui/icons-material/Logout";
import MenuIcon from "@mui/icons-material/Menu";
import { Link, useTheme } from "@mui/material";
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
import AppHeaderSearchBar from "./AppHeaderSearchBar2";
import { ONE_CADEMY_SECTIONS, OneCademySection } from "./home/SectionsItems";

export const HEADER_HEIGHT = 50;

type MenuBarProps = {
  items: OneCademySection[];
  switchSection: any;
};

const MenuBar = ({ items, switchSection }: MenuBarProps) => {
  return (
    <Stack
      direction={"column"}
      justifyContent={"space-between"}
      alignItems={"center"}
      sx={{
        position: "absolute",
        top: "50px",
        bottom: "0px",
        left: "0px",
        right: "0px",
        background: "white",
        zIndex: "12",
      }}
    >
      <Stack flex={1} direction={"column"} alignItems={"center"} spacing="32px" padding={"16px"}>
        {items.map((cur, idx) => {
          return (
            <Tooltip key={cur.id} title={cur.title}>
              <Link
                onClick={switchSection(idx + 1)}
                sx={{ color: "common.black", cursor: "pointer", textDecoration: "none" }}
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

type AppHeaderProps = {
  switchSection: any;
  homeClick: any;
  joinUsClick: any;
};

const AppHeader = (props: AppHeaderProps) => {
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
        <MenuItem disabled sx={{ flexGrow: 3, color: "common.black", opacity: "1 !important" }}>
          {user.fName}
        </MenuItem>
      )}
      {isAuthenticated && user && (
        <>
          <MenuItem sx={{ flexGrow: 3 }} onClick={signOut}>
            <LogoutIcon /> <span id="LogoutText">Logout</span>
          </MenuItem>
        </>
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
          zIndex: "10",
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
                style={{ cursor: "pointer" }}
                onClick={props.homeClick}
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
              {ONE_CADEMY_SECTIONS.slice(1).map((cur, idx) => {
                return (
                  <Tooltip key={cur.id} title={cur.title}>
                    <Link
                      onClick={props.switchSection(idx + 1)}
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

          <AppHeaderSearchBar />
          {/* <Box sx={{ flexGrow: 1 }}>
            </Box> */}
          <Stack direction={"row"} justifyContent="flex-end" alignItems="center" spacing={"8px"}>
            <Tooltip title="Apply to join 1Cademy">
              <IconButton onClick={handleThemeSwitch}>
                {theme.palette.mode === "dark" ? <LightModeIcon /> : <DarkModeIcon />}
              </IconButton>
            </Tooltip>

            {!isAuthenticated && (
              <Tooltip title="Apply to join 1Cademy">
                <Button
                  variant="contained"
                  //   color="secondary"
                  onClick={props.joinUsClick}
                  sx={{
                    fontSize: 14,
                    // color: theme.palette.mode === "dark" ? theme.palette.common.white : theme.palette.common.black,
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
              <Tooltip title="Account">
                <IconButton>
                  <Box
                    sx={{
                      width: "22px",
                      height: "22px",
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

            {
              <IconButton
                onClick={() => setOpenMenu(prev => !prev)}
                sx={{ display: { xs: "flex", md: "none" }, alignSelf: "center" }}
                size="small"
              >
                {openMenu ? <CloseIcon /> : <MenuIcon />}
              </IconButton>
            }
          </Stack>
        </Stack>
        {isAuthenticated && user && renderProfileMenu}
      </Box>

      {openMenu && <MenuBar items={ONE_CADEMY_SECTIONS.slice(1)} switchSection={props.switchSection} />}
    </>
  );
};

export default AppHeader;
