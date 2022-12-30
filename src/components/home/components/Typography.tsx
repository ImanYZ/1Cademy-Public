import { Theme, Typography, TypographyTypeMap } from "@mui/material";
import { Box, SxProps } from "@mui/system";
import * as React from "react";

type CustomTypographyProps = {
  variant: TypographyTypeMap["props"]["variant"];
  children: string;
  component: React.ElementType;
  align?: TypographyTypeMap["props"]["align"];
  marked?: "none" | "center";
  sx?: SxProps<Theme>;
};

function CustomTypography(props: CustomTypographyProps) {
  const { children, component, variant, align = "center", marked = "none", sx } = props;

  return (
    <Typography component={component} variant={variant} align={align} sx={{ textTransform: "uppercase", ...sx }}>
      {children}
      {marked === "center" && (
        <Box
          component="span"
          sx={{
            height: 4,
            width: 55,
            display: "block",
            margin: theme => `${theme.spacing(1)} auto 0`,
            backgroundColor: theme => theme.palette.common.orange,
          }}
        ></Box>
      )}
    </Typography>
  );
}

export default CustomTypography;
