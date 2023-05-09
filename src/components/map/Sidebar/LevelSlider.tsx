import { Slider, styled } from "@mui/material";

import { DESIGN_SYSTEM_COLORS } from "@/lib/theme/colors";

// const iOSBoxShadow = "0 3px 1px rgba(0,0,0,0.1),0 4px 8px rgba(0,0,0,0.13),0 0 0 1px rgba(0,0,0,0.02)";

export const LevelSlider = styled(Slider)(
  ({
    theme: {
      palette: { mode },
    },
  }) => ({
    color: mode === "dark" ? DESIGN_SYSTEM_COLORS.gray900 : DESIGN_SYSTEM_COLORS.baseWhite,
    height: 2,
    padding: "15px 0",
    "& .MuiSlider-thumb": {
      height: 20,
      width: 20,
      backgroundColor: mode === "dark" ? DESIGN_SYSTEM_COLORS.primary800 : DESIGN_SYSTEM_COLORS.gray300,
      // boxShadow: iOSBoxShadow,
      "&:focus, &:hover, &.Mui-active": {
        boxShadow: "0 3px 1px rgba(0,0,0,0.1),0 4px 8px rgba(0,0,0,0.3),0 0 0 1px rgba(0,0,0,0.02)",
        // Reset on touch devices, it doesn't add specificity
        "@media (hover: none)": {
          // boxShadow: iOSBoxShadow,
        },
      },
    },
    "& .MuiSlider-valueLabel": {
      fontSize: 14,
      fontWeight: "500",
      top: -6,
      backgroundColor: "unset",
      color: mode === "dark" ? DESIGN_SYSTEM_COLORS.gray900 : DESIGN_SYSTEM_COLORS.baseWhite,

      "& *": {
        background: "transparent !important",
        color: mode === "dark" ? "#fff" : "#000 !important",
      },
    },
    "& .MuiSlider-track": {
      backgroundColor: mode === "dark" ? DESIGN_SYSTEM_COLORS.primary800 : DESIGN_SYSTEM_COLORS.primary600,
      border: "none",
    },
    "& .MuiSlider-rail": {
      backgroundColor: mode === "dark" ? DESIGN_SYSTEM_COLORS.notebookG200 : DESIGN_SYSTEM_COLORS.gray300,
    },
    "& .MuiSlider-mark": {
      backgroundColor: mode === "dark" ? DESIGN_SYSTEM_COLORS.notebookG200 : DESIGN_SYSTEM_COLORS.gray300,
      height: 14,
      width: 1,
      "&.MuiSlider-markActive": {
        backgroundColor: mode === "dark" ? DESIGN_SYSTEM_COLORS.primary800 : DESIGN_SYSTEM_COLORS.primary600,
      },
    },
  })
);
export default LevelSlider;
