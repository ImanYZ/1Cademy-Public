import CloseIcon from "@mui/icons-material/Close";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import LightModeIcon from "@mui/icons-material/LightMode";
import LogoutIcon from "@mui/icons-material/Logout";
import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search";
import { Modal, Typography, useMediaQuery, useTheme } from "@mui/material";
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
import { orange900, orangeDark } from "@/pages/home";

import oneCademyLogo from "../../../public/DarkmodeLogo.png";
import oneCademyLogoExtended from "../../../public/logo-extended.png";
import { useAuth } from "../../context/AuthContext";
import ROUTES from "../../lib/utils/routes";
import { capitalizeString } from "../../lib/utils/string.utils";
import AppHeaderSearchBar from "../AppHeaderSearchBar2";
import AssistantForm from "../assistant/AssistantRegister";
import { HomepageSection } from "../home/SectionsItems";
import SearcherPupUp from "../SearcherPupUp";
import { ActiveLink } from "./ActiveLink";
import { MenuHeader } from "./MenuHeader";
import { SubMenu } from "./SubMenu";

export const HEADER_HEIGHT = 80;
export const HEADER_HEIGHT_MOBILE = 72;

export type HeaderPage = "ONE_CADEMY" | "ONE_ASSISTANT";

type AppHeaderProps = {
  page: HeaderPage;
  sections: HomepageSection[];
  selectedSectionId: string;
  onSwitchSection: (sectionId: string) => void;
  // preUrl?: string;
};

const AppHeader = ({ page, sections, selectedSectionId, onSwitchSection }: AppHeaderProps) => {
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

  const onCloseMenu = () => {
    setOpenMenu(false);
    // onSwitchSection(id);
  };

  const onSwitchSectionByMenu = (id: string) => {
    onSwitchSection(id);
    setOpenMenu(false);
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
        {/* Navbar Left Options */}
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
                onClick={() => router.push(ROUTES.home)}
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
              {sections.slice(1).map((cur, idx) =>
                cur.options?.length ? (
                  <Box key={cur.id} sx={{ display: "flex" }}>
                    {/* <Link href={preUrl ? `${preUrl}#${cur.id}` : `#${cur.id}`} replace> */}
                    <ActiveLink
                      section={cur}
                      selectedSectionId={selectedSectionId}
                      // preUrl={preUrl}
                      onSwitchSection={onSwitchSection}
                    />
                    {/* </Link> */}
                    <IconButton
                      onClick={() => setIdxOptionVisible(prev => (prev === idx ? -1 : idx))}
                      size="small"
                      sx={{ p: "0px", ml: { xs: "4px", lg: "13px" } }}
                    >
                      {idxOptionVisible === idx ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                    </IconButton>
                  </Box>
                ) : (
                  <ActiveLink
                    key={cur.id}
                    section={cur}
                    selectedSectionId={selectedSectionId}
                    // preUrl={preUrl}
                    onSwitchSection={onSwitchSection}
                  />
                  // <Tooltip key={cur.id} title={cur.title}>
                  // {/* <Link href={preUrl ? `${preUrl}#${cur.id}` : `#${cur.id}`} replace> */}
                  // {/* </Link> */}
                  // </Tooltip>
                )
              )}
            </Stack>
          </Stack>

          {/* Navbar Right Options */}
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

            <Stack display={"flex"} direction={"row"} justifyContent="flex-end" alignItems="center" spacing={"8px"}>
              {page === "ONE_CADEMY" && !isAuthenticated && (
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

              {page === "ONE_CADEMY" && isAuthenticated && user && (
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
              )}

              {(!isAuthenticated || page !== "ONE_CADEMY") && (
                <Tooltip title="SIGN IN/UP">
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={page === "ONE_CADEMY" ? signUpHandler : () => setOpenForm(true)}
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

        <Modal
          open={openMenu}
          onClose={() => setOpenMenu(false)}
          aria-labelledby="Menu"
          aria-describedby="Navigate through sections"
          sx={{ display: { md: "none" } }}
        >
          <MenuHeader
            page={page}
            items={sections.slice(1)}
            onCloseMenu={onCloseMenu}
            selectedSectionId={selectedSectionId}
            onSwitchSection={onSwitchSectionByMenu}
            otherOptions={
              page === "ONE_ASSISTANT" ? (
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={() => setOpenForm(true)}
                  sx={{
                    display: { xs: "flex", sm: "none" },
                    fontSize: 16,
                    backgroundColor: theme => (theme.palette.mode === "dark" ? "#303030" : "#e4e4e4"),
                    color: theme =>
                      theme.palette.mode === "dark" ? theme.palette.common.white : theme.palette.common.black,
                    borderRadius: 40,
                    // height: "25px",
                    textTransform: "capitalize",
                    ":hover": {
                      backgroundColor: theme => (theme.palette.mode === "dark" ? "#444444" : "#cacaca"),
                    },
                  }}
                >
                  Sign In/Up
                </Button>
              ) : null
            }
          />
        </Modal>

        <Box
          sx={{
            position: "absolute",
            top: "80px",
            left: "0px",
            right: "0px",
            background: theme => (theme.palette.mode === "dark" ? "#000000" : "#ffffff"),
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

const AppHeaderMemoized = React.memo(AppHeader);

export default AppHeaderMemoized;
