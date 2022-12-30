import { Theme, Typography, TypographyTypeMap } from "@mui/material";
import { Box, SxProps } from "@mui/system";
// import { withStyles } from "@mui/styles";
import * as React from "react";

// const markStyleMapping: any = {
//   center: {
//     h1: "",
//     h2: "markedH2Center",
//     h3: "markedH3Center",
//     h4: "markedH4Center",
//     h5: "",
//     h6: "",
//   },
//   left: {
//     h1: "",
//     h2: "",
//     h3: "",
//     h4: "",
//     h5: "",
//     h6: "markedH6Left",
//   },
//   none: {
//     h1: "",
//     h2: "",
//     h3: "",
//     h4: "",
//     h5: "",
//     h6: "",
//   },
// };

// const variantMapping = {
//   h1: "h1",
//   h2: "h1",
//   h3: "h1",
//   h4: "h1",
//   h5: "h3",
//   h6: "h2",
//   subtitle1: "h3",
// };

type CustomTypographyProps = {
  align: TypographyTypeMap["props"]["align"];
  variant: TypographyTypeMap["props"]["variant"];
  children: string;
  marked: "none" | "center";
  component: React.ElementType;
  sx?: SxProps<Theme>;
};

function CustomTypography(props: CustomTypographyProps) {
  const { children, component, variant, align, marked = "none", sx } = props;

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
      {/* {markedClassName ? <span className={markedClassName} /> : null} */}
    </Typography>
  );
}

// interface StyledTypographyProps extends TypographyProps {
//   classes: string;
//   marked: "center" | "left" | "none";
// }

// const StyledTypography = styled(MUITypography)<StyledTypographyProps>(({ theme }) => ({
//   [markStyleMapping.center.h2]: {
//     height: 4,
//     width: 73,
//     display: "block",
//     margin: `${theme.spacing(1)} auto 0`,
//     backgroundColor: theme.palette.secondary.main,
//   },
//   [markStyleMapping.center.h3]: {
//     height: 4,
//     width: 55,
//     display: "block",
//     margin: `${theme.spacing(1)} auto 0`,
//     backgroundColor: theme.palette.secondary.main,
//   },
//   [markStyleMapping.center.h4]: {
//     height: 4,
//     width: 55,
//     display: "block",
//     margin: `${theme.spacing(1)} auto 0`,
//     backgroundColor: theme.palette.secondary.main,
//   },
//   [markStyleMapping.left.h6]: {
//     height: 2,
//     width: 28,
//     display: "block",
//     marginTop: theme.spacing(0.5),
//     background: "currentColor",
//   },
// }));

export default CustomTypography;

// const styles = (theme: any) => ({});
