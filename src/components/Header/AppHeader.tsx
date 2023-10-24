import AccountCircle from "@mui/icons-material/AccountCircle";
import BiotechIcon from "@mui/icons-material/Biotech";
import CloseIcon from "@mui/icons-material/Close";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import LightModeIcon from "@mui/icons-material/LightMode";
import LogoutIcon from "@mui/icons-material/Logout";
import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search";
import { Avatar, Modal, Typography, useMediaQuery, useTheme } from "@mui/material";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Tooltip from "@mui/material/Tooltip";
import { Stack } from "@mui/system";
import { getAuth } from "firebase/auth";
import { collection, getDocs, query, where } from "firebase/firestore";
import Image from "next/image";
import { useRouter } from "next/router";
import React, { forwardRef, useEffect, useState } from "react";

import useThemeChange from "@/hooks/useThemeChange";
import { orange900, orangeDark } from "@/pages/home";

import oneCademyLogo from "../../../public/DarkmodeLogo.png";
import oneCademyLogoExtended from "../../../public/logo-extended.png";
import { useAuth } from "../../context/AuthContext";
import { auth, dbExp } from "../../lib/firestoreClient/firestoreClient.config";
import { Post } from "../../lib/mapApi";
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

export type HeaderPage = "ONE_CADEMY" | "ONE_ASSISTANT" | "COMMUNITIES";

type AppHeaderProps = {
  page: HeaderPage;
  sections: HomepageSection[];
  selectedSectionId: string;
  onSwitchSection: (sectionId: string) => void;
  mitpage?: boolean;
  // preUrl?: string;
};

const AppHeader = forwardRef(({ page, sections, selectedSectionId, onSwitchSection }: AppHeaderProps, ref) => {
  const [openSearch, setOpenSearch] = useState(false);
  const [{ isAuthenticated, user }] = useAuth();
  const [emailExp, setEmailExp] = useState("");
  const [nameExp, setNameExp] = useState("");
  const [handleThemeSwitch] = useThemeChange();
  const theme = useTheme();
  const router = useRouter();
  const isMobile = useMediaQuery("(max-width:599px)");

  const [profileMenuOpen, setProfileMenuOpen] = useState(null);
  const isProfileMenuOpen = Boolean(profileMenuOpen);
  const [profileMenuOpenExp, setProfileMenuOpenExp] = useState(null);
  const isProfileMenuOpenExp = Boolean(profileMenuOpenExp);
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
  const handleProfileMenuCloseExp = () => {
    setProfileMenuOpenExp(null);
  };
  const handleProfileMenuOpenExp = (event: any) => {
    setProfileMenuOpenExp(event.currentTarget);
  };

  const onCloseMenu = () => {
    setOpenMenu(false);
    // onSwitchSection(id);
  };

  const onSwitchSectionByMenu = (id: string) => {
    onSwitchSection(id);
    setOpenMenu(false);
  };

  useEffect(() => {
    if (isAuthenticated && router.query?.course) {
      Post("/assignCourseToUser", { course: router.query?.course });
    }
  }, [isAuthenticated, router.query?.course]);

  useEffect(() => {
    return auth.onAuthStateChanged(async (user: any) => {
      const uEmail = user?.email?.toLowerCase();
      if (!uEmail || !user.emailVerified) {
        setEmailExp("");
        setNameExp("");
        return;
      }
      const users = await getDocs(query(collection(dbExp, "users"), where("email", "==", uEmail)));
      const usersSurvey = await getDocs(query(collection(dbExp, "usersSurvey"), where("email", "==", uEmail)));
      if (users.docs.length > 0 || usersSurvey.docs.length > 0) {
        setEmailExp(user.email.toLowerCase());
        setNameExp(user.displayName);
      } else {
        setEmailExp("");
        setNameExp("");
      }
    });
  }, []);

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
  const signUpHandlerExp = () => {
    router.push(ROUTES.signUpExp);
  };
  const signOut1 = async () => {
    await auth.signOut();
  };
  const renderProfileMenuExp = (
    <Menu
      id="ProfileMenu"
      anchorEl={profileMenuOpenExp}
      open={isProfileMenuOpenExp}
      onClose={handleProfileMenuCloseExp}
    >
      {emailExp && <Typography sx={{ p: "6px 16px" }}>{capitalizeString(nameExp)}</Typography>}
      {emailExp && (
        <>
          <MenuItem
            sx={{ flexGrow: 3 }}
            onClick={() => {
              window.open("https://1cademy.us/Activities/experiment", "_blank");
            }}
          >
            <BiotechIcon /> <span id="ExperimentActivities">Experiment Activities</span>
          </MenuItem>
          <MenuItem sx={{ flexGrow: 3 }} onClick={signOut1}>
            <LogoutIcon /> <span id="LogoutText">Logout</span>
          </MenuItem>
        </>
      )}
    </Menu>
  );
  return (
    <>
      <Box
        ref={ref}
        sx={{
          background: theme => (theme.palette.mode === "dark" ? "rgba(0,0,0,.72)" : "rgba(255, 255, 255, 0.85);"),
          backdropFilter: "saturate(180%) blur(10px)",
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
              <Avatar
                src={isMobile ? oneCademyLogoExtended.src : oneCademyLogo.src}
                alt="logo"
                sx={{ cursor: "pointer", width: { xs: "149px", sm: "60px" }, height: { xs: "40px", sm: "64px" } }}
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
                    <Box>
                      <ActiveLink
                        section={cur}
                        selectedSectionId={selectedSectionId}
                        onSwitchSection={onSwitchSection}
                      />
                    </Box>
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
                    onSwitchSection={onSwitchSection}
                  />
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

            <Tooltip title="Open Searcher">
              <IconButton
                onClick={() => setOpenSearch(true)}
                sx={{
                  display: {
                    xs: isAuthenticated ? "none" : undefined,
                    sm: "none",
                    md: isAuthenticated ? "none" : undefined,
                    lg: "none",
                  },
                }}
                size="small"
              >
                <SearchIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title="Change theme">
              <IconButton onClick={handleThemeSwitch} size="small">
                {theme.palette.mode === "dark" ? <LightModeIcon /> : <DarkModeIcon />}
              </IconButton>
            </Tooltip>

            <Stack display={"flex"} direction={"row"} justifyContent="flex-end" alignItems="center" spacing={"8px"}>
              {page === "ONE_CADEMY" && !isAuthenticated && (
                <Button
                  variant="contained"
                  href="https://1cademy.us/ScheduleInstructor"
                  target="_blank"
                  rel="noopener"
                  sx={{
                    display: { xs: "none", sm: "flex" },
                    p: { xs: "6px 10px", lg: undefined },
                    minWidth: "133px",
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
                  Schedule Demo
                </Button>
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

              {emailExp && page === "COMMUNITIES" && (
                <Tooltip title="Account">
                  <IconButton
                    size="large"
                    edge="end"
                    aria-haspopup="true"
                    aria-controls="lock-menu"
                    aria-label={`${emailExp}'s Account`}
                    aria-expanded={isProfileMenuOpenExp ? "true" : undefined}
                    onClick={handleProfileMenuOpenExp}
                    color="inherit"
                  >
                    <AccountCircle />
                  </IconButton>
                </Tooltip>
              )}
              {page === "COMMUNITIES" && !emailExp && (
                <Tooltip title="SIGN IN/UP">
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={signUpHandlerExp}
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

              {!isAuthenticated && page !== "COMMUNITIES" && (
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
        {emailExp && renderProfileMenuExp}
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
              ) : page === "COMMUNITIES" ? (
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={() => window.open("https://1cademy.us/auth", "_blank")}
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
            background: theme => (theme.palette.mode === "dark" ? "#000000ff" : "#ffffff"),
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
});

AppHeader.displayName = "AppHeader";

const AppHeaderMemoized = React.memo(AppHeader);

export default AppHeaderMemoized;
