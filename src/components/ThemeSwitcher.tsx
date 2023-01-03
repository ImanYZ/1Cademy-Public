import { styled, Switch } from "@mui/material";

export const ThemeSwitcher = styled(Switch)(() => ({
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
