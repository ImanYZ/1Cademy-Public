import { styled, Typography as MUITypography } from "@mui/material";
import { TypographyProps } from "@mui/material/Typography";
// import { withStyles } from "@mui/styles";
import * as React from "react";

const markStyleMapping: any = {
  center: {
    h1: "",
    h2: "markedH2Center",
    h3: "markedH3Center",
    h4: "markedH4Center",
    h5: "",
    h6: "",
  },
  left: {
    h1: "",
    h2: "",
    h3: "",
    h4: "",
    h5: "",
    h6: "markedH6Left",
  },
  none: {
    h1: "",
    h2: "",
    h3: "",
    h4: "",
    h5: "",
    h6: "",
  },
};

const variantMapping = {
  h1: "h1",
  h2: "h1",
  h3: "h1",
  h4: "h1",
  h5: "h3",
  h6: "h2",
  subtitle1: "h3",
};

function Typography(props: any) {
  const { children, variant, classes, marked = "none", ...other } = props;

  let markedClassName = "";
  if (variant && variant in markStyleMapping[marked] && classes) {
    markedClassName = classes[markStyleMapping[marked][variant]];
  }

  return (
    <StyledTypography variantMapping={variantMapping} variant={variant} {...other}>
      {children}
      {markedClassName ? <span className={markedClassName} /> : null}
    </StyledTypography>
  );
}

interface StyledTypographyProps extends TypographyProps {
  classes: string;
  marked: "center" | "left" | "none";
}

const StyledTypography = styled(MUITypography)<StyledTypographyProps>(({ theme }) => ({
  [markStyleMapping.center.h2]: {
    height: 4,
    width: 73,
    display: "block",
    margin: `${theme.spacing(1)} auto 0`,
    backgroundColor: theme.palette.secondary.main,
  },
  [markStyleMapping.center.h3]: {
    height: 4,
    width: 55,
    display: "block",
    margin: `${theme.spacing(1)} auto 0`,
    backgroundColor: theme.palette.secondary.main,
  },
  [markStyleMapping.center.h4]: {
    height: 4,
    width: 55,
    display: "block",
    margin: `${theme.spacing(1)} auto 0`,
    backgroundColor: theme.palette.secondary.main,
  },
  [markStyleMapping.left.h6]: {
    height: 2,
    width: 28,
    display: "block",
    marginTop: theme.spacing(0.5),
    background: "currentColor",
  },
}));

export default Typography;

// const styles = (theme: any) => ({});
