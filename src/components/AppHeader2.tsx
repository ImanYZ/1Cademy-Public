import CloseIcon from "@mui/icons-material/Close";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import LightModeIcon from "@mui/icons-material/LightMode";
import LogoutIcon from "@mui/icons-material/Logout";
import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search";
import { ClickAwayListener, Collapse, Link, Modal, Theme, Typography, useMediaQuery, useTheme } from "@mui/material";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Tooltip from "@mui/material/Tooltip";
import { Stack, SxProps } from "@mui/system";
import { getAuth } from "firebase/auth";
import Image from "next/image";
import { useRouter } from "next/router";
import React, { useState } from "react";

import useThemeChange from "@/hooks/useThemeChange";
import { gray50, gray200, gray300, gray600, gray700, gray900, orange900, orangeDark } from "@/pages/home";

import oneCademyLogo from "../../public/DarkmodeLogo.png";
import oneCademyLogoExtended from "../../public/logo-extended.png";
import { useAuth } from "../context/AuthContext";
import ROUTES from "../lib/utils/routes";
import { capitalizeString } from "../lib/utils/string.utils";
import AppHeaderSearchBar from "./AppHeaderSearchBar2";
import AssistantForm from "./assistant/AssistantRegister";
import { HomepageSection } from "./home/SectionsItems";
import SearcherPupUp from "./SearcherPupUp";

export const HEADER_HEIGHT = 80;
export const HEADER_HEIGHT_MOBILE = 72;

type MenuBarProps = {
  items: HomepageSection[];
  onCloseMenu: (sectionId: string) => void;
  selectedSectionId: string;
};

const MenuBar = ({ items, onCloseMenu, selectedSectionId }: MenuBarProps) => {
  const [idxOptionVisible, setIdxOptionVisible] = useState(-1);
  const [{ isAuthenticated }] = useAuth();
  const router = useRouter();

  const signUpHandler = () => {
    router.push(ROUTES.signIn);
  };

  return (
    <Stack
      direction={"column"}
      alignItems={"self-start"}
      sx={{
        height: {
          xs: `calc(100vh - ${HEADER_HEIGHT_MOBILE}px)`,
          md: `calc(100vh - ${HEADER_HEIGHT}px)`,
          overflowY: "auto",
        },
      }}
    >
      <Stack width={"100%"} direction={"column"} spacing="32px" sx={{ padding: { xs: "32px 16px", md: "32px" } }}>
        {items.map((cur, idx) => {
          return cur.options.length ? (
            <Box key={cur.id} sx={{ border: "solid 1 red" }}>
              <Box sx={{ display: "flex" }}>
                <Link
                  href={`#${cur.id}`}
                  onClick={() => onCloseMenu(cur.id)}
                  sx={{
                    color: theme => (theme.palette.mode === "dark" ? gray200 : gray600),
                    cursor: "pointer",
                    textDecoration: "none",
                    borderBottom: selectedSectionId === cur.id ? `solid 2px ${orangeDark}` : undefined,
                  }}
                >
                  {cur.label}
                </Link>
                <IconButton
                  onClick={() => setIdxOptionVisible(prev => (prev === idx ? -1 : idx))}
                  size="small"
                  sx={{ p: "0px", ml: { xs: "4px", lg: "13px" } }}
                >
                  {idxOptionVisible === idx ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                </IconButton>
              </Box>
              <SubMenu
                onCloseSubMenu={() => setIdxOptionVisible(-1)}
                sectionVisible={items[idxOptionVisible]}
                sx={{
                  border: theme => `solid 1px ${theme.palette.mode === "dark" ? "#FFFFFF4D" : gray200}`,
                  borderRadius: "12px",
                }}
              />
            </Box>
          ) : (
            <Link
              key={cur.id}
              href={`#${cur.id}`}
              onClick={() => onCloseMenu(cur.id)}
              sx={{
                color: theme => (theme.palette.mode === "dark" ? gray200 : gray600),
                cursor: "pointer",
                textDecoration: "none",
                borderBottom: selectedSectionId === cur.id ? `solid 2px ${orangeDark}` : undefined,
              }}
            >
              {cur.label}
            </Link>
          );
        })}

        {!isAuthenticated && (
          <Button
            variant="contained"
            onClick={() => window?.open(ROUTES.apply, "_blank")}
            sx={{
              display: { xs: "flex", sm: "none" },
              background: orangeDark,
              fontSize: 16,
              borderRadius: 40,
              height: "25px",
              textTransform: "capitalize",
              ":hover": {
                background: orange900,
              },
            }}
          >
            Apply
          </Button>
        )}

        {!isAuthenticated && (
          <Button
            variant="contained"
            color="secondary"
            onClick={signUpHandler}
            sx={{
              display: { xs: "flex", sm: "none" },
              fontSize: 16,
              backgroundColor: theme => (theme.palette.mode === "dark" ? "#303030" : "#e4e4e4"),
              color: theme => (theme.palette.mode === "dark" ? theme.palette.common.white : theme.palette.common.black),
              borderRadius: 40,
              height: "25px",
              textTransform: "capitalize",
              ":hover": {
                backgroundColor: theme => (theme.palette.mode === "dark" ? "#444444" : "#cacaca"),
              },
            }}
          >
            Sign In/Up
          </Button>
        )}
      </Stack>
    </Stack>
  );
};

type SubMenuProps = { onCloseSubMenu: () => void; sectionVisible?: HomepageSection; sx?: SxProps<Theme> };

const SubMenu = ({ onCloseSubMenu, sectionVisible, sx }: SubMenuProps) => {
  return (
    <Collapse in={Boolean(sectionVisible)} timeout="auto" unmountOnExit sx={{ ...sx }}>
      {sectionVisible && (
        <ClickAwayListener onClickAway={onCloseSubMenu}>
          <Box
            sx={{
              p: { xs: "16px", sm: "32px" },
              maxWidth: "1280px",
              margin: "auto",
            }}
          >
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr 1fr" } }}>
              {sectionVisible.options.map(cur => (
                <Link
                  key={cur.title}
                  href={cur.link}
                  rel="noopener"
                  target="_blank"
                  sx={{
                    textDecoration: "none",
                    p: "12px",
                    cursor: "pointer",
                    borderRadius: "16px",
                    color: theme => (theme.palette.mode === "dark" ? gray200 : "black"),
                    ":hover": {
                      background: theme => (theme.palette.mode === "dark" ? gray900 : gray50),
                    },
                  }}
                >
                  <Typography
                    sx={{
                      mb: "4px",
                      color: theme => (theme.palette.mode === "dark" ? gray200 : gray900),
                      fontSize: "16px",
                      fontWeight: 600,
                    }}
                  >
                    {cur.title}
                  </Typography>
                  <Typography
                    sx={{
                      display: { xs: "none", md: "block" },
                      color: theme => (theme.palette.mode === "dark" ? gray300 : gray600),
                      fontSize: "14px",
                    }}
                  >
                    {cur.description.split(" ").slice(0, 13).join(" ") + "..."}
                  </Typography>
                </Link>
              ))}
            </Box>
          </Box>
        </ClickAwayListener>
      )}
    </Collapse>
  );
};

type AppHeaderProps = {
  page: "ONE_CADEMY" | "ONE_ASSISTANT";
  sections: HomepageSection[];
  selectedSectionId: string;
  onPreventSwitch: (sectionId: string) => void;
};

const AppHeader = ({ page, sections, selectedSectionId, onPreventSwitch }: AppHeaderProps) => {
  const [openSearch, setOpenSearch] = useState(false);
  const [{ isAuthenticated, user }] = useAuth();
  const [handleThemeSwitch] = useThemeChange();
  const theme = useTheme();
  const router = useRouter();
  const isMobile = useMediaQuery("(max-width:599px)");

  const [profileMenuOpen, setProfileMenuOpen] = useState(null);
  const isProfileMenuOpen = Boolean(profileMenuOpen);
  const [openMenu, setOpenMenu] = useState(false);
  const [openForm, setOpenForm] = useState(false);
  const [idxOptionVisible, setIdxOptionVisible] = useState(-1);

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

  const onCloseMenu = (id: string) => {
    setOpenMenu(false);
    onPreventSwitch(id);
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
          spacing={{ xs: "2px", sm: "8px", md: "16px" }}
          sx={{
            px: { xs: "16px", sm: "32px" },
            maxWidth: "1280px",
            margin: "auto",
            height: { xs: `${HEADER_HEIGHT_MOBILE}px`, md: `${HEADER_HEIGHT}px` },
          }}
        >
          <Stack direction={"row"} alignItems="center" spacing={"16px"}>
            <Tooltip title="1Cademy's Landing Page">
              <img
                src={isMobile ? oneCademyLogoExtended.src : oneCademyLogo.src}
                alt="logo"
                width={isMobile ? "149px" : "60px"}
                height={isMobile ? "40px" : "64px"}
                style={{ cursor: "pointer" }}
                onClick={() => router.push("/")}
              />
            </Tooltip>

            <Stack
              direction={"row"}
              aria-label="navigation bar"
              spacing={{ xs: "16px", lg: "24px" }}
              alignItems={"center"}
              justifyContent={"space-between"}
              sx={{
                display: {
                  xs: "none",
                  md: "flex",
                },
              }}
            >
              {sections.slice(1).map((cur, idx) => {
                return cur.options?.length ? (
                  <Box key={cur.id} sx={{ display: "flex" }}>
                    <Link
                      href={`#${cur.id}`}
                      onClick={() => onPreventSwitch(cur.id)}
                      onMouseOver={() => setIdxOptionVisible(prev => (prev === idx ? -1 : idx))}
                      sx={{
                        whiteSpace: "nowrap",
                        color: theme => (theme.palette.mode === "dark" ? gray200 : gray600),
                        cursor: "pointer",
                        textDecoration: "none",
                        fontWeight: 600,
                        borderBottom: selectedSectionId === cur.id ? `solid 2px ${orangeDark}` : undefined,
                        ":hover": {
                          color: theme => (theme.palette.mode === "dark" ? gray300 : gray700),
                        },
                      }}
                    >
                      {cur.label}
                    </Link>
                    <IconButton
                      onClick={() => setIdxOptionVisible(prev => (prev === idx ? -1 : idx))}
                      size="small"
                      sx={{ p: "0px", ml: { xs: "4px", lg: "13px" } }}
                    >
                      {idxOptionVisible === idx ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                    </IconButton>
                  </Box>
                ) : (
                  <Tooltip key={cur.id} title={cur.title}>
                    <Link
                      href={`#${cur.id}`}
                      onClick={() => onPreventSwitch(cur.id)}
                      onMouseOver={() => setIdxOptionVisible(-1)}
                      sx={{
                        whiteSpace: "nowrap",
                        color: theme => (theme.palette.mode === "dark" ? gray200 : gray600),
                        cursor: "pointer",
                        textDecoration: "none",
                        fontWeight: 600,
                        borderBottom: selectedSectionId === cur.id ? `solid 2px ${orangeDark}` : undefined,
                        ":hover": {
                          color: theme => (theme.palette.mode === "dark" ? gray300 : gray700),
                        },
                      }}
                    >
                      {cur.label}
                    </Link>
                  </Tooltip>
                );
              })}
            </Stack>
          </Stack>

          <Stack direction={"row"} justifyContent="flex-end" alignItems="center" spacing={"8px"}>
            <Box
              sx={{
                width: "100%",
                maxWidth: "240px",
                display: {
                  xs: isAuthenticated ? "block" : "none",
                  sm: "block",
                  md: isAuthenticated ? "block" : "none",
                  lg: "block",
                },
              }}
            >
              <AppHeaderSearchBar />
            </Box>
            {true && (
              <Tooltip title="Open Searcher">
                <IconButton
                  onClick={() => setOpenSearch(true)}
                  sx={{
                    display: {
                      xs: !isAuthenticated ? undefined : "none",
                      sm: "none",
                      md: "flex",
                      lg: "none",
                    },
                  }}
                  size="small"
                >
                  <SearchIcon />
                </IconButton>
              </Tooltip>
            )}
            <Tooltip title="Change theme">
              <IconButton onClick={handleThemeSwitch} size="small">
                {theme.palette.mode === "dark" ? <LightModeIcon /> : <DarkModeIcon />}
              </IconButton>
            </Tooltip>

            {/* BUTTONS FOR 1CADEMY HOMEPAGE */}

            <Stack
              display={page === "ONE_CADEMY" ? "flex" : "none"}
              direction={"row"}
              justifyContent="flex-end"
              alignItems="center"
              spacing={"8px"}
            >
              {!isAuthenticated && (
                <Tooltip title="Apply to join 1Cademy">
                  <Button
                    variant="contained"
                    onClick={() => window?.open(ROUTES.apply, "_blank")}
                    sx={{
                      display: { xs: "none", sm: "flex" },
                      p: { xs: "6px 10px", lg: undefined },
                      minWidth: "54px",
                      background: orangeDark,
                      fontSize: 16,
                      borderRadius: 40,
                      height: "25px",
                      // width: "60px",
                      textTransform: "capitalize",
                      ":hover": {
                        background: orange900,
                      },
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
                </Tooltip>
              ) : (
                <Tooltip title="SIGN IN/UP">
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={signUpHandler}
                    sx={{
                      display: { xs: "none", sm: "flex" },
                      p: { xs: "6px 10px", lg: undefined },
                      minWidth: "95px",
                      fontSize: 16,
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
            </Stack>

            {/* BUTTONS FOR 1ASSISTANT HOMEPAGE */}

            <Stack
              display={page === "ONE_ASSISTANT" ? "flex" : "none"}
              direction={"row"}
              justifyContent="flex-end"
              alignItems="center"
              spacing={"8px"}
            >
              <Tooltip title="SIGN IN/UP">
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={() => setOpenForm(true)}
                  sx={{
                    p: { xs: "6px 10px", lg: undefined },
                    minWidth: "95px",
                    fontSize: 16,
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
            </Stack>

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

        {openMenu && (
          <MenuBar items={sections.slice(1)} onCloseMenu={onCloseMenu} selectedSectionId={selectedSectionId} />
        )}

        <Box
          sx={{
            position: "absolute",
            top: "80px",
            left: "0px",
            right: "0px",
            background: theme => (theme.palette.mode === "dark" ? "#000000" : "#ffffff"),
            // background: theme => (theme.palette.mode === "dark" ? "#000000ff" : "#f8f8f8ff"),
          }}
        >
          <SubMenu
            onCloseSubMenu={() => setIdxOptionVisible(-1)}
            sectionVisible={sections.slice(1)[idxOptionVisible]}
          />
        </Box>

        {page === "ONE_ASSISTANT" && (
          <Modal open={openForm} onClose={() => setOpenForm(false)}>
            <Box
              sx={{
                width: "100%",
                height: "100%",
                bgcolor: theme => (theme.palette.mode === "dark" ? "#28282ad3" : "#f8f8f8e3"),
                backdropFilter: "blur(4px)",
                display: "flex",
                justifyContent: "center",
                alignItems: { sx: "flex-start", sm: "center" },
              }}
            >
              <Box
                sx={{
                  position: "relative",
                  maxWidth: "900px",
                  overflowY: "auto",
                }}
              >
                <IconButton onClick={() => setOpenForm(false)} sx={{ position: "absolute", top: "0px", right: "0px" }}>
                  <CloseIcon />
                </IconButton>
                <Box>
                  <AssistantForm onSuccessFeedback={() => setOpenForm(false)} />
                </Box>
              </Box>
            </Box>
          </Modal>
        )}
      </Box>
      <Modal
        open={openSearch}
        onClose={() => setOpenSearch(false)}
        aria-labelledby="searcher"
        aria-describedby="search nodes"
      >
        <Box>
          <SearcherPupUp onClose={() => setOpenSearch(false)} />
        </Box>
      </Modal>
    </>
  );
};

export const AppHeaderMemoized = React.memo(AppHeader);

export default AppHeaderMemoized;
