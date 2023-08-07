import { Box, Button, ButtonProps, styled, SxProps, Theme } from "@mui/material";
import { ReactNode } from "react";

import { DESIGN_SYSTEM_COLORS } from "@/lib/theme/colors";

type CustomIconButtonProps = {
  id?: string;
  children: ReactNode;
  onClick?: () => void;
  onClickOnDisable?: () => void;
  disabled?: boolean;
  size?: "md" | "sm";
  sx?: SxProps<Theme>;
};

export const CustomWrapperButton = ({
  id,
  children,
  sx,
  disabled,
  size = "sm",
  onClickOnWrapper,
}: CustomIconButtonProps & { onClickOnWrapper?: () => void }) => {
  return (
    <Box
      id={id}
      onClick={onClickOnWrapper}
      sx={{
        height: size === "md" ? "30px" : "24px",
        // p: "6px 8px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "16px",
        backgroundColor: ({ palette }) =>
          disabled
            ? palette.mode === "dark"
              ? palette.common.notebookG600
              : palette.common.notebookG50
            : palette.mode === "dark"
            ? palette.common.notebookG500
            : palette.common.gray200,
        color: ({ palette }) => (palette.mode === "dark" ? palette.common.gray50 : palette.common.gray600),
        ...(!disabled &&
          {
            // ":hover": {
            //   backgroundColor: ({ palette }) =>
            //     palette.mode === "dark" ? palette.common.notebookG400 : palette.common.lightBackground2,
            // },
          }),
        ...sx,
      }}
    >
      {children}
    </Box>
  );
};

export const CustomButton = styled(Button)<ButtonProps>(({ theme }) => ({
  borderRadius: "26px",

  "&.MuiButton-containedPrimary": {
    backgroundColor: DESIGN_SYSTEM_COLORS.primary800,
    ":hover": {
      backgroundColor: DESIGN_SYSTEM_COLORS.primary900,
    },
  },

  "&.MuiButton-containedSecondary": {
    border: `solid 1px ${DESIGN_SYSTEM_COLORS.gray300}`,
    backgroundColor:
      theme.palette.mode === "dark" ? DESIGN_SYSTEM_COLORS.notebookMainBlack : DESIGN_SYSTEM_COLORS.baseWhite,
    color: theme.palette.mode === "dark" ? DESIGN_SYSTEM_COLORS.gray200 : DESIGN_SYSTEM_COLORS.gray700,
    ":hover": {
      backgroundColor: theme.palette.mode === "dark" ? DESIGN_SYSTEM_COLORS.baseGraphit : DESIGN_SYSTEM_COLORS.gray300,
    },
  },
}));
