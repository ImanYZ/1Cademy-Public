import MenuIcon from "@mui/icons-material/Menu";
import { AppBar, Box, Button, IconButton, Link, Toolbar, Tooltip } from "@mui/material";
import Image from "next/image";
import LinkNext from "next/link";
import { useRouter } from "next/router";
import React, { useState } from "react";

import LogoDarkMode from "../../../public/DarkModeLogo.svg";
import { User } from "../../knowledgeTypes";
import { Option } from "../layouts/InstructorsLayout";

type HeaderNavbarMovilProps = { options: Option[]; user: User };
const HeaderNavbarMovil = ({ options, user }: HeaderNavbarMovilProps) => {
  const [showMenu, setShowMenu] = useState(false);
  const router = useRouter();

  return (
    <>
      <AppBar data-testid="app-nav-bar" position="sticky">
        <Toolbar sx={{ height: "75px", justifyContent: "space-between" }}>
          <Box sx={{ flex: 1, display: "flex", justifyContent: "flex-start", gap: "24px" }}>
            <IconButton onClick={() => setShowMenu(showMenu => !showMenu)}>
              <MenuIcon
                sx={{
                  color: theme => theme.palette.common.white,
                }}
              />
            </IconButton>
          </Box>

          <Box
            color="inherit"
            // onClick={() => open("https://1cademy.us/home#LandingSection", "_blank")}
            sx={{
              fontSize: 24,
              margin: "4px 0px 0px 0px",
              // cursor: "pointer",
              mr: { xs: "20px", md: "0px" },
            }}
          >
            <Image src={LogoDarkMode.src} alt="logo" width="52px" height="70px" />
          </Box>

          <Box sx={{ flex: 1, display: "flex", justifyContent: "flex-end", gap: "24px" }}>
            <Box
              sx={{
                width: "55px",
                height: "55px",
                position: "relative",
                color: theme => theme.palette.common.gray,
              }}
            >
              <Tooltip title={user.role ?? ""}>
                <Box>
                  <Image
                    src={user.imageUrl ?? ""}
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
              </Tooltip>
            </Box>
          </Box>
        </Toolbar>
        {showMenu && (
          <Box
            sx={{
              width: "100%",
              height: "calc(100vh - 75px)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "40px",
              background: theme => theme.palette.common.darkGrayBackground,
              zIndex: 10,
            }}
          >
            {user.role === "INSTRUCTOR" &&
              options.map((page, idx) => (
                <LinkNext
                  key={idx}
                  onClick={event => {
                    event.preventDefault();
                    router.push(page.route);
                  }}
                  color="inherit"
                  style={{
                    fontFamily: "Work Sans,sans-serif",
                    fontSize: "18px",
                    fontWeight: 400,
                  }}
                  href={page.route}
                >
                  <Link
                    sx={{
                      fontFamily: "Work Sans,sans-serif",
                      fontSize: "18px",
                      fontWeight: 400,
                      textDecoration: "none",
                      color: theme => theme.palette.common.white,
                      cursor: "pointer",
                      borderBottom: theme =>
                        router.route === page.route ? `solid 2px ${theme.palette.common.orange}` : undefined,
                    }}
                  >
                    {page.label}
                  </Link>
                </LinkNext>
              ))}
            <Button
              variant="outlined"
              // color="secondary"
              sx={{
                wordBreak: "normal",
                width: "233px",
                p: "16px 24px",
                fontSize: "15px",
                background: theme => theme.palette.common.darkGrayBackground,
                color: theme => theme.palette.common.white,
                borderColor: theme => theme.palette.common.white,
              }}
              onClick={() => router.push("/notebook")}
            >
              GO TO NOTEBOOK
            </Button>
          </Box>
        )}
      </AppBar>
    </>
  );
};

export default HeaderNavbarMovil;
