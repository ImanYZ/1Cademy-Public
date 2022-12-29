import { Box, Button, Tab, Tabs, Tooltip } from "@mui/material";
import { useRouter } from "next/router";
import React from "react";

import LogoDarkMode from "../../../public/DarkModeLogo.svg";
import AppBar from "./AppBar";
import { sectionsOrder } from "./sectionsOrder";
import Toolbar from "./Toolbar";

const LinkTab = (props: any) => {
  return (
    <Tooltip title={props.titl}>
      <Tab
        onClick={event => {
          event.preventDefault();
          props.onClick(event);
        }}
        color="inherit"
        {...props}
      />
    </Tooltip>
  );
};

const AppAppBar = (props: any) => {
  const router = useRouter();
  const signUpHandler = () => {
    // navigateTo("/auth");
    // TODO: redirect
    router.push("https://1cademy.us/auth");
  };

  return (
    <div>
      <AppBar>
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Tooltip title="1Cademy's Landing Page">
            <Box
              //   variant="h6"
              //   underline="none"
              color="inherit"
              onClick={props.homeClick}
              sx={{
                fontSize: 24,
                margin: "7px 19px 0px -10px",
                cursor: "pointer",
              }}
            >
              <img src={LogoDarkMode.src} alt="logo" width="52px" />
            </Box>
          </Tooltip>
          <Tabs
            value={props.section}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            aria-label="scrollable auto tabs navigation bar"
            sx={{
              marginLeft: "auto",
              fontWeight: 400,
              "& .MuiTab-root": {
                color: "#AAAAAA",
              },
              "& .MuiTab-root.Mui-selected": {
                color: "common.white",
              },
              "& .MuiTabs-indicator": {
                backgroundColor: "secondary.main",
              },
            }}
          >
            {[0, 1, 2, 3, 4].map(idx => {
              return (
                <LinkTab
                  key={"Key" + idx}
                  onClick={() => props.switchSection(idx)}
                  label={sectionsOrder[idx + 1].label}
                  titl={sectionsOrder[idx + 1].title}
                />
              );
            })}
            {/* {(leading || props.thisPage) && (
              <LinkTab onClick={props.switchSection(5)} label={props.thisPage} titl={props.thisPage} />
            )}
            {fullname && !props.tutorial && completedExperiment && (
              <Tooltip title="1Cademy Tutorial">
                <Tab component="a" href="/tutorial" target="_blank" label="Tutorial" color="inherit" />
              </Tooltip>
            )} */}
          </Tabs>
          <Box sx={{ flex: 1, display: "flex", justifyContent: "flex-end" }}>
            {!props.tutorial && !props.joinNowSec && !props.communities && (
              <Tooltip title="Apply to join 1Cademy">
                <Button
                  variant="contained"
                  // color="secondary"
                  onClick={props.joinUsClick}
                  sx={{
                    fontSize: 16,
                    color: "common.white",
                    ml: 2.5,
                    borderRadius: 40,
                  }}
                >
                  Apply
                </Button>
              </Tooltip>
            )}
            <Tooltip title="SIGN IN/UP">
              <Button
                variant="contained"
                // color="secondary"
                onClick={signUpHandler}
                sx={{
                  fontSize: 16,
                  color: "common.white",
                  backgroundColor: "rgb(40, 40, 42)",
                  ml: 2.5,
                  borderRadius: 40,
                  ":hover": {
                    backgroundColor: "rgb(30, 30, 31)",
                  },
                }}
              >
                SIGN IN/UP
              </Button>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>
      {/* {fullname && renderProfileMenu} */}
      <Toolbar />
    </div>
  );
};

export default AppAppBar;
