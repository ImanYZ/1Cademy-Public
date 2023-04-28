import { Box, SxProps, Theme } from "@mui/material";
import { ReactNode } from "react";

type CustomIconButtonProps = {
  id: string;
  children: ReactNode;
  onClick?: () => void;
  onClickOnDisable?: () => void;
  disabled?: boolean;
  sx?: SxProps<Theme>;
};

export const CustomWrapperButton = ({
  id,
  children,
  sx,
  disabled,
  onClickOnWrapper,
}: CustomIconButtonProps & { onClickOnWrapper?: () => void }) => {
  return (
    <Box
      id={id}
      onClick={onClickOnWrapper}
      sx={{
        height: "30px",
        p: "6px 8px",
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
        ...(!disabled && {
          ":hover": {
            backgroundColor: ({ palette }) =>
              palette.mode === "dark" ? palette.common.notebookG400 : palette.common.lightBackground2,
          },
        }),
        ...sx,
      }}
    >
      {children}
    </Box>
  );
};
