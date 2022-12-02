import { alpha, createTheme } from "@mui/material";
import { grey } from "@mui/material/colors";
import { Theme, ThemeOptions } from "@mui/material/styles";
import { deepmerge } from "@mui/utils";

declare module "@mui/material/styles/createPalette" {
  interface CommonColors {
    black: string;
    white: string;
    orange: string;
    orangeLight: string;
    orangeDark: string;
    darkGrayBackground: string;
    gray: string;
    borderColor: string;
    darkBackground1: string;
    lightBackground1: string;
    darkBackground2: string;
    lightBackground2: string;
  }
}

const common = {
  black: "#1a1a1a",
  white: "#F8F8F8",
  orange: "#ff8a33",
  orangeLight: "#f9e2d1",
  orangeDark: "#ff6d00",
  darkGrayBackground: "#28282A",
  gray: "#D3D3D3",
  borderColor: "#585858",
  darkBackground1: "#302f2f",
  lightBackground1: "#E7E7E7",
  darkBackground2: "#525151",
  lightBackground2: "#dbd9d9",
};

const systemFont = ["Roboto", "sans-serif"];

export const getDesignTokens = (mode: "light" | "dark") =>
  ({
    palette: {
      mode,
      primary: {
        main: common.orange,
        ...(mode === "dark" && {
          main: common.orange,
        }),
      },
      secondary: {
        main: common.darkGrayBackground,
        ...(mode === "dark" && {
          main: common.white,
        }),
      },
      light: {
        main: common.white,
        ...(mode === "dark" && {
          main: grey[500],
        }),
      },
      warning: {
        main: "#ffc071",
        dark: "#ffb25e",
      },
      divider: mode === "dark" ? grey[200] : grey[200],
      background: {
        default: common.white,
        paper: common.white,
      },
      ...(mode === "dark" && {
        background: {
          default: common.darkGrayBackground,
          paper: common.darkGrayBackground,
        },
      }),
      common,
      ...(mode === "light" && {
        text: {
          primary: common.black,
          secondary: grey[700],
        },
      }),
      ...(mode === "dark" && {
        text: {
          primary: common.white,
          secondary: grey[300],
        },
      }),
      grey,
    },
    spacing: 5,
    typography: {
      fontFamily: [...systemFont].join(","),
      fontFamilySystem: systemFont.join(","),
      h1: { fontSize: "36px", color: mode === "dark" ? common.white : common.black },
      h2: { fontSize: "32px", color: mode === "dark" ? common.white : common.black },
      h3: { fontSize: "24px", color: mode === "dark" ? common.white : common.black },
      h4: { fontSize: "19px", color: mode === "dark" ? common.white : common.black },
      body1: { fontSize: "16px", color: mode === "dark" ? common.white : common.black },
      body2: { fontSize: "19px", color: mode === "dark" ? common.white : common.black },
      caption: { fontSize: "14.5px", color: mode === "dark" ? common.white : common.black },
      button: {
        textTransform: "initial",
      },
    },
  } as ThemeOptions);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function getThemedComponents(theme: Theme): {
  components: Theme["components"];
} {
  return {
    components: {
      MuiButtonBase: {
        defaultProps: {
          disableTouchRipple: true,
        },
      },
      MuiButton: {
        defaultProps: {
          disableElevation: true,
        },
        styleOverrides: {
          containedPrimary: {
            backgroundColor: "common.orange",
            color: common.white,
            ":hover": {
              backgroundColor: common.orangeDark,
            },
          },
          containedSecondary: {
            backgroundColor: theme.palette.mode === "dark" ? common.white : common.darkGrayBackground,
            color: theme.palette.mode === "dark" ? common.darkGrayBackground : common.white,
            ":hover": {
              backgroundColor:
                theme.palette.mode === "dark" ? alpha(common.white, 0.9) : alpha(common.darkGrayBackground, 0.9),
            },
          },
        },
        variants: [
          {
            props: { variant: "contained" },
            style: {
              "&.Mui-disabled .MuiLoadingButton-loadingIndicator": {
                color: common.orangeLight,
              },
            },
          },
        ],
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: common.darkGrayBackground,
          },
        },
      },
      MuiTooltip: {
        defaultProps: {
          arrow: true,
        },
      },
      MuiSelect: {
        variants: [
          {
            props: { variant: "standard" },
            style: {
              ".MuiSelect-standard:focus": {
                backgroundColor: "transparent",
              },
              padding: "10px",
              "&:after": { borderBottom: "none" },
              "&:before": {
                borderBottom: "none",
              },
              "&:hover": {
                color: grey[800],
              },
              [`&:hover:not(.disabled):before`]: {
                borderBottom: "none",
                "@media (hover: none)": {
                  borderBottom: "none",
                },
              },
            },
          },
          // {
          //   props: { variant: "outlined" },
          //   style: {
          //     "&:hover": {
          //       backgroundColor: "red",
          //     },
          //   },
          // },
        ],
      },
      // MuiAutocomplete: {
      //   styleOverrides: {
      //     root: {
      //       "&": { color: "blue", background: "red" },
      //       "&.MuiInputLabel": {
      //         color: theme.palette.mode === "light" ? common.darkGrayBackground : common.white,
      //       },
      //       // ".Mui-focuced": {
      //       //   color: theme.palette.mode === "light" ? common.darkGrayBackground : common.white,
      //       // },
      //       // color: theme.palette.mode === "light" ? common.darkGrayBackground : common.white,
      //     },
      //   },
      // },
      MuiCardContent: {
        styleOverrides: {
          root: {
            "&": {
              paddingTop: "0px",
              paddingBottom: "0px",
            },
            "&:last-child": {
              paddingTop: "0px",
              paddingBottom: "0px",
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            "&": {
              border: `solid 1px ${grey[600]}`,
              color: `solid 1px ${grey[100]}`,
            },
          },
          icon: {
            color: common.orange,
          },
        },
      },
      MuiToggleButtonGroup: {
        styleOverrides: {
          root: {
            backgroundColor: theme.palette.mode === "light" ? common.white : common.darkGrayBackground,
            color: theme.palette.mode === "light" ? common.darkGrayBackground : common.white,
          },
        },
      },
      MuiToggleButton: {
        styleOverrides: {
          root: {
            textTransform: "none",
          },
        },
      },
      MuiFormControlLabel: {
        styleOverrides: {
          root: {
            color: theme.palette.mode === "dark" ? common.white : common.darkGrayBackground,
          },
        },
      },
      // MuiInputLabel: {
      //   styleOverrides: {
      //     root: {
      //       color: theme.palette.mode === "dark" ? "red" : "blue",
      //     },
      //   },
      // },
      MuiTab: {
        styleOverrides: {
          root: {
            color: theme.palette.mode === "dark" ? common.white : common.black,
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            background: theme.palette.mode === "dark" ? "#303134" : "#f0f0f0",
          },
        },
      },
      MuiDivider: {
        styleOverrides: {
          root: {
            borderColor: theme.palette.mode === "dark" ? common.white : common.black,
          },
        },
      },
      // MuiMenuItem:{
      //   styleOverrides:{
      //     root:{
      //       ":hover"
      //     }
      //   }
      // }
    },
  };
}

export const getMetaThemeColor = (mode: "light" | "dark") => {
  if (mode === "light") return common.orange;
  if (mode === "dark") return common.orangeDark;
  return common.orange;
};

const darkTheme = createTheme(getDesignTokens("dark"));
const lightTheme = createTheme(getDesignTokens("light"));

export const brandingDarkTheme = deepmerge(darkTheme, getThemedComponents(darkTheme));
export const brandingLightTheme = deepmerge(lightTheme, getThemedComponents(lightTheme));
