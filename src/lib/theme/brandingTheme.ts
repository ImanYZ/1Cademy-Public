import { createTheme } from '@mui/material'
import { grey } from '@mui/material/colors';
import { Theme, ThemeOptions } from "@mui/material/styles";
import { TypographyOptions } from '@mui/material/styles/createTypography';

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

const ONE_ACADEMY_BLACK = '#28282A'
const ONE_ACADEMY_ORANGE = '#FF8A33'
const ONE_ACADEMY_WHITE = '#F8F8F8'

const systemFont = ["Roboto", "sans-serif"];

export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: ONE_ACADEMY_ORANGE
    },
    secondary: {
      main: ONE_ACADEMY_BLACK
    },
    warning: {
      main: "#ffc071",
      dark: "#ffb25e"
    },
    text: {
      primary: common.black,
      secondary: grey[700]
    },
    divider: grey[200],
    common
  },
  typography: {
    fontFamily: [...systemFont].join(","),
    h3: {},
    body1: {
      color: 'black'
    },
    button: {
      textTransform: "initial"
    },
  },
  spacing: 5,
});

<<<<<<< HEAD:src/brandingTheme.ts
export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: ONE_ACADEMY_ORANGE
    },
    secondary: {
      main: ONE_ACADEMY_WHITE
    },
    warning: {
      main: "#ffc071",
      dark: "#ffb25e"
    },
    text: {
      primary: common.white,
      secondary: grey[300]
    },
    divider: grey[200],
    common,
  },
  typography: {
    fontFamily: [...systemFont].join(","),
    h3: {},
    body1: {
      color: 'white'
    },
    button: {
      textTransform: "initial"
    },
  },
  spacing: 5,
});
=======
export const getDesignTokens = (mode: "light" | "dark") =>
({
  palette: {
    primary: {
      main: common.orange,
      ...(mode === "dark" && {
        main: common.orange
      })
    },
    secondary: {
      main: common.darkGrayBackground,
      ...(mode === "dark" && {
        main: grey[500]
      })
    },
    light: {
      main: common.white,
      ...(mode === "dark" && {
        main: grey[500]
      })
    },
    warning: {
      main: "#ffc071",
      dark: "#ffb25e"
    },
    divider: mode === "dark" ? grey[200] : grey[200],
    mode,
    background: {
      default: "#FAFAFA",
      paper: common.white
    },
    ...(mode === "dark" && {
      background: {
        default: grey[600],
        paper: grey[700]
      }
    }),
    common,
    ...(mode === "light" && {
      text: {
        primary: common.black,
        secondary: grey[700]
      }
    }),
    ...(mode === "dark" && {
      text: {
        primary: common.white,
        secondary: grey[300]
      }
    }),
    grey
  },
  spacing: 5,
  typography: {
    fontFamily: [...systemFont].join(","),
    fontFamilySystem: systemFont.join(","),
    h1: { fontSize: "50px" },
    h2: { fontSize: "30px" },
    h3: { fontSize: "25px" },
    h4: { fontSize: "23px" },
    button: { textTransform: "initial" }
  }
} as ThemeOptions);
>>>>>>> feature/analytics:src/lib/theme/brandingTheme.ts

export function getThemedComponents(): {
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
          // variant: "contained",
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
                // backgroundColor: common.orangeDark,
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
      },
<<<<<<< HEAD:src/brandingTheme.ts
=======
      MuiFormHelperText: {
        styleOverrides: {
          root: {
            marginTop: 0,
            height: 0
          }
        }
      }
>>>>>>> feature/analytics:src/lib/theme/brandingTheme.ts
    }
  };
}


export const getMetaThemeColor = (mode: "light" | "dark") => {
  if (mode === 'light') return common.orange
  if (mode === 'dark') return common.orangeDark
  return common.orange
};
