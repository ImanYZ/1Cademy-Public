import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import {
  AppBar,
  Box,
  Button,
  FormGroup,
  styled,
  Switch,
  Tab,
  Tabs,
  Toolbar,
  Tooltip,
  tooltipClasses,
  TooltipProps,
  useTheme,
} from "@mui/material";
import Image from "next/image";
import { useRouter } from "next/router";
import React from "react";

import useThemeChange from "@/hooks/useThemeChange";
import ROUTES from "@/lib/utils/routes";

import LogoDarkMode from "../../../public/DarkModeLogo.svg";
import { User } from "../../knowledgeTypes";
import { Option } from "../layouts/InstructorsLayout";

type HeaderNavbarProps = { options: Option[]; user: User; onNewCourse?: () => void };
const HeaderNavbar = ({ options, user, onNewCourse }: HeaderNavbarProps) => {
  const [handleThemeSwitch] = useThemeChange();
  const router = useRouter();
  const theme = useTheme();
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
            {onNewCourse && (
              <Button
                onClick={() => onNewCourse()}
                variant={"contained"}
                size={"small"}
                sx={{ fontFamily: "Work Sans,sans-serif", fontSize: "15px", letterSpacing: "-1px", marginLeft: "16px" }}
              >
                NEW COURSE
              </Button>
            )}
          </Tabs>
        )}
        <Box sx={{ flex: 1, display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "24px" }}>
          <FormGroup>
            <MaterialUISwitch
              sx={{ m: 1 }}
              onClick={e => handleThemeSwitch(e)}
              checked={theme.palette.mode === "dark"}
            />
          </FormGroup>
          <Button
            onClick={() => window.open(ROUTES.dashboard, "_blank", "noopener,noreferrer")}
            // color="secondary"
            sx={{
              wordBreak: "normal",
              width: "233px",
              p: "12px 24px 12px 37px",
              background: theme => theme.palette.common.darkGrayBackground,
              color: theme => theme.palette.common.white,
              borderColor: theme => theme.palette.common.white,
            }}
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
    </AppBar>
  );
};

const MaterialUISwitch = styled(Switch)(() => ({
  padding: 8,
  width: 65,
  height: 41,
  "& .Mui-checked": {
    color: "#fff",
    transform: "translateX(22px)",
    "& + .MuiSwitch-track": {
      opacity: 1,
      backgroundColor: "#4D4D4D",
    },
    "& .MuiSwitch-thumb": {
      marginLeft: 3,
    },
  },
  "& .MuiSwitch-track": {
    backgroundColor: "#4D4D4D!important",
    opacity: "1!important",
    borderRadius: 22 / 2,
    "&:before, &:after": {
      content: '""',
      position: "absolute",
      top: "50%",
      transform: "translateY(-50%)",
      width: 20,
      height: 16,
    },
    "&:before": {
      content: '"🌜"',
      left: 11,
      display: "flex",
      alignItems: "center",
      fontSize: 16,
    },
    "&:after": {
      content: '"🌞"',
      right: 11,
      display: "flex",
      alignItems: "center",
      fontSize: 16,
    },
  },
  "& .MuiSwitch-thumb": {
    backgroundColor: "#fff",
    boxShadow: "none",
    width: 21,
    height: 21,
    margin: 1,
  },
}));

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
