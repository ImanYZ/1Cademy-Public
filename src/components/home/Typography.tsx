import MuiTypography from "@mui/material/Typography";
import { withStyles } from "@mui/styles";
import * as React from "react";

const markStyleMapping = {
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

const styles = (theme: any) => ({
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
});

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
  let _markStyleMapping: any = markStyleMapping;
  const { children, variant, classes, marked = "none", ...other } = props;

  let markedClassName = "";
  if (variant && variant in _markStyleMapping[marked]) {
    markedClassName = classes[_markStyleMapping[marked][variant]];
  }

  return (
    <MuiTypography variantMapping={variantMapping} variant={variant} {...other}>
      {children}
      {markedClassName ? <span className={markedClassName} /> : null}
    </MuiTypography>
  );
}

export default withStyles(styles)(Typography);
