import { createTheme } from "@mui/material";
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
  }
}

const common = {
  black: "#1a1a1a",
  white: "#ffffff",
  orange: "#ff8a33",
  orangeLight: "#f9e2d1",
  orangeDark: "#ff6d00",
  darkGrayBackground: "#28282A",
  gray: "#D3D3D3"
};

const ONE_ACADEMY_BLACK = "#28282A";
const ONE_ACADEMY_ORANGE = "#FF8A33";
const ONE_ACADEMY_WHITE = "#F8F8F8";

const systemFont = ["Roboto", "sans-serif"];

export const getDesignTokens = (mode: "light" | "dark") =>
  ({
    palette: {
      mode,
      primary: {
        main: ONE_ACADEMY_ORANGE
      },
      secondary: {
        main: mode === "light" ? ONE_ACADEMY_BLACK : ONE_ACADEMY_WHITE
      },
      warning: {
        main: "#ffc071",
        dark: "#ffb25e"
      },
      text: {
        primary: mode === "light" ? common.black : common.white,
        secondary: grey[300]
      },
      divider: grey[200],
      common
    },
    typography: {
      fontFamily: [...systemFont].join(","),
      h3: {},
      body1: {
        color: mode === "light" ? common.black : common.white
      },
      button: {
        textTransform: "initial"
      }
    },
    spacing: 5
  } as ThemeOptions);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function getThemedComponents(theme: Theme): {
  components: Theme["components"];
} {
  return {
    components: {
      MuiButtonBase: {
        defaultProps: {
          disableTouchRipple: true
        }
      },
      MuiButton: {
        defaultProps: {
          disableElevation: true
        },
        styleOverrides: {
          containedPrimary: {
            backgroundColor: "common.orange",
            color: common.white
          }
        },
        variants: [
          {
            props: { variant: "contained" },
            style: {
              "&:hover, &.Mui-focusVisible": {
                backgroundColor: common.orangeDark
              },
              "&.Mui-disabled .MuiLoadingButton-loadingIndicator": {
                color: common.orangeLight
              }
            }
          }
        ]
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: common.darkGrayBackground
          }
        }
      },
      MuiTooltip: {
        defaultProps: {
          arrow: true
        }
      },
      MuiSelect: {
        variants: [
          {
            props: { variant: "standard" },
            style: {
              ".MuiSelect-standard:focus": {
                backgroundColor: "transparent"
              },
              padding: "10px",
              "&:after": { borderBottom: "none" },
              "&:before": {
                borderBottom: "none"
              },
              "&:hover": {
                color: grey[800]
              },
              [`&:hover:not(.disabled):before`]: {
                borderBottom: "none",
                "@media (hover: none)": {
                  borderBottom: "none"
                }
              }
            }
          }
        ]
      },
      MuiCardContent: {
        styleOverrides: {
          root: {
            "&": {
              paddingTop: "0px",
              paddingBottom: "0px"
            },
            "&:last-child": {
              paddingTop: "0px",
              paddingBottom: "0px"
            }
          }
        }
      },
      MuiChip: {
        styleOverrides: {
          root: {
            "&": {
              border: `solid 1px ${grey[300]}`
            }
          },
          icon: {
            color: common.orange
          }
        }
      },
      MuiToggleButtonGroup: {
        styleOverrides: {
          root: {
            backgroundColor: "#fff"
          }
        }
      },
      MuiToggleButton: {
        styleOverrides: {
          root: {
            textTransform: "none"
          }
        }
      }
    }
  };
}

export const getMetaThemeColor = (mode: "light" | "dark") => {
  if (mode === "light") return common.orange;
  if (mode === "dark") return common.orangeDark;
  return common.orange;
};

const darkTheme = createTheme(getDesignTokens("dark"));
export const brandingDarkTheme = deepmerge(darkTheme, getThemedComponents(darkTheme));
