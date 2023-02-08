import CloseIcon from "@mui/icons-material/Close";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import { Box, Button, IconButton, Link, Stack } from "@mui/material";
import { useRouter } from "next/router";
import { forwardRef, useState } from "react";

import oneCademyLogoExtended from "../../../public/logo-extended.png";
import { useAuth } from "../../context/AuthContext";
import ROUTES from "../../lib/utils/routes";
import { gray200, gray600, orange900, orangeDark } from "../../pages/home";
import { HomepageSection } from "../home/SectionsItems";
import { HEADER_HEIGHT, HEADER_HEIGHT_MOBILE } from "./AppHeader";
import { SubMenu } from "./SubMenu";

type MenuHeaderProps = {
  items: HomepageSection[];
  onCloseMenu: (sectionId: string) => void;
  selectedSectionId: string;
};

export const MenuHeader = forwardRef<HTMLDivElement, MenuHeaderProps>(
  ({ items, onCloseMenu, selectedSectionId }, ref) => {
    const [idxOptionVisible, setIdxOptionVisible] = useState(-1);
    const [{ isAuthenticated }] = useAuth();
    const router = useRouter();

    const signUpHandler = () => {
      router.push(ROUTES.signIn);
    };

    return (
      <Stack
        ref={ref}
        direction={"column"}
        alignItems={"self-start"}
        sx={{
          height: {
            xs: `calc(100vh)`,
            md: `calc(100vh)`,
            overflowY: "auto",
          },
          background: theme => (theme.palette.mode === "dark" ? "#000000" : "#ffffff"),
        }}
        tabIndex={-1}
      >
        <Stack
          direction={"row"}
          justifyContent="space-between"
          alignItems="center"
          sx={{
            px: { xs: "16px", sm: "32px" },
            width: "100%",
            height: { xs: `${HEADER_HEIGHT_MOBILE}px`, md: `${HEADER_HEIGHT}px` },
          }}
        >
          <img
            src={oneCademyLogoExtended.src}
            alt="logo"
            width={"149px"}
            height={"40px"}
            style={{ cursor: "pointer" }}
            onClick={() => router.push(ROUTES.home)}
          />
          <IconButton
            onClick={() => onCloseMenu("")}
            sx={{ display: { xs: "flex", md: "none" }, alignSelf: "center" }}
            size="small"
          >
            <CloseIcon />
          </IconButton>
        </Stack>

        <Stack width={"100%"} direction={"column"} spacing={{ xs: "0px" }} sx={{ padding: { xs: "0px" } }}>
          {items.map((cur, idx) => {
            return cur.options.length ? (
              <Box key={cur.id}>
                <Box sx={{ p: { xs: "12px 16px" }, display: "flex", justifyContent: "space-between" }}>
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
                {idxOptionVisible === idx && (
                  <Box sx={{ p: { xs: "12px 16px" } }}>
                    <SubMenu
                      onCloseSubMenu={() => setIdxOptionVisible(-1)}
                      sectionVisible={items[idxOptionVisible]}
                      sx={{
                        border: theme => `solid 1px ${theme.palette.mode === "dark" ? "#FFFFFF4D" : gray200}`,
                        borderRadius: "12px",
                      }}
                    />
                  </Box>
                )}
              </Box>
            ) : (
              <Box key={cur.id} sx={{ p: { xs: "12px 16px" }, display: "flex", justifyContent: "space-between" }}>
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
              </Box>
            );
          })}
          {!isAuthenticated && (
            <Stack spacing={"12px"} sx={{ p: { xs: "12px 16px" }, width: "100%" }}>
              <Button
                variant="contained"
                color="secondary"
                onClick={signUpHandler}
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

              <Button
                variant="contained"
                onClick={() => window?.open(ROUTES.apply, "_blank")}
                sx={{
                  display: { xs: "flex", sm: "none" },
                  background: orangeDark,
                  fontSize: 16,
                  borderRadius: 40,
                  // height: "25px",
                  textTransform: "capitalize",
                  ":hover": {
                    background: orange900,
                  },
                }}
              >
                Apply to join
              </Button>
            </Stack>
          )}
        </Stack>
      </Stack>
    );
  }
);

MenuHeader.displayName = "MenuHeader";
